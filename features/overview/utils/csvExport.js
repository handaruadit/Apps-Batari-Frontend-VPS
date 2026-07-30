//===== (Imports) ======
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { POWER_SERIES_CONFIG } from "../constants/overviewConstants";
import { getApiNumber, getRecordTimestampValue } from "./apiData";
import { buildFiveMinuteSlots } from "./chartPresentation";
import { normalizeSeriesRows } from "./powerData";
//===== (CSV Export Utilities) ======
//===== (getSlotLabelFromRecord) ======
export function getSlotLabelFromRecord(record) {
  const timestamp = getRecordTimestampValue(record);

  if (timestamp === null) {
    return null;
  }

  const date = new Date(timestamp);
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const roundedMinutes = Math.round(totalMinutes / 5) * 5;
  const safeMinutes = Math.min(roundedMinutes, 23 * 60 + 55);
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

//===== (formatCsvCellValue) ======
export function formatCsvCellValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return Math.abs(number).toFixed(2);
}

//===== (escapeCsvCell) ======
export function escapeCsvCell(value) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

//===== (buildDailyCsvRows) ======
export function buildDailyCsvRows(series) {
  const rowsByTime = buildFiveMinuteSlots().reduce((items, time) => {
    items[time] = {
      time,
      production: "",
      grid: "",
      battery: "",
      pvGenerate: "",
      export: "",
      charge: "",
    };
    return items;
  }, {});

  POWER_SERIES_CONFIG.forEach((item) => {
    normalizeSeriesRows(series?.[item.key]).forEach((record) => {
      const slotLabel = getSlotLabelFromRecord(record);

      if (!slotLabel || !rowsByTime[slotLabel]) {
        return;
      }

      const value = getApiNumber(record);

      if (value === null) {
        return;
      }

      rowsByTime[slotLabel][item.key] = formatCsvCellValue(value);
    });
  });

  return buildFiveMinuteSlots().map((time) => rowsByTime[time]);
}

//===== (buildDailyCsv) ======
export function buildDailyCsv({ series }) {
  const rows = buildDailyCsvRows(series);
  const header = [
    "Waktu",
    "PV",
    "Grid",
    "Battery",
    "PV Generate",
    "Export",
    "Charge",
  ];
  const csvRows = rows.map((row) =>
    [
      row.time,
      row.production,
      row.grid,
      row.battery,
      row.pvGenerate,
      row.export,
      row.charge,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [header.join(","), ...csvRows].join("\n");
}

//===== (shareDailyChartCsv) ======
export async function shareDailyChartCsv({ series, dateText, unavailableMessage }) {
  const csv = buildDailyCsv({ series });
  const fileName = `chart-data-${dateText}.csv`;
  const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(targetUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error(unavailableMessage);
  }

  await Sharing.shareAsync(targetUri, {
    mimeType: "text/csv",
    dialogTitle: `Simpan ${fileName}`,
    UTI: "public.comma-separated-values-text",
  });
}

