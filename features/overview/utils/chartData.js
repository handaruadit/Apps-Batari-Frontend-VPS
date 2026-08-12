//========== IMPORTS ==========
import { BASE_URL } from "@/config/api";
import {
  DAY_SERIES_CONFIG,
  DEBUG_CHART,
  ENERGY_SERIES_CONFIG,
  POWER_CHART_LAYOUT,
  POWER_CHART_RESPONSIVE_WIDTH,
  POWER_CHART_TIME_TICKS,
} from "../constants/overviewConstants";
import { getApiNumber, getPowerCategoryAliases } from "./apiData";
import { getChartApiSegment } from "./dateTime";
import {
  getChartDataUnit,
  normalizeChartSeries,
  normalizeSeriesRows,
} from "./powerData";

//========== NUMBER HELPERS ==========
export function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

//========== CHART DATA HELPERS ==========
export function getResponsiveChartWidth(windowWidth) {
  return Math.min(
    POWER_CHART_RESPONSIVE_WIDTH.max,
    Math.max(
      POWER_CHART_RESPONSIVE_WIDTH.min,
      windowWidth - POWER_CHART_RESPONSIVE_WIDTH.horizontalGap,
    ),
  );
}

export function getResponsiveChartTimeTicks(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return [0, 6, 12, 18, 24];
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return [0, 4, 8, 12, 16, 20, 24];
  }

  return POWER_CHART_TIME_TICKS;
}

export function getResponsiveChartTimeFontSize(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return 10;
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return 11;
  }

  return POWER_CHART_LAYOUT.timeLabelFontSize;
}

export function createEmptyChartSeries() {
  return DAY_SERIES_CONFIG.reduce((items, item) => {
    items[item.key] = [];
    return items;
  }, {});
}

function aggregateSeriesRows(rows) {
  const normalizedRows = normalizeSeriesRows(rows);

  if (!normalizedRows.length) {
    return null;
  }

  return normalizedRows.reduce(
    (total, row) => total + (getApiNumber(row) ?? 0),
    0,
  );
}

export function buildYearRangeChartSeries(chartResults, yearRange) {
  return ENERGY_SERIES_CONFIG.reduce((series, item) => {
    series[item.key] = yearRange.flatMap((year, index) => {
      const chartResult = chartResults[index];

      if (!chartResult?.ok || chartResult?.json?.data == null) {
        return [];
      }

      const normalizedSeries = normalizeChartSeries(chartResult.json.data);
      const value = aggregateSeriesRows(normalizedSeries[item.key]);

      if (value === null) {
        return [];
      }

      return [{
        value,
        year,
        label: String(year),
        unit: getChartDataUnit(chartResult.json.data),
      }];
    });

    return series;
  }, {});
}

export function getChartSeriesCounts(series) {
  return DAY_SERIES_CONFIG.reduce((counts, item) => {
    counts[item.key] = Array.isArray(series?.[item.key])
      ? series[item.key].length
      : 0;
    return counts;
  }, {});
}

export function getChartRequestDate(
  segment,
  selectedDay,
  selectedMonth,
  selectedYear,
) {
  const month = String(selectedMonth).padStart(2, "0");
  const day = String(selectedDay).padStart(2, "0");

  if (segment === "day") {
    return `${selectedYear}-${month}-${day}`;
  }

  if (segment === "month") {
    return `${selectedYear}-${month}`;
  }

  if (segment === "year") {
    return String(selectedYear);
  }

  return null;
}

export function debugChartLog(message, payload = {}) {
  if (DEBUG_CHART && __DEV__) {
    console.log(`[chart-debug] ${message}`, payload);
  }
}

//========== API HELPERS ==========
export function buildChartSelectionKey(
  segment,
  plantId,
  selectedDay,
  selectedMonth,
  selectedYear,
  dataSource = "plant",
) {
  return [
    segment,
    plantId,
    dataSource,
    String(selectedYear),
    String(selectedMonth).padStart(2, "0"),
    String(selectedDay).padStart(2, "0"),
  ].join(":");
}

export function buildLatestPowerRequests(
  plantId,
  config,
  dataSourceDeviceId = null,
) {
  return getPowerCategoryAliases(config.category).map((category) => ({
    sourceCategory: config.category,
    endpoint: `${BASE_URL}/api/data/?${buildQueryString({
      plantId,
      category,
      type: config.types.join(","),
      latestBy: "inserted",
      device_id: dataSourceDeviceId,
      deviceId: dataSourceDeviceId,
    })}`,
  }));
}

export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

export function buildChartEndpoint(
  segment,
  plantId,
  selectedDay,
  selectedMonth,
  selectedYear,
  dataSourceDeviceId = null,
) {
  const apiSegment = getChartApiSegment(segment);
  const date = getChartRequestDate(
    apiSegment,
    selectedDay,
    selectedMonth,
    selectedYear,
  );
  const sourceParams = {
    device_id: dataSourceDeviceId,
    deviceId: dataSourceDeviceId,
  };

  if (apiSegment === "month") {
    return `${BASE_URL}/api/data/chart/monthly?${buildQueryString({
      plantId: String(plantId),
      month: date,
      ...sourceParams,
    })}`;
  }

  if (apiSegment === "year") {
    return `${BASE_URL}/api/data/chart/yearly?${buildQueryString({
      plantId: String(plantId),
      year: date,
      ...sourceParams,
    })}`;
  }

  return `${BASE_URL}/api/data/chart?${buildQueryString({
    plantId: String(plantId),
    segment: apiSegment,
    date,
    ...sourceParams,
  })}`;
}
