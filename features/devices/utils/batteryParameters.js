//===== (Battery Parameter Constants) ======
const HIDDEN_BATTERY_PARAMETERS = new Set(["sw_bal", "sw_chg", "sw_dis"]);

const BATTERY_GROUP_KEYS = new Set([
  "baterai",
  "battery",
  "data_bms",
  "setting_bms",
]);

const MANDATORY_BATTERY_PARAMS = ["power", "voltage", "current", "soc"];

//===== (hasValidParameterValue) ======
function hasValidParameterValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      trimmed === "" ||
      trimmed === "-" ||
      trimmed.toLowerCase() === "null" ||
      trimmed.toLowerCase() === "undefined"
    ) {
      return false;
    }
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return true;
}

//===== (formatValue) ======
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);
  return Number.isFinite(number)
    ? String(Number(number.toFixed(4)))
    : String(value);
}

//===== (normalizeParameterKey) ======
function normalizeParameterKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

//===== (formatBatteryParameterLabel) ======
function formatBatteryParameterLabel(value, t = (key) => key) {
  const key = normalizeParameterKey(value);
  const cellMatch = key.match(/^cells?_(\d+)$/);

  if (cellMatch) {
    return `${t("cell")} ${cellMatch[1]}`;
  }

  const knownLabels = {
    power: t("power"),
    alarm: t("alarm"),
    current: t("current"),
    cycle: t("cycle"),
    soc: "SoC",
    voltage: t("voltage"),
  };

  if (knownLabels[key]) {
    return knownLabels[key];
  }

  return (
    String(value || "-")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "-"
  );
}

//===== (getBatteryParameterUnit) ======
function getBatteryParameterUnit(key) {
  const normalizedKey = normalizeParameterKey(key);

  if (normalizedKey === "power") {
    return "kW";
  }

  if (/^cells?_\d+$/.test(normalizedKey) || normalizedKey === "voltage") {
    return "V";
  }

  if (normalizedKey === "current") {
    return "A";
  }

  if (normalizedKey === "soc") {
    return "%";
  }

  return "";
}

//===== (formatBatteryParameterValue) ======
export function formatBatteryParameterValue(value, key) {
  const formattedValue =
    value === null || value === undefined || value === ""
      ? "0"
      : formatValue(value);
  const unit = getBatteryParameterUnit(key);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

//===== (isBatteryCategory) ======
function isBatteryCategory(value) {
  const key = normalizeParameterKey(value);
  return (
    key.includes("battery") ||
    key.includes("baterai") ||
    BATTERY_GROUP_KEYS.has(key)
  );
}

//===== (pushBatteryParameter) ======
function pushBatteryParameter(rows, seenKeys, label, value, t) {
  const safeLabel = String(label || "").trim();

  if (!safeLabel) {
    return;
  }

  const normalizedKey = normalizeParameterKey(safeLabel);

  if (
    HIDDEN_BATTERY_PARAMETERS.has(normalizedKey) ||
    BATTERY_GROUP_KEYS.has(normalizedKey)
  ) {
    return;
  }

  const isMandatory = MANDATORY_BATTERY_PARAMS.includes(normalizedKey);

  if (!isMandatory && !hasValidParameterValue(value)) {
    return;
  }

  if (seenKeys.has(normalizedKey)) {
    const existingIndex = rows.findIndex((r) => r.key === normalizedKey);
    if (
      existingIndex !== -1 &&
      !hasValidParameterValue(rows[existingIndex].value) &&
      hasValidParameterValue(value)
    ) {
      rows[existingIndex].value = value;
    }
    return;
  }

  seenKeys.add(normalizedKey);
  rows.push({
    key: normalizedKey,
    label: formatBatteryParameterLabel(safeLabel, t),
    value: isMandatory && !hasValidParameterValue(value) ? 0 : value,
  });
}

//===== (parseMaybeJson) ======
function parseMaybeJson(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || !["{", "["].includes(trimmedValue[0])) {
    return value;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return value;
  }
}

//===== (collectBatteryObjectParameters) ======
function collectBatteryObjectParameters(
  source,
  rows,
  seenKeys,
  prefix = "",
  t,
) {
  source = parseMaybeJson(source);

  if (!source || typeof source !== "object") {
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (
      [
        "id",
        "device_id",
        "deviceId",
        "created_at",
        "updated_at",
        "timestamp",
      ].includes(key)
    ) {
      return;
    }

    const normalizedKey = normalizeParameterKey(key);
    const shouldFlattenGroup = BATTERY_GROUP_KEYS.has(normalizedKey);
    const label = prefix && !shouldFlattenGroup ? `${prefix}_${key}` : key;
    const nextPrefix = shouldFlattenGroup ? prefix : label;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          collectBatteryObjectParameters(item, rows, seenKeys, nextPrefix, t);
        } else {
          pushBatteryParameter(
            rows,
            seenKeys,
            `${label}_${index + 1}`,
            item,
            t,
          );
        }
      });
      return;
    }

    const parsedValue = parseMaybeJson(value);

    if (parsedValue && typeof parsedValue === "object") {
      collectBatteryObjectParameters(
        parsedValue,
        rows,
        seenKeys,
        nextPrefix,
        t,
      );
      return;
    }

    pushBatteryParameter(rows, seenKeys, label, parsedValue, t);
  });
}

