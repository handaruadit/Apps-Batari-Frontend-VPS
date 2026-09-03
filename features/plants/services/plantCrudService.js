import { apiRequest } from "@/services/apiClient";
import { assertPlantId, throwApiError } from "./plantShared";

//===== (fetchPlants) ======
export async function fetchPlants() {
  const { response, body } = await apiRequest("/api/plant/");

  if (!response.ok) {
    throwApiError(response, body, "Gagal mengambil data plant");
  }

  return Array.isArray(body?.data) ? body.data : [];
}

//===== (createPlant) ======
export async function createPlant(payload) {
  const { response, body } = await apiRequest("/api/plant/create", {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan plant");
  }

  return body;
}

//===== (updatePlant) ======
export async function updatePlant(plantId, payload) {
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}`,
    {
      method: "PUT",
      body: payload,
    },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan perubahan plant");
  }

  return body;
}

//===== (deletePlant) ======
export async function deletePlant(plantId) {
  assertPlantId(plantId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus plant");
  }

  return body;
}

