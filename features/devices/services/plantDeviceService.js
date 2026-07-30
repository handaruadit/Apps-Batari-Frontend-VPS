import { assertPlantId, throwApiError } from "@/features/plants/services/plantShared";
import { apiRequest } from "@/services/apiClient";

//===== (normalizeDeviceId) ======
function normalizeDeviceId(deviceId) {
  const normalizedDeviceId = String(deviceId || "").trim();

  if (!normalizedDeviceId) {
    throw new Error("Device ID tidak boleh kosong.");
  }

  return normalizedDeviceId;
}

//===== (linkDeviceToPlant) ======
export async function linkDeviceToPlant(plantId, deviceId) {
  assertPlantId(plantId);
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/device`,
    {
      method: "POST",
      body: { device_id: normalizedDeviceId },
    },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan device. Coba lagi.");
  }

  return body;
}

//===== (unlinkDeviceFromPlant) ======
export async function unlinkDeviceFromPlant(plantId, deviceId) {
  assertPlantId(plantId);
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/device/${encodeURIComponent(normalizedDeviceId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal melepas device dari plant.");
  }

  return body;
}

//===== (fetchPlantDevices) ======
export async function fetchPlantDevices(plantId) {
  assertPlantId(plantId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}/devices`,
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal mengambil data device.");
  }

  return body?.data ?? { plant: null, devices: [] };
}
