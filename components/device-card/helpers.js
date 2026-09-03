//===== (Constants) ======
const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;

//===== (parseTimestamp) ======
function parseTimestamp(value) {
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

//===== (getLatestDataTimestamp) ======
function getLatestDataTimestamp(device) {
  return Math.max(
    0,
    parseTimestamp(device?.latestDataStatusTimestamp) || 0,
    parseTimestamp(device?.latestDataAt) || 0,
    parseTimestamp(device?.latest_data_at) || 0,
    parseTimestamp(device?.lastDataAt) || 0,
    parseTimestamp(device?.last_data_at) || 0,
    parseTimestamp(device?.latestDataTime) || 0,
    parseTimestamp(device?.latest_data_time) || 0,
    parseTimestamp(device?.last_seen) || 0,
    parseTimestamp(device?.timestamp) || 0,
  );
}

//===== (getPlantConnectionStatus) ======
export function getPlantConnectionStatus(device) {
  const latestTimestamp = getLatestDataTimestamp(device);
  const isOnline =
    latestTimestamp > 0 && Date.now() - latestTimestamp <= ONLINE_THRESHOLD_MS;

  return {
    key: isOnline ? "online" : "offline",
    isOnline,
    label: isOnline ? "Online" : "Offline",
    timestamp: latestTimestamp,
  };
}

//===== (formatCityProvince) ======
export function formatCityProvince(device) {
  if (device?.location && String(device.location).trim()) {
    return String(device.location).trim();
  }
  const city = String(device?.city || "").trim();
  const province = String(device?.province || "").trim();
  const locationParts = [city, province].filter(Boolean);

  return locationParts.length ? locationParts.join(", ") : "-";
}
