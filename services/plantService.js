import { clearAuth, getToken, isTokenValid } from "@/auth/token";
import { BASE_URL } from "@/config/api";

export const DEMO_PLANT_NAME = "Plant Testing";

export function isDemoPlant(plant) {
  return String(plant?.name || "").trim().toLowerCase() ===
    DEMO_PLANT_NAME.toLowerCase();
}

async function getAuthHeaders() {
  const token = await getToken();

  if (!token || !isTokenValid(token)) {
    await clearAuth();
    const error = new Error("Sesi Anda telah habis atau token tidak valid.");
    error.code = "AUTH_EXPIRED";
    throw error;
  }

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
  const url = `${BASE_URL}/api/plant/create`;
  let headers;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    console.log("CREATE_PLANT_URL:", url);
    console.log("CREATE_PLANT_PAYLOAD:", payload);
    console.log("CREATE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  console.log("CREATE_PLANT_URL:", url);
  console.log("CREATE_PLANT_PAYLOAD:", payload);
  console.log("CREATE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);

  console.log("CREATE_PLANT_STATUS:", response.status);
  console.log("CREATE_PLANT_RESPONSE:", body);

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
    console.log("UPDATE_PLANT_URL:", url);
    console.log("UPDATE_PLANT_PAYLOAD:", payload);
    console.log("UPDATE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  console.log("UPDATE_PLANT_URL:", url);
  console.log("UPDATE_PLANT_PAYLOAD:", payload);
  console.log("UPDATE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);

  console.log("UPDATE_PLANT_STATUS:", response.status);
  console.log("UPDATE_PLANT_RESPONSE:", body);

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
    console.log("DELETE_PLANT_URL:", url);
    console.log("DELETE_PLANT_ID:", plantId);
    console.log("DELETE_PLANT_HAS_TOKEN:", false);
    throw error;
  }

  console.log("DELETE_PLANT_URL:", url);
  console.log("DELETE_PLANT_ID:", plantId);
  console.log("DELETE_PLANT_HAS_TOKEN:", Boolean(headers.Authorization));

  const response = await fetch(url, {
    method: "DELETE",
    headers,
  });
  const body = await parseResponse(response);

  console.log("DELETE_PLANT_STATUS:", response.status);
  console.log("DELETE_PLANT_RESPONSE:", body);

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus plant");
  }

  return body;
}
