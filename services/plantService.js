import { clearAuth, getToken, isTokenValid } from "@/auth/token";
import { BASE_URL } from "@/config/api";

export const DEMO_PLANT_NAME = "Plant Testing";
export const PLANT_ACCESS_ROLE_VALUES = Object.freeze({
  VIEW_ONLY: "viewer",
  MANAGE_ACCESS: "editor",
});

const PLANT_ACCESS_ROLE_ALIASES = Object.freeze({
  viewer: PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
  view_only: PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
  only_view: PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
  "view only": PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
  view: PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
  editor: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
  manage_access: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
  can_manage: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
  "manage access": PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
  manager: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
  manage: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS,
});

const DEBUG = false;

const debug = (...args) => {
  if (__DEV__ && DEBUG) {
    console.log(...args);
  }
};

export function isDemoPlant(plant) {
  return String(plant?.name || "").trim().toLowerCase() ===
    DEMO_PLANT_NAME.toLowerCase();
}

export function normalizePlantAccessRole(role) {
  const key = String(role || "").trim().toLowerCase();

  return PLANT_ACCESS_ROLE_ALIASES[key] || "";
}

export function isValidPlantAccessRole(role) {
  return Boolean(normalizePlantAccessRole(role));
}

async function getAuthHeaders() {
  const token = await getToken();
  if (!token || !isTokenValid(token)) {
    await clearAuth();
    const error = new Error("Sesi Anda telah habis atau token tidak valid.");
    error.code = "AUTH_EXPIRED";
    throw error;
  }

  debug("TOKEN VALID");
  debug("HAS_TOKEN:", !!token);

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(response) {
  if (typeof response.text !== "function") {
    return typeof response.json === "function" ? response.json() : {};
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, message: extractErrorMessage(text) };
  }
}

function extractErrorMessage(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const preMatch = text.match(/<pre>([\s\S]*?)<\/pre>/i);
  if (preMatch?.[1]) {
    return preMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  const bodyText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return bodyText || text;
}

function throwApiError(response, body, fallbackMessage) {
  const backendMessage =
    body?.message || body?.error || body?.errors || body?.raw || fallbackMessage;
  const message =
    typeof backendMessage === "string"
      ? backendMessage
      : JSON.stringify(backendMessage);
  const error = new Error(
    message.startsWith("Cannot DELETE")
      ? `Endpoint delete plant belum tersedia di backend: ${message}`
      : message,
  );
  error.status = response.status;
  error.body = body;
  throw error;
}

function createServiceError(message, code, status, body) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.body = body;
  return error;
}

function collectErrorText(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(collectErrorText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(collectErrorText).filter(Boolean).join(" ");
  }

  return String(value);
}

function getPlantAccessErrorMessage(response, body, fallbackMessage) {
  const backendMessage =
    collectErrorText(body?.message) ||
    collectErrorText(body?.error) ||
    collectErrorText(body?.errors) ||
    collectErrorText(body?.raw);
  const message = backendMessage || fallbackMessage;
  const normalized = message.toLowerCase();

  if (
    response.status === 409 ||
    /duplicate|already|unique|sudah.*akses|akses.*sudah|user_plants.*key/.test(
      normalized,
    )
  ) {
    return "User sudah memiliki akses ke plant ini.";
  }

  if (
    response.status === 404 ||
    /user.*not found|not found.*user|user.*tidak ditemukan|tidak ditemukan.*user/.test(
      normalized,
    )
  ) {
    return "User tidak ditemukan.";
  }

  if (
    /user_plants_role_check|role.*check|check constraint.*role|invalid role|role tidak valid/.test(
      normalized,
    )
  ) {
    return "Role tidak valid. Silakan pilih View Only atau Manage Access.";
  }

  if (
    /insert into|violates|constraint|syntax error|relation |select .* from|update .* set|delete from/.test(
      normalized,
    )
  ) {
    return fallbackMessage;
  }

  return message;
}

function throwPlantAccessApiError(response, body, fallbackMessage) {
  throw createServiceError(
    getPlantAccessErrorMessage(response, body, fallbackMessage),
    "PLANT_ACCESS_ERROR",
    response.status,
    body,
  );
}

