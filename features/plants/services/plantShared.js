import { createServiceError } from "@/services/apiClient";

//===== (Constants) ======
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

//===== (isDemoPlant) ======
export function isDemoPlant(plant) {
  return (
    String(plant?.name || "")
      .trim()
      .toLowerCase() === DEMO_PLANT_NAME.toLowerCase()
  );
}

//===== (normalizePlantAccessRole) ======
export function normalizePlantAccessRole(role) {
  const key = String(role || "")
    .trim()
    .toLowerCase();

  return PLANT_ACCESS_ROLE_ALIASES[key] || "";
}

//===== (isValidPlantAccessRole) ======
export function isValidPlantAccessRole(role) {
  return Boolean(normalizePlantAccessRole(role));
}

//===== (throwApiError) ======
export function throwApiError(response, body, fallbackMessage) {
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

//===== (collectErrorText) ======
function collectErrorText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(collectErrorText).filter(Boolean).join(" ");
  }
  if (typeof value === "object") {
    return Object.values(value).map(collectErrorText).filter(Boolean).join(" ");
  }
  return String(value);
}

//===== (getPlantAccessErrorMessage) ======
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

//===== (throwPlantAccessApiError) ======
export function throwPlantAccessApiError(response, body, fallbackMessage) {
  throw createServiceError(
    getPlantAccessErrorMessage(response, body, fallbackMessage),
    "PLANT_ACCESS_ERROR",
    response.status,
    body,
  );
}

//===== (assertPlantId) ======
export function assertPlantId(plantId) {
  if (plantId == null || String(plantId).trim() === "") {
    throw new Error("ID plant tidak valid.");
  }
}
