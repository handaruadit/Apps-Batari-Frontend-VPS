//===== (Imports) ======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/api";
import {
  CHART_STORAGE_PREFIX,
  DEBUG_CHART,
  DEMO_POWER_VALUES,
  POWER_CHART_HISTORY_MAX_POINTS,
  POWER_CHART_LAYOUT,
  POWER_CHART_RESPONSIVE_WIDTH,
  POWER_CHART_SAMPLE_MIN_GAP_MS,
  POWER_CHART_TIME_TICKS,
  POWER_CHART_YEAR_X_TICKS,
  POWER_SERIES_CONFIG,
} from "../constants/overviewConstants";
import {
  getApiNumber,
  getPowerCategoryAliases,
  getRecordTimestampValue,
} from "./apiData";
import { getChartApiSegment, getJakartaDateParts, getYearRange } from "./dateTime";
import {
  getChargeChartValue,
  getChartDataUnit,
  hasChartSeriesRows,
  mergeChartSeries,
  normalizeChartSeries,
  normalizeSeriesRows,
  splitBatteryChargeValue,
} from "./powerData";
//===== (Chart Data Utilities) ======
//===== (getResponsiveChartWidth) ======
export function getResponsiveChartWidth(windowWidth) {
  return Math.min(
    POWER_CHART_RESPONSIVE_WIDTH.max,
    Math.max(
      POWER_CHART_RESPONSIVE_WIDTH.min,
      windowWidth - POWER_CHART_RESPONSIVE_WIDTH.horizontalGap,
    ),
  );
}

//===== (getResponsiveChartTimeTicks) ======
export function getResponsiveChartTimeTicks(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return [0, 6, 12, 18, 24];
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return [0, 4, 8, 12, 16, 20, 24];
  }

  return POWER_CHART_TIME_TICKS;
}

//===== (getResponsiveChartTimeFontSize) ======
export function getResponsiveChartTimeFontSize(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return 10;
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return 11;
  }

  return POWER_CHART_LAYOUT.timeLabelFontSize;
}

//===== (clampChartValue) ======
export function clampChartValue(value, minY, maxY) {
  return Math.max(minY, Math.min(maxY, Number(value || 0)));
}

//===== (isFiniteCoordinate) ======
export function isFiniteCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number);
}

//===== (createEmptyChartSeries) ======
export function createEmptyChartSeries() {
  return POWER_SERIES_CONFIG.reduce((items, item) => {
    items[item.key] = [];
    return items;
  }, {});
}

//===== (limitChartSeriesRows) ======
export function limitChartSeriesRows(series) {
  return POWER_SERIES_CONFIG.reduce((limited, item) => {
    const rows = series?.[item.key] ?? [];
    limited[item.key] = rows.slice(-POWER_CHART_HISTORY_MAX_POINTS);
    return limited;
  }, {});
}

//===== (mergeAndLimitChartSeries) ======
export function mergeAndLimitChartSeries(...seriesGroups) {
  return limitChartSeriesRows(mergeChartSeries(...seriesGroups));
}

//===== (createDemoChartRow) ======
export function createDemoChartRow(value, dateFields) {
  return {
    value: Number(value.toFixed(3)),
    ...dateFields,
  };
}

