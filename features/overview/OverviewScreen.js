//===== (Imports) ======
import LandscapeChartModal from "./components/LandscapeChartModal";
import OverviewChartSection from "./components/OverviewChartSection";
import PowerFlowSection from "./components/PowerFlowSection";
import {
  DEBUG_LAYOUT,
  GRID_POINTER_CONFIG,
  LANDSCAPE_CHART_LAYOUT,
  PLANT_HEADER_BOX,
  PLANT_HEADER_BUTTON,
  POWER_CHART_DAY_CHIP_STEP,
  POWER_CHART_LOADING_DELAY_MS,
  POWER_CHART_MONTH_CHIP_STEP,
  POWER_SERIES_CONFIG,
  ZERO_ENERGY_VALUES,
} from "./constants/overviewConstants";
import { useOverviewData } from "./hooks/useOverviewData";
import { useVisiblePowerSeries } from "./hooks/useVisiblePowerSeries";
import styles from "./styles/overview.styles";
import { pickFiniteNumber, pickNumber, pickValue } from "./utils/apiData";
import {
  buildFallbackSeries,
  buildZeroSeries,
  createEmptyChartSeries,
  getChartFallbackValue,
  getResponsiveChartWidth,
} from "./utils/chartData";
import {
  formatCompactNumber,
  getJakartaDateParts,
  getYearRange,
  resolvePlantId,
} from "./utils/dateTime";
import { buildProductionPowerFlowData } from "./utils/powerFlow";
import { normalizeDeviceList } from "./utils/powerData";
import { appColors } from "@/config/theme";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { isDemoPlant } from "@/services/plantService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

