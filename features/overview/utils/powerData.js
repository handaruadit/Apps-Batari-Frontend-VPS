//===== (Imports) ======
import {
  MONITORING_ONLINE_THRESHOLD_MS,
  POWER_CHART_AGGREGATE_UNIT_FALLBACK,
  POWER_SERIES_CONFIG,
} from "../constants/overviewConstants";
import {
  collectMonitoringTimestamps,
  getApiLatestValue,
  getApiNumber,
  getApiRecord,
  getPowerTypeAliases,
  getRecordTimestampText,
  getRecordTimestampValue,
  matchesApiText,
  pickObjectValueByAliases,
  pickValue,
} from "./apiData";
//===== (Power Data Utilities) ======
//===== (normalizeSeriesRows) ======
export function normalizeSeriesRows(record) {
  if (!record) {
    return [];
  }

  const rows = Array.isArray(record) ? record : [record];

  return rows.filter((row) => getApiNumber(row) !== null);
}

//===== (getApiSeries) ======
export function getApiSeries(data, category, type) {
  return normalizeSeriesRows(getApiRecord(data, category, type));
}

//===== (splitBatteryChargeValue) ======
export function splitBatteryChargeValue(value, targetKey) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  if (targetKey === "charge") {
    return number > 0 ? number : 0;
  }

  if (targetKey === "battery") {
    return number < 0 ? number : 0;
  }

  return number;
}

//===== (getChargeChartValue) ======
export function getChargeChartValue(chargeValue, batteryValue) {
  const chargeNumber = splitBatteryChargeValue(chargeValue, "charge");

  if (chargeNumber > 0) {
    return chargeNumber;
  }

  return splitBatteryChargeValue(batteryValue, "charge");
}

//===== (splitBatteryChargeSeries) ======
export function splitBatteryChargeSeries(series, targetKey) {
  return normalizeSeriesRows(series)
    .map((row) => {
      const value = splitBatteryChargeValue(getApiNumber(row), targetKey);

      if (value === null) {
        return null;
      }

      return {
        ...row,
        value,
      };
    })
    .filter(Boolean);
}

//===== (normalizePowerValues) ======
export function normalizePowerValues(data) {
  const pvPower = getApiLatestValue(data, "pv", "power");
  const pvChargePower = getApiLatestValue(data, "pv", "chargePower");
  const outPower = getApiLatestValue(data, "load", "power");
  const outVaPower = getApiLatestValue(data, "load", "vaPower");

  return {
    production: pvChargePower ?? pvPower,
    pv: pvPower ?? pvChargePower,
    grid: getApiLatestValue(data, "grid", "power"),
    battery: getApiLatestValue(data, "battery", "power"),
    load: outPower ?? outVaPower,
    upsLoad: outVaPower ?? outPower,
  };
}

//===== (getDirectApiTypeValue) ======
export function getDirectApiTypeValue(data, type) {
  if (!data) {
    return null;
  }

  const typeAliases = getPowerTypeAliases(type);

  if (Array.isArray(data)) {
    const typedRows = data.filter((item) =>
      matchesApiText(item?.type, typeAliases),
    );

    return typedRows.length ? getApiNumber(typedRows) : null;
  }

  if (typeof data === "object") {
    const typeRecord = pickObjectValueByAliases(data, typeAliases);

    if (typeRecord !== undefined) {
      return getApiNumber(typeRecord);
    }

    if (!data.category && !data.type) {
      return getApiNumber(data);
    }
  }

  return getApiNumber(data);
}

//===== (normalizeLatestPowerValues) ======
export function normalizeLatestPowerValues(data, sourceCategory) {
  const nestedValues = normalizePowerValues(data);
  const directPower = getDirectApiTypeValue(data, "power");
  const directChargePower = getDirectApiTypeValue(data, "chargePower");
  const directVaPower = getDirectApiTypeValue(data, "vaPower");
  let directValues = {};

  if (sourceCategory === "pv") {
    directValues = {
      production: directChargePower ?? directPower,
      pv: directPower ?? directChargePower,
    };
  } else if (sourceCategory === "grid") {
    directValues = {
      grid: directPower,
    };
  } else if (sourceCategory === "battery") {
    directValues = {
      battery: directPower,
    };
  } else if (sourceCategory === "load") {
    directValues = {
      load: directPower ?? directVaPower,
      upsLoad: directVaPower ?? directPower,
    };
  }

  return mergePowerValues(nestedValues, directValues);
}