//===== (collectBatterySource) ======
function collectBatterySource(source, rows, seenKeys, t) {
  const parsedSource = parseMaybeJson(source);

  if (Array.isArray(parsedSource)) {
    parsedSource.forEach((item) => {
      const parsedItem = parseMaybeJson(item);

      if (parsedItem?.type || parsedItem?.parameter || parsedItem?.name) {
        pushBatteryParameter(
          rows,
          seenKeys,
          parsedItem.type || parsedItem.parameter || parsedItem.name,
          parseMaybeJson(parsedItem.value),
          t,
        );
        return;
      }

      collectBatteryObjectParameters(parsedItem, rows, seenKeys, "", t);
    });
    return;
  }

  if (parsedSource && typeof parsedSource === "object") {
    const batteryEntries = Object.entries(parsedSource).filter(([key]) =>
      isBatteryCategory(key),
    );

    if (batteryEntries.length) {
      batteryEntries.forEach(([, value]) =>
        collectBatteryObjectParameters(value, rows, seenKeys, "", t),
      );
      return;
    }
  }

  collectBatteryObjectParameters(parsedSource, rows, seenKeys, "", t);
}

//===== (getBatteryParameterRows) ======
export function getBatteryParameterRows(device, t) {
  const rows = [];
  const seenKeys = new Set();

  if (Array.isArray(device?.latestData)) {
    device.latestData.forEach((row) => {
      const categoryKey = normalizeParameterKey(row?.category);
      const typeKey = normalizeParameterKey(
        row?.type || row?.parameter || row?.name,
      );

      if (!isBatteryCategory(categoryKey) && !isBatteryCategory(typeKey)) {
        return;
      }

      const parsedRowValue = parseMaybeJson(row?.value);

      if (
        BATTERY_GROUP_KEYS.has(typeKey) &&
        parsedRowValue &&
        typeof parsedRowValue === "object"
      ) {
        collectBatteryObjectParameters(parsedRowValue, rows, seenKeys, "", t);
        return;
      }

      pushBatteryParameter(
        rows,
        seenKeys,
        row?.type || row?.parameter || row?.name,
        parsedRowValue,
        t,
      );
    });
  }

  [
    device?.latestData && !Array.isArray(device.latestData)
      ? device.latestData
      : null,
    device?.latest_data,
    device?.data_bms,
    device?.setting_bms,
    device?.baterai,
    device?.battery,
    device?.batteries,
    device?.batteryData,
    device?.battery_data,
    device?.latestBatteryData,
    device?.latest_battery_data,
    device?.parameters?.battery,
    device?.parameters?.baterai,
  ].forEach((source) => {
    collectBatterySource(source, rows, seenKeys, t);
  });

  // Pastikan parameter wajib (power, voltage, current, soc) selalu ada
  MANDATORY_BATTERY_PARAMS.forEach((key) => {
    if (!seenKeys.has(key)) {
      pushBatteryParameter(rows, seenKeys, key, 0, t);
    }
  });

  // Filter parameter selain wajib yang tidak memiliki nilai valid
  const validRows = rows.filter(
    (row) =>
      MANDATORY_BATTERY_PARAMS.includes(row.key) ||
      hasValidParameterValue(row.value),
  );

  const mandatoryOrder = new Map(
    MANDATORY_BATTERY_PARAMS.map((key, index) => [key, index]),
  );

  return validRows.sort((left, right) => {
    const leftMandatory = mandatoryOrder.get(left.key);
    const rightMandatory = mandatoryOrder.get(right.key);

    if (leftMandatory !== undefined && rightMandatory !== undefined) {
      return leftMandatory - rightMandatory;
    }

    if (leftMandatory !== undefined) {
      return -1;
    }

    if (rightMandatory !== undefined) {
      return 1;
    }

    const leftCell = left.key.match(/^cells?_(\d+)$/);
    const rightCell = right.key.match(/^cells?_(\d+)$/);
    if (leftCell && rightCell) {
      return Number(leftCell[1]) - Number(rightCell[1]);
    }
    if (leftCell) return -1;
    if (rightCell) return 1;

    return left.label.localeCompare(right.label);
  });
}
