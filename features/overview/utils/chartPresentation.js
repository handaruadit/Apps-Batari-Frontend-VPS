//===== (Imports) ======
import {
  POWER_CHART_AGGREGATE_UNIT_FALLBACK,
  POWER_CHART_MONTH_X_TICKS,
  POWER_CHART_MONTH_Y_RANGE,
  POWER_CHART_YEAR_X_TICKS,
  POWER_SERIES_CONFIG,
} from "../constants/overviewConstants";
import {
  getApiNumber,
  getRecordTimestampText,
  getRecordTimestampValue,
  parseChartTimestamp,
  pickValue,
} from "./apiData";
import { clampChartValue } from "./chartData";
import { getJakartaDateParts, getYearRange } from "./dateTime";
import { normalizeSeriesRows } from "./powerData";
//===== (Chart Presentation Utilities) ======
//===== (getChartPoints) ======
export function getChartPoints(data, minY, maxY, width, height, pad) {
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  if (!data.length) {
    return [];
  }

  return data.map((value, index) => {
    const timestampText = getRecordTimestampText(value);
    const parsedDate = parseChartTimestamp(timestampText);
    const hasValidTimestamp =
      parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());
    const hourRatio = hasValidTimestamp
      ? Math.min(
          24,
          parsedDate.getHours() +
            parsedDate.getMinutes() / 60 +
            parsedDate.getSeconds() / 3600,
        ) / 24
      : data.length === 1
        ? 0.5
        : index / (data.length - 1);
    const numericValue = getApiNumber(value);
    const number = clampChartValue(
      numericValue !== null ? numericValue : value,
      minY,
      maxY,
    );

    return {
      x: pad.left + hourRatio * innerWidth,
      y: pad.top + ((maxY - number) / (maxY - minY || 1)) * innerHeight,
    };
  });
}

//===== (getLatestChartPoint) ======
export function getLatestChartPoint(data, minY, maxY, width, height, pad) {
  const points = getChartPoints(data, minY, maxY, width, height, pad);

  return points.length ? points[points.length - 1] : null;
}