//===== (getBackendNumber) ======
export function getBackendNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

//===== (normalizeLatestEnergyValues) ======
export function normalizeLatestEnergyValues(responseJson) {
  return {
    energy: {
      consumptionKwh: getBackendNumber(responseJson?.energy?.consumptionKwh),
      batteryKwh: getBackendNumber(responseJson?.energy?.batteryKwh),
      gridKwh: getBackendNumber(responseJson?.energy?.gridKwh),
      totalKwh: getBackendNumber(responseJson?.energy?.totalKwh),
    },
    energyPercent: {
      batteryPercent: getBackendNumber(
        responseJson?.energyPercent?.batteryPercent,
      ),
      consumptionPercent: getBackendNumber(
        responseJson?.energyPercent?.consumptionPercent,
      ),
      gridPercent: getBackendNumber(responseJson?.energyPercent?.gridPercent),
    },
  };
}

//===== (getLatestEnergyValues) ======
export function getLatestEnergyValues(latestResults) {
  const resultWithEnergy = latestResults.find(
    (item) => item?.json?.energy || item?.json?.energyPercent,
  );

  return normalizeLatestEnergyValues(resultWithEnergy?.json);
}

//===== (getAggregateItemValue) ======
export function getAggregateItemValue(row, key) {
  const valueKey = key === "production" ? "pv" : key;
  const rawValue = row?.[valueKey];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return key === "load" ? 0 : null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? Math.abs(value) : null;
}

//===== (getChartDataUnit) ======
export function getChartDataUnit(data, row = null) {
  const unit = pickValue(
    row?.unit,
    data?.unit,
    POWER_CHART_AGGREGATE_UNIT_FALLBACK,
  );
  const unitText = String(unit || "").trim();

  return unitText || POWER_CHART_AGGREGATE_UNIT_FALLBACK;
}

//===== (normalizeChartSeries) ======
export function normalizeChartSeries(data) {
  if (Array.isArray(data?.items)) {
    return POWER_SERIES_CONFIG.reduce((series, item) => {
      series[item.key] = data.items
        .map((row) => {
          const value = getAggregateItemValue(row, item.key);

          if (value === null) {
            return null;
          }

          return {
            value,
            day: row?.day,
            month: row?.month,
            year: row?.year,
            label: row?.label,
            date: row?.date,
            source: data?.source,
            unit: getChartDataUnit(data, row),
          };
        })
        .filter(Boolean);

      return series;
    }, {});
  }

  const directSeries = {
    production: normalizeSeriesRows(data?.production),
    grid: normalizeSeriesRows(data?.grid),
    battery: splitBatteryChargeSeries(data?.battery, "battery"),
    pvGenerate: normalizeSeriesRows(data?.pvGenerate),
    load: normalizeSeriesRows(data?.load),
  };
  const hasDirectSeries = hasChartSeriesRows(directSeries);
  const production = getApiSeries(data, "pv", "chargePower");
  const pvPower = getApiSeries(data, "pv", "power");
  const batteryPower = getApiSeries(data, "battery", "power");

  if (hasDirectSeries) {
    return directSeries;
  }

  return {
    production: production.length ? production : pvPower,
    grid: getApiSeries(data, "grid", "power"),
    battery: splitBatteryChargeSeries(batteryPower, "battery"),
    pvGenerate: normalizeSeriesRows(data?.pvGenerate),
    export: normalizeSeriesRows(data?.export),
    charge: mergeSeriesRows(
      splitBatteryChargeSeries(data?.charge, "charge"),
      splitBatteryChargeSeries(batteryPower, "charge"),
    ),
  };
}

//===== (mergeSeriesRows) ======
export function mergeSeriesRows(...seriesParts) {
  const mergedByTimestamp = new Map();
  let anonymousIndex = 0;

  seriesParts.forEach((seriesPart) => {
    normalizeSeriesRows(seriesPart).forEach((row) => {
      const timestampKey = getRecordTimestampText(row);
      const fallbackKey = `${row?.category ?? "unknown"}-${row?.type ?? "unknown"}-${anonymousIndex}`;
      const rowKey = timestampKey || fallbackKey;

      anonymousIndex += 1;
      mergedByTimestamp.set(rowKey, row);
    });
  });

  return Array.from(mergedByTimestamp.values()).sort((left, right) => {
    const leftTime = getRecordTimestampValue(left);
    const rightTime = getRecordTimestampValue(right);

    if (leftTime === null && rightTime === null) {
      return 0;
    }

    if (leftTime === null) {
      return 1;
    }

    if (rightTime === null) {
      return -1;
    }

    return leftTime - rightTime;
  });
}

