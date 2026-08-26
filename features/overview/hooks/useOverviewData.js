//===== (Imports) ======
import { clearAuth, getToken, isTokenValid } from '@/auth/token';
import { BASE_URL } from '@/config/api';
import { fetchPlantDevices, isDemoPlant } from '@/services/plantService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
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
        const chartEndpoints =
          activeSegment === "lifetime"
            ? chartYearRange.map((year) =>
                buildChartEndpoint(
                  activeSegment,
                  resolvedPlantId,
                  selectedDay,
                  selectedMonth,
                  year,
                  selectedSourceDeviceId,
                ),
              )
            : [
                buildChartEndpoint(
                  activeSegment,
                  resolvedPlantId,
                  selectedDay,
                  selectedMonth,
                  selectedYear,
                  selectedSourceDeviceId,
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
            : mergeChartSeries(normalizeChartSeries(chartResult.json.data))
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
        const apiEnergyValues = getLatestEnergyValues(latestResults);
        const monitoringState = getMonitoringOnlineState(latestResults);
        const deviceMonitoringState = getDevicesMonitoringState(sourceDevices);
        const isCurrentDemoPlant = isDemoPlant(plantInfo);
        const effectiveMonitoringState = isCurrentDemoPlant
          ? { isOnline: true, latestTimestamp: Date.now() }
          : monitoringState.isOnline || deviceMonitoringState.isOnline
            ? {
                isOnline: true,
                latestTimestamp:
                  monitoringState.latestTimestamp ??
                  deviceMonitoringState.latestTimestamp,
              }
            : monitoringState;
        const effectivePowerValues = hasAnyPowerValue(apiPowerValues)
          ? apiPowerValues
          : devicePowerValues;
        const displayPowerValues = isCurrentDemoPlant
          ? DEMO_POWER_VALUES
          : effectiveMonitoringState.isOnline
            ? effectivePowerValues
            : ZERO_POWER_VALUES;
        const displayEnergyValues = isCurrentDemoPlant
          ? DEMO_ENERGY_VALUES
          : effectiveMonitoringState.isOnline
            ? apiEnergyValues
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
            production:
              displayPowerValues.production ??
              (effectiveMonitoringState.isOnline ? current?.production : 0) ??
              plantInfo.production ??
              selectedDevice?.production ??
              0,
            pv:
              displayPowerValues.pv ??
              (effectiveMonitoringState.isOnline ? current?.pv : 0) ??
              plantInfo.pv ??
              selectedDevice?.pv ??
              0,
            grid:
              displayPowerValues.grid ??
              (effectiveMonitoringState.isOnline ? current?.grid : 0) ??
              plantInfo.grid ??
              selectedDevice?.grid ??
              0,
            battery:
              displayPowerValues.battery ??
              (effectiveMonitoringState.isOnline ? current?.battery : 0) ??
              plantInfo.battery ??
              selectedDevice?.battery ??
              0,
            upsLoad:
              displayPowerValues.upsLoad ??
              (effectiveMonitoringState.isOnline ? current?.upsLoad : 0) ??
              plantInfo.upsLoad ??
              selectedDevice?.upsLoad ??
              0,
            load:
              displayPowerValues.load ??
              (effectiveMonitoringState.isOnline ? current?.load : 0) ??
              plantInfo.load ??
              selectedDevice?.load ??
              0,
            energy: displayEnergyValues.energy,
            energyPercent: displayEnergyValues.energyPercent,
            soc: effectiveMonitoringState.isOnline ? backendSocValue : null,
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