//===== (buildSmoothLinePath) ======
export function buildSmoothLinePath(data, minY, maxY, width, height, pad) {
  const points = getChartPoints(data, minY, maxY, width, height, pad);

  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const midX = (previous.x + point.x) / 2;

      return `C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
}

//===== (buildSmoothAreaPath) ======
export function buildSmoothAreaPath(data, minY, maxY, width, height, pad) {
  const points = getChartPoints(data, minY, maxY, width, height, pad);

  if (!points.length) {
    return "";
  }

  const baseY = height - pad.bottom;
  const linePath = buildSmoothLinePath(data, minY, maxY, width, height, pad);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

//===== (getMonthTickDays) ======
export function getMonthTickDays(selectedYear, selectedMonth) {
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  return POWER_CHART_MONTH_X_TICKS.filter((day) => day <= daysInMonth);
}

//===== (getAggregateTickValues) ======
export function getAggregateTickValues(
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  if (segment === "lifetime") {
    return yearRange.length ? yearRange : getYearRange(selectedYear);
  }

  if (segment === "year") {
    return POWER_CHART_YEAR_X_TICKS;
  }

  return getMonthTickDays(selectedYear, selectedMonth);
}

//===== (getAggregateItemCount) ======
export function getAggregateItemCount(
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  if (segment === "lifetime") {
    return (yearRange.length ? yearRange : getYearRange(selectedYear)).length;
  }

  if (segment === "year") {
    return POWER_CHART_YEAR_X_TICKS.length;
  }

  return new Date(selectedYear, selectedMonth, 0).getDate();
}

//===== (getAggregateRecordIndex) ======
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

    if (Number.isFinite(explicitYear) && years.includes(explicitYear)) {
      return years.indexOf(explicitYear);
    }

    const parsedDate = parseChartTimestamp(getRecordTimestampText(record));

    if (parsedDate && years.includes(parsedDate.getFullYear())) {
      return years.indexOf(parsedDate.getFullYear());
    }

    return fallbackIndex;
  }

  if (segment === "year") {
    const monthValue = pickValue(
      record?.month,
      record?.dateMonth,
      record?.label,
    );
    const explicitMonth = Number(monthValue);

    if (
      Number.isFinite(explicitMonth) &&
      explicitMonth >= 1 &&
      explicitMonth <= 12
    ) {
      return explicitMonth - 1;
    }

    const yearMonthMatch = String(monthValue ?? "").match(
      /^(\d{4})-(\d{1,2})$/,
    );
    const yearMonthNumber = Number(yearMonthMatch?.[2]);

    if (
      yearMonthMatch &&
      Number(yearMonthMatch[1]) === selectedYear &&
      Number.isFinite(yearMonthNumber) &&
      yearMonthNumber >= 1 &&
      yearMonthNumber <= 12
    ) {
      return yearMonthNumber - 1;
    }

    const parsedDate = parseChartTimestamp(getRecordTimestampText(record));

    if (parsedDate && parsedDate.getFullYear() === selectedYear) {
      return parsedDate.getMonth();
    }

    return fallbackIndex;
  }

  const explicitDay = Number(pickValue(record?.day, record?.dateDay));

  if (Number.isFinite(explicitDay) && explicitDay >= 1 && explicitDay <= 31) {
    return explicitDay - 1;
  }

  const parsedDate = parseChartTimestamp(getRecordTimestampText(record));

  if (parsedDate) {
    const recordMonth = parsedDate.getMonth() + 1;
    const recordYear = parsedDate.getFullYear();

    if (recordMonth === selectedMonth && recordYear === selectedYear) {
      return parsedDate.getDate() - 1;
    }
  }

  return fallbackIndex;
}

//===== (buildAggregateChartStacks) ======
export function buildAggregateChartStacks(
  series,
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  const itemCount = getAggregateItemCount(
    segment,
    selectedYear,
    selectedMonth,
    yearRange,
  );
  const values = POWER_SERIES_CONFIG.reduce((items, item) => {
    items[item.key] = Array.from({ length: itemCount }, () => 0);
    return items;
  }, {});

  POWER_SERIES_CONFIG.forEach((item) => {
    const rows = normalizeSeriesRows(series?.[item.key]);

    rows.forEach((row, index) => {
      const itemIndex = getAggregateRecordIndex(
        row,
        index,
        segment,
        selectedYear,
        selectedMonth,
        yearRange,
      );

      if (itemIndex < 0 || itemIndex >= itemCount) {
        return;
      }

      const value = getApiNumber(row);

      if (value === null) {
        return;
      }

      values[item.key][itemIndex] += Math.abs(value);
    });
  });

  return {
    itemCount,
    values,
  };
}

//===== (getAggregateChartUnit) ======
export function getAggregateChartUnit(series) {
  for (const item of POWER_SERIES_CONFIG) {
    const rows = normalizeSeriesRows(series?.[item.key]);
    const rowWithUnit = rows.find(
      (row) => typeof row?.unit === "string" && row.unit.trim(),
    );

    if (rowWithUnit) {
      return rowWithUnit.unit.trim();
    }
  }

  return POWER_CHART_AGGREGATE_UNIT_FALLBACK;
}

//===== (roundUpAggregateRangeLimit) ======
export function roundUpAggregateRangeLimit(value) {
  const safeValue = Math.abs(Number(value) || 0);

  if (safeValue <= 0) {
    return POWER_CHART_MONTH_Y_RANGE.maxY;
  }

  const paddedValue = safeValue * 1.12;
  const magnitude = 10 ** Math.floor(Math.log10(paddedValue));
  const normalizedValue = paddedValue / magnitude;
  const niceValue =
    normalizedValue <= 1
      ? 1
      : normalizedValue <= 1.5
        ? 1.5
        : normalizedValue <= 2
          ? 2
          : normalizedValue <= 3
            ? 3
            : normalizedValue <= 5
              ? 5
              : normalizedValue <= 7.5
                ? 7.5
                : 10;

  return niceValue * magnitude;
}

//===== (buildRangeTicks) ======
export function buildRangeTicks(minY, maxY) {
  const range = maxY - minY;

  if (range <= 0) {
    return POWER_CHART_MONTH_Y_RANGE.leftTicks;
  }

  return [
    maxY,
    (maxY * 2) / 3,
    maxY / 3,
    0,
    minY / 3,
    (minY * 2) / 3,
    minY,
  ].map((tick) => (Math.abs(tick) < 1e-9 ? 0 : tick));
}

//===== (getAggregateChartRange) ======
export function getAggregateChartRange(
  aggregateStacks,
  activeConsumptionDatasets,
  activeProductionDatasets,
) {
  let maxPositiveStack = 0;
  let maxNegativeStack = 0;

  Array.from({ length: aggregateStacks.itemCount }, (_, index) => {
    const positiveStack = activeConsumptionDatasets.reduce(
      (sum, item) =>
        sum + Math.abs(Number(aggregateStacks.values[item.key]?.[index]) || 0),
      0,
    );
    const negativeStack = activeProductionDatasets.reduce(
      (sum, item) =>
        sum + Math.abs(Number(aggregateStacks.values[item.key]?.[index]) || 0),
      0,
    );

    maxPositiveStack = Math.max(maxPositiveStack, positiveStack);
    maxNegativeStack = Math.max(maxNegativeStack, negativeStack);
  });

  const maxY = roundUpAggregateRangeLimit(maxPositiveStack);
  const minY = -roundUpAggregateRangeLimit(maxNegativeStack);

  return {
    minY,
    maxY,
    leftTicks: buildRangeTicks(minY, maxY),
  };
}

//===== (clampSelectedIndex) ======
export function clampSelectedIndex(index, maxIndex) {
  const safeMaxIndex = Math.max(0, Number(maxIndex) || 0);
  const safeIndex = Number(index);

  if (!Number.isFinite(safeIndex)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(safeIndex), 0), safeMaxIndex);
}

//===== (getSeriesMaxIndex) ======
export function getSeriesMaxIndex(
  series,
  segment,
  selectedYear,
  selectedMonth,
  yearRange = [],
) {
  if (segment === "month" || segment === "year" || segment === "lifetime") {
    return Math.max(
      0,
      getAggregateItemCount(segment, selectedYear, selectedMonth, yearRange) -
        1,
    );
  }

  if (segment === "day") {
    return 287;
  }

  return 0;
}

//===== (getDefaultChartSelectedIndex) ======
export function getDefaultChartSelectedIndex(
  segment,
  maxIndex,
  selectedYear,
  selectedMonth,
  currentTime,
  yearRange = [],
) {
  if (maxIndex <= 0) {
    return 0;
  }

  const now = getJakartaDateParts(currentTime);

  if (segment === "month") {
    if (selectedYear === now.year && selectedMonth === now.month) {
      return clampSelectedIndex(now.day - 1, maxIndex);
    }

    return 0;
  }

  if (segment === "year") {
    if (selectedYear === now.year) {
      return clampSelectedIndex(now.month - 1, maxIndex);
    }

    return 0;
  }

  if (segment === "lifetime") {
    const years = yearRange.length ? yearRange : getYearRange(selectedYear);
    const selectedYearIndex = years.indexOf(selectedYear);

    return selectedYearIndex >= 0
      ? clampSelectedIndex(selectedYearIndex, maxIndex)
      : 0;
  }

  const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const slotIndex = Math.floor(totalMinutes / 5);

  return clampSelectedIndex(slotIndex, maxIndex);
}

//===== (getSelectedIndexFromX) ======
export function getSelectedIndexFromX(x, pad, innerWidth, maxIndex, segment = "day") {
  if (!Number.isFinite(x) || innerWidth <= 0 || maxIndex <= 0) {
    return 0;
  }

  const progress = Math.min(Math.max((x - pad.left) / innerWidth, 0), 1);

  if (segment === "month" || segment === "year" || segment === "lifetime") {
    return clampSelectedIndex(progress * (maxIndex + 1) - 0.5, maxIndex);
  }

  return clampSelectedIndex(progress * maxIndex, maxIndex);
}

//===== (getSelectedMarkerX) ======
export function getSelectedMarkerX(
  selectedIndex,
  pad,
  innerWidth,
  maxIndex,
  segment = "day",
) {
  if (innerWidth <= 0 || maxIndex <= 0) {
    return pad.left;
  }

  const safeIndex = clampSelectedIndex(selectedIndex, maxIndex);

  if (segment === "month" || segment === "year" || segment === "lifetime") {
    return pad.left + ((safeIndex + 0.5) / (maxIndex + 1)) * innerWidth;
  }

  return pad.left + (safeIndex / maxIndex) * innerWidth;
}

//===== (getDaySeriesRecordAtIndex) ======
export function getDaySeriesRecordAtIndex(rows, selectedIndex, maxIndex) {
  const normalizedRows = normalizeSeriesRows(rows);

  if (!normalizedRows.length) {
    return null;
  }

  const selectedSlotIndex = clampSelectedIndex(selectedIndex, maxIndex);
  const timestampedRows = normalizedRows
    .map((row) => {
      const rowTimestamp = getRecordTimestampValue(row);

      if (rowTimestamp === null) {
        return null;
      }

      const rowDate = new Date(rowTimestamp);

      if (Number.isNaN(rowDate.getTime())) {
        return null;
      }

      const rowTotalMinutes =
        rowDate.getHours() * 60 +
        rowDate.getMinutes() +
        rowDate.getSeconds() / 60;

      return {
        row,
        slotIndex: clampSelectedIndex(rowTotalMinutes / 5, maxIndex),
      };
    })
    .filter(Boolean);

  if (timestampedRows.length) {
    return (
      timestampedRows.find((item) => item.slotIndex === selectedSlotIndex)
        ?.row ?? null
    );
  }

  return null;
}

//===== (getSelectedChartValues) ======
export function getSelectedChartValues({
  series,
  segment,
  selectedIndex,
  maxIndex,
  aggregateStacks,
}) {
  return POWER_SERIES_CONFIG.reduce((values, item) => {
    if (segment === "month" || segment === "year" || segment === "lifetime") {
      values[item.key] = Math.abs(
        Number(aggregateStacks.values[item.key]?.[selectedIndex]) || 0,
      );
      return values;
    }

    const record = getDaySeriesRecordAtIndex(
      series?.[item.key],
      selectedIndex,
      maxIndex,
    );
    const value = getApiNumber(record);

    values[item.key] = Math.abs(Number(value) || 0);
    return values;
  }, {});
}

//===== (getSelectedDayLabel) ======
export function getSelectedDayLabel(selectedIndex, maxIndex) {
  const slotIndex = clampSelectedIndex(selectedIndex, maxIndex);
  const totalMinutes = slotIndex * 5;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

//===== (getSelectedChartLabel) ======
export function getSelectedChartLabel({
  t,
  segment,
  selectedIndex,
  maxIndex,
  yearRange = [],
}) {
  if (segment === "month") {
    return `${t("date")} ${selectedIndex + 1}`;
  }

  if (segment === "year") {
    return String(selectedIndex + 1);
  }

  if (segment === "lifetime") {
    const years = yearRange.length
      ? yearRange
      : getYearRange(new Date().getFullYear());
    const label = years[selectedIndex];

    return label ? String(label) : String(selectedIndex + 1);
  }

  return getSelectedDayLabel(selectedIndex, maxIndex);
}

//===== (formatSelectedChartValue) ======
export function formatSelectedChartValue(value, unit) {
  const number = Math.abs(Number(value) || 0);

  if (unit === "MWh") {
    return number.toFixed(4);
  }

  return number.toFixed(2);
}

//===== (formatSelectedChartPercent) ======
export function formatSelectedChartPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toFixed(1);
}

//===== (formatSocPercentValue) ======
export function formatSocPercentValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1)}%`;
}

//===== (getSelectedDateText) ======
export function getSelectedDateText(selectedDay, selectedMonth, selectedYear) {
  return `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(
    selectedDay,
  ).padStart(2, "0")}`;
}

//===== (buildFiveMinuteSlots) ======
export function buildFiveMinuteSlots() {
  return Array.from({ length: 24 * 12 }, (_, index) => {
    const totalMinutes = index * 5;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )}`;
  });
}