//===== (OverviewScreen) ======
export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const { colors, language, t, themeMode } = useAppSettings();
  const isLightMode = themeMode === "light";
  const navigationColor = isLightMode
    ? appColors.screen
    : "rgba(248,250,252,0.88)";
  const pointerLineColor = isLightMode
    ? colors.accent
    : GRID_POINTER_CONFIG.lineColor;
  const { selectedDevice } = useContext(AuthContext);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const resolvedPlantId = resolvePlantId(id, selectedDevice?.id);
  //===== (Initial Jakarta Date) ======
  const initialJakartaDate = useMemo(() => getJakartaDateParts(), []);
  const [activeSegment, setActiveSegment] = useState("day");
  const [selectedDataSource, setSelectedDataSource] = useState("plant");
  const [dataSourceMenuVisible, setDataSourceMenuVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(initialJakartaDate.day);
  const [selectedMonth, setSelectedMonth] = useState(initialJakartaDate.month);
  const [selectedYear, setSelectedYear] = useState(initialJakartaDate.year);
  const [plantMenuVisible, setPlantMenuVisible] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isChartLandscapeVisible, setIsChartLandscapeVisible] = useState(false);
  const [chartCurrentTime, setChartCurrentTime] = useState(() => new Date());
  const { togglePowerSeries, visiblePowerSeries } = useVisiblePowerSeries();
  //===== (Overview Chart Width) ======
  const overviewChartWidth = useMemo(
    () => getResponsiveChartWidth(windowWidth),
    [windowWidth],
  );
  //===== (Chart Year Range) ======
  const chartYearRange = useMemo(
    () => getYearRange(initialJakartaDate.year),
    [initialJakartaDate.year],
  );
  const {
    chartSelectionKey,
    fetchedData,
    fetchOverviewData,
    focusRefreshKey,
    isRefreshLoading,
    plantDevices,
  } = useOverviewData({
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
  });
  const weatherCardAnim = useRef(new Animated.Value(0)).current;
  const dayPickerScrollRef = useRef(null);
  const monthPickerScrollRef = useRef(null);
  const chartLoadingTimerRef = useRef(null);
  const todayParts = getJakartaDateParts();
  const todayDay = todayParts.day;
  const todayMonth = todayParts.month;
  const todayYear = todayParts.year;
  //===== (Data Source Options) ======
  const dataSourceOptions = useMemo(
    () => [
      { key: "plant", label: t("plantData") },
      ...normalizeDeviceList(plantDevices).map((device) => ({
        key: String(device.dataSourceId),
        label: String(device.dataSourceId),
      })),
    ],
    [plantDevices, t],
  );
  const selectedDataSourceLabel =
    dataSourceOptions.find((item) => item.key === selectedDataSource)?.label ||
    t("plantData");
  //===== (Plant Presentation Data) ======
  const plantData = useMemo(() => {
    const isDeviceOnline = fetchedData?.isDeviceOnline === true;

    return {
      plantName: pickValue(
        fetchedData?.name,
        selectedDevice?.name,
        "No Device Selected",
      ),
      productionToday: pickNumber(
        isDeviceOnline ? fetchedData?.productionToday : 0,
        isDeviceOnline ? fetchedData?.production : 0,
        isDeviceOnline ? selectedDevice?.productionToday : 0,
        isDeviceOnline ? selectedDevice?.production : 0,
      ),
      weather: pickValue(fetchedData?.weather, selectedDevice?.weather, null),
      weatherTemperature: pickFiniteNumber(
        fetchedData?.weatherTemperature,
        selectedDevice?.weatherTemperature,
      ),
      weatherHigh: pickFiniteNumber(
        fetchedData?.weatherHigh,
        selectedDevice?.weatherHigh,
      ),
      weatherLow: pickFiniteNumber(
        fetchedData?.weatherLow,
        selectedDevice?.weatherLow,
      ),
      weatherConditionText: pickValue(
        fetchedData?.weatherConditionText,
        selectedDevice?.weatherConditionText,
        null,
      ),
      weatherConditionType: pickValue(
        fetchedData?.weatherConditionType,
        selectedDevice?.weatherConditionType,
        null,
      ),
      weatherIsDaytime: pickValue(
        fetchedData?.weatherIsDaytime,
        selectedDevice?.weatherIsDaytime,
        null,
      ),
      address: pickValue(fetchedData?.location, selectedDevice?.location, null),
      city: pickValue(fetchedData?.city, selectedDevice?.city, null),
      province: pickValue(
        fetchedData?.province,
        selectedDevice?.province,
        null,
      ),
      longitude: pickValue(
        fetchedData?.longitude,
        selectedDevice?.longitude,
        null,
      ),
      latitude: pickValue(
        fetchedData?.latitude,
        selectedDevice?.latitude,
        null,
      ),
      updatedAt: pickValue(
        fetchedData?.updatedAt,
        selectedDevice?.updatedAt,
        null,
      ),
      production: pickNumber(
        isDeviceOnline ? fetchedData?.production : 0,
        isDeviceOnline ? selectedDevice?.production : 0,
      ),
      pv: pickNumber(isDeviceOnline ? fetchedData?.pv : 0),
      grid: pickNumber(isDeviceOnline ? fetchedData?.grid : 0),
      battery: pickNumber(isDeviceOnline ? fetchedData?.battery : 0),
      upsLoad: pickNumber(isDeviceOnline ? fetchedData?.upsLoad : 0),
      load: pickNumber(isDeviceOnline ? fetchedData?.load : 0),
      energy: isDeviceOnline
        ? (fetchedData?.energy ?? ZERO_ENERGY_VALUES.energy)
        : ZERO_ENERGY_VALUES.energy,
      energyPercent: isDeviceOnline
        ? (fetchedData?.energyPercent ?? ZERO_ENERGY_VALUES.energyPercent)
        : ZERO_ENERGY_VALUES.energyPercent,
      soc: isDeviceOnline ? pickFiniteNumber(fetchedData?.soc) : null,
      selectedDataPercentages: isDeviceOnline
        ? (fetchedData?.selectedDataPercentages ?? {})
        : {},
      status: pickValue(fetchedData?.status, selectedDevice?.status, "--"),
      isDeviceOnline,
      latestDataTimestamp: fetchedData?.latestDataTimestamp ?? null,
      canAddDatalogger: selectedDevice?.canAddDatalogger === true,
      chartSeries: fetchedData?.chartSeries ?? createEmptyChartSeries(),
    };
  }, [fetchedData, selectedDevice]);
  const isCurrentDemoPlant = isDemoPlant({ name: plantData.plantName });
  //===== (Lower Power Flow Data) ======
  const lowerPowerFlowData = useMemo(
    () => buildProductionPowerFlowData(plantData, isCurrentDemoPlant),
    [isCurrentDemoPlant, plantData],
  );
  const productionMeta = `${formatCompactNumber(plantData.productionToday)}kW`;
  const weatherCardAnimatedStyle = {
    opacity: weatherCardAnim,
    transform: [
      {
        translateY: weatherCardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
      {
        scale: weatherCardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  //===== (goPrevMonth) ======
  const goPrevMonth = () => {
    const date = new Date(selectedYear, selectedMonth - 1, 1);

    date.setMonth(date.getMonth() - 1);

    setSelectedMonth(date.getMonth() + 1);
    setSelectedYear(date.getFullYear());

    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  };

  //===== (goNextMonth) ======
  const goNextMonth = () => {
    const date = new Date(selectedYear, selectedMonth - 1, 1);

    date.setMonth(date.getMonth() + 1);

    const today = new Date();
    const currentMonth =
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    setSelectedMonth(date.getMonth() + 1);
    setSelectedYear(date.getFullYear());

    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();

    if (currentMonth) {
      setSelectedDay(Math.min(selectedDay, today.getDate()));
    } else if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  };

  //===== (goPrevYear) ======
  const goPrevYear = () => {
    setSelectedYear((year) => year - 1);
  };

  //===== (goNextYear) ======
  const goNextYear = () => {
    setSelectedYear((year) => year + 1);
  };
  //===== (handleRefreshOverview) ======
  const handleRefreshOverview = async () => {
    setPlantMenuVisible(false);
    await fetchOverviewData({ showLoading: true });
  };

  //===== (handleAddDatalogger) ======
  const handleAddDatalogger = () => {
    setPlantMenuVisible(false);

    if (!plantData.canAddDatalogger) {
      Alert.alert(
        "Access denied",
        "Anda tidak memiliki izin menambah datalogger.",
      );
      return;
    }

    if (!resolvedPlantId) {
      Alert.alert("Peringatan", "Plant belum siap. Silakan coba lagi.");
      return;
    }

    router.push({
      pathname: "/plant/[id]/Add-device",
      params: { id: resolvedPlantId },
    });
  };

  const isFutureDaySelection =
    activeSegment === "day" &&
    new Date(selectedYear, selectedMonth - 1, selectedDay) >
      new Date(todayYear, todayMonth - 1, todayDay);

  const isFutureMonthSelection =
    activeSegment === "month" &&
    (selectedYear > todayYear ||
      (selectedYear === todayYear && selectedMonth > todayMonth));

  const isFutureYearSelection = false;

  const isFutureSelection =
    isFutureDaySelection || isFutureMonthSelection || isFutureYearSelection;
  //===== (Daily Chart Series) ======
  const dailySeries = useMemo(() => {
    return POWER_SERIES_CONFIG.reduce((items, item, index) => {
      const apiSeries = plantData.chartSeries?.[item.key];

      if (isFutureSelection) {
        items[item.key] = buildZeroSeries();
        return items;
      }

      if (activeSegment !== "day") {
        items[item.key] = Array.isArray(apiSeries) ? apiSeries : [];
        return items;
      }

      items[item.key] =
        Array.isArray(apiSeries) && apiSeries.length
          ? apiSeries
          : buildFallbackSeries(
              getChartFallbackValue(item.key, plantData),
              index,
            );

      return items;
    }, {});
  }, [activeSegment, isFutureSelection, plantData]);


  const monthOptions = [
    { label: t("january"), value: 1 },
    { label: t("february"), value: 2 },
    { label: t("march"), value: 3 },
    { label: t("april"), value: 4 },
    { label: t("may"), value: 5 },
    { label: t("june"), value: 6 },
    { label: t("july"), value: 7 },
    { label: t("august"), value: 8 },
    { label: t("september"), value: 9 },
    { label: t("october"), value: 10 },
    { label: t("november"), value: 11 },
    { label: t("december"), value: 12 },
  ];

  const selectedMonthLabel =
    monthOptions.find((month) => month.value === selectedMonth)?.label || "";

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  //===== (clampSelectedDay) ======
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  //===== (scrollDayPicker) ======
  useEffect(() => {
    if (activeSegment !== "day") {
      return;
    }

    const offsetX = Math.max(0, (selectedDay - 1) * POWER_CHART_DAY_CHIP_STEP);
    const frame = requestAnimationFrame(() => {
      dayPickerScrollRef.current?.scrollTo({
        x: offsetX,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeSegment, selectedDay, selectedMonth, selectedYear]);

  //===== (manageChartLoadingState) ======
  useEffect(() => {
    if (chartLoadingTimerRef.current) {
      clearTimeout(chartLoadingTimerRef.current);
    }

    if (!chartSelectionKey) {
      setIsChartLoading(false);
      return undefined;
    }

    setIsChartLoading(true);
    chartLoadingTimerRef.current = setTimeout(() => {
      setIsChartLoading(false);
    }, POWER_CHART_LOADING_DELAY_MS);

    return () => {
      if (chartLoadingTimerRef.current) {
        clearTimeout(chartLoadingTimerRef.current);
      }
    };
  }, [chartSelectionKey]);

  //===== (scrollMonthPicker) ======
  useEffect(() => {
    if (activeSegment !== "month") {
      return;
    }

    const offsetX = Math.max(
      0,
      (selectedMonth - 1) * POWER_CHART_MONTH_CHIP_STEP,
    );
    const frame = requestAnimationFrame(() => {
      monthPickerScrollRef.current?.scrollTo({
        x: offsetX,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeSegment, selectedMonth, selectedYear]);

  //===== (animateOverviewHeader) ======
  useEffect(() => {
    Animated.timing(weatherCardAnim, {
      toValue: 1,
      duration: 560,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [weatherCardAnim]);

  //===== (updateRealtimeClock) ======
  useEffect(() => {
    const clock = setInterval(() => {
      setChartCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  const yearOptions = getYearRange(todayYear);

  //===== (logResponsiveLayout) ======
  useEffect(() => {
    if (!DEBUG_LAYOUT || !__DEV__) {
      return;
    }

    console.log("[layout-debug] overview screen", {
      width: windowWidth,
      chartWidth: overviewChartWidth,
    });
  }, [overviewChartWidth, windowWidth]);

  //===== (pollOverviewData) ======
  useEffect(() => {
    let isMounted = true;

    fetchOverviewData();

    const interval = setInterval(() => {
      if (isMounted) {
        fetchOverviewData();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchOverviewData, focusRefreshKey]);
  const overviewSafeTopPadding = Platform.OS === "ios" ? insets.top : 0;
  const isLandscapeChartRotated = windowHeight > windowWidth;
  const landscapeChartWidth = Math.max(
    320,
    isLandscapeChartRotated
      ? windowHeight -
          overviewSafeTopPadding -
          LANDSCAPE_CHART_LAYOUT.headerHeight -
          LANDSCAPE_CHART_LAYOUT.bottomPadding
      : windowWidth - LANDSCAPE_CHART_LAYOUT.horizontalPadding * 2,
  );
  const landscapeChartHeight = Math.max(
    LANDSCAPE_CHART_LAYOUT.minHeight,
    isLandscapeChartRotated
      ? windowWidth - LANDSCAPE_CHART_LAYOUT.horizontalPadding * 2
      : windowHeight -
          overviewSafeTopPadding -
          LANDSCAPE_CHART_LAYOUT.headerHeight -
          LANDSCAPE_CHART_LAYOUT.bottomPadding,
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={[
        styles.safeArea,
        { paddingTop: overviewSafeTopPadding, backgroundColor: colors.bubble },
      ]}
    >
      <StatusBar
        translucent={false}
        backgroundColor={isLightMode ? colors.bubble : appColors.bubble}
        barStyle={isLightMode ? "dark-content" : "light-content"}
      />

      <Animated.View
        style={[
          styles.stickyTopBar,
          {
            paddingHorizontal: windowWidth < 380 ? 18 : 24,
            minHeight: windowWidth < 380 ? 62 : PLANT_HEADER_BOX.minHeight,
          },
          isLightMode && {
            backgroundColor: colors.bubble,
            borderBottomWidth: 1,
            borderBottomColor: colors.bubbleBorder,
          },
          weatherCardAnimatedStyle,
        ]}
      >
        <View style={styles.leftHeader}>
          <TouchableOpacity
            onPress={() => router.replace("/(home)/plant")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={PLANT_HEADER_BUTTON.backIconSize}
              color={navigationColor}
            />
          </TouchableOpacity>

          <View style={styles.plantTitleBlock}>
            <Text
              style={[styles.plantName, isLightMode && { color: colors.text }]}
              numberOfLines={1}
            >
              {plantData.plantName}
            </Text>

            <View style={styles.plantMetaRow}>
              <Text
                style={[styles.plantProductionMeta, { color: colors.accent }]}
              >
                {productionMeta}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setPlantMenuVisible(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={PLANT_HEADER_BUTTON.menuIconSize}
            color={navigationColor}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        showsVerticalScrollIndicator={false}
      >

        <Modal
          visible={plantMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPlantMenuVisible(false)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setPlantMenuVisible(false)}
          >
            <View
              style={[
                styles.menuPopup,
                { backgroundColor: colors.bubble, borderColor: colors.accent },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={handleRefreshOverview}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={colors.accent}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {t("refresh")}
                </Text>
              </TouchableOpacity>

              {plantData.canAddDatalogger && (
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.75}
                  onPress={handleAddDatalogger}
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={19}
                    color={colors.accent}
                  />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    {t("addDatalogger")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={isRefreshLoading}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View
            style={[
              styles.refreshLoadingOverlay,
              isLightMode && { backgroundColor: "rgba(247,251,255,0.82)" },
            ]}
          >
            <View
              style={[
                styles.refreshLoadingCard,
                isLightMode && {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <ActivityIndicator size="large" color={colors.accent} />
              <Text
                style={[styles.refreshLoadingTitle, { color: colors.text }]}
              >
                {t("loading")}
              </Text>
            </View>
          </View>
        </Modal>

        <View style={styles.content}>
          <PowerFlowSection
            colors={colors}
            dataSourceMenuVisible={dataSourceMenuVisible}
            dataSourceOptions={dataSourceOptions}
            isLightMode={isLightMode}
            lowerPowerFlowData={lowerPowerFlowData}
            plantData={plantData}
            pointerLineColor={pointerLineColor}
            selectedDataSource={selectedDataSource}
            selectedDataSourceLabel={selectedDataSourceLabel}
            setDataSourceMenuVisible={setDataSourceMenuVisible}
            setSelectedDataSource={setSelectedDataSource}
            t={t}
            windowWidth={windowWidth}
          />

          <OverviewChartSection
            activeSegment={activeSegment}
            chartCurrentTime={chartCurrentTime}
            chartYearRange={chartYearRange}
            colors={colors}
            dailySeries={dailySeries}
            dayOptions={dayOptions}
            dayPickerScrollRef={dayPickerScrollRef}
            goNextMonth={goNextMonth}
            goNextYear={goNextYear}
            goPrevMonth={goPrevMonth}
            goPrevYear={goPrevYear}
            isChartLoading={isChartLoading}
            isLightMode={isLightMode}
            monthOptions={monthOptions}
            monthPickerScrollRef={monthPickerScrollRef}
            overviewChartWidth={overviewChartWidth}
            plantData={plantData}
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedMonthLabel={selectedMonthLabel}
            selectedYear={selectedYear}
            setActiveSegment={setActiveSegment}
            setIsChartLandscapeVisible={setIsChartLandscapeVisible}
            setSelectedDay={setSelectedDay}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            t={t}
            todayMonth={todayMonth}
            todayYear={todayYear}
            togglePowerSeries={togglePowerSeries}
            visiblePowerSeries={visiblePowerSeries}
            yearOptions={yearOptions}
          />
        </View>
      </ScrollView>

      <LandscapeChartModal
        activeSegment={activeSegment}
        chartCurrentTime={chartCurrentTime}
        chartYearRange={chartYearRange}
        colors={colors}
        dailySeries={dailySeries}
        isChartLandscapeVisible={isChartLandscapeVisible}
        isChartLoading={isChartLoading}
        isLandscapeChartRotated={isLandscapeChartRotated}
        isLightMode={isLightMode}
        landscapeChartHeight={landscapeChartHeight}
        landscapeChartWidth={landscapeChartWidth}
        navigationColor={navigationColor}
        plantData={plantData}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setIsChartLandscapeVisible={setIsChartLandscapeVisible}
        t={t}
        togglePowerSeries={togglePowerSeries}
        visiblePowerSeries={visiblePowerSeries}
      />
    </SafeAreaView>
  );
}
