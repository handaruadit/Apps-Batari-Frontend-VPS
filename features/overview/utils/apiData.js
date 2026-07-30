//===== (Imports) ======
import {
  GENERIC_PERCENT_FIELD_KEYS,
  MONITORING_ONLINE_THRESHOLD_MS,
  POWER_CATEGORY_ALIASES,
  POWER_TYPE_ALIASES,
  SELECTED_PERCENT_CATEGORY_KEYS,
  SELECTED_PERCENT_FIELD_KEYS,
  SOC_FIELD_KEYS,
} from "../constants/overviewConstants";
//===== (API Data Utilities) ======
//===== (getTemperatureNumber) ======
export function getTemperatureNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 26;
}

//===== (pickValue) ======
export function pickValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

//===== (pickNumber) ======
export function pickNumber(...values) {
  const value = pickValue(...values);
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

//===== (pickFiniteNumber) ======
export function pickFiniteNumber(...values) {
  const value = pickValue(...values);
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

//===== (normalizeApiText) ======
export function normalizeApiText(value) {
  return String(value ?? "")
    .trim()
    .replace(/[-_\s]+/g, "")
    .toLowerCase();
}

//===== (getPowerCategoryAliases) ======
export function getPowerCategoryAliases(category) {
  return POWER_CATEGORY_ALIASES[category] ?? [category];
}

//===== (getPowerTypeAliases) ======
export function getPowerTypeAliases(type) {
  return POWER_TYPE_ALIASES[type] ?? [type];
}

//===== (matchesApiText) ======
export function matchesApiText(value, aliases) {
  const normalizedValue = normalizeApiText(value);

  return aliases.some((alias) => normalizeApiText(alias) === normalizedValue);
}

//===== (pickObjectValueByAliases) ======
export function pickObjectValueByAliases(source, aliases) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const normalizedAliases = aliases.map(normalizeApiText);

  return Object.entries(source).find(([key]) =>
    normalizedAliases.includes(normalizeApiText(key)),
  )?.[1];
}

//===== (getNullableNumber) ======
export function getNullableNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

//===== (getKeyValueRecordNumber) ======
export function getKeyValueRecordNumber(source, fieldNames) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }

  const fieldKey = pickValue(
    source.key,
    source.name,
    source.param,
    source.parameter,
    source.type,
    source.label,
  );

  if (!matchesApiText(fieldKey, fieldNames)) {
    return null;
  }

  return getNullableNumber(
    pickValue(source.value, source.data, source.reading, source.percent),
  );
}

//===== (findFirstNumberByFieldNames) ======
export function findFirstNumberByFieldNames(source, fieldNames, visited = new Set()) {
  if (!source) {
    return null;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const value = findFirstNumberByFieldNames(item, fieldNames, visited);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  if (typeof source !== "object") {
    return null;
  }

  if (visited.has(source)) {
    return null;
  }

  visited.add(source);

  const recordValue = getKeyValueRecordNumber(source, fieldNames);

  if (recordValue !== null) {
    return recordValue;
  }

  const directValue = pickObjectValueByAliases(source, fieldNames);
  const directNumber = getNullableNumber(directValue);

  if (directNumber !== null) {
    return directNumber;
  }

  for (const value of Object.values(source)) {
    const nestedNumber = findFirstNumberByFieldNames(
      value,
      fieldNames,
      visited,
    );

    if (nestedNumber !== null) {
      return nestedNumber;
    }
  }

  return null;
}

//===== (getBackendSocValue) ======
export function getBackendSocValue(sources) {
  return findFirstNumberByFieldNames(sources, SOC_FIELD_KEYS);
}

//===== (getBackendSelectedPercentages) ======
export function getBackendSelectedPercentages(sources, latestResults, latestRequests) {
  const percentages = Object.entries(SELECTED_PERCENT_FIELD_KEYS).reduce(
    (items, [key, fieldNames]) => {
      const value = findFirstNumberByFieldNames(sources, fieldNames);

      if (value !== null) {
        items[key] = value;
      }

      return items;
    },
    {},
  );

  latestResults.forEach((result, index) => {
    const category = latestRequests[index]?.sourceCategory;
    const targetKeys = SELECTED_PERCENT_CATEGORY_KEYS[category] ?? [];

    if (!targetKeys.length) {
      return;
    }

    const value = findFirstNumberByFieldNames(
      result?.json,
      GENERIC_PERCENT_FIELD_KEYS,
    );

    if (value === null) {
      return;
    }

    targetKeys.forEach((key) => {
      if (percentages[key] === undefined) {
        percentages[key] = value;
      }
    });
  });

  return percentages;
}

//===== (getApiNumber) ======
export function getApiNumber(record) {
  if (record === undefined || record === null || record === "") {
    return null;
  }

  if (Array.isArray(record)) {
    return getApiNumber(record[record.length - 1]);
  }

  if (typeof record !== "object") {
    const primitiveNumber = Number(record);

    return Number.isFinite(primitiveNumber) ? primitiveNumber : null;
  }

  const value = pickValue(
    record.value,
    record.power,
    record.chargePower,
    record.charge_power,
    record.vaPower,
    record.va_power,
    record.reading,
    record.data,
    record.avg,
    record.sum,
    record.max,
    record.min,
    record.total,
  );
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

//===== (getApiRecord) ======
export function getApiRecord(data, category, type) {
  if (!data) {
    return null;
  }

  const categoryAliases = getPowerCategoryAliases(category);
  const typeAliases = getPowerTypeAliases(type);

  if (Array.isArray(data)) {
    return data.filter(
      (item) =>
        matchesApiText(item.category, categoryAliases) &&
        matchesApiText(item.type, typeAliases),
    );
  }

  if (
    matchesApiText(data.category, categoryAliases) &&
    matchesApiText(data.type, typeAliases)
  ) {
    return data;
  }

  const categoryRecord = pickObjectValueByAliases(data, categoryAliases);

  if (Array.isArray(categoryRecord)) {
    return categoryRecord.filter((item) =>
      matchesApiText(item.type, typeAliases),
    );
  }

  if (categoryRecord && typeof categoryRecord === "object") {
    return pickObjectValueByAliases(categoryRecord, typeAliases) ?? null;
  }

  if (categoryRecord !== undefined) {
    return categoryRecord;
  }

  return null;
}

//===== (getApiLatestValue) ======
export function getApiLatestValue(data, category, type) {
  return getApiNumber(getApiRecord(data, category, type));
}

//===== (getRecordTimestampText) ======
export function getRecordTimestampText(record) {
  return pickValue(
    record?.created_at,
    record?.createdAt,
    record?.inserted_at,
    record?.insertedAt,
    record?.received_at,
    record?.receivedAt,
    record?.timestamp,
    record?.time,
    record?.datetime,
    record?.dateTime,
    record?.date,
    record?.month,
    record?.year,
    null,
  );
}

//===== (parseChartTimestamp) ======
export function parseChartTimestamp(rawTimestamp) {
  if (!rawTimestamp) {
    return null;
  }

  if (rawTimestamp instanceof Date) {
    return Number.isNaN(rawTimestamp.getTime()) ? null : rawTimestamp;
  }

  if (typeof rawTimestamp === "number") {
    const numberDate = new Date(rawTimestamp);

    return Number.isNaN(numberDate.getTime()) ? null : numberDate;
  }

  if (typeof rawTimestamp !== "string") {
    return null;
  }

  const normalizedText = rawTimestamp.trim();

  if (!normalizedText) {
    return null;
  }

  const nativeDate = new Date(normalizedText);

  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const localMatch = normalizedText.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/,
  );

  if (localMatch) {
  const [, year, month, day, hour, minute, second = "0", millisecond = "0"] =
    localMatch;

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0")),
    ),
  );
}

  const timezoneMatch = normalizedText.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):?(\d{2}))$/,
  );

  if (timezoneMatch) {
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second = "0",
      millisecond = "0",
      timezoneToken,
      offsetSign,
      offsetHour = "0",
      offsetMinute = "0",
    ] = timezoneMatch;

    const utcMilliseconds = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0")),
    );

    if (timezoneToken === "Z") {
      return new Date(utcMilliseconds);
    }

    const timezoneOffsetMinutes =
      (Number(offsetHour) * 60 + Number(offsetMinute)) *
      (offsetSign === "-" ? -1 : 1);

    return new Date(utcMilliseconds - timezoneOffsetMinutes * 60 * 1000);
  }

  return null;
}