//===== (mergeChartSeries) ======
export function mergeChartSeries(...seriesGroups) {
  return POWER_SERIES_CONFIG.reduce((merged, item) => {
    merged[item.key] = mergeSeriesRows(
      ...seriesGroups.map((group) => group?.[item.key]),
    );

    return merged;
  }, {});
}

//===== (mergePowerValues) ======
export function mergePowerValues(...powerSources) {
  return powerSources.reduce((merged, item) => {
    Object.entries(item || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        merged[key] = value;
      }
    });

    return merged;
  }, {});
}

//===== (sumPowerValues) ======
export function sumPowerValues(...powerSources) {
  return powerSources.reduce((totals, item) => {
    Object.entries(item || {}).forEach(([key, value]) => {
      const number = Number(value);

      if (!Number.isFinite(number)) {
        return;
      }

      totals[key] = (Number(totals[key]) || 0) + number;
    });

    return totals;
  }, {});
}

//===== (hasAnyPowerValue) ======
export function hasAnyPowerValue(powerValues) {
  return Object.values(powerValues || {}).some((value) =>
    Number.isFinite(Number(value)),
  );
}

//===== (getDeviceIdentifier) ======
export function getDeviceIdentifier(device) {
  return pickValue(
    device?.device_id,
    device?.deviceId,
    device?.serialNumber,
    device?.serial_number,
    device?.sn,
    null,
  );
}

//===== (normalizeDeviceList) ======
export function normalizeDeviceList(devices) {
  const seen = new Set();

  return (Array.isArray(devices) ? devices : [])
    .map((device) => ({
      ...device,
      dataSourceId: getDeviceIdentifier(device),
    }))
    .filter((device) => {
      if (!device.dataSourceId) {
        return false;
      }

      const key = String(device.dataSourceId);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

//===== (areDeviceListsEqual) ======
export function areDeviceListsEqual(leftDevices, rightDevices) {
  const leftIds = normalizeDeviceList(leftDevices).map((device) =>
    String(device.dataSourceId),
  );
  const rightIds = normalizeDeviceList(rightDevices).map((device) =>
    String(device.dataSourceId),
  );

  return (
    leftIds.length === rightIds.length &&
    leftIds.every((id, index) => id === rightIds[index])
  );
}

//===== (getDeviceLatestSources) ======
export function getDeviceLatestSources(device) {
  return [
    device?.latestData,
    device?.latest_data,
    device?.data,
    device?.parameters,
    device?.latestPowerData,
    device?.latest_power_data,
  ].filter(Boolean);
}

//===== (getDevicePowerValues) ======
export function getDevicePowerValues(device) {
  return mergePowerValues(
    ...getDeviceLatestSources(device).map((source) =>
      normalizePowerValues(source),
    ),
  );
}

//===== (getDevicesAggregatePowerValues) ======
export function getDevicesAggregatePowerValues(devices) {
  return sumPowerValues(
    ...normalizeDeviceList(devices).map((device) =>
      getDevicePowerValues(device),
    ),
  );
}

//===== (getDeviceLatestTimestamp) ======
export function getDeviceLatestTimestamp(device) {
  const timestamps = collectMonitoringTimestamps(device);

  return timestamps.length ? Math.max(...timestamps) : 0;
}

//===== (getDevicesMonitoringState) ======
export function getDevicesMonitoringState(devices) {
  const timestamps = normalizeDeviceList(devices)
    .map(getDeviceLatestTimestamp)
    .filter((timestamp) => timestamp > 0);
  const latestTimestamp = timestamps.length ? Math.max(...timestamps) : null;
  const hasReadableData = normalizeDeviceList(devices).some((device) =>
    hasAnyPowerValue(getDevicePowerValues(device)),
  );

  return {
    isOnline:
      latestTimestamp !== null
        ? Date.now() - latestTimestamp <= MONITORING_ONLINE_THRESHOLD_MS
        : hasReadableData,
    latestTimestamp,
  };
}

//===== (hasChartSeriesRows) ======
export function hasChartSeriesRows(series) {
  return POWER_SERIES_CONFIG.some((item) => series?.[item.key]?.length);
}