//===== (buildDemoChartSeries) ======
export function buildDemoChartSeries(
  segment,
  selectedDay,
  selectedMonth,
  selectedYear,
  yearRange,
) {
  const series = createEmptyChartSeries();

  if (segment === "lifetime") {
    const years =
      Array.isArray(yearRange) && yearRange.length
        ? yearRange
        : getYearRange(selectedYear);

    POWER_SERIES_CONFIG.forEach((item, itemIndex) => {
      series[item.key] = years.map((year, index) => {
        const base = Math.max(0, Number(DEMO_POWER_VALUES[item.key] || 0));
        const factor = 1 + (index - 2) * 0.08 + itemIndex * 0.01;
        return createDemoChartRow(base * 12 * factor, {
          year,
          label: String(year),
        });
      });
    });

    return series;
  }

  if (segment === "year") {
    POWER_SERIES_CONFIG.forEach((item, itemIndex) => {
      series[item.key] = POWER_CHART_YEAR_X_TICKS.map((month) => {
        const base = Math.max(0, Number(DEMO_POWER_VALUES[item.key] || 0));
        const monthlyShape = 0.82 + 0.18 * Math.sin((month / 12) * Math.PI);
        const factor = monthlyShape + itemIndex * 0.01;
        return createDemoChartRow(base * 30 * factor, {
          month,
          year: selectedYear,
          label: String(month),
          date: `${selectedYear}-${String(month).padStart(2, "0")}`,
        });
      });
    });

    return series;
  }

  if (segment === "month") {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    POWER_SERIES_CONFIG.forEach((item, itemIndex) => {
      series[item.key] = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const base = Math.max(0, Number(DEMO_POWER_VALUES[item.key] || 0));
        const dailyShape =
          0.72 + 0.22 * Math.sin((day / daysInMonth) * Math.PI);
        return createDemoChartRow(base * dailyShape * (1 + itemIndex * 0.01), {
          day,
          month: selectedMonth,
          year: selectedYear,
          date: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        });
      });
    });

    return series;
  }

  POWER_SERIES_CONFIG.forEach((item, itemIndex) => {
    series[item.key] = Array.from({ length: 24 }, (_, hour) => {
      const base = Math.max(0, Number(DEMO_POWER_VALUES[item.key] || 0));
      const daylight =
        hour >= 6 && hour <= 18 ? Math.sin(((hour - 6) / 12) * Math.PI) : 0.15;
      const value = base * Math.max(0.08, daylight + itemIndex * 0.015);

      return createDemoChartRow(value, {
        createdAt: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00`,
      });
    });
  });

  return series;
}

//===== (aggregateSeriesRows) ======
export function aggregateSeriesRows(rows) {
  return normalizeSeriesRows(rows).reduce((total, row) => {
    const value = getApiNumber(row);

    if (value === null) {
      return total;
    }

    return total + Math.abs(value);
  }, 0);
}

//===== (buildYearRangeChartSeries) ======
export function buildYearRangeChartSeries(chartResults, yearRange) {
  return POWER_SERIES_CONFIG.reduce((series, item) => {
    series[item.key] = yearRange.map((year, index) => {
      const chartResult = chartResults[index];
      const normalizedSeries =
        chartResult?.ok && chartResult?.json?.data != null
          ? normalizeChartSeries(chartResult.json.data)
          : createEmptyChartSeries();

      return {
        value: aggregateSeriesRows(normalizedSeries[item.key], year),
        year,
        label: String(year),
        unit: getChartDataUnit(chartResult?.json?.data),
      };
    });

    return series;
  }, {});
}

//===== (getStoredChartSeriesKey) ======
export function getStoredChartSeriesKey(chartSelectionKey) {
  return `${CHART_STORAGE_PREFIX}${chartSelectionKey}`;
}

//===== (loadStoredChartSeries) ======
export async function loadStoredChartSeries(chartSelectionKey) {
  if (!chartSelectionKey) {
    return createEmptyChartSeries();
  }

  try {
    const rawValue = await AsyncStorage.getItem(
      getStoredChartSeriesKey(chartSelectionKey),
    );

    if (!rawValue) {
      return createEmptyChartSeries();
    }

    const parsedValue = JSON.parse(rawValue);
    const storedSeries = parsedValue?.chartSeries ?? parsedValue;

    return mergeAndLimitChartSeries(storedSeries);
  } catch (error) {
    console.warn("Gagal memuat data grafik tersimpan:", error);
    return createEmptyChartSeries();
  }
}

//===== (saveStoredChartSeries) ======
export async function saveStoredChartSeries(chartSelectionKey, chartSeries) {
  if (!chartSelectionKey) {
    return;
  }

  const limitedSeries = mergeAndLimitChartSeries(chartSeries);

  if (!hasChartSeriesRows(limitedSeries)) {
    return;
  }

  try {
    await AsyncStorage.setItem(
      getStoredChartSeriesKey(chartSelectionKey),
      JSON.stringify({
        savedAt: new Date().toISOString(),
        chartSeries: limitedSeries,
      }),
    );
  } catch (error) {
    console.warn("Gagal menyimpan data grafik:", error);
  }
}

//===== (getChartSeriesCounts) ======
export function getChartSeriesCounts(series) {
  return POWER_SERIES_CONFIG.reduce((counts, item) => {
    counts[item.key] = Array.isArray(series?.[item.key])
      ? series[item.key].length
      : 0;
    return counts;
  }, {});
}

//===== (getChartRequestDate) ======
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

//===== (debugChartLog) ======
export function debugChartLog(message, payload = {}) {
  if (!DEBUG_CHART || !__DEV__) {
    return;
  }

  console.log(`[chart-debug] ${message}`, payload);
}

//===== (removeStoredChartSeries) ======
export async function removeStoredChartSeries(chartSelectionKey) {
  if (!chartSelectionKey) {
    return;
  }

  try {
    await AsyncStorage.removeItem(getStoredChartSeriesKey(chartSelectionKey));
  } catch (error) {
    console.warn("Gagal menghapus cache grafik:", error);
  }
}

//===== (getLatestChartTimestampValue) ======
export function getLatestChartTimestampValue(series) {
  const timestamps = POWER_SERIES_CONFIG.map((item) => {
    const rows = series?.[item.key] ?? [];
    return rows.length ? getRecordTimestampValue(rows[rows.length - 1]) : null;
  }).filter((value) => value !== null);

  return timestamps.length ? Math.max(...timestamps) : null;
}

//===== (shouldAppendRealtimeChartSample) ======
export function shouldAppendRealtimeChartSample(currentSeries, sampleSeries) {
  if (!hasChartSeriesRows(sampleSeries)) {
    return false;
  }

  if (!hasChartSeriesRows(currentSeries)) {
    return true;
  }

  const hasChangedValue = POWER_SERIES_CONFIG.some((item) => {
    const sampleRow = sampleSeries?.[item.key]?.[0];
    const sampleValue = getApiNumber(sampleRow);

    if (sampleValue === null) {
      return false;
    }

    const currentRows = currentSeries?.[item.key] ?? [];
    const currentValue = getApiNumber(currentRows[currentRows.length - 1]);

    return (
      currentValue === null || Math.abs(currentValue - sampleValue) > 0.0001
    );
  });

  if (hasChangedValue) {
    return true;
  }

  const latestTimestamp = getLatestChartTimestampValue(currentSeries);

  return (
    latestTimestamp === null ||
    Date.now() - latestTimestamp >= POWER_CHART_SAMPLE_MIN_GAP_MS
  );
}

//===== (createRealtimeChartSampleSeries) ======
export function createRealtimeChartSampleSeries(powerValues, timestamp = new Date()) {
  const createdAt = timestamp.toISOString();
  const series = createEmptyChartSeries();

  //===== (addSample) ======
  const addSample = (key, category, type, value) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return;
    }

    series[key] = [
      {
        category,
        type,
        value: number,
        createdAt,
      },
    ];
  };

  addSample("production", "pv", "chargePower", powerValues.production);
  addSample("grid", "grid", "power", powerValues.grid);
  addSample(
    "battery",
    "baterai",
    "power",
    splitBatteryChargeValue(powerValues.battery, "battery"),
  );
  addSample("pvGenerate", "production", "pvGenerate", powerValues.pvGenerate);
  addSample("export", "production", "export", powerValues.export);
  addSample(
    "charge",
    "production",
    "charge",
    getChargeChartValue(powerValues.charge, powerValues.battery),
  );

  return series;
}

//===== (buildChartSelectionKey) ======
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

//===== (isSelectedCurrentDay) ======
export function isSelectedCurrentDay(
  segment,
  selectedDay,
  selectedMonth,
  selectedYear,
) {
  const now = getJakartaDateParts();

  return (
    segment === "day" &&
    selectedDay === now.day &&
    selectedMonth === now.month &&
    selectedYear === now.year
  );
}

//===== (buildFallbackSeries) ======
export function buildFallbackSeries(value, index) {
  const number = Number(value || 0);
  const shape = [0.92, 0.78, 1.04, 1.12, 1.02, 0.82];

  return shape.map((ratio) =>
    Number((number * (ratio + index * 0.015)).toFixed(2)),
  );
}

//===== (buildZeroSeries) ======
export function buildZeroSeries(length = 6) {
  return Array.from({ length }, () => 0);
}

//===== (getChartFallbackValue) ======
export function getChartFallbackValue(key, plantData) {
  if (key === "pvGenerate") {
    return null;
  }

  if (key === "export") {
    return null;
  }

  if (key === "charge") {
    return null;
  }

  return plantData?.[key] ?? 0;
}

//===== (buildLatestPowerRequests) ======
export function buildLatestPowerRequests(plantId, config, dataSourceDeviceId = null) {
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

//===== (buildQueryString) ======
export function buildQueryString(params) {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

//===== (buildChartEndpoint) ======
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
  const params = {
    plantId: String(plantId),
    segment: apiSegment,
    device_id: dataSourceDeviceId,
    deviceId: dataSourceDeviceId,
  };

  if (date) {
    params.date = date;
  }

  if (apiSegment === "month") {
    return `${BASE_URL}/api/data/chart/monthly?${buildQueryString({
      plantId: String(plantId),
      month: date,
      device_id: dataSourceDeviceId,
      deviceId: dataSourceDeviceId,
    })}`;
  }

  if (apiSegment === "year") {
    return `${BASE_URL}/api/data/chart/yearly?${buildQueryString({
      plantId: String(plantId),
      year: date,
      device_id: dataSourceDeviceId,
      deviceId: dataSourceDeviceId,
    })}`;
  }

  return `${BASE_URL}/api/data/chart?${buildQueryString(params)}`;
}
