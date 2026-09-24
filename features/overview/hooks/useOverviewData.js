//===== (Imports) ======
import { clearAuth, getToken, isTokenValid } from '@/auth/token';
import { BASE_URL } from '@/config/api';
import { fetchPlantDevices } from '@/services/plantService';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  DEMO_ENERGY_VALUES,
  DEMO_POWER_VALUES,
  POWER_LATEST_ENDPOINT_CONFIG,
  ZERO_ENERGY_VALUES,
  ZERO_POWER_VALUES,
} from '../constants/overviewConstants';
import { fetchGoogleWeatherForPlant } from '../services/weatherService';
import {
  getBackendSelectedPercentages,
  getBackendSocValue,
  getMonitoringOnlineState,
  pickFiniteNumber,
  pickNumber,
  pickValue,
} from '../utils/apiData';
import {
  buildChartEndpoint,
  buildChartSelectionKey,
  buildLatestPowerRequests,
  buildYearRangeChartSeries,
  createEmptyChartSeries,
  debugChartLog,
  getChartRequestDate,
  getChartSeriesCounts,
} from '../utils/chartData';
import { getChartApiSegment } from '../utils/dateTime';
import {
  areDeviceListsEqual,
  getDevicesAggregatePowerValues,
  getDevicesMonitoringState,
  getLatestEnergyValues,
  hasAnyPowerValue,
  mergeChartSeries,
  mergePowerValues,
  normalizeChartSeries,
  normalizeDeviceList,
  normalizeLatestPowerValues,
} from '../utils/powerData';

