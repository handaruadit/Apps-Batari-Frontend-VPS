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
  const rawStatus = String(
    device?.status || device?.connection_status || device?.connectionStatus || ""
  )
    .trim()
    .toLowerCase();

  const isExplicitOffline =
    rawStatus === "offline" ||
    rawStatus === "all_offline" ||
    device?.connectStatus === 0 ||
    device?.connectStatus === 3;

  if (isExplicitOffline) {
    return {
      key: "offline",
      statusKey: "offline",
      isOnline: false,
      label: "Offline",
      timestamp: getLatestDataTimestamp(device),
    };
  }

  const isExplicitOnline =
    rawStatus === "online" ||
    rawStatus === "normal" ||
    device?.connectStatus === 1 ||
    device?.is_online === true;

  const latestTimestamp = getLatestDataTimestamp(device);
  const isRecentTimestamp =
    latestTimestamp > 0 && Date.now() - latestTimestamp <= ONLINE_THRESHOLD_MS;

  const isOnline = isExplicitOnline || isRecentTimestamp;

  return {
    key: isOnline ? "online" : "offline",
    statusKey: isOnline ? "online" : "offline",
    isOnline,
    label: isOnline ? "Online" : "Offline",
    timestamp: latestTimestamp || (isOnline ? Date.now() : 0),
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

//===== (formatPlantCapacity) ======
export function formatPlantCapacity(device) {
  const cap = Number(
    device?.pv_capacity ?? device?.installed_capacity ?? device?.capacity ?? 0
  );
  if (!Number.isFinite(cap) || cap <= 0) {
    return null;
  }
  if (cap >= 1000) {
    return `${(cap / 1000).toFixed(2)} MWp`;
  }
  return `${Number(cap.toFixed(1))} kWp`;
}

//===== (formatPlantLivePower) ======
export function formatPlantLivePower(device, connectionStatus) {
  if (connectionStatus && !connectionStatus.isOnline) {
    return null;
  }
  const statusStr = String(device?.status || device?.connectionStatus || "").toLowerCase();
  if (statusStr === "offline" || statusStr === "all_offline") {
    return null;
  }
  const rawVal = Number(device?.production ?? device?.pvKw ?? 0);
  if (!Number.isFinite(rawVal) || rawVal <= 0) {
    return null;
  }
  return `${rawVal.toFixed(1)} kW`;
}


