import { apiRequest, createServiceError } from "@/services/apiClient";
import {
  assertPlantId,
  normalizePlantAccessRole,
  PLANT_ACCESS_ROLE_VALUES,
  throwApiError,
  throwPlantAccessApiError,
} from "./plantShared";

//===== (fetchPlantAccess) ======
export async function fetchPlantAccess(plantId) {
  assertPlantId(plantId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/access`,
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal mengambil access plant.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

//===== (searchPlantAccessUsers) ======
export async function searchPlantAccessUsers(plantId, query) {
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/access/search`,
    {
      method: "POST",
      body: { query },
    },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal mencari user.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

//===== (validateAccessInput) ======
function validateAccessInput(userId, role) {
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

  return normalizedRole;
}

//===== (addPlantAccessUser) ======
export async function addPlantAccessUser(
  plantId,
  userId,
  role = PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY,
) {
  const normalizedRole = validateAccessInput(userId, role);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/access`,
    {
      method: "POST",
      body: { userId, role: normalizedRole },
    },
  );

  if (!response.ok) {
    throwPlantAccessApiError(
      response,
      body,
      "Gagal menambahkan user. Pastikan email dan role sudah benar.",
    );
  }

  return Array.isArray(body?.data) ? body.data : [];
}

//===== (updatePlantAccessUser) ======
export async function updatePlantAccessUser(plantId, userId, role) {
  const normalizedRole = validateAccessInput(userId, role);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/access/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      body: { role: normalizedRole },
    },
  );

  if (!response.ok) {
    throwPlantAccessApiError(
      response,
      body,
      "Gagal mengubah akses user. Pastikan role sudah benar.",
    );
  }

  return Array.isArray(body?.data) ? body.data : [];
}

//===== (removePlantAccessUser) ======
export async function removePlantAccessUser(plantId, userId) {
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/access/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus akses user.");
  }

  return Array.isArray(body?.data) ? body.data : [];
}