export async function fetchPlants() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/plant/`, {
    method: "GET",
    headers,
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal mengambil data plant");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function createPlant(payload) {
  debug("MASUK CREATE PLANT");
  debug("PAYLOAD:", payload);
  const url = `${BASE_URL}/api/plant/create`;
  let headers;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    debug("CREATE_PLANT_URL:", url);
    debug("CREATE_PLANT_PAYLOAD:", payload);
    debug("CREATE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  debug("CREATE_PLANT_URL:", url);
  debug("CREATE_PLANT_PAYLOAD:", payload);
  debug("CREATE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);

  debug("CREATE_PLANT_STATUS:", response.status);
  debug("CREATE_PLANT_RESPONSE:", body);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan plant");
  }

  return body;
}

export async function updatePlant(plantId, payload) {
  const url = `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}`;
  let headers;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    debug("UPDATE_PLANT_URL:", url);
    debug("UPDATE_PLANT_PAYLOAD:", payload);
    debug("UPDATE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  debug("UPDATE_PLANT_URL:", url);
  debug("UPDATE_PLANT_PAYLOAD:", payload);
  debug("UPDATE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);

  debug("UPDATE_PLANT_STATUS:", response.status);
  debug("UPDATE_PLANT_RESPONSE:", body);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan perubahan plant");
  }

  return body;
}

export async function deletePlant(plantId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }

  const url = `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}`;
  let headers;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    debug("DELETE_PLANT_URL:", url);
    debug("DELETE_PLANT_ID:", plantId);
    debug("DELETE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  debug("DELETE_PLANT_URL:", url);
  debug("DELETE_PLANT_ID:", plantId);
  debug("DELETE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });
  const body = await parseResponse(response);

  debug("DELETE_PLANT_STATUS:", response.status);
  debug("DELETE_PLANT_RESPONSE:", body);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus plant");
  }

  return body;
}

export async function fetchPlantAccess(plantId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/access`,
    {
      method: "GET",
      headers,
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal mengambil access plant.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function searchPlantAccessUsers(plantId, query) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/access/search`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal mencari user.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function addPlantAccessUser(
  plantId,
  userId,
  role = PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
) {
  const normalizedRole = normalizePlantAccessRole(role);

  if (!normalizedRole) {
    throw createServiceError(
      "Role tidak valid. Silakan pilih View Only atau Manage Access.",
      "INVALID_ROLE",
    );
  }

  if (userId == null || String(userId).trim() === "") {
    throw createServiceError("User tidak ditemukan.", "USER_NOT_FOUND");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/access`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, role: normalizedRole }),
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwPlantAccessApiError(
      response,
      body,
      "Gagal menambahkan user. Pastikan email dan role sudah benar.",
    );
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function updatePlantAccessUser(plantId, userId, role) {
  const normalizedRole = normalizePlantAccessRole(role);

  if (!normalizedRole) {
    throw createServiceError(
      "Role tidak valid. Silakan pilih View Only atau Manage Access.",
      "INVALID_ROLE",
    );
  }

  if (userId == null || String(userId).trim() === "") {
    throw createServiceError("User tidak ditemukan.", "USER_NOT_FOUND");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/access/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role: normalizedRole }),
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwPlantAccessApiError(
      response,
      body,
      "Gagal mengubah akses user. Pastikan role sudah benar.",
    );
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function removePlantAccessUser(plantId, userId) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/access/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers,
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus akses user.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

export async function linkDeviceToPlant(plantId, deviceId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }

  const normalizedDeviceId = String(deviceId || "").trim();

  if (!normalizedDeviceId) {
    throw new Error("Device ID tidak boleh kosong.");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/device`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ device_id: normalizedDeviceId }),
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan device. Coba lagi.");
  }

  return body;
}

export async function unlinkDeviceFromPlant(plantId, deviceId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }

  const normalizedDeviceId = String(deviceId || "").trim();

  if (!normalizedDeviceId) {
    throw new Error("Device ID tidak boleh kosong.");
  }

  const headers = await getAuthHeaders();
  const response = await fetch(
    `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/device/${encodeURIComponent(normalizedDeviceId)}`,
    {
      method: "DELETE",
      headers,
    },
  );
  const body = await parseResponse(response);

  if (!response.ok) {
    throwApiError(response, body, "Gagal melepas device dari plant.");
  }

  return body;
}

export async function fetchPlantDevices(plantId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }

  const headers = await getAuthHeaders();
  const url = `${BASE_URL}/api/plant/${encodeURIComponent(plantId)}/devices`;

  debug("FETCH_PLANT_DEVICES_URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const body = await parseResponse(response);

  debug("FETCH_PLANT_DEVICES_STATUS:", response.status);

  if (!response.ok) {
    debug("FETCH_PLANT_DEVICES_ERROR:", body);
    throwApiError(response, body, "Gagal mengambil data device.");
  }

  return body?.data ?? { plant: null, devices: [] };
}
