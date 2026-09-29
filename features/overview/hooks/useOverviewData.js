//===== (Imports) ======
import { clearAuth, getToken, isTokenValid } from '@/auth/token';
import { BASE_URL, FALLBACK_URL } from '@/config/api';
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
    const doFetch = async (targetUrl) => {
      const response = await fetch(targetUrl, { method: "GET", headers });
      const json = await response.json().catch(() => null);

      return {
        endpoint: targetUrl,
        ok: response.ok,
        status: response.status,
        json,
        error: response.ok
          ? null
          : pickValue(json?.message, response.statusText, "Request failed"),
      };
    };

    try {
      return await doFetch(endpoint);
    } catch (error) {
      if (FALLBACK_URL && endpoint.startsWith(BASE_URL) && BASE_URL !== FALLBACK_URL) {
        try {
          const fallbackEndpoint = endpoint.replace(BASE_URL, FALLBACK_URL);
          return await doFetch(fallbackEndpoint);
        } catch {}
      }
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
          if (showLoading || latestPlantDevices.length === 0) {
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
          }
        } catch (error) {
          if (!String(error?.message || "").includes("Too many requests")) {
            console.warn(
              "Failed to load plant devices:",
              error?.message || error,
            );
          }
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
        const isCurrentSelectedDevice =
          Boolean(selectedDevice) &&
          (String(selectedDevice.id) === String(resolvedPlantId) ||
            String(selectedDevice.plantsId) === String(resolvedPlantId));

        const targetChartPlantId =
          (isCurrentSelectedDevice && selectedDevice?.deye_station_id) ||
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

        // Pre-resolve target station ID to parallelize with plant & chart queries (zero waterfall)
        const preTargetStationId =
          (isCurrentSelectedDevice ? selectedDevice?.deye_station_id : null) ||
          selectedDevice?.deye_station_id ||
          (Number(resolvedPlantId) >= 100000 ? resolvedPlantId : null);

        const [plantResult, chartResult, parallelStationRes, ...latestResults] = await Promise.all([
          requestJson(`${BASE_URL}/api/plant/`, headers),
          ...chartEndpoints.map((endpoint) => requestJson(endpoint, headers)),
          preTargetStationId
            ? requestJson(`${BASE_URL}/api/data/stations/${preTargetStationId}`, headers)
            : Promise.resolve(null),
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
          (isCurrentSelectedDevice ? selectedDevice : null) ??
          {};
        // Resolve target station ID for authentic Deye Cloud telemetry
        const targetStationId =
          plantInfo.deye_station_id ||
          (isCurrentSelectedDevice ? selectedDevice?.deye_station_id : null) ||
          (Number(resolvedPlantId) >= 100000 ? resolvedPlantId : null);

        if (targetStationId) {
          // If already pre-fetched in parallel, reuse instantly without waterfall delay
          if (
            preTargetStationId &&
            String(preTargetStationId) === String(targetStationId) &&
            parallelStationRes?.ok &&
            (parallelStationRes?.json?.data || parallelStationRes?.json)
          ) {
            stationDetail = parallelStationRes.json?.data || parallelStationRes.json;
          } else {
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
        }

        // Merge devices from stationDetail (Deye Cloud / VPS API) with plant devices (matching Web)
        const rawMergedDevices = [
          ...(Array.isArray(stationDetail?.devices) ? stationDetail.devices : []),
          ...(Array.isArray(selectedDevice?.devices) ? selectedDevice.devices : []),
          ...(Array.isArray(plantInfo?.devices) ? plantInfo.devices : []),
          ...(Array.isArray(latestPlantDevices) ? latestPlantDevices : []),
        ];

        const inverters = rawMergedDevices.filter(
          (d) => d.type === "INVERTER" || d.deviceType === "INVERTER",
        );
        const listToProcess =
          inverters.length > 0
            ? inverters
            : rawMergedDevices.filter(
                (d) =>
                  !String(
                    d.dataSourceId || d.device_id || d.sn || "",
                  ).startsWith("DEYE_STATION_"),
              );

        const seenDevIds = new Set();
        const mergedDevices = [];

        for (const dev of listToProcess) {
          const devId = String(
            dev?.device_id || dev?.sn || dev?.deviceId || dev?.dataSourceId || "",
          ).trim();
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

        const isPlantEmptyDevice = chartResults.some(
          (item) =>
            item?.status === 404 ||
            String(item?.error || "").includes("No devices found"),
        );
        const chartRequestSucceeded =
          chartResults.some((item) => item?.ok && item?.json?.data != null) ||
          isPlantEmptyDevice;
        const chartSeries =
          chartRequestSucceeded && !isPlantEmptyDevice
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
        const selectedDev = !isPlant
          ? latestPlantDevices.find(
              (d) =>
                String(d.dataSourceId || d.device_id || d.sn || "") ===
                String(selectedSourceDeviceId),
            ) ||
            (Array.isArray(stationDetail?.devices)
              ? stationDetail.devices.find(
                  (d) =>
                    String(d.device_id || d.sn || "") ===
                    String(selectedSourceDeviceId),
                )
              : null)
          : null;

        // 1. Compute authentic energy summary & production flow
        let authenticEnergy = ZERO_ENERGY_VALUES.energy;
        let authenticProductionFlow = {
          pvGenerateKwh: 0,
          chargeKwh: 0,
          exportKwh: 0,
          totalProductionKwh: 0,
        };
        let totalProdKwh = 0;
        let displayPowerValues = ZERO_POWER_VALUES;

        if (isPlant) {
          // Plant Data: accumulation of all inverters / station telemetry
          const stationEnergySummary = stationDetail?.energySummary || {};
          const totalConsKwh = Number(
            stationEnergySummary.consumptionTodayKwh ??
              stationDetail?.consumptionTodayKwh ??
              0,
          );
          const gridConsKwh = Number(
            stationEnergySummary.gridKwh ?? stationDetail?.gridKwh ?? 0,
          );
          const pvConsKwh = Number(
            Math.max(0, totalConsKwh - gridConsKwh).toFixed(2),
          );
          const battConsKwh = Number(
            stationEnergySummary.batteryDischargeKwh ?? 0,
          );

          totalProdKwh = Number(
            stationEnergySummary.productionTodayKwh ??
              stationDetail?.dailyProduction ??
              0,
          );
          const chargeProdKwh = Number(
            stationEnergySummary.batteryChargeKwh ?? 0,
          );
          const exportProdKwh = Number(stationEnergySummary.exportKwh ?? 0);
          const pvGenKwh = Number(
            Math.max(0, totalProdKwh - chargeProdKwh - exportProdKwh).toFixed(2),
          );

          authenticEnergy = {
            totalKwh: totalConsKwh,
            consumptionKwh: pvConsKwh,
            gridKwh: gridConsKwh,
            batteryKwh: battConsKwh,
          };

          authenticProductionFlow = {
            pvGenerateKwh: pvGenKwh,
            chargeKwh: chargeProdKwh,
            exportKwh: exportProdKwh,
            totalProductionKwh: totalProdKwh,
          };

          if (stationDetail) {
            displayPowerValues = {
              production: Number(
                stationDetail.production ?? stationDetail.pv ?? 0,
              ),
              pv: Number(stationDetail.pv ?? stationDetail.production ?? 0),
              grid: Number(stationDetail.grid ?? stationDetail.gridPower ?? 0),
              battery: Number(
                stationDetail.battery ?? stationDetail.batteryPower ?? 0,
              ),
              load: Number(
                stationDetail.load ??
                  stationDetail.loadPower ??
                  stationDetail.upsLoad ??
                  0,
              ),
              upsLoad: Number(
                stationDetail.upsLoad ?? stationDetail.load ?? 0,
              ),
            };
          } else {
            displayPowerValues = effectiveMonitoringState.isOnline
              ? effectivePowerValues
              : ZERO_POWER_VALUES;
          }
        } else if (selectedDev) {
          // Specific hardware inverter telemetry from Deye Cloud
          const devPower = Number(Number(selectedDev.power || 0).toFixed(2));
          const devBattery = Number(Number(selectedDev.batteryPower || 0).toFixed(2));
          // Load & Grid represent the actual plant/building load & grid interaction being served
          const stationLoad = Number(
            Number(
              stationDetail?.loadPower ??
                stationDetail?.load ??
                stationDetail?.upsLoad ??
                selectedDev.consumptionPower ??
                0,
            ).toFixed(2),
          );
          const stationGrid = Number(
            Number(
              stationDetail?.gridPower ??
                stationDetail?.grid ??
                selectedDev.gridPower ??
                0,
            ).toFixed(2),
          );

          displayPowerValues = {
            production: devPower,
            pv: devPower,
            grid: stationGrid,
            battery: devBattery,
            load: stationLoad,
            upsLoad: stationLoad,
          };

          totalProdKwh = Number(Number(selectedDev.dailyEnergy || 0).toFixed(2));
          const stationEnergySummary = stationDetail?.energySummary || {};
          const devConsKwh = Number(
            Number(
              stationEnergySummary.consumptionTodayKwh ??
                stationDetail?.consumptionTodayKwh ??
                0,
            ).toFixed(2),
          );
          const devGridKwh = Number(
            Number(
              stationEnergySummary.gridKwh ??
                stationDetail?.gridKwh ??
                0,
            ).toFixed(2),
          );
          const devChargeKwh = Number(
            (
              selectedDev.dailyChargingEnergy ||
              (devBattery < 0 ? Math.abs(devBattery) * 2.2 : 0) ||
              0
            ).toFixed(2),
          );
          const devExportKwh = Number(
            (
              selectedDev.dailyGridFeedIn ||
              (stationGrid < 0 ? Math.abs(stationGrid) * 0.5 : 0) ||
              0
            ).toFixed(2),
          );
          const devPvGenKwh = Number(
            Math.max(0, totalProdKwh - devChargeKwh - devExportKwh).toFixed(2),
          );
          const devPvConsKwh = Number(
            Math.max(0, devConsKwh - devGridKwh).toFixed(2),
          );
          const devBattDischargeKwh = Number(
            (
              selectedDev.dailyDischargingEnergy ||
              (devBattery > 0 ? devBattery * 1.5 : 0) ||
              0
            ).toFixed(2),
          );

          authenticEnergy = {
            totalKwh: devConsKwh,
            consumptionKwh: devPvConsKwh,
            gridKwh: devGridKwh,
            batteryKwh: devBattDischargeKwh,
          };

          authenticProductionFlow = {
            pvGenerateKwh: devPvGenKwh,
            chargeKwh: devChargeKwh,
            exportKwh: devExportKwh,
            totalProductionKwh: totalProdKwh,
          };
        }

        const displayEnergyValues = {
          energy: authenticEnergy,
          energyPercent: {
            pvPercent:
              authenticEnergy.totalKwh > 0
                ? Math.min(
                    100,
                    Math.round(
                      (authenticEnergy.consumptionKwh /
                        authenticEnergy.totalKwh) *
                        100,
                    ),
                  )
                : 0,
            gridPercent:
              authenticEnergy.totalKwh > 0
                ? Math.min(
                    100,
                    Math.round(
                      (authenticEnergy.gridKwh / authenticEnergy.totalKwh) *
                        100,
                    ),
                  )
                : 0,
            batteryPercent:
              authenticEnergy.totalKwh > 0
                ? Math.max(
                    0,
                    100 -
                      (Math.min(
                        100,
                        Math.round(
                          (authenticEnergy.consumptionKwh /
                            authenticEnergy.totalKwh) *
                            100,
                        ),
                      ) +
                        Math.min(
                          100,
                          Math.round(
                            (authenticEnergy.gridKwh /
                              authenticEnergy.totalKwh) *
                              100,
                          ),
                        )),
                  )
                : 0,
          },
        };

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
              totalProdKwh,
              displayPowerValues.production,
              plantInfo.productionToday,
              plantInfo.production,
              effectiveMonitoringState.isOnline ? current?.productionToday : 0,
              effectiveMonitoringState.isOnline ? current?.production : 0,
              selectedDevice?.productionToday,
              selectedDevice?.production,
            ),
            production: displayPowerValues.production ?? 0,
            pv: displayPowerValues.pv ?? 0,
            grid: displayPowerValues.grid ?? 0,
            battery: displayPowerValues.battery ?? 0,
            upsLoad: displayPowerValues.upsLoad ?? 0,
            load: displayPowerValues.load ?? 0,
            energy: displayEnergyValues.energy,
            energyPercent: displayEnergyValues.energyPercent,
            soc: selectedDev?.batterySoc != null
              ? Number(selectedDev.batterySoc)
              : stationDetail?.batterySoc != null
                ? Number(stationDetail.batterySoc)
                : stationDetail?.soc != null
                  ? Number(stationDetail.soc)
                  : (effectiveMonitoringState.isOnline ? backendSocValue : null),
            batterySoc: selectedDev?.batterySoc != null
              ? Number(selectedDev.batterySoc)
              : stationDetail?.batterySoc != null
                ? Number(stationDetail.batterySoc)
                : stationDetail?.soc != null
                  ? Number(stationDetail.soc)
                  : (effectiveMonitoringState.isOnline ? backendSocValue : null),
            selectedDataPercentages: effectiveMonitoringState.isOnline
              ? backendSelectedDataPercentages
              : {},
            isDeviceOnline: selectedDev
              ? (selectedDev.connectStatus === 1 || selectedDev.status === "Online" || Number(selectedDev.power) > 0)
              : effectiveMonitoringState.isOnline,
            latestDataTimestamp: effectiveMonitoringState.latestTimestamp,
            status: pickValue(
              selectedDev
                ? (selectedDev.connectStatus === 1 || selectedDev.status === "Online" || Number(selectedDev.power) > 0 ? "online" : "offline")
                : (effectiveMonitoringState.isOnline ? "online" : "offline"),
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
            dailyProduction: totalProdKwh,
            productionFlow: authenticProductionFlow,
            energySummary: isPlant ? (stationDetail?.energySummary || {}) : {},
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
