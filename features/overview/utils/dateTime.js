//===== (Date and Formatting Utilities) ======
//===== (normalizeRouteParam) ======
export function normalizeRouteParam(value) {
  if (Array.isArray(value)) {
    return normalizeRouteParam(value[0]);
  }

  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (
    !normalizedValue ||
    normalizedValue === "[id]" ||
    normalizedValue === "undefined" ||
    normalizedValue === "null"
  ) {
    return null;
  }

  return normalizedValue;
}

//===== (resolvePlantId) ======
export function resolvePlantId(routeId, fallbackId) {
  return normalizeRouteParam(routeId) ?? normalizeRouteParam(fallbackId);
}

//===== (formatCompactNumber) ======
export function formatCompactNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return String(number);
}

//===== (formatKwValue) ======
export function formatKwValue(value) {
  return `${formatCompactNumber(value)} kW`;
}

//===== (hasActivePowerFlowValue) ======
export function hasActivePowerFlowValue(value) {
  return Math.abs(Number(value) || 0) > 0;
}

//===== (formatRealtimeClock) ======
export function formatRealtimeClock(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

//===== (formatChartHour) ======
export function formatChartHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

//===== (getJakartaDateParts) ======
export function getJakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  //===== (getPart) ======
  const getPart = (type) =>
    Number(parts.find((item) => item.type === type)?.value || 0);

  return {
    day: getPart("day"),
    month: getPart("month"),
    year: getPart("year"),
  };
}

//===== (getYearRange) ======
export function getYearRange(selectedYear) {
  const year = Number(selectedYear);
  const safeYear = Number.isFinite(year) ? year : getJakartaDateParts().year;

  return Array.from({ length: 5 }, (_, index) => safeYear - 3 + index);
}

//===== (getChartApiSegment) ======
export function getChartApiSegment(segment) {
  return segment === "lifetime" ? "year" : segment;
}
