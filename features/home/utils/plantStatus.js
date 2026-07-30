//===== (Imports) ======
import {
  fetchPlantDevices,
  isDemoPlant,
} from "@/services/plantService";

//===== (Constants) ======
const STATUS_TIMESTAMP_FIELD_PATTERN =
  /(^|_)(last|latest|created|updated|inserted|received|seen)(_|$)|timestamp|datetime|date_time|time/i;

//===== (parseStatusTimestamp) ======
function parseStatusTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const milliseconds = value < 10000000000 ? value * 1000 : value;
    return Number.isFinite(milliseconds) ? milliseconds : null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

//===== (collectStatusTimestamps) ======
function collectStatusTimestamps(source, timestamps = []) {
  if (!source || typeof source !== "object") {
    return timestamps;
  }

  if (Array.isArray(source)) {
    source.forEach((item) => collectStatusTimestamps(item, timestamps));
    return timestamps;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (STATUS_TIMESTAMP_FIELD_PATTERN.test(key)) {
      const timestamp = parseStatusTimestamp(value);

      if (timestamp) {
        timestamps.push(timestamp);
      }
    }

    if (value && typeof value === "object") {
      collectStatusTimestamps(value, timestamps);
    }
  });

  return timestamps;
}

//===== (getLatestStatusTimestamp) ======
function getLatestStatusTimestamp(source) {
  return Math.max(0, ...collectStatusTimestamps(source));
}

//===== (getDeviceLatestDataTimestamp) ======
function getDeviceLatestDataTimestamp(device) {
  const latestDataTimestamps = collectStatusTimestamps(device?.latestData);

  return Math.max(
    0,
    parseStatusTimestamp(device?.latestDataAt) || 0,
    parseStatusTimestamp(device?.latest_data_at) || 0,
    parseStatusTimestamp(device?.lastDataAt) || 0,
    parseStatusTimestamp(device?.last_data_at) || 0,
    parseStatusTimestamp(device?.timestamp) || 0,
    ...latestDataTimestamps,
  );
}

//===== (attachLatestDeviceTimestamps) ======
export async function attachLatestDeviceTimestamps(plants) {
  return Promise.all(
    plants.map(async (plant) => {
      if (isDemoPlant(plant)) {
        return {
          ...plant,
          hasDeviceId: true,
          latestDataStatusTimestamp: Date.now(),
        };
      }

      try {
        const result = await fetchPlantDevices(plant.id);
        const devices = Array.isArray(result?.devices) ? result.devices : [];
        const latestDataTimestamp = Math.max(
          0,
          ...devices.map(getDeviceLatestDataTimestamp),
        );

        return {
          ...plant,
          hasDeviceId: devices.length > 0,
          latestDataStatusTimestamp: latestDataTimestamp || null,
        };
      } catch (error) {
        console.warn(
          "Failed to load latest device timestamp for plant status:",
          plant?.id,
          error?.message || error,
        );

        return {
          ...plant,
          latestDataStatusTimestamp: getLatestStatusTimestamp(plant) || null,
        };
      }
    }),
  );
}
