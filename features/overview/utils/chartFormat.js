//========== NUMBER HELPERS ==========
export function formatAxisValue(value) {
  const absoluteValue = Math.abs(Number(value));

  if (absoluteValue >= 1000) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  if (absoluteValue >= 10) {
    return Number(value).toFixed(0);
  }

  return Number(value).toFixed(absoluteValue > 0 && absoluteValue < 1 ? 1 : 0);
}

export function formatPower(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)} kW` : "No data";
}

export function formatEnergy(value, unit) {
  return Number.isFinite(value) ? `${value.toFixed(value >= 100 ? 0 : 1)} ${unit}` : "No data";
}

//========== DATE HELPERS ==========
export function formatChartTime(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return "--:--";
  }

  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastDataTime(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

//========== CHART DATA HELPERS ==========
export function getEnergyDisplayScale(values, sourceUnit = "kWh") {
  const normalizedUnit = String(sourceUnit).toLowerCase();
  const maxValue = Math.max(0, ...(values || []).map((value) => Math.abs(value)));

  if (normalizedUnit === "kwh" && maxValue >= 1000) {
    return { unit: "MWh", divisor: 1000 };
  }

  return { unit: sourceUnit || "kWh", divisor: 1 };
}
