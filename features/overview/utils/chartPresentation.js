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
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
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