//===== (useOverviewData) ======
export function useOverviewData({
  activeSegment,
  chartYearRange,
  language,
  resolvedPlantId,
  selectedDataSource,
  selectedDay,
  selectedDevice,
  selectedMonth,
  selectedYear,
  setSelectedDataSource,
}) {
  const router = useRouter();
  const [fetchedData, setFetchedData] = useState(null);
  const [plantDevices, setPlantDevices] = useState([]);
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [chartRequestState, setChartRequestState] = useState({
    key: null,
    status: "loading",
    error: null,
  });
  const plantDevicesRef = useRef([]);
  const activePlantIdRef = useRef(resolvedPlantId);

  //===== (Reset Plant Scoped State) ======
  useEffect(() => {
    activePlantIdRef.current = resolvedPlantId;
    plantDevicesRef.current = [];
    setFetchedData(null);
    setPlantDevices([]);
    setSelectedDataSource("plant");
    setChartRequestState({
      key: null,
      status: "loading",
      error: null,
    });
  }, [resolvedPlantId, setSelectedDataSource]);

  //===== (Chart Selection Key) ======
  const chartSelectionKey = useMemo(() => {
    if (!resolvedPlantId) {
      return null;
    }

    return buildChartSelectionKey(
      activeSegment,
      resolvedPlantId,
      selectedDay,
      selectedMonth,
      selectedYear,
      selectedDataSource,
    );
  }, [
    activeSegment,
    resolvedPlantId,
    selectedDay,
    selectedMonth,
    selectedYear,
    selectedDataSource,
  ]);
  const selectedSourceDeviceId =
    selectedDataSource === 'plant' ? null : selectedDataSource;

  //===== (getAuthorizedHeaders) ======
  const getAuthorizedHeaders = useCallback(async () => {
    const token = await getToken();

    if (!token || !isTokenValid(token)) {
      await clearAuth();
      Alert.alert(
        "Error",
        "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
      );
      router.replace("/(auth)/login");
      return null;
    }

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [router]);

  //===== (requestJson) ======
  const requestJson = useCallback(async (endpoint, headers) => {
    try {
      const response = await fetch(endpoint, { method: "GET", headers });
      const json = await response.json().catch(() => null);

      return {
        endpoint,
        ok: response.ok,
        status: response.status,
        json,
        error: response.ok
          ? null
          : pickValue(json?.message, response.statusText, "Request failed"),
      };
    } catch (error) {
      return {
        endpoint,
        ok: false,
        status: null,
        json: null,
        error: error?.message ?? "Network request failed",
      };
    }
  }, []);

  //===== (fetchOverviewData) ======
  const fetchOverviewData = useCallback(
    async ({ showLoading = false } = {}) => {
      const requestPlantId = resolvedPlantId;
      let stationDetail = null;
      try {
        if (showLoading) {
          setIsRefreshLoading(true);
        }

        if (!resolvedPlantId || !chartSelectionKey) {
          return;
        }

        const headers = await getAuthorizedHeaders();

        if (!headers) {
          return;
        }

        let latestPlantDevices = plantDevicesRef.current;

        try {
          const deviceResult = await fetchPlantDevices(resolvedPlantId);
          if (String(activePlantIdRef.current) !== String(requestPlantId)) {
            return;
          }
          latestPlantDevices = normalizeDeviceList(deviceResult?.devices);
          plantDevicesRef.current = latestPlantDevices;
          setPlantDevices((currentDevices) =>
            areDeviceListsEqual(currentDevices, latestPlantDevices)
              ? currentDevices
              : latestPlantDevices,
          );

          if (
            selectedDataSource !== "plant" &&
            !latestPlantDevices.some(
              (device) => String(device.dataSourceId) === selectedDataSource,
            )
          ) {
            setSelectedDataSource("plant");
          }
        } catch (error) {
          console.warn(
            "Failed to load plant devices:",
            error?.message || error,
          );
        }

        const sourceDevices = selectedSourceDeviceId
          ? latestPlantDevices.filter(
              (device) =>
                String(device.dataSourceId) === selectedSourceDeviceId,
            )
          : latestPlantDevices;
        const latestRequests = POWER_LATEST_ENDPOINT_CONFIG.flatMap((item) =>
          buildLatestPowerRequests(
            resolvedPlantId,
            item,
            selectedSourceDeviceId,
          ),
        );
        const targetChartPlantId =
          selectedDevice?.deye_station_id ||
          selectedDevice?.plantsId ||
          resolvedPlantId;

        // For plant or Deye Station gateway, query station history (deviceId = null).
        // For individual hardware device (e.g. 2411216565), pass deviceId so backend queries that device.
        const chartDeviceId =
          !selectedSourceDeviceId ||
          selectedSourceDeviceId === "plant" ||
          String(selectedSourceDeviceId).startsWith("DEYE_STATION_")
            ? null
            : selectedSourceDeviceId;

        const chartEndpoints =
          activeSegment === "lifetime"
            ? chartYearRange.map((year) =>
                buildChartEndpoint(
                  activeSegment,
                  targetChartPlantId,
                  selectedDay,
                  selectedMonth,
                  year,
                  chartDeviceId,
                ),
              )
            : [
                buildChartEndpoint(
                  activeSegment,
                  targetChartPlantId,
                  selectedDay,
                  selectedMonth,
                  selectedYear,
                  chartDeviceId,
                ),
              ];
        const chartEndpoint = chartEndpoints[0];
        const chartDate = getChartRequestDate(
          getChartApiSegment(activeSegment),
          selectedDay,
          selectedMonth,
          selectedYear,
        );

        debugChartLog("request", {
          endpoint: chartEndpoint,
          plantId: resolvedPlantId,
          segment: activeSegment,
          date: chartDate,
        });

        const [plantResult, chartResult, ...latestResults] = await Promise.all([
          requestJson(`${BASE_URL}/api/plant/`, headers),
          ...chartEndpoints.map((endpoint) => requestJson(endpoint, headers)),
          ...latestRequests.map((item) => requestJson(item.endpoint, headers)),
        ]);
        if (String(activePlantIdRef.current) !== String(requestPlantId)) {
          return;
        }
        const chartResults =
          activeSegment === "lifetime"
            ? [
                chartResult,
                ...latestResults.splice(0, chartEndpoints.length - 1),
              ]
            : [chartResult];

        const plants = Array.isArray(plantResult?.json?.data)
          ? plantResult.json.data
          : [];
        const plantInfo =
          plants.find((item) => String(item.id) === String(resolvedPlantId)) ??
          selectedDevice ??
          {};
        // Resolve target station ID for authentic Deye Cloud telemetry
        const targetStationId =
          plantInfo.deye_station_id ||
          selectedDevice?.deye_station_id ||
          plantInfo.plantsId ||
          resolvedPlantId;

        if (targetStationId) {
          try {
            const stationRes = await requestJson(
              `${BASE_URL}/api/data/stations/${targetStationId}`,
              headers,
            );
            if (stationRes?.ok && (stationRes?.json?.data || stationRes?.json)) {
              stationDetail = stationRes.json?.data || stationRes.json;
            }
          } catch (_stErr) {
            stationDetail = null;
          }
        }

        // Merge devices from stationDetail (Deye Cloud / VPS API) with plant devices (matching Web)
        const rawMergedDevices = [
          ...(Array.isArray(stationDetail?.devices) ? stationDetail.devices : []),
          ...(Array.isArray(selectedDevice?.devices) ? selectedDevice.devices : []),
          ...(Array.isArray(plantInfo?.devices) ? plantInfo.devices : []),
          ...(Array.isArray(latestPlantDevices) ? latestPlantDevices : []),
        ];

        const seenDevIds = new Set();
        const mergedDevices = [];

        // Always include DEYE_STATION_ gateway first in dropdown if targetStationId exists
        if (targetStationId) {
          const stationGatewayId = `DEYE_STATION_${targetStationId}`;
          seenDevIds.add(stationGatewayId);
          mergedDevices.push({
            dataSourceId: stationGatewayId,
            device_id: stationGatewayId,
            sn: stationGatewayId,
            name: "DEYE Station",
            type: "Station Telemetry",
          });
        }

        for (const dev of rawMergedDevices) {
          const devId = String(dev?.device_id || dev?.sn || dev?.deviceId || dev?.dataSourceId || "").trim();
          if (devId && !seenDevIds.has(devId)) {
            seenDevIds.add(devId);
            mergedDevices.push({
              ...dev,
              dataSourceId: devId,
              device_id: devId,
              sn: devId,
            });
          }
        }

        if (mergedDevices.length > 0) {
          latestPlantDevices = mergedDevices;
          plantDevicesRef.current = mergedDevices;
          setPlantDevices((currentDevices) =>
            areDeviceListsEqual(currentDevices, mergedDevices)
              ? currentDevices
              : mergedDevices,
          );
        }
        const backendDataSources = [
          ...latestResults.map((item) => item?.json).filter(Boolean),
          ...chartResults.map((item) => item?.json).filter(Boolean),
          plantInfo,
          ...sourceDevices,
        ];
        const backendSocValue = getBackendSocValue(backendDataSources);
        const backendSelectedDataPercentages = getBackendSelectedPercentages(
          backendDataSources,
          latestResults,
          latestRequests,
        );

        let googleWeather = null;
        try {
          googleWeather = await fetchGoogleWeatherForPlant({
            locationText: pickValue(
              plantInfo.location,
              selectedDevice?.location,
              "",
            ),
            latitude: pickValue(
              plantInfo.latitude,
              selectedDevice?.latitude,
              null,
            ),
            longitude: pickValue(
              plantInfo.longitude,
              selectedDevice?.longitude,
              null,
            ),
            languageCode: language === "id" ? "id" : "en",
          });
        } catch (_error) {
          googleWeather = null;
        }

        const chartRequestSucceeded = chartResults.some(
          (item) => item?.ok && item?.json?.data != null,
        );
        const chartSeries = chartRequestSucceeded
          ? activeSegment === "lifetime"
            ? buildYearRangeChartSeries(chartResults, chartYearRange)
            : mergeChartSeries(normalizeChartSeries(chartResult?.json?.data))
          : createEmptyChartSeries();
        setChartRequestState({
          key: chartSelectionKey,
          status: chartRequestSucceeded ? "ready" : "error",
          error: chartRequestSucceeded
            ? null
            : chartResults
                .map((item) => item?.error)
                .filter(Boolean)
                .join("; ") || "Unable to load chart data.",
        });
        debugChartLog("response", {
          plantId: resolvedPlantId,
          segment: activeSegment,
          date: chartDate,
          status: chartResults.map((item) => item?.status).join(","),
          ok: chartRequestSucceeded,
          error: chartResults
            .map((item) => item?.error)
            .filter(Boolean)
            .join("; "),
          counts: getChartSeriesCounts(chartSeries),
        });
        const apiPowerValues = mergePowerValues(
          ...latestResults.map((item, index) =>
            normalizeLatestPowerValues(
              item?.json?.data,
              latestRequests[index]?.sourceCategory,
            ),
          ),
        );
        const devicePowerValues = getDevicesAggregatePowerValues(sourceDevices);
        const effectivePowerValues = hasAnyPowerValue(apiPowerValues)
          ? mergePowerValues(apiPowerValues, devicePowerValues)
          : devicePowerValues;
        const apiEnergyValues = getLatestEnergyValues(latestResults);
        const monitoringState = getMonitoringOnlineState(latestResults);
        const deviceMonitoringState = getDevicesMonitoringState(sourceDevices);
        const isStationOnline = stationDetail
          ? (stationDetail.status === "Online" || stationDetail.isDeviceOnline === true)
          : false;

        const effectiveMonitoringState = stationDetail
          ? {
              isOnline: isStationOnline,
              latestTimestamp: stationDetail.lastUpdateTime
                ? new Date(stationDetail.lastUpdateTime).getTime()
                : Date.now(),
            }
          : monitoringState.isOnline || deviceMonitoringState.isOnline
            ? {
                isOnline: true,
                latestTimestamp:
                  monitoringState.latestTimestamp ??
                  deviceMonitoringState.latestTimestamp,
              }
            : monitoringState;

                const isPlant =
          !selectedSourceDeviceId || selectedSourceDeviceId === "plant";
        const isDeyeStation = Boolean(
          selectedSourceDeviceId &&
            String(selectedSourceDeviceId).startsWith("DEYE_STATION_"),
        );
        const isStationGateway = isPlant || isDeyeStation;

        // Compute authentic energy summary directly from Deye Cloud telemetry (only for station gateway)
        const stationEnergySummary = isStationGateway ? (stationDetail?.energySummary || {}) : {};
        const totalConsKwh = isStationGateway ? Number(stationEnergySummary.consumptionTodayKwh ?? stationDetail?.consumptionTodayKwh ?? 0) : 0;
        const gridConsKwh = isStationGateway ? Number(stationEnergySummary.gridKwh ?? stationDetail?.gridKwh ?? 0) : 0;
        const pvConsKwh = isStationGateway ? Number(Math.max(0, totalConsKwh - gridConsKwh).toFixed(2)) : 0;
        const battConsKwh = isStationGateway ? Number(stationEnergySummary.batteryDischargeKwh ?? 0) : 0;

        const authenticEnergy = {
          totalKwh: totalConsKwh,
          consumptionKwh: pvConsKwh,
          gridKwh: gridConsKwh,
          batteryKwh: battConsKwh,
        };

        const totalProdKwh = isStationGateway ? Number(stationEnergySummary.productionTodayKwh ?? stationDetail?.dailyProduction ?? 0) : 0;
        const chargeProdKwh = isStationGateway ? Number(stationEnergySummary.batteryChargeKwh ?? 0) : 0;
        const exportProdKwh = isStationGateway ? Number(stationEnergySummary.exportKwh ?? 0) : 0;

        const authenticProductionFlow = {
          pvGenerateKwh: totalProdKwh,
          chargeKwh: chargeProdKwh,
          exportKwh: exportProdKwh,
          totalProductionKwh: totalProdKwh,
        };

        // For Plant Data ('plant'): accumulation of all sources in dropdown
        // For Deye Station ('DEYE_STATION_...'): specifically telemetry from Deye Cloud
        // For individual device: strictly 0 (no sub-meter parameters)
        let displayPowerValues = ZERO_POWER_VALUES;
        if (isDeyeStation) {
          // Parameters taken directly from Deye Cloud
          displayPowerValues = stationDetail
            ? {
                production: Number(stationDetail.production ?? stationDetail.pv ?? 0),
                pv: Number(stationDetail.pv ?? stationDetail.production ?? 0),
                grid: Number(stationDetail.grid ?? stationDetail.gridPower ?? 0),
                battery: Number(stationDetail.battery ?? stationDetail.batteryPower ?? 0),
                load: Number(stationDetail.load ?? stationDetail.loadPower ?? stationDetail.upsLoad ?? 0),
                upsLoad: Number(stationDetail.upsLoad ?? stationDetail.load ?? 0),
              }
            : ZERO_POWER_VALUES;
        } else if (isPlant) {
          // Accumulation of all sources in the dropdown:
          // Base Deye station telemetry + any separate device telemetry
          const nonDeyeDevices = sourceDevices.filter(
            (d) => !String(d.dataSourceId || "").startsWith("DEYE_STATION_"),
          );
          const nonDeyePower = getDevicesAggregatePowerValues(nonDeyeDevices);

          if (stationDetail) {
            displayPowerValues = {
              production: Number(stationDetail.production ?? stationDetail.pv ?? 0) + (Number(nonDeyePower.production) || 0),
              pv: Number(stationDetail.pv ?? stationDetail.production ?? 0) + (Number(nonDeyePower.pv) || 0),
              grid: Number(stationDetail.grid ?? stationDetail.gridPower ?? 0),
              battery: Number(stationDetail.battery ?? stationDetail.batteryPower ?? 0),
              load: Number(stationDetail.load ?? stationDetail.loadPower ?? stationDetail.upsLoad ?? 0) + (Number(nonDeyePower.load) || 0),
              upsLoad: Number(stationDetail.upsLoad ?? stationDetail.load ?? 0),
            };
          } else {
            displayPowerValues = effectiveMonitoringState.isOnline ? effectivePowerValues : ZERO_POWER_VALUES;
          }
        }

        const displayEnergyValues = isStationGateway
          ? (stationDetail
              ? {
                  energy: authenticEnergy,
                  energyPercent: {
                    pvPercent: authenticEnergy.totalKwh > 0 ? Math.min(100, Math.round((authenticEnergy.consumptionKwh / authenticEnergy.totalKwh) * 100)) : 0,
                    gridPercent: authenticEnergy.totalKwh > 0 ? Math.min(100, Math.round((authenticEnergy.gridKwh / authenticEnergy.totalKwh) * 100)) : 0,
                    batteryPercent: authenticEnergy.totalKwh > 0 ? Math.max(0, 100 - (authenticEnergy.consumptionKwh + authenticEnergy.gridKwh)) : 0,
                  },
                }
              : effectiveMonitoringState.isOnline
                ? apiEnergyValues
                : ZERO_ENERGY_VALUES)
          : ZERO_ENERGY_VALUES;
        setFetchedData((current) => {
          const currentChartSeries =
            current?.chartSelectionKey === chartSelectionKey
              ? current?.chartSeries
              : createEmptyChartSeries();
          const nextChartSeries = chartRequestSucceeded
            ? chartSeries
            : currentChartSeries;

          return {
            ...current,
            ...plantInfo,
            updatedAt: pickValue(
              plantInfo.updated_at,
              plantInfo.updatedAt,
              current?.updatedAt,
              selectedDevice?.updatedAt,
              null,
            ),
            latitude: pickValue(
              plantInfo.latitude,
              googleWeather?.latitude,
              current?.latitude,
              selectedDevice?.latitude,
              null,
            ),
            longitude: pickValue(
              plantInfo.longitude,
              googleWeather?.longitude,
              current?.longitude,
              selectedDevice?.longitude,
              null,
            ),
            weather: pickValue(
              plantInfo.weather,
              googleWeather?.temperature !== undefined
                ? `${Math.round(googleWeather.temperature)}\u00B0C`
                : null,
              current?.weather,
              selectedDevice?.weather,
              null,
            ),
            weatherTemperature: pickFiniteNumber(
              plantInfo.weatherTemperature,
              googleWeather?.temperature,
              current?.weatherTemperature,
              selectedDevice?.weatherTemperature,
            ),
            weatherHigh: pickFiniteNumber(
              plantInfo.weatherHigh,
              googleWeather?.high,
              current?.weatherHigh,
              selectedDevice?.weatherHigh,
            ),
            weatherLow: pickFiniteNumber(
              plantInfo.weatherLow,
              googleWeather?.low,
              current?.weatherLow,
              selectedDevice?.weatherLow,
            ),
            weatherConditionText: pickValue(
              plantInfo.weatherConditionText,
              googleWeather?.conditionText,
              current?.weatherConditionText,
              selectedDevice?.weatherConditionText,
              null,
            ),
            weatherConditionType: pickValue(
              plantInfo.weatherConditionType,
              googleWeather?.conditionType,
              current?.weatherConditionType,
              selectedDevice?.weatherConditionType,
              null,
            ),
            weatherIsDaytime: pickValue(
              plantInfo.weatherIsDaytime,
              googleWeather?.isDaytime,
              current?.weatherIsDaytime,
              selectedDevice?.weatherIsDaytime,
              null,
            ),
            productionToday: pickNumber(
              displayPowerValues.production,
              plantInfo.productionToday,
              plantInfo.production,
              effectiveMonitoringState.isOnline ? current?.productionToday : 0,
              effectiveMonitoringState.isOnline ? current?.production : 0,
              selectedDevice?.productionToday,
              selectedDevice?.production,
            ),
            production: isStationGateway ? (displayPowerValues.production ?? 0) : 0,
            pv: isStationGateway ? (displayPowerValues.pv ?? 0) : 0,
            grid: isStationGateway ? (displayPowerValues.grid ?? 0) : 0,
            battery: isStationGateway ? (displayPowerValues.battery ?? 0) : 0,
            upsLoad: isStationGateway ? (displayPowerValues.upsLoad ?? 0) : 0,
            load: isStationGateway ? (displayPowerValues.load ?? 0) : 0,
            energy: isStationGateway ? displayEnergyValues.energy : ZERO_ENERGY_VALUES.energy,
            energyPercent: isStationGateway ? displayEnergyValues.energyPercent : ZERO_ENERGY_VALUES.energyPercent,
            soc: isStationGateway
              ? (stationDetail?.batterySoc != null
                  ? Number(stationDetail.batterySoc)
                  : (stationDetail?.soc != null
                      ? Number(stationDetail.soc)
                      : (effectiveMonitoringState.isOnline ? backendSocValue : null)))
              : null,
            batterySoc: isStationGateway
              ? (stationDetail?.batterySoc != null
                  ? Number(stationDetail.batterySoc)
                  : (stationDetail?.soc != null
                      ? Number(stationDetail.soc)
                      : (effectiveMonitoringState.isOnline ? backendSocValue : null)))
              : null,
            selectedDataPercentages: effectiveMonitoringState.isOnline
              ? backendSelectedDataPercentages
              : {},
            isDeviceOnline: effectiveMonitoringState.isOnline,
            latestDataTimestamp: effectiveMonitoringState.latestTimestamp,
            status: pickValue(
              effectiveMonitoringState.isOnline ? "online" : "offline",
              plantInfo.status,
              current?.status,
              selectedDevice?.status,
              "--",
            ),
            capacity: pickNumber(
              stationDetail?.capacity,
              stationDetail?.installedCapacity,
              plantInfo.capacity,
              plantInfo.pv_capacity,
              plantInfo.installed_capacity,
              plantInfo.installedCapacity,
              selectedDevice?.capacity,
              selectedDevice?.pv_capacity,
              selectedDevice?.installed_capacity,
              selectedDevice?.installedCapacity,
              current?.capacity,
              0,
            ),
            dailyProduction: isStationGateway
              ? pickNumber(
                  stationEnergySummary.productionTodayKwh,
                  stationDetail?.dailyProduction,
                  stationDetail?.productionToday,
                  plantInfo.dailyProduction,
                  plantInfo.productionToday,
                  selectedDevice?.dailyProduction,
                  selectedDevice?.productionToday,
                  0,
                )
              : 0,
            productionFlow: isStationGateway
              ? authenticProductionFlow
              : {
                  pvGenerateKwh: 0,
                  chargeKwh: 0,
                  exportKwh: 0,
                  totalProductionKwh: 0,
                },
            energySummary: isStationGateway ? stationEnergySummary : {},
            chartSeries: nextChartSeries,
            chartSelectionKey,
          };
        });

      } catch (error) {
        console.error("Error fetching plant data:", error);
        setChartRequestState({
          key: chartSelectionKey,
          status: "error",
          error: error?.message || "Unable to load chart data.",
        });
      } finally {
        if (
          showLoading &&
          String(activePlantIdRef.current) === String(requestPlantId)
        ) {
          setIsRefreshLoading(false);
        }
      }
    },
    [
      activeSegment,
      chartSelectionKey,
      chartYearRange,
      getAuthorizedHeaders,
      language,
      requestJson,
      resolvedPlantId,
      selectedDay,
      selectedDataSource,
      selectedDevice,
      selectedMonth,
      selectedSourceDeviceId,
      selectedYear,
      setSelectedDataSource,
    ],
  );

  //===== (refreshOverviewOnFocus) ======
  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((prev) => prev + 1);
    }, []),
  );

  //===== (resetChartRequestState) ======
  useEffect(() => {
    setChartRequestState({
      key: chartSelectionKey,
      status: "loading",
      error: null,
    });
  }, [chartSelectionKey]);

  return {
    chartError: chartRequestState.error,
    chartSelectionKey,
    chartStatus:
      chartRequestState.key === chartSelectionKey
        ? chartRequestState.status
        : "loading",
    fetchedData,
    fetchOverviewData,
    focusRefreshKey,
    isRefreshLoading,
    plantDevices,
  };
}