//===== (getRecordTimestampValue) ======
export function getRecordTimestampValue(record) {
  const parsed = parseChartTimestamp(getRecordTimestampText(record));

  return parsed ? parsed.getTime() : null;
}

//===== (collectMonitoringTimestamps) ======
export function collectMonitoringTimestamps(source, timestamps = []) {
  if (!source) {
    return timestamps;
  }

  if (Array.isArray(source)) {
    source.forEach((item) => collectMonitoringTimestamps(item, timestamps));
    return timestamps;
  }

  if (typeof source !== "object") {
    return timestamps;
  }

  const timestamp = getRecordTimestampValue(source);

  if (timestamp !== null) {
    timestamps.push(timestamp);
  }

  Object.values(source).forEach((value) => {
    if (value && typeof value === "object") {
      collectMonitoringTimestamps(value, timestamps);
    }
  });

  return timestamps;
}

//===== (hasNumericMonitoringData) ======
export function hasNumericMonitoringData(source) {
  if (!source) {
    return false;
  }

  if (Array.isArray(source)) {
    return source.some(hasNumericMonitoringData);
  }

  if (typeof source === "object") {
    if (getApiNumber(source) !== null) {
      return true;
    }

    return Object.values(source).some(hasNumericMonitoringData);
  }

  const number = Number(source);
  return Number.isFinite(number);
}

//===== (hasOfflineStatus) ======
export function hasOfflineStatus(source) {
  if (!source || typeof source !== "object") {
    return false;
  }

  if (Array.isArray(source)) {
    return source.some(hasOfflineStatus);
  }

  const statusText = normalizeApiText(
    pickValue(
      source.status,
      source.deviceStatus,
      source.device_status,
      source.connectionStatus,
      source.connection_status,
      source.message,
      "",
    ),
  );

  if (
    statusText.includes("offline") ||
    statusText.includes("disconnected") ||
    statusText.includes("notconnected")
  ) {
    return true;
  }

  return Object.values(source).some((value) =>
    value && typeof value === "object" ? hasOfflineStatus(value) : false,
  );
}

//===== (getMonitoringOnlineState) ======
export function getMonitoringOnlineState(latestResults) {
  const successfulJson = latestResults
    .filter((item) => item?.ok)
    .map((item) => item?.json)
    .filter(Boolean);

  if (!successfulJson.length || successfulJson.some(hasOfflineStatus)) {
    return { isOnline: false, latestTimestamp: null };
  }

  const timestamps = successfulJson.flatMap((json) =>
    collectMonitoringTimestamps(json?.data),
  );
  const latestTimestamp = timestamps.length ? Math.max(...timestamps) : null;
  const hasReadableData = successfulJson.some((json) =>
    hasNumericMonitoringData(json?.data),
  );

  return {
    isOnline:
      latestTimestamp !== null
        ? Date.now() - latestTimestamp <= MONITORING_ONLINE_THRESHOLD_MS
        : hasReadableData,
    latestTimestamp,
  };
}

