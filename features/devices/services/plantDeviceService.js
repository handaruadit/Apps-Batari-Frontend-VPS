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

  const plant = body?.data?.plant ?? null;
  let devices = Array.isArray(body?.data?.devices) ? body.data.devices : [];

  const inverters = devices.filter(
    (d) => d.type === "INVERTER" || d.deviceType === "INVERTER",
  );

  // If no physical inverters found in plant_devices, fetch from station telemetry
  const targetStationId =
    plant?.deye_station_id ||
    plant?.deyeStationId ||
    (Number(plantId) >= 100000 ? plantId : null);

  if (inverters.length === 0 && targetStationId) {
    try {
      const { response: stRes, body: stBody } = await apiRequest(
        `/api/data/stations/${encodeURIComponent(targetStationId)}`,
      );
      const stationDevices = stBody?.data?.devices || stBody?.devices;
      if (stRes.ok && Array.isArray(stationDevices) && stationDevices.length > 0) {
        const deyeInverters = stationDevices.filter(
          (d) => d.type === "INVERTER" || d.deviceType === "INVERTER",
        );
        if (deyeInverters.length > 0) {
          devices = deyeInverters;
        }
      }
    } catch (_err) {
      // Fallback silently to existing devices
    }
  }

  return { plant, devices };
}
