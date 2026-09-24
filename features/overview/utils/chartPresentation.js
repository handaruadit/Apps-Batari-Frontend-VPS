//========== IMPORTS ==========
import {
  DAY_SERIES_CONFIG,
  ENERGY_SERIES_CONFIG,
} from "../constants/overviewConstants";
import {
  getApiNumber,
  getRecordTimestampText,
  getRecordTimestampValue,
  parseChartTimestamp,
  pickValue,
} from "./apiData";
import { getYearRange } from "./dateTime";
import { normalizeSeriesRows } from "./powerData";

//========== DATE HELPERS ==========
export function getDayTimeRange(selectedDay, selectedMonth, selectedYear) {
  const startTimestamp = new Date(
    selectedYear,
    selectedMonth - 1,
    selectedDay,
  ).getTime();

  return {
    startTimestamp,
    endTimestamp: startTimestamp + 24 * 60 * 60 * 1000,
  };
}

export function getSelectedDateText(selectedDay, selectedMonth, selectedYear) {
  return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(
    selectedDay,
  ).padStart(2, "0")}`;
}

export function getAggregateLabels(
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  if (segment === "lifetime") {
    return (yearRange.length ? yearRange : getYearRange(selectedYear)).map(
      String,
    );
  }

  if (segment === "year") {
    return [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  }

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => String(index + 1));
}

export function getAggregateRecordIndex(
  record,
  fallbackIndex,
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  if (segment === "lifetime") {
    const years = yearRange.length ? yearRange : getYearRange(selectedYear);
    const explicitYear = Number(pickValue(record?.year, record?.label));
    return years.includes(explicitYear) ? years.indexOf(explicitYear) : -1;
  }

  if (segment === "year") {
    const explicitMonth = Number(pickValue(record?.month, record?.dateMonth));

    if (explicitMonth >= 1 && explicitMonth <= 12) {
      return explicitMonth - 1;
    }
  } else {
    const explicitDay = Number(pickValue(record?.day, record?.dateDay));

    if (explicitDay >= 1 && explicitDay <= 31) {
      return explicitDay - 1;
    }
  }

  const parsedDate = parseChartTimestamp(getRecordTimestampText(record));

  if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
    return segment === "year" ? parsedDate.getMonth() : parsedDate.getDate() - 1;
  }

  return fallbackIndex;
}

//========== CHART DATA HELPERS ==========
export function normalizeDayPowerSeries(series) {
  return DAY_SERIES_CONFIG.reduce((normalizedData, item) => {
    normalizedData[item.key] = normalizeSeriesRows(series?.[item.key])
      .map((record) => {
        const timestamp = getRecordTimestampValue(record);
        const value = getApiNumber(record);

        const isInvalidSoc = item.key === "soc" && (value < 0 || value > 100);

        if (timestamp === null || value === null || isInvalidSoc) {
          return null;
        }

        return { timestamp, value };
      })
      .filter(Boolean)
      .sort((left, right) => left.timestamp - right.timestamp);

    return normalizedData;
  }, {});
}

export function buildAggregateChartData({
  series,
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
}) {
  const labels = getAggregateLabels(
    segment,
    selectedYear,
    selectedMonth,
    yearRange,
  );
  const items = labels.map((label) => ({ label }));

  ENERGY_SERIES_CONFIG.forEach((config) => {
    normalizeSeriesRows(series?.[config.key]).forEach((record, fallbackIndex) => {
      const itemIndex = getAggregateRecordIndex(
        record,
        fallbackIndex,
        segment,
        selectedYear,
        selectedMonth,
        yearRange,
      );
      const value = getApiNumber(record);

      if (itemIndex < 0 || itemIndex >= items.length || value === null) {
        return;
      }

      items[itemIndex][config.key] =
        (items[itemIndex][config.key] ?? 0) + value;
    });
  });

  return items;
}

export function buildLinePath(points) {
  if (!points || !points.length) {
    return "";
  }

  // Filter out any non-finite coords or duplicate adjacent X coordinates
  const valid = points.filter((pt, idx, arr) => {
    if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return false;
    if (idx > 0 && Math.abs(pt.x - arr[idx - 1].x) < 0.0001) return false;
    return true;
  });

  if (valid.length === 0) return "";
  if (valid.length === 1) return `M ${valid[0].x.toFixed(1)} ${valid[0].y.toFixed(1)}`;
  if (valid.length === 2) {
    return `M ${valid[0].x.toFixed(1)} ${valid[0].y.toFixed(1)} L ${valid[1].x.toFixed(1)} ${valid[1].y.toFixed(1)}`;
  }

  let d = `M ${valid[0].x.toFixed(1)} ${valid[0].y.toFixed(1)}`;

  for (let i = 0; i < valid.length - 1; i++) {
    const p0 = valid[Math.max(0, i - 1)];
    const p1 = valid[i];
    const p2 = valid[i + 1];
    const p3 = valid[Math.min(valid.length - 1, i + 2)];

    let cp1x = p1.x + (p2.x - p0.x) / 6;
    let cp1y = p1.y + (p2.y - p0.y) / 6;
    let cp2x = p2.x - (p3.x - p1.x) / 6;
    let cp2y = p2.y - (p3.y - p1.y) / 6;

    // Monotonic clamping on Y: avoids artificial wave dips below zero or above peaks
    if (Math.abs(p1.y - p2.y) < 0.001) {
      cp1y = p1.y;
      cp2y = p2.y;
    } else if (p1.y < p2.y) {
      cp1y = Math.max(p1.y, Math.min(p2.y, cp1y));
      cp2y = Math.max(p1.y, Math.min(p2.y, cp2y));
    } else {
      cp1y = Math.min(p1.y, Math.max(p2.y, cp1y));
      cp2y = Math.min(p1.y, Math.max(p2.y, cp2y));
    }

    // Monotonic clamping on X
    cp1x = Math.max(p1.x, Math.min(p2.x, cp1x));
    cp2x = Math.max(p1.x, Math.min(p2.x, cp2x));

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export function findNearestDataPoint(
  points,
  targetTimestamp,
  maxDistanceMs = 15 * 60 * 1000,
) {
  let nearestPoint = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  (points || []).forEach((point) => {
    const distance = Math.abs(point.timestamp - targetTimestamp);

    if (distance < nearestDistance) {
      nearestPoint = point;
      nearestDistance = distance;
    }
  });

  return nearestDistance <= maxDistanceMs ? nearestPoint : null;
}

export function findNearestTimestamp(
  normalizedData,
  visibleSeries,
  targetTimestamp,
  maxDistanceMs = 15 * 60 * 1000,
) {
  const timestamps = DAY_SERIES_CONFIG.filter(
    (item) => visibleSeries[item.key],
  ).flatMap((item) =>
    (normalizedData[item.key] || []).map((point) => point.timestamp),
  );

  if (!timestamps.length) {
    return null;
  }

  const nearestTimestamp = timestamps.reduce((nearest, timestamp) =>
    Math.abs(timestamp - targetTimestamp) < Math.abs(nearest - targetTimestamp)
      ? timestamp
      : nearest,
  );

  return Math.abs(nearestTimestamp - targetTimestamp) <= maxDistanceMs
    ? nearestTimestamp
    : null;
}

export function hasChartData(series, keys = DAY_SERIES_CONFIG.map((item) => item.key)) {
  return keys.some((key) => Array.isArray(series?.[key]) && series[key].length);
}

export function getLastChartTimestamp(series) {
  const timestamps = DAY_SERIES_CONFIG.flatMap((item) =>
    normalizeSeriesRows(series?.[item.key])
      .map(getRecordTimestampValue)
      .filter((timestamp) => timestamp !== null),
  );

  return timestamps.length ? Math.max(...timestamps) : null;
}

export function getChartDataUnit(series, fallbackUnit = "kWh") {
  for (const config of ENERGY_SERIES_CONFIG) {
    const row = normalizeSeriesRows(series?.[config.key]).find(
      (item) => typeof item?.unit === "string" && item.unit.trim(),
    );

    if (row) {
      return row.unit.trim();
    }
  }

  return fallbackUnit;
}

export function buildFiveMinuteSlots() {
  return Array.from({ length: 24 * 12 }, (_, index) => {
    const totalMinutes = index * 5;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });
}
