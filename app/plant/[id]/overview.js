import PowerFlowDiagram from "@/components/PowerFlowDiagram";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAuth, getToken, isTokenValid } from "@/auth/token";
import { BASE_URL, GOOGLE_MAPS_API_KEY } from "@/config/api";
import { appColors, appFont } from "@/config/theme";
import { AuthContext } from "@/context/AuthContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
import Svg, {
  Circle as SvgCircle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 60;
const CHART_HEIGHT = 250;
const CHART_STORAGE_PREFIX = "batari:overview-chart:";
const DEBUG_CHART = process.env.EXPO_PUBLIC_DEBUG_CHART === "true";
const DEBUG_LAYOUT = process.env.EXPO_PUBLIC_DEBUG_LAYOUT === "true";
const WEATHER_LAYOUT = {
  cardMarginHorizontal: 24,
  cardMarginTop: 10,
  cardMarginBottom: 16,
  cardPaddingHorizontal: 22,
  cardPaddingTop: 24,
  cardPaddingBottom: 24,
  cardRadius: 28,
  topRowMinHeight: 146,
  cityMarginBottom: 8,
  statusWidth: 116,
  statusPaddingTop: 8,
  conditionMarginTop: 6,
  rangeMarginTop: 2,
  daysPaddingRight: 18,
  dayItemWidth: 68,
  dayItemGap: 12,
  dayNumberMarginBottom: 16,
  dayIconMarginBottom: 16,
};
const WEATHER_FONT_SIZE = {
  city: 20,
  temperature: 60,
  temperatureLineHeight: 70,
  condition: 22,
  conditionLineHeight: 28,
  range: 14,
  rangeLineHeight: 20,
  dayNumber: 18,
  dayNumberLineHeight: 24,
  dayTemperature: 22,
  dayTemperatureLineHeight: 28,
};
const WEATHER_ICON_SIZE = {
  current: 46,
  day: 34,
};
const POWER_SERIES_CONFIG = [
  { key: "production", label: "Production", color: "#1FB7FF" },
  { key: "load", label: "Load", color: "#FF4646" },
  { key: "upsLoad", label: "Ups-Load", color: "#FFD54A" },
  { key: "grid", label: "Grid", color: "#FF9300" },
  { key: "battery", label: "Battery", color: "#99E500" },
];

const BUBBLE_POSITION_CONFIG = {
  bubbleLeftPct: 0.02,
};

const POWER_FLOW_OVERLAY_LAYOUT = {
  baselineWidth: 390,
  baselineHeight: 360,
  minScale: 0.86,
  maxScale: 1,
  minHeight: 340,
  maxHeight: 360,
  bubbleMinWidth: 86,
  bubbleMaxWidth: 118,
  bubblePaddingHorizontal: 14,
  bubblePaddingVertical: 10,
  bubbleBorderRadius: 18,
  bubbleLabelFontSize: 14,
  bubbleValueFontSize: 16,
};

const BATTERY_BUBBLE_CONFIG = {
  widthExtra: 10, // tambah lebar Battery dari ukuran Grid
  heightExtra: 0,
  titleFontSize: 14,
  valueFontSize: 16,
  titleFontWeight: "700",
  valueFontWeight: "800",
};

const MANUAL_BUBBLE_OFFSET = {
  grid: {
    x: 0,
    y: 0,
  },
  pv: {
    x: 0,
    y: 0,
  },
  battery: {
    x: 0,
    y: 0,
  },
  load: {
    x: 0,
    y: 0,
  },
};

// Atur garis Grid ke tower dari sini.
const GRID_POINTER_CONFIG = {
  lineOffsetX: 0,
  lineOffsetY: 0,
  lineStartOffsetX: 0,
  lineStartOffsetY: -5,
  startLeadLength: 50,
  lineBendOffsetX: 0,
  lineBendOffsetY: 0,
  lineEndOffsetX: -87,
  lineEndOffsetY: 0,
  verticalLineLength: 100,
  horizontalLineLength: 148,
  lineEndAnchorPctX: 0.25,
  lineEndAnchorPctY: 0.85,
  lineThickness: 1,
  lineColor: "#FFFFFF",
  dotColor: "#FF1F1F",
  dotGlowColor: "rgba(255,31,31,0.45)",
  dotSize: 7,
  animationDuration: 3000,
  animationLoopInterval: 2500,
  animationEffect: "glow",
  animationEasing: "linear",
  dotFrameSmoothing: true,
  bendTransitionSmoothing: true,
  dotOpacity: 1,
  enableGlow: true,
  enablePulse: true,
};

// Atur garis Battery ke image dari sini.
const BATTERY_POINTER_CONFIG = {
  lineOffsetX: 0,
  lineOffsetY: 0,
  lineStartOffsetX: 0,
  lineStartOffsetY: 0,
  lineBendOffsetX: 0,
  lineBendOffsetY: 0,
  lineEndOffsetX: 0,
  lineEndOffsetY: 0,
  horizontalLineLength: 90,
  verticalLineLength: -90,
  lineEndAnchorPctX: 0.5,
  lineEndAnchorPctY: 0.62,
  lineThickness: GRID_POINTER_CONFIG.lineThickness,
  lineColor: GRID_POINTER_CONFIG.lineColor,
  dotColor: GRID_POINTER_CONFIG.dotColor,
  dotGlowColor: GRID_POINTER_CONFIG.dotGlowColor,
  dotSize: GRID_POINTER_CONFIG.dotSize,
  animationDuration: GRID_POINTER_CONFIG.animationDuration,
  animationLoopInterval: GRID_POINTER_CONFIG.animationLoopInterval,
  animationEffect: GRID_POINTER_CONFIG.animationEffect,
  animationEasing: GRID_POINTER_CONFIG.animationEasing,
  dotFrameSmoothing: GRID_POINTER_CONFIG.dotFrameSmoothing,
  bendTransitionSmoothing: GRID_POINTER_CONFIG.bendTransitionSmoothing,
  dotOpacity: GRID_POINTER_CONFIG.dotOpacity,
  enableGlow: GRID_POINTER_CONFIG.enableGlow,
  enablePulse: GRID_POINTER_CONFIG.enablePulse,
};

// Atur garis PV ke solar panel dari sini.
const PV_POINTER_CONFIG = {
  lineOffsetX: 0,
  lineOffsetY: 0,
  lineStartOffsetX: 0,
  lineStartOffsetY: 0,
  lineBendOffsetX: 0,
  lineBendOffsetY: 0,
  lineEndOffsetX: 0,
  lineEndOffsetY: 0,
  horizontalLineLength: 70,
  verticalLineLength: 76,
  lineEndAnchorPctX: 0.5,
  lineEndAnchorPctY: 0.5,
  lineThickness: GRID_POINTER_CONFIG.lineThickness,
  lineColor: GRID_POINTER_CONFIG.lineColor,
  dotColor: GRID_POINTER_CONFIG.dotColor,
  dotGlowColor: GRID_POINTER_CONFIG.dotGlowColor,
  dotSize: GRID_POINTER_CONFIG.dotSize,
  animationDuration: GRID_POINTER_CONFIG.animationDuration,
  animationLoopInterval: GRID_POINTER_CONFIG.animationLoopInterval,
  animationEffect: GRID_POINTER_CONFIG.animationEffect,
  animationEasing: GRID_POINTER_CONFIG.animationEasing,
  dotFrameSmoothing: GRID_POINTER_CONFIG.dotFrameSmoothing,
  bendTransitionSmoothing: GRID_POINTER_CONFIG.bendTransitionSmoothing,
  dotOpacity: GRID_POINTER_CONFIG.dotOpacity,
  enableGlow: GRID_POINTER_CONFIG.enableGlow,
  enablePulse: GRID_POINTER_CONFIG.enablePulse,
};

// Atur garis Load ke image dari sini.
const LOAD_POINTER_CONFIG = {
  lineOffsetX: 0,
  lineOffsetY: 0,
  lineStartOffsetX: 0,
  lineStartOffsetY: 0,
  lineBendOffsetX: 0,
  lineBendOffsetY: 0,
  lineEndOffsetX: 0,
  lineEndOffsetY: 0,
  horizontalLineLength: 25, // space ke kiri dulu
  verticalLineLength: 90, // lalu naik ke atas
  lineEndAnchorPctX: 0.5,
  lineEndAnchorPctY: 0.5,
  lineThickness: GRID_POINTER_CONFIG.lineThickness,
  lineColor: GRID_POINTER_CONFIG.lineColor,
  dotColor: GRID_POINTER_CONFIG.dotColor,
  dotGlowColor: GRID_POINTER_CONFIG.dotGlowColor,
  dotSize: GRID_POINTER_CONFIG.dotSize,
  animationDuration: GRID_POINTER_CONFIG.animationDuration,
  animationLoopInterval: GRID_POINTER_CONFIG.animationLoopInterval,
  animationEffect: GRID_POINTER_CONFIG.animationEffect,
  animationEasing: GRID_POINTER_CONFIG.animationEasing,
  dotFrameSmoothing: GRID_POINTER_CONFIG.dotFrameSmoothing,
  bendTransitionSmoothing: GRID_POINTER_CONFIG.bendTransitionSmoothing,
  dotOpacity: GRID_POINTER_CONFIG.dotOpacity,
  enableGlow: GRID_POINTER_CONFIG.enableGlow,
  enablePulse: GRID_POINTER_CONFIG.enablePulse,
};

const BUBBLE_BASE_POSITION = {
  grid: {
    topPct: 0.02,
    leftPct: BUBBLE_POSITION_CONFIG.bubbleLeftPct,
  },
  pv: {
    topPct: 0.02,
    rightPct: 0.03,
  },
  battery: {
    topPct: 0.76,
    leftPct: BUBBLE_POSITION_CONFIG.bubbleLeftPct,
  },
  load: {
    topPct: 0.76,
    rightPct: 0.03,
  },
};

function getResponsiveBubblePositionStyle(key, boxWidth, boxHeight, scale) {
  const base = BUBBLE_BASE_POSITION[key];
  const offset = MANUAL_BUBBLE_OFFSET[key];

  const positionStyle = {};

  if (base.topPct !== undefined) {
    positionStyle.top = boxHeight * base.topPct;
  }

  if (base.leftPct !== undefined) {
    positionStyle.left = boxWidth * base.leftPct;
  }

  if (base.rightPct !== undefined) {
    positionStyle.right = boxWidth * base.rightPct;
  }

  return {
    ...positionStyle,
    transform: [
      { translateX: offset.x * scale },
      { translateY: offset.y * scale },
    ],
  };
}

function clampResponsiveValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPowerFlowOverlayHeight(width) {
  const widthScale = width / POWER_FLOW_OVERLAY_LAYOUT.baselineWidth;
  const scaledHeight = POWER_FLOW_OVERLAY_LAYOUT.baselineHeight * widthScale;

  return Math.round(
    clampResponsiveValue(
      scaledHeight,
      POWER_FLOW_OVERLAY_LAYOUT.minHeight,
      POWER_FLOW_OVERLAY_LAYOUT.maxHeight,
    ),
  );
}

function getPowerFlowOverlayScale(width, height) {
  const scaleX = width / POWER_FLOW_OVERLAY_LAYOUT.baselineWidth;
  const scaleY = height / POWER_FLOW_OVERLAY_LAYOUT.baselineHeight;

  return clampResponsiveValue(
    Math.min(scaleX, scaleY),
    POWER_FLOW_OVERLAY_LAYOUT.minScale,
    POWER_FLOW_OVERLAY_LAYOUT.maxScale,
  );
}

function getScaledLineThickness(config, scale) {
  return Math.max(1, config.lineThickness * scale);
}

function getGridPointerCoordinates(containerLayout, gridBubbleLayout, scale) {
  if (
    !containerLayout?.width ||
    !containerLayout?.height ||
    !gridBubbleLayout
  ) {
    return null;
  }

  const config = GRID_POINTER_CONFIG;
  const bubbleOffset = MANUAL_BUBBLE_OFFSET.grid || { x: 0, y: 0 };
  const targetEndX = containerLayout.width * config.lineEndAnchorPctX;
  const targetEndY = containerLayout.height * config.lineEndAnchorPctY;
  const startX =
    gridBubbleLayout.x +
    gridBubbleLayout.width +
    bubbleOffset.x * scale +
    (config.lineOffsetX + config.lineStartOffsetX) * scale;
  const startY =
    gridBubbleLayout.y +
    gridBubbleLayout.height / 2 +
    bubbleOffset.y * scale +
    (config.lineOffsetY + config.lineStartOffsetY) * scale;
  const leadX = startX + (config.startLeadLength || 0) * scale;
  const leadY = startY;
  const bendX = leadX + (config.lineBendOffsetX || 0) * scale;
  const verticalLength =
    config.verticalLineLength == null
      ? targetEndY - startY
      : config.verticalLineLength * scale;
  const bendY = leadY + verticalLength + (config.lineBendOffsetY || 0) * scale;
  const endX =
    config.horizontalLineLength == null
      ? targetEndX + (config.lineOffsetX + config.lineEndOffsetX) * scale
      : startX +
        config.horizontalLineLength * scale +
        config.lineEndOffsetX * scale;
  const endY = bendY + (config.lineEndOffsetY || 0) * scale;
  const firstSegmentLength = Math.hypot(leadX - startX, leadY - startY);
  const secondSegmentLength = Math.hypot(bendX - leadX, bendY - leadY);
  const thirdSegmentLength = Math.hypot(endX - bendX, endY - bendY);
  const totalLength =
    firstSegmentLength + secondSegmentLength + thirdSegmentLength || 1;
  const leadProgress = Math.min(
    0.96,
    Math.max(0.02, firstSegmentLength / totalLength),
  );
  const bendProgress = Math.min(
    0.98,
    Math.max(
      leadProgress + 0.02,
      (firstSegmentLength + secondSegmentLength) / totalLength,
    ),
  );

  return {
    startX,
    startY,
    leadX,
    leadY,
    bendX,
    bendY,
    endX,
    endY,
    path: `M ${startX} ${startY} L ${leadX} ${leadY} L ${bendX} ${bendY} L ${endX} ${endY}`,
    leadProgress,
    bendProgress,
  };
}

function getBatteryPointerCoordinates(
  containerLayout,
  batteryBubbleLayout,
  scale,
) {
  if (
    !containerLayout?.width ||
    !containerLayout?.height ||
    !batteryBubbleLayout
  ) {
    return null;
  }

  const config = BATTERY_POINTER_CONFIG;
  const bubbleOffset = MANUAL_BUBBLE_OFFSET.battery || { x: 0, y: 0 };
  const targetEndY = containerLayout.height * config.lineEndAnchorPctY;
  const startX =
    batteryBubbleLayout.x +
    batteryBubbleLayout.width +
    bubbleOffset.x * scale +
    (config.lineOffsetX + config.lineStartOffsetX) * scale;
  const startY =
    batteryBubbleLayout.y +
    batteryBubbleLayout.height / 2 +
    bubbleOffset.y * scale +
    (config.lineOffsetY + config.lineStartOffsetY) * scale;
  const horizontalLength =
    config.horizontalLineLength == null
      ? containerLayout.width * config.lineEndAnchorPctX - startX
      : config.horizontalLineLength * scale;
  const bendX =
    startX + horizontalLength + (config.lineBendOffsetX || 0) * scale;
  const bendY = startY + (config.lineBendOffsetY || 0) * scale;
  const endX = bendX + (config.lineEndOffsetX || 0) * scale;
  const endY =
    config.verticalLineLength == null
      ? targetEndY + (config.lineOffsetY + config.lineEndOffsetY) * scale
      : bendY +
        config.verticalLineLength * scale +
        (config.lineEndOffsetY || 0) * scale;
  const firstSegmentLength = Math.hypot(bendX - startX, bendY - startY);
  const secondSegmentLength = Math.hypot(endX - bendX, endY - bendY);
  const totalLength = firstSegmentLength + secondSegmentLength || 1;
  const bendProgress = Math.min(
    0.98,
    Math.max(0.02, firstSegmentLength / totalLength),
  );

  return {
    startX,
    startY,
    bendX,
    bendY,
    endX,
    endY,
    path: `M ${startX} ${startY} L ${bendX} ${bendY} L ${endX} ${endY}`,
    bendProgress,
  };
}

function getPvPointerCoordinates(containerLayout, pvBubbleLayout, scale) {
  if (!containerLayout?.width || !containerLayout?.height || !pvBubbleLayout) {
    return null;
  }

  const config = PV_POINTER_CONFIG;
  const bubbleOffset = MANUAL_BUBBLE_OFFSET.pv || { x: 0, y: 0 };
  const targetEndX = containerLayout.width * config.lineEndAnchorPctX;
  const targetEndY = containerLayout.height * config.lineEndAnchorPctY;
  const startX =
    pvBubbleLayout.x +
    bubbleOffset.x * scale +
    (config.lineOffsetX + config.lineStartOffsetX) * scale;
  const startY =
    pvBubbleLayout.y +
    pvBubbleLayout.height / 2 +
    bubbleOffset.y * scale +
    (config.lineOffsetY + config.lineStartOffsetY) * scale;
  const horizontalLength =
    config.horizontalLineLength == null
      ? startX - targetEndX
      : config.horizontalLineLength * scale;
  const bendX =
    startX - horizontalLength + (config.lineBendOffsetX || 0) * scale;
  const bendY = startY + (config.lineBendOffsetY || 0) * scale;
  const endX = bendX + (config.lineEndOffsetX || 0) * scale;
  const endY =
    config.verticalLineLength == null
      ? targetEndY + (config.lineOffsetY + config.lineEndOffsetY) * scale
      : bendY +
        config.verticalLineLength * scale +
        (config.lineEndOffsetY || 0) * scale;
  const firstSegmentLength = Math.hypot(bendX - startX, bendY - startY);
  const secondSegmentLength = Math.hypot(endX - bendX, endY - bendY);
  const totalLength = firstSegmentLength + secondSegmentLength || 1;
  const bendProgress = Math.min(
    0.98,
    Math.max(0.02, firstSegmentLength / totalLength),
  );

  return {
    startX,
    startY,
    bendX,
    bendY,
    endX,
    endY,
    path: `M ${startX} ${startY} L ${bendX} ${bendY} L ${endX} ${endY}`,
    bendProgress,
  };
}

function getLoadPointerCoordinates(containerLayout, loadBubbleLayout, scale) {
  if (
    !containerLayout?.width ||
    !containerLayout?.height ||
    !loadBubbleLayout
  ) {
    return null;
  }

  const config = LOAD_POINTER_CONFIG;
  const bubbleOffset = MANUAL_BUBBLE_OFFSET.load || { x: 0, y: 0 };
  const targetEndY = containerLayout.height * config.lineEndAnchorPctY;

  const startX =
    loadBubbleLayout.x +
    bubbleOffset.x * scale +
    (config.lineOffsetX + config.lineStartOffsetX) * scale;

  const startY =
    loadBubbleLayout.y +
    loadBubbleLayout.height / 2 +
    bubbleOffset.y * scale +
    (config.lineOffsetY + config.lineStartOffsetY) * scale;

  // Garis pertama: dari kiri tengah bubble Load, maju ke kiri dulu
  const horizontalLength =
    config.horizontalLineLength == null
      ? 40 * scale
      : config.horizontalLineLength * scale;

  const bendX =
    startX - horizontalLength + (config.lineBendOffsetX || 0) * scale;

  const bendY = startY + (config.lineBendOffsetY || 0) * scale;

  // Garis kedua: setelah ada space ke kiri, baru naik ke atas
  const verticalLength =
    config.verticalLineLength == null
      ? bendY - targetEndY
      : config.verticalLineLength * scale;

  const endX = bendX + (config.lineEndOffsetX || 0) * scale;

  const endY = bendY - verticalLength + (config.lineEndOffsetY || 0) * scale;

  const firstSegmentLength = Math.hypot(bendX - startX, bendY - startY);
  const secondSegmentLength = Math.hypot(endX - bendX, endY - bendY);
  const totalLength = firstSegmentLength + secondSegmentLength || 1;

  const bendProgress = Math.min(
    0.98,
    Math.max(0.02, firstSegmentLength / totalLength),
  );

  return {
    startX,
    startY,
    bendX,
    bendY,
    endX,
    endY,
    path: `M ${startX} ${startY} L ${bendX} ${bendY} L ${endX} ${endY}`,
    bendProgress,
  };
}
function getPointerAnimationEasing(config) {
  if (config.animationEasing === "linear") {
    return Easing.linear;
  }

  return Easing.linear;
}
const POWER_LATEST_ENDPOINT_CONFIG = [
  {
    key: "pv",
    label: "PV",
    category: "pv",
    types: ["power", "chargePower"],
  },
  {
    key: "grid",
    label: "Grid",
    category: "grid",
    types: ["power"],
  },
  {
    key: "battery",
    label: "Battery",
    category: "battery",
    types: ["power"],
  },
  {
    key: "load",
    label: "Load",
    category: "load",
    types: ["power", "vaPower"],
  },
];
const POWER_CATEGORY_ALIASES = {
  pv: ["pv", "solar"],
  grid: ["grid"],
  battery: ["battery", "baterai"],
  load: ["load", "out"],
};
const POWER_TYPE_ALIASES = {
  power: ["power"],
  chargePower: ["chargePower", "charge_power", "chargepower"],
  vaPower: ["vaPower", "va_power", "vapower"],
};
// Atur layout grafik power dan switch button dari sini.
const POWER_CHART_LAYOUT = {
  paddingTop: 52,
  paddingRight: 58,
  paddingBottom: 42,
  paddingLeft: 46,
  axisTitleFontSize: 18,
  axisLabelFontSize: 13,
  timeLabelFontSize: 12,
  currentTimeFontSize: 13,
  lineStrokeWidth: 3,
  pointRadius: 3.5,
  switchWidth: 44,
  switchHeight: 22,
  switchPadding: 3,
  switchGap: 9,
  switchMarginTop: 10,
};
const POWER_CHART_Y_RANGE = {
  minKw: -6,
  maxKw: 8,
  leftTicks: [8, 6, 4, 2, 0, -2, -4, -6],
};
const POWER_CHART_TIME_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
const POWER_CHART_HISTORY_MAX_POINTS = 720;
const POWER_CHART_SAMPLE_MIN_GAP_MS = 60 * 1000;
const POWER_CHART_RESPONSIVE_WIDTH = {
  min: 240,
  max: 520,
  horizontalGap: 60,
  compactInnerWidth: 260,
  mediumInnerWidth: 340,
};
// Atur layout section dashboard energi dari sini.
const DASHBOARD_LAYOUT = {
  sectionMarginTop: 6,
  sectionMarginBottom: 18,
  cardGap: 10,
  cardRadius: 14,
  metricCardHeight: 86,
  metricCardPaddingHorizontal: 12,
  metricIconSize: 28,
  sourceCardPadding: 16,
  sourceRowMarginTop: 28,
  sourceIconSize: 34,
  sourceBarHeight: 7,
  sourceBarMarginTop: 26,
  monthlyMarginTop: 24,
  monthlyCardWidth: 154,
  monthlyCardHeight: 206,
  monthlyCardGap: 18,
  monthlyIconSize: 52,
  impactCardMarginTop: 22,
  impactCardPaddingVertical: 26,
  impactIconSize: 34,
};
// Atur ukuran font section dashboard energi dari sini.
const DASHBOARD_FONT_SIZE = {
  metricLabel: 15,
  metricValue: 20,
  sectionTitle: 24,
  sectionMeta: 15,
  sourcePercent: 17,
  monthTitle: 22,
  monthValue: 21,
  impactValue: 24,
  impactLabel: 16,
};
// Atur ukuran kotak Plant Testing dari sini.
const PLANT_HEADER_BOX = {
  minHeight: 78,
  marginHorizontal: 0,
  marginTop: 0,
  marginBottom: 12,
  paddingHorizontal: 24,
  paddingVertical: 0,
  borderRadius: 0,
};
// Atur ukuran tulisan Plant Testing dan 0kW dari sini.
const PLANT_HEADER_TEXT = {
  nameFontSize: 16,
  nameLineHeight: 22,
  productionFontSize: 20,
  productionLineHeight: 24,
  productionMarginTop: 2,
};
// Atur ukuran dan posisi tombol back dari sini.
const PLANT_HEADER_BUTTON = {
  backButtonSize: 40,
  backIconSize: 40,
  backOffsetX: -20,
  backOffsetY: 0,
  backMarginRight: 14,
  menuButtonSize: 42,
  menuIconSize: 24,
};
const weatherForecastDays = [
  { day: "1", icon: "rainy-outline", temp: 26 },
  { day: "2", icon: "rainy-outline", temp: 26 },
  { day: "3", icon: "cloud-outline", temp: 26 },
  { day: "4", icon: "rainy-outline", temp: 29 },
];
const dashboardMetricCards = [
  {
    key: "consumption",
    label: "production",
    value: "0kWh",
    icon: "flash-outline",
    color: appColors.accent,
  },
  {
    key: "charging",
    label: "Total\nPengisian",
    value: "0kWh",
    icon: "battery-charging-outline",
    color: appColors.accent,
  },
];
const energySourceItems = [
  {
    key: "battery",
    icon: "battery-charging-outline",
    color: "#8CCB3F",
    value: "0%",
    barFlex: 1,
  },
  {
    key: "grid",
    icon: "flash-outline",
    color: appColors.accent,
    value: "0%",
    barFlex: 1,
  },
  {
    key: "solar",
    icon: "broadcast-tower",
    iconLibrary: "FontAwesome5",
    color: "#E0262E",
    value: "0%",
    barFlex: 1,
  },
];
const monthlySavingItems = [
  { key: "jan", month: "January", value: "Rp0" },
  { key: "feb", month: "February", value: "Rp0" },
  { key: "mar", month: "March", value: "Rp0" },
  { key: "apr", month: "April", value: "Rp0" },
];
const environmentImpactItems = [
  {
    key: "co2",
    icon: "cloud-outline",
    value: "0.00",
    label: "CO2 reduced",
  },
  {
    key: "coal",
    icon: "cloud-done-outline",
    value: "0.00",
    label: "Standard coal\nsaved",
  },
  {
    key: "deforestation",
    icon: "leaf-outline",
    value: "0.00",
    label: "Deforestation\nreduced",
  },
];

function getWeatherLocation(address) {
  if (!address || address === "-") {
    return "Jakarta";
  }

  return String(address).split(",")[0]?.trim() || "Jakarta";
}

function getTemperatureNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 26;
}

function formatCoordinate(value) {
  const text = String(value ?? "-").trim();
  return text && text !== "-" ? `${text}\u00B0` : "-\u00B0";
}

function pickValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function pickNumber(...values) {
  const value = pickValue(...values);
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function pickFiniteNumber(...values) {
  const value = pickValue(...values);
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function normalizeApiText(value) {
  return String(value ?? "")
    .trim()
    .replace(/[-_\s]+/g, "")
    .toLowerCase();
}

function getPowerCategoryAliases(category) {
  return POWER_CATEGORY_ALIASES[category] ?? [category];
}

function getPowerTypeAliases(type) {
  return POWER_TYPE_ALIASES[type] ?? [type];
}

function matchesApiText(value, aliases) {
  const normalizedValue = normalizeApiText(value);

  return aliases.some((alias) => normalizeApiText(alias) === normalizedValue);
}

function pickObjectValueByAliases(source, aliases) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const normalizedAliases = aliases.map(normalizeApiText);

  return Object.entries(source).find(([key]) =>
    normalizedAliases.includes(normalizeApiText(key)),
  )?.[1];
}

function normalizeRouteParam(value) {
  if (Array.isArray(value)) {
    return normalizeRouteParam(value[0]);
  }

  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (
    !normalizedValue ||
    normalizedValue === "[id]" ||
    normalizedValue === "undefined" ||
    normalizedValue === "null"
  ) {
    return null;
  }

  return normalizedValue;
}

function resolvePlantId(routeId, fallbackId) {
  return normalizeRouteParam(routeId) ?? normalizeRouteParam(fallbackId);
}

function formatCompactNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return String(number);
}

function formatKwValue(value) {
  return `${formatCompactNumber(value)} kW`;
}

function formatRealtimeClock(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function formatChartHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getResponsiveChartWidth(windowWidth) {
  return Math.min(
    POWER_CHART_RESPONSIVE_WIDTH.max,
    Math.max(
      POWER_CHART_RESPONSIVE_WIDTH.min,
      windowWidth - POWER_CHART_RESPONSIVE_WIDTH.horizontalGap,
    ),
  );
}

function getResponsiveChartTimeTicks(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return [0, 6, 12, 18, 24];
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return [0, 4, 8, 12, 16, 20, 24];
  }

  return POWER_CHART_TIME_TICKS;
}

function getResponsiveChartTimeFontSize(innerWidth) {
  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.compactInnerWidth) {
    return 10;
  }

  if (innerWidth < POWER_CHART_RESPONSIVE_WIDTH.mediumInnerWidth) {
    return 11;
  }

  return POWER_CHART_LAYOUT.timeLabelFontSize;
}

function clampChartValue(value, minY, maxY) {
  return Math.max(minY, Math.min(maxY, Number(value || 0)));
}

function isFiniteCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number);
}

function buildGoogleGeocodeEndpoint(locationText) {
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    locationText,
  )}&region=id&key=${GOOGLE_MAPS_API_KEY}`;
}

function buildGoogleWeatherEndpoint(latitude, longitude) {
  return `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}&unitsSystem=METRIC&languageCode=id`;
}

function getWeatherConditionText(weather) {
  return pickValue(
    weather?.weatherCondition?.description?.text,
    weather?.weatherCondition?.type,
    weather?.weatherCondition?.description,
    null,
  );
}

function getWeatherConditionType(weather) {
  return pickValue(weather?.weatherCondition?.type, null);
}

function getWeatherIconName(conditionType, isDaytime = true) {
  const type = String(conditionType || "").toUpperCase();

  if (type.includes("THUNDER")) {
    return "thunderstorm-outline";
  }

  if (type.includes("RAIN") || type.includes("DRIZZLE")) {
    return "rainy-outline";
  }

  if (type.includes("SNOW")) {
    return "snow-outline";
  }

  if (type.includes("CLOUD")) {
    return isDaytime ? "cloudy-outline" : "cloudy-night-outline";
  }

  if (type.includes("FOG") || type.includes("MIST") || type.includes("HAZE")) {
    return "cloud-outline";
  }

  return isDaytime ? "sunny-outline" : "moon-outline";
}

async function fetchGoogleWeatherForPlant({
  locationText,
  latitude,
  longitude,
}) {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  let resolvedLatitude = isFiniteCoordinate(latitude) ? Number(latitude) : null;
  let resolvedLongitude = isFiniteCoordinate(longitude)
    ? Number(longitude)
    : null;

  if (locationText) {
    const geocodeResponse = await fetch(
      buildGoogleGeocodeEndpoint(locationText),
    );
    const geocodeJson = await geocodeResponse.json().catch(() => null);
    const firstResult = geocodeJson?.results?.[0]?.geometry?.location;

    if (
      geocodeResponse.ok &&
      firstResult &&
      isFiniteCoordinate(firstResult.lat) &&
      isFiniteCoordinate(firstResult.lng)
    ) {
      resolvedLatitude = Number(firstResult.lat);
      resolvedLongitude = Number(firstResult.lng);
    }
  }

  if (
    !isFiniteCoordinate(resolvedLatitude) ||
    !isFiniteCoordinate(resolvedLongitude)
  ) {
    return null;
  }

  const weatherResponse = await fetch(
    buildGoogleWeatherEndpoint(resolvedLatitude, resolvedLongitude),
  );
  const weatherJson = await weatherResponse.json().catch(() => null);

  if (!weatherResponse.ok || !weatherJson) {
    return null;
  }

  const currentTemperature = pickNumber(
    weatherJson?.temperature?.degrees,
    weatherJson?.currentTemperature?.degrees,
  );
  const maxTemperature = pickNumber(
    weatherJson?.currentConditionsHistory?.maxTemperature?.degrees,
    currentTemperature + 2,
  );
  const minTemperature = pickNumber(
    weatherJson?.currentConditionsHistory?.minTemperature?.degrees,
    currentTemperature - 2,
  );

  return {
    latitude: resolvedLatitude,
    longitude: resolvedLongitude,
    temperature: currentTemperature,
    high: maxTemperature,
    low: minTemperature,
    conditionText: getWeatherConditionText(weatherJson),
    conditionType: getWeatherConditionType(weatherJson),
    isDaytime: Boolean(weatherJson?.isDaytime),
  };
}

function getApiNumber(record) {
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

function getApiRecord(data, category, type) {
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

function getApiLatestValue(data, category, type) {
  return getApiNumber(getApiRecord(data, category, type));
}

function getRecordTimestampText(record) {
  return pickValue(
    record?.created_at,
    record?.createdAt,
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

function parseChartTimestamp(rawTimestamp) {
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
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0")),
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

function getRecordTimestampValue(record) {
  const parsed = parseChartTimestamp(getRecordTimestampText(record));

  return parsed ? parsed.getTime() : null;
}

function normalizeSeriesRows(record) {
  if (!record) {
    return [];
  }

  const rows = Array.isArray(record) ? record : [record];

  return rows.filter((row) => getApiNumber(row) !== null);
}

function getApiSeries(data, category, type) {
  return normalizeSeriesRows(getApiRecord(data, category, type));
}

function normalizePowerValues(data) {
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

function getDirectApiTypeValue(data, type) {
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

function normalizeLatestPowerValues(data, sourceCategory) {
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

function normalizeChartSeries(data) {
  const directSeries = {
    production: normalizeSeriesRows(data?.production),
    load: normalizeSeriesRows(data?.load),
    upsLoad: normalizeSeriesRows(data?.upsLoad),
    grid: normalizeSeriesRows(data?.grid),
    battery: normalizeSeriesRows(data?.battery),
  };
  const hasDirectSeries = hasChartSeriesRows(directSeries);
  const production = getApiSeries(data, "pv", "chargePower");
  const pvPower = getApiSeries(data, "pv", "power");
  const outPower = getApiSeries(data, "load", "power");
  const outVaPower = getApiSeries(data, "load", "vaPower");

  if (hasDirectSeries) {
    return directSeries;
  }

  return {
    production: production.length ? production : pvPower,
    load: outPower.length ? outPower : outVaPower,
    upsLoad: outVaPower.length ? outVaPower : outPower,
    grid: getApiSeries(data, "grid", "power"),
    battery: getApiSeries(data, "battery", "power"),
  };
}

function mergeSeriesRows(...seriesParts) {
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

function mergeChartSeries(...seriesGroups) {
  return POWER_SERIES_CONFIG.reduce((merged, item) => {
    merged[item.key] = mergeSeriesRows(
      ...seriesGroups.map((group) => group?.[item.key]),
    );

    return merged;
  }, {});
}

function mergePowerValues(...powerSources) {
  return powerSources.reduce((merged, item) => {
    Object.entries(item || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        merged[key] = value;
      }
    });

    return merged;
  }, {});
}

function createEmptyChartSeries() {
  return POWER_SERIES_CONFIG.reduce((items, item) => {
    items[item.key] = [];
    return items;
  }, {});
}

function hasChartSeriesRows(series) {
  return POWER_SERIES_CONFIG.some((item) => series?.[item.key]?.length);
}

function limitChartSeriesRows(series) {
  return POWER_SERIES_CONFIG.reduce((limited, item) => {
    const rows = series?.[item.key] ?? [];
    limited[item.key] = rows.slice(-POWER_CHART_HISTORY_MAX_POINTS);
    return limited;
  }, {});
}

function mergeAndLimitChartSeries(...seriesGroups) {
  return limitChartSeriesRows(mergeChartSeries(...seriesGroups));
}

function getStoredChartSeriesKey(chartSelectionKey) {
  return `${CHART_STORAGE_PREFIX}${chartSelectionKey}`;
}

async function loadStoredChartSeries(chartSelectionKey) {
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

async function saveStoredChartSeries(chartSelectionKey, chartSeries) {
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

function getChartSeriesCounts(series) {
  return POWER_SERIES_CONFIG.reduce((counts, item) => {
    counts[item.key] = Array.isArray(series?.[item.key])
      ? series[item.key].length
      : 0;
    return counts;
  }, {});
}

function getChartRequestDate(
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

function debugChartLog(message, payload = {}) {
  if (!DEBUG_CHART || !__DEV__) {
    return;
  }

  console.log(`[chart-debug] ${message}`, payload);
}

async function removeStoredChartSeries(chartSelectionKey) {
  if (!chartSelectionKey) {
    return;
  }

  try {
    await AsyncStorage.removeItem(getStoredChartSeriesKey(chartSelectionKey));
  } catch (error) {
    console.warn("Gagal menghapus cache grafik:", error);
  }
}

function getLatestChartTimestampValue(series) {
  const timestamps = POWER_SERIES_CONFIG.map((item) => {
    const rows = series?.[item.key] ?? [];
    return rows.length ? getRecordTimestampValue(rows[rows.length - 1]) : null;
  }).filter((value) => value !== null);

  return timestamps.length ? Math.max(...timestamps) : null;
}

function shouldAppendRealtimeChartSample(currentSeries, sampleSeries) {
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

function createRealtimeChartSampleSeries(powerValues, timestamp = new Date()) {
  const createdAt = timestamp.toISOString();
  const series = createEmptyChartSeries();

  const addSample = (key, category, type, value) => {
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
  addSample("load", "out", "power", powerValues.load);
  addSample("upsLoad", "out", "vaPower", powerValues.upsLoad);
  addSample("grid", "grid", "power", powerValues.grid);
  addSample("battery", "baterai", "power", powerValues.battery);

  return series;
}

function buildChartSelectionKey(
  segment,
  plantId,
  selectedDay,
  selectedMonth,
  selectedYear,
) {
  return [
    segment,
    plantId,
    String(selectedYear),
    String(selectedMonth).padStart(2, "0"),
    String(selectedDay).padStart(2, "0"),
  ].join(":");
}

function isSelectedCurrentDay(
  segment,
  selectedDay,
  selectedMonth,
  selectedYear,
) {
  const now = new Date();

  return (
    segment === "day" &&
    selectedDay === now.getDate() &&
    selectedMonth === now.getMonth() + 1 &&
    selectedYear === now.getFullYear()
  );
}

function buildFallbackSeries(value, index) {
  const number = Number(value || 0);
  const shape = [0.92, 0.78, 1.04, 1.12, 1.02, 0.82];

  return shape.map((ratio) =>
    Number((number * (ratio + index * 0.015)).toFixed(2)),
  );
}

function buildZeroSeries(length = 6) {
  return Array.from({ length }, () => 0);
}

function buildLatestPowerRequests(plantId, config) {
  return getPowerCategoryAliases(config.category).map((category) => ({
    sourceCategory: config.category,
    endpoint: `${BASE_URL}/api/data/?plantId=${plantId}&category=${category}&type=${config.types.join(",")}&latestBy=inserted`,
  }));
}

function buildQueryString(params) {
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

function buildChartEndpoint(
  segment,
  plantId,
  selectedDay,
  selectedMonth,
  selectedYear,
) {
  const date = getChartRequestDate(
    segment,
    selectedDay,
    selectedMonth,
    selectedYear,
  );
  const params = {
    plantId: String(plantId),
    segment,
  };

  if (date) {
    params.date = date;
  }

  return `${BASE_URL}/api/data/chart?${buildQueryString(params)}`;
}

function getChartPoints(data, minY, maxY, width, height, pad) {
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

function getLatestChartPoint(data, minY, maxY, width, height, pad) {
  const points = getChartPoints(data, minY, maxY, width, height, pad);

  return points.length ? points[points.length - 1] : null;
}

function buildSmoothLinePath(data, minY, maxY, width, height, pad) {
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

function buildSmoothAreaPath(data, minY, maxY, width, height, pad) {
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

function DailyOverviewChart({
  series,
  chartWidth = CHART_WIDTH,
  visibleSeries,
  onToggleSeries,
  currentTime = new Date(),
}) {
  const isCompactChart = chartWidth < 320;
  const pad = {
    top: POWER_CHART_LAYOUT.paddingTop,
    right: isCompactChart ? 50 : POWER_CHART_LAYOUT.paddingRight,
    bottom: isCompactChart ? 46 : POWER_CHART_LAYOUT.paddingBottom,
    left: isCompactChart ? 40 : POWER_CHART_LAYOUT.paddingLeft,
  };
  const yTicks = POWER_CHART_Y_RANGE.leftTicks;
  const minY = POWER_CHART_Y_RANGE.minKw;
  const maxY = POWER_CHART_Y_RANGE.maxKw;
  const innerWidth = Math.max(0, chartWidth - pad.left - pad.right);
  const innerHeight = CHART_HEIGHT - pad.top - pad.bottom;
  const timeTicks = getResponsiveChartTimeTicks(innerWidth);
  const timeLabelFontSize = getResponsiveChartTimeFontSize(innerWidth);
  const currentHour =
    currentTime.getHours() +
    currentTime.getMinutes() / 60 +
    currentTime.getSeconds() / 3600;
  const currentTimeX = pad.left + (Math.min(currentHour, 24) / 24) * innerWidth;
  const currentTimeLabel = formatRealtimeClock(currentTime);
  const datasets = POWER_SERIES_CONFIG.map((item) => ({
    ...item,
    data: series[item.key] || [],
  }));
  const activeDatasets = datasets.filter((item) => visibleSeries[item.key]);

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartCurrentTimeText}>{currentTimeLabel}</Text>

      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          {datasets.map((item) => (
            <LinearGradient
              key={`${item.key}-gradient`}
              id={`${item.key}Gradient`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0" stopColor={item.color} stopOpacity="0.28" />
              <Stop offset="1" stopColor={item.color} stopOpacity="0" />
            </LinearGradient>
          ))}
        </Defs>

        <SvgText
          x={4}
          y={26}
          fontSize={POWER_CHART_LAYOUT.axisTitleFontSize}
          fill={appColors.text}
          fontWeight="500"
          textAnchor="start"
        >
          kW
        </SvgText>

        <SvgText
          x={chartWidth - 4}
          y={26}
          fontSize={POWER_CHART_LAYOUT.axisTitleFontSize}
          fill={appColors.text}
          fontWeight="500"
          textAnchor="end"
        >
          Percentage
        </SvgText>

        {yTicks.map((value) => {
          const y = pad.top + ((maxY - value) / (maxY - minY)) * innerHeight;
          const percentage = Math.round(((value - minY) / (maxY - minY)) * 100);

          return (
            <Fragment key={`chart-y-${value}`}>
              <Line
                x1={pad.left}
                y1={y}
                x2={chartWidth - pad.right}
                y2={y}
                stroke="rgba(248,250,252,0.12)"
                strokeWidth="1"
              />

              <SvgText
                x={pad.left - 8}
                y={y + 5}
                fontSize={POWER_CHART_LAYOUT.axisLabelFontSize}
                fill="rgba(248,250,252,0.52)"
                textAnchor="end"
              >
                {value.toFixed(1)}
              </SvgText>

              <SvgText
                x={chartWidth - pad.right + 8}
                y={y + 5}
                fontSize={POWER_CHART_LAYOUT.axisLabelFontSize}
                fill="rgba(248,250,252,0.52)"
                textAnchor="start"
              >
                {percentage}%
              </SvgText>
            </Fragment>
          );
        })}

        {timeTicks.map((hour) => {
          const x = pad.left + (hour / 24) * innerWidth;

          return (
            <Fragment key={`chart-x-${hour}`}>
              <Line
                x1={x}
                y1={pad.top}
                x2={x}
                y2={CHART_HEIGHT - pad.bottom}
                stroke="rgba(248,250,252,0.1)"
                strokeWidth="1"
              />

              <SvgText
                x={x}
                y={CHART_HEIGHT - 12}
                fontSize={timeLabelFontSize}
                fill="rgba(248,250,252,0.52)"
                textAnchor="middle"
              >
                {formatChartHour(hour)}
              </SvgText>
            </Fragment>
          );
        })}

        <Line
          x1={currentTimeX}
          y1={pad.top}
          x2={currentTimeX}
          y2={CHART_HEIGHT - pad.bottom}
          stroke="rgba(147,197,253,0.62)"
          strokeWidth="1.4"
          strokeDasharray="7 7"
        />

        {activeDatasets.map((item) => (
          <Path
            key={`${item.key}-area`}
            d={buildSmoothAreaPath(
              item.data,
              minY,
              maxY,
              chartWidth,
              CHART_HEIGHT,
              pad,
            )}
            fill={`url(#${item.key}Gradient)`}
          />
        ))}

        {activeDatasets.map((item) => (
          <Path
            key={`${item.key}-line`}
            d={buildSmoothLinePath(
              item.data,
              minY,
              maxY,
              chartWidth,
              CHART_HEIGHT,
              pad,
            )}
            stroke={item.color}
            strokeWidth={POWER_CHART_LAYOUT.lineStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}

        {activeDatasets.map((item) => {
          const point = getLatestChartPoint(
            item.data,
            minY,
            maxY,
            chartWidth,
            CHART_HEIGHT,
            pad,
          );

          return point ? (
            <SvgCircle
              key={`${item.key}-current-point`}
              cx={point.x}
              cy={point.y}
              r={POWER_CHART_LAYOUT.pointRadius + 1}
              fill={item.color}
              stroke="rgba(248,250,252,0.82)"
              strokeWidth="1.4"
            />
          ) : null;
        })}
      </Svg>

      <View style={styles.chartSwitchRow}>
        {datasets.map((item) => {
          const isActive = visibleSeries[item.key];

          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.82}
              onPress={() => onToggleSeries(item.key)}
              style={[
                styles.chartSwitchButton,
                {
                  backgroundColor: isActive
                    ? `${item.color}35`
                    : "rgba(248,250,252,0.18)",
                },
              ]}
            >
              <View
                style={[
                  styles.chartSwitchKnob,
                  {
                    backgroundColor: isActive
                      ? `${item.color}CC`
                      : "rgba(248,250,252,0.45)",
                    transform: [
                      {
                        translateX: isActive
                          ? POWER_CHART_LAYOUT.switchWidth -
                            POWER_CHART_LAYOUT.switchHeight
                          : 0,
                      },
                    ],
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const { selectedDevice } = useContext(AuthContext);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const resolvedPlantId = resolvePlantId(id, selectedDevice?.id);
  const [activeSegment, setActiveSegment] = useState("day");
  const [fetchedData, setFetchedData] = useState(null);
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [selectedLifetimeRange, setSelectedLifetimeRange] = useState(5);
  const [plantMenuVisible, setPlantMenuVisible] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [chartCurrentTime, setChartCurrentTime] = useState(() => new Date());
  const [visiblePowerSeries, setVisiblePowerSeries] = useState(() =>
    POWER_SERIES_CONFIG.reduce((items, item) => {
      items[item.key] = true;
      return items;
    }, {}),
  );
  const [houseOverlayLayout, setHouseOverlayLayout] = useState(null);
  const [gridBubbleLayout, setGridBubbleLayout] = useState(null);
  const [batteryBubbleLayout, setBatteryBubbleLayout] = useState(null);
  const [pvBubbleLayout, setPvBubbleLayout] = useState(null);
  const [loadBubbleLayout, setLoadBubbleLayout] = useState(null);
  const overviewChartWidth = useMemo(
    () => getResponsiveChartWidth(windowWidth),
    [windowWidth],
  );
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
    );
  }, [
    activeSegment,
    resolvedPlantId,
    selectedDay,
    selectedMonth,
    selectedYear,
  ]);
  const weatherCardAnim = useRef(new Animated.Value(0)).current;
  const gridPointerProgress = useRef(new Animated.Value(0)).current;
  const batteryPointerProgress = useRef(new Animated.Value(0)).current;
  const pvPointerProgress = useRef(new Animated.Value(0)).current;
  const loadPointerProgress = useRef(new Animated.Value(0)).current;
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();

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

  const fetchOverviewData = useCallback(
    async ({ showLoading = false } = {}) => {
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

        const latestRequests = POWER_LATEST_ENDPOINT_CONFIG.flatMap((item) =>
          buildLatestPowerRequests(resolvedPlantId, item),
        );
        const chartEndpoint = buildChartEndpoint(
          activeSegment,
          resolvedPlantId,
          selectedDay,
          selectedMonth,
          selectedYear,
        );
        const chartDate = getChartRequestDate(
          activeSegment,
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
          requestJson(chartEndpoint, headers),
          ...latestRequests.map((item) => requestJson(item.endpoint, headers)),
        ]);

        const plants = Array.isArray(plantResult?.json?.data)
          ? plantResult.json.data
          : [];
        const plantInfo =
          plants.find((item) => String(item.id) === String(resolvedPlantId)) ??
          selectedDevice ??
          {};

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
          });
        } catch (_error) {
          googleWeather = null;
        }

        const chartRequestSucceeded =
          chartResult?.ok && chartResult?.json?.data != null;
        const chartSeries = chartRequestSucceeded
          ? mergeChartSeries(normalizeChartSeries(chartResult.json.data))
          : createEmptyChartSeries();
        debugChartLog("response", {
          plantId: resolvedPlantId,
          segment: activeSegment,
          date: chartDate,
          status: chartResult?.status,
          ok: chartResult?.ok,
          error: chartResult?.error,
          counts: getChartSeriesCounts(chartSeries),
        });
        const fallbackChartSeries = chartRequestSucceeded
          ? createEmptyChartSeries()
          : await loadStoredChartSeries(chartSelectionKey);
        const apiPowerValues = mergePowerValues(
          ...latestResults.map((item, index) =>
            normalizeLatestPowerValues(
              item?.json?.data,
              latestRequests[index]?.sourceCategory,
            ),
          ),
        );
        const realtimeChartSampleSeries = isSelectedCurrentDay(
          activeSegment,
          selectedDay,
          selectedMonth,
          selectedYear,
        )
          ? createRealtimeChartSampleSeries(apiPowerValues)
          : createEmptyChartSeries();

        setFetchedData((current) => {
          const currentChartSeries =
            current?.chartSelectionKey === chartSelectionKey
              ? current?.chartSeries
              : createEmptyChartSeries();
          const baseChartSeries = chartRequestSucceeded
            ? chartSeries
            : hasChartSeriesRows(fallbackChartSeries)
              ? fallbackChartSeries
              : currentChartSeries;
          let nextChartSeries = mergeAndLimitChartSeries(baseChartSeries);

          if (
            shouldAppendRealtimeChartSample(
              nextChartSeries,
              realtimeChartSampleSeries,
            )
          ) {
            nextChartSeries = mergeAndLimitChartSeries(
              nextChartSeries,
              realtimeChartSampleSeries,
            );
          }

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
              apiPowerValues.production,
              plantInfo.productionToday,
              plantInfo.production,
              current?.productionToday,
              current?.production,
              selectedDevice?.productionToday,
              selectedDevice?.production,
            ),
            production:
              apiPowerValues.production ??
              current?.production ??
              plantInfo.production ??
              selectedDevice?.production ??
              0,
            pv:
              apiPowerValues.pv ??
              current?.pv ??
              plantInfo.pv ??
              selectedDevice?.pv ??
              0,
            grid:
              apiPowerValues.grid ??
              current?.grid ??
              plantInfo.grid ??
              selectedDevice?.grid ??
              0,
            battery:
              apiPowerValues.battery ??
              current?.battery ??
              plantInfo.battery ??
              selectedDevice?.battery ??
              0,
            upsLoad:
              apiPowerValues.upsLoad ??
              current?.upsLoad ??
              plantInfo.upsLoad ??
              selectedDevice?.upsLoad ??
              0,
            load:
              apiPowerValues.load ??
              current?.load ??
              plantInfo.load ??
              selectedDevice?.load ??
              0,
            status: pickValue(
              plantInfo.status,
              current?.status,
              selectedDevice?.status,
              "--",
            ),
            chartSeries: nextChartSeries,
            chartSelectionKey,
          };
        });

        if (chartRequestSucceeded && !hasChartSeriesRows(chartSeries)) {
          await removeStoredChartSeries(chartSelectionKey);
        }
      } catch (error) {
        console.error("Error fetching plant data:", error);
      } finally {
        if (showLoading) {
          setIsRefreshLoading(false);
        }
      }
    },
    [
      activeSegment,
      chartSelectionKey,
      getAuthorizedHeaders,
      requestJson,
      resolvedPlantId,
      selectedDay,
      selectedDevice,
      selectedMonth,
      selectedYear,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((prev) => prev + 1);
    }, []),
  );

  useEffect(() => {
    if (
      !fetchedData?.chartSelectionKey ||
      !hasChartSeriesRows(fetchedData.chartSeries)
    ) {
      return;
    }

    saveStoredChartSeries(
      fetchedData.chartSelectionKey,
      fetchedData.chartSeries,
    );
  }, [fetchedData?.chartSelectionKey, fetchedData?.chartSeries]);

  const plantData = useMemo(
    () => ({
      plantName: pickValue(
        fetchedData?.name,
        selectedDevice?.name,
        "No Device Selected",
      ),
      productionToday: pickNumber(
        fetchedData?.productionToday,
        fetchedData?.production,
        selectedDevice?.productionToday,
        selectedDevice?.production,
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
        fetchedData?.production,
        selectedDevice?.production,
      ),
      pv: pickNumber(fetchedData?.pv, selectedDevice?.pv),
      grid: pickNumber(fetchedData?.grid, selectedDevice?.grid),
      battery: pickNumber(fetchedData?.battery, selectedDevice?.battery),
      upsLoad: pickNumber(fetchedData?.upsLoad, selectedDevice?.upsLoad),
      load: pickNumber(fetchedData?.load, selectedDevice?.load),
      status: pickValue(fetchedData?.status, selectedDevice?.status, "--"),
      chartSeries: fetchedData?.chartSeries ?? createEmptyChartSeries(),
    }),
    [fetchedData, selectedDevice],
  );

  const weatherLocation = getWeatherLocation(plantData.address);
  const currentTemperature = pickNumber(
    plantData.weatherTemperature,
    getTemperatureNumber(plantData.weather),
  );
  const weatherHigh = pickNumber(plantData.weatherHigh, currentTemperature + 2);
  const weatherLow = pickNumber(
    plantData.weatherLow,
    Math.max(currentTemperature - 7, 0),
  );
  const weatherCondition = pickValue(plantData.weatherConditionText, "Raining");
  const weatherIconName = getWeatherIconName(
    plantData.weatherConditionType,
    plantData.weatherIsDaytime,
  );
  const productionMeta = `${formatCompactNumber(plantData.productionToday)}kW`;
  const coordinateMeta = `${formatCoordinate(plantData.latitude)} ${formatCoordinate(
    plantData.longitude,
  )}`;
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

  const handleEditPlantName = () => {
    setPlantMenuVisible(false);
    Alert.alert("Edit name", "Fitur edit nama plant belum tersedia.");
  };

  const handleRefreshOverview = async () => {
    setPlantMenuVisible(false);
    await fetchOverviewData({ showLoading: true });
  };

  const handleDeletePlant = () => {
    setPlantMenuVisible(false);
    Alert.alert("Delete plant", `Hapus ${plantData.plantName}?`, [
      { text: "Batal", style: "cancel" },
      { text: "Delete", style: "destructive" },
    ]);
  };

  const isFutureDaySelection =
    activeSegment === "day" &&
    new Date(selectedYear, selectedMonth - 1, selectedDay) >
      new Date(todayYear, todayMonth - 1, todayDay);

  const isFutureMonthSelection =
    activeSegment === "month" &&
    (selectedYear > todayYear ||
      (selectedYear === todayYear && selectedMonth > todayMonth));

  const isFutureYearSelection =
    activeSegment === "year" && selectedYear > todayYear;

  const isFutureSelection =
    isFutureDaySelection || isFutureMonthSelection || isFutureYearSelection;
  const dailySeries = useMemo(() => {
    return POWER_SERIES_CONFIG.reduce((items, item, index) => {
      const apiSeries = plantData.chartSeries?.[item.key];

      if (isFutureSelection) {
        items[item.key] = buildZeroSeries();
        return items;
      }

      items[item.key] =
        Array.isArray(apiSeries) && apiSeries.length
          ? apiSeries
          : buildFallbackSeries(plantData[item.key], index);

      return items;
    }, {});
  }, [isFutureSelection, plantData]);

  const togglePowerSeries = (key) => {
    setVisiblePowerSeries((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const selectedMonthLabel =
    monthOptions.find((month) => month.value === selectedMonth)?.label || "";

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  useEffect(() => {
    Animated.timing(weatherCardAnim, {
      toValue: 1,
      duration: 560,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [weatherCardAnim]);

  useEffect(() => {
    const loopDelay = Math.max(
      0,
      GRID_POINTER_CONFIG.animationLoopInterval -
        GRID_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gridPointerProgress, {
          toValue: 1,
          duration: GRID_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(GRID_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(gridPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    gridPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [gridPointerProgress]);

  useEffect(() => {
    const loopDelay = Math.max(
      0,
      BATTERY_POINTER_CONFIG.animationLoopInterval -
        BATTERY_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(batteryPointerProgress, {
          toValue: 1,
          duration: BATTERY_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(BATTERY_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(batteryPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    batteryPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [batteryPointerProgress]);

  useEffect(() => {
    const loopDelay = Math.max(
      0,
      PV_POINTER_CONFIG.animationLoopInterval -
        PV_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pvPointerProgress, {
          toValue: 1,
          duration: PV_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(PV_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(pvPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    pvPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [pvPointerProgress]);

  useEffect(() => {
    const loopDelay = Math.max(
      0,
      LOAD_POINTER_CONFIG.animationLoopInterval -
        LOAD_POINTER_CONFIG.animationDuration,
    );
    const pointerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loadPointerProgress, {
          toValue: 1,
          duration: LOAD_POINTER_CONFIG.animationDuration,
          easing: getPointerAnimationEasing(LOAD_POINTER_CONFIG),
          useNativeDriver: true,
        }),
        Animated.delay(loopDelay),
        Animated.timing(loadPointerProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    loadPointerProgress.setValue(0);
    pointerLoop.start();

    return () => pointerLoop.stop();
  }, [loadPointerProgress]);

  useEffect(() => {
    const clock = setInterval(() => {
      setChartCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  const yearOptions = Array.from(
    { length: 3000 - 2021 + 1 },
    (_, i) => 2021 + i,
  );

  useEffect(() => {
    if (!DEBUG_LAYOUT || !__DEV__) {
      return;
    }

    console.log("[layout-debug] overview screen", {
      width: windowWidth,
      chartWidth: overviewChartWidth,
    });
  }, [overviewChartWidth, windowWidth]);

  const fallbackHouseOverlayWidth = Math.max(0, windowWidth - 32);
  const houseOverlayWidth =
    houseOverlayLayout?.width || fallbackHouseOverlayWidth;
  const houseOverlayHeight = getPowerFlowOverlayHeight(houseOverlayWidth);
  const bubbleScale = getPowerFlowOverlayScale(
    houseOverlayWidth,
    houseOverlayHeight,
  );
  const responsiveBubbleStyle = {
    minWidth: POWER_FLOW_OVERLAY_LAYOUT.bubbleMinWidth * bubbleScale,
    maxWidth: POWER_FLOW_OVERLAY_LAYOUT.bubbleMaxWidth * bubbleScale,
    paddingHorizontal:
      POWER_FLOW_OVERLAY_LAYOUT.bubblePaddingHorizontal * bubbleScale,
    paddingVertical:
      POWER_FLOW_OVERLAY_LAYOUT.bubblePaddingVertical * bubbleScale,
    borderRadius: POWER_FLOW_OVERLAY_LAYOUT.bubbleBorderRadius * bubbleScale,
  };
  const responsiveBubbleLabelStyle = {
    fontSize: POWER_FLOW_OVERLAY_LAYOUT.bubbleLabelFontSize * bubbleScale,
  };
  const responsiveBubbleValueStyle = {
    fontSize: POWER_FLOW_OVERLAY_LAYOUT.bubbleValueFontSize * bubbleScale,
  };
  const responsiveBatteryLabelStyle = {
    fontSize: BATTERY_BUBBLE_CONFIG.titleFontSize * bubbleScale,
  };
  const responsiveBatteryValueStyle = {
    fontSize: BATTERY_BUBBLE_CONFIG.valueFontSize * bubbleScale,
  };
  const gridPointerCoordinates = getGridPointerCoordinates(
    houseOverlayLayout,
    gridBubbleLayout,
    bubbleScale,
  );
  const batteryPointerCoordinates = getBatteryPointerCoordinates(
    houseOverlayLayout,
    batteryBubbleLayout,
    bubbleScale,
  );
  const pvPointerCoordinates = getPvPointerCoordinates(
    houseOverlayLayout,
    pvBubbleLayout,
    bubbleScale,
  );
  const loadPointerCoordinates = getLoadPointerCoordinates(
    houseOverlayLayout,
    loadBubbleLayout,
    bubbleScale,
  );
  const gridPointerDotSize = GRID_POINTER_CONFIG.dotSize * bubbleScale;
  const gridPointerGlowSize = GRID_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const batteryPointerDotSize = BATTERY_POINTER_CONFIG.dotSize * bubbleScale;
  const batteryPointerGlowSize =
    BATTERY_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const pvPointerDotSize = PV_POINTER_CONFIG.dotSize * bubbleScale;
  const pvPointerGlowSize = PV_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const loadPointerDotSize = LOAD_POINTER_CONFIG.dotSize * bubbleScale;
  const loadPointerGlowSize =
    LOAD_POINTER_CONFIG.dotSize * 2.8 * bubbleScale;
  const gridPointerDotX = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startX - gridPointerDotSize / 2,
          gridPointerCoordinates.leadX - gridPointerDotSize / 2,
          gridPointerCoordinates.bendX - gridPointerDotSize / 2,
          gridPointerCoordinates.endX - gridPointerDotSize / 2,
        ],
      })
    : null;
  const gridPointerDotY = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startY - gridPointerDotSize / 2,
          gridPointerCoordinates.leadY - gridPointerDotSize / 2,
          gridPointerCoordinates.bendY - gridPointerDotSize / 2,
          gridPointerCoordinates.endY - gridPointerDotSize / 2,
        ],
      })
    : null;
  const gridPointerGlowX = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startX - gridPointerGlowSize / 2,
          gridPointerCoordinates.leadX - gridPointerGlowSize / 2,
          gridPointerCoordinates.bendX - gridPointerGlowSize / 2,
          gridPointerCoordinates.endX - gridPointerGlowSize / 2,
        ],
      })
    : null;
  const gridPointerGlowY = gridPointerCoordinates
    ? gridPointerProgress.interpolate({
        inputRange: [
          0,
          gridPointerCoordinates.leadProgress,
          gridPointerCoordinates.bendProgress,
          1,
        ],
        outputRange: [
          gridPointerCoordinates.startY - gridPointerGlowSize / 2,
          gridPointerCoordinates.leadY - gridPointerGlowSize / 2,
          gridPointerCoordinates.bendY - gridPointerGlowSize / 2,
          gridPointerCoordinates.endY - gridPointerGlowSize / 2,
        ],
      })
    : null;
  const batteryPointerDotX = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: [
          batteryPointerCoordinates.startX - batteryPointerDotSize / 2,
          batteryPointerCoordinates.bendX - batteryPointerDotSize / 2,
          batteryPointerCoordinates.endX - batteryPointerDotSize / 2,
        ],
      })
    : null;
  const batteryPointerDotY = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: [
          batteryPointerCoordinates.startY - batteryPointerDotSize / 2,
          batteryPointerCoordinates.bendY - batteryPointerDotSize / 2,
          batteryPointerCoordinates.endY - batteryPointerDotSize / 2,
        ],
      })
    : null;
  const batteryPointerGlowX = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: [
          batteryPointerCoordinates.startX - batteryPointerGlowSize / 2,
          batteryPointerCoordinates.bendX - batteryPointerGlowSize / 2,
          batteryPointerCoordinates.endX - batteryPointerGlowSize / 2,
        ],
      })
    : null;
  const batteryPointerGlowY = batteryPointerCoordinates
    ? batteryPointerProgress.interpolate({
        inputRange: [0, batteryPointerCoordinates.bendProgress, 1],
        outputRange: [
          batteryPointerCoordinates.startY - batteryPointerGlowSize / 2,
          batteryPointerCoordinates.bendY - batteryPointerGlowSize / 2,
          batteryPointerCoordinates.endY - batteryPointerGlowSize / 2,
        ],
      })
    : null;
  const pvPointerDotX = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startX - pvPointerDotSize / 2,
          pvPointerCoordinates.bendX - pvPointerDotSize / 2,
          pvPointerCoordinates.endX - pvPointerDotSize / 2,
        ],
      })
    : null;
  const pvPointerDotY = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startY - pvPointerDotSize / 2,
          pvPointerCoordinates.bendY - pvPointerDotSize / 2,
          pvPointerCoordinates.endY - pvPointerDotSize / 2,
        ],
      })
    : null;
  const pvPointerGlowX = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startX - pvPointerGlowSize / 2,
          pvPointerCoordinates.bendX - pvPointerGlowSize / 2,
          pvPointerCoordinates.endX - pvPointerGlowSize / 2,
        ],
      })
    : null;
  const pvPointerGlowY = pvPointerCoordinates
    ? pvPointerProgress.interpolate({
        inputRange: [0, pvPointerCoordinates.bendProgress, 1],
        outputRange: [
          pvPointerCoordinates.startY - pvPointerGlowSize / 2,
          pvPointerCoordinates.bendY - pvPointerGlowSize / 2,
          pvPointerCoordinates.endY - pvPointerGlowSize / 2,
        ],
      })
    : null;
  const loadPointerDotX = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endX - loadPointerDotSize / 2,
          loadPointerCoordinates.bendX - loadPointerDotSize / 2,
          loadPointerCoordinates.startX - loadPointerDotSize / 2,
        ],
      })
    : null;
  const loadPointerDotY = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endY - loadPointerDotSize / 2,
          loadPointerCoordinates.bendY - loadPointerDotSize / 2,
          loadPointerCoordinates.startY - loadPointerDotSize / 2,
        ],
      })
    : null;
  const loadPointerGlowX = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endX - loadPointerGlowSize / 2,
          loadPointerCoordinates.bendX - loadPointerGlowSize / 2,
          loadPointerCoordinates.startX - loadPointerGlowSize / 2,
        ],
      })
    : null;
  const loadPointerGlowY = loadPointerCoordinates
    ? loadPointerProgress.interpolate({
        inputRange: [0, loadPointerCoordinates.bendProgress, 1],
        outputRange: [
          loadPointerCoordinates.endY - loadPointerGlowSize / 2,
          loadPointerCoordinates.bendY - loadPointerGlowSize / 2,
          loadPointerCoordinates.startY - loadPointerGlowSize / 2,
        ],
      })
    : null;
  const gridPointerDotOpacity =
    GRID_POINTER_CONFIG.animationEffect === "fade"
      ? gridPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            GRID_POINTER_CONFIG.dotOpacity,
            GRID_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : GRID_POINTER_CONFIG.dotOpacity;
  const gridPointerGlowScale =
    GRID_POINTER_CONFIG.enablePulse ||
    GRID_POINTER_CONFIG.animationEffect === "pulse"
      ? gridPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const batteryPointerDotOpacity =
    BATTERY_POINTER_CONFIG.animationEffect === "fade"
      ? batteryPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            BATTERY_POINTER_CONFIG.dotOpacity,
            BATTERY_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : BATTERY_POINTER_CONFIG.dotOpacity;
  const batteryPointerGlowScale =
    BATTERY_POINTER_CONFIG.enablePulse ||
    BATTERY_POINTER_CONFIG.animationEffect === "pulse"
      ? batteryPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const pvPointerDotOpacity =
    PV_POINTER_CONFIG.animationEffect === "fade"
      ? pvPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            PV_POINTER_CONFIG.dotOpacity,
            PV_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : PV_POINTER_CONFIG.dotOpacity;
  const pvPointerGlowScale =
    PV_POINTER_CONFIG.enablePulse ||
    PV_POINTER_CONFIG.animationEffect === "pulse"
      ? pvPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;
  const loadPointerDotOpacity =
    LOAD_POINTER_CONFIG.animationEffect === "fade"
      ? loadPointerProgress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [
            0,
            LOAD_POINTER_CONFIG.dotOpacity,
            LOAD_POINTER_CONFIG.dotOpacity,
            0,
          ],
        })
      : LOAD_POINTER_CONFIG.dotOpacity;
  const loadPointerGlowScale =
    LOAD_POINTER_CONFIG.enablePulse ||
    LOAD_POINTER_CONFIG.animationEffect === "pulse"
      ? loadPointerProgress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 1.18, 0.9],
        })
      : 1;

  const lifetimeOptions = Array.from({ length: 40 }, (_, i) => (i + 1) * 5);
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
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <StatusBar
        translucent={false}
        backgroundColor="#111326"
        barStyle="light-content"
      />

      <Animated.View
        style={[
          styles.stickyTopBar,
          {
            paddingHorizontal: windowWidth < 380 ? 18 : 24,
            minHeight: windowWidth < 380 ? 72 : 78,
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
              color="rgba(248,250,252,0.88)"
            />
          </TouchableOpacity>

          <View style={styles.plantTitleBlock}>
            <Text style={styles.plantName} numberOfLines={1}>
              {plantData.plantName}
            </Text>

            <View style={styles.plantMetaRow}>
              <Text style={styles.plantProductionMeta}>{productionMeta}</Text>
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
            color="rgba(248,250,252,0.82)"
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerCard, weatherCardAnimatedStyle]}>
          <View style={styles.weatherTopRow}>
            <View style={styles.weatherMainInfo}>
              <Text style={styles.weatherCity}>{weatherLocation}</Text>
              <Text style={styles.weatherTemp}>
                {currentTemperature}
                {"\u00B0"}
              </Text>
              <Text style={styles.weatherCoordinates} numberOfLines={1}>
                {coordinateMeta}
              </Text>
            </View>

            <View style={styles.weatherStatus}>
              <View style={styles.weatherIconWrap}>
                <Ionicons
                  name={weatherIconName}
                  size={WEATHER_ICON_SIZE.current}
                  color={appColors.accent}
                />
              </View>
              <Text style={styles.weatherCondition} numberOfLines={1}>
                {weatherCondition}
              </Text>
              <Text
                style={styles.weatherRange}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                H:{weatherHigh}
                {"\u00B0"} L:{weatherLow}
                {"\u00B0"}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weatherDaysContent}
          >
            {weatherForecastDays.map((item) => (
              <View key={item.day} style={styles.weatherDayItem}>
                <Text style={styles.weatherDayNumber}>{item.day}</Text>
                <Ionicons
                  name={item.icon}
                  size={WEATHER_ICON_SIZE.day}
                  color={appColors.accent}
                  style={styles.weatherDayIcon}
                />
                <Text style={styles.weatherDayTemp}>
                  {item.temp}
                  {"\u00B0"}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

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
            <View style={styles.menuPopup}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={handleRefreshOverview}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={appColors.accent}
                />
                <Text style={styles.menuItemText}>Refresh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={handleEditPlantName}
              >
                <Ionicons
                  name="create-outline"
                  size={19}
                  color={appColors.accent}
                />
                <Text style={styles.menuItemText}>Edit name</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.75}
                onPress={handleDeletePlant}
              >
                <Ionicons name="trash-outline" size={19} color="#EF4444" />
                <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                  Delete plant
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={isRefreshLoading}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.refreshLoadingOverlay}>
            <View style={styles.refreshLoadingCard}>
              <ActivityIndicator size="large" color={appColors.accent} />
              <Text style={styles.refreshLoadingTitle}>Loading . . .</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.content}>
          <View style={styles.powerFlowSection}>
            <View style={styles.houseImageOnly}>
              <View
                style={[
                  styles.houseOverlayWrap,
                  { height: houseOverlayHeight },
                ]}
                onLayout={({ nativeEvent }) =>
                  setHouseOverlayLayout(nativeEvent.layout)
                }
              >
                <Image
                  source={require("@/assets/images/Asset App Batari Alternative.png")}
                  style={[styles.houseImage, { height: houseOverlayHeight }]}
                  resizeMode="contain"
                />

                {gridPointerCoordinates && (
                  <View pointerEvents="none" style={styles.gridPointerOverlay}>
                    <Svg
                      pointerEvents="none"
                      style={styles.gridPointerOverlay}
                      width="100%"
                      height="100%"
                    >
                      <Path
                        d={gridPointerCoordinates.path}
                        stroke={GRID_POINTER_CONFIG.lineColor}
                        strokeWidth={getScaledLineThickness(
                          GRID_POINTER_CONFIG,
                          bubbleScale,
                        )}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                    {GRID_POINTER_CONFIG.enableGlow &&
                      GRID_POINTER_CONFIG.animationEffect !== "plain" && (
                        <Animated.View
                          style={[
                            styles.gridPointerDotGlow,
                            {
                              width: gridPointerGlowSize,
                              height: gridPointerGlowSize,
                              borderRadius: gridPointerGlowSize / 2,
                              backgroundColor: GRID_POINTER_CONFIG.dotGlowColor,
                              opacity: gridPointerDotOpacity,
                              transform: [
                                { translateX: gridPointerGlowX },
                                { translateY: gridPointerGlowY },
                                { scale: gridPointerGlowScale },
                              ],
                            },
                          ]}
                        />
                      )}
                    <Animated.View
                      style={[
                        styles.gridPointerDot,
                        {
                          width: gridPointerDotSize,
                          height: gridPointerDotSize,
                          borderRadius: gridPointerDotSize / 2,
                          backgroundColor: GRID_POINTER_CONFIG.dotColor,
                          opacity: gridPointerDotOpacity,
                          transform: [
                            { translateX: gridPointerDotX },
                            { translateY: gridPointerDotY },
                          ],
                        },
                      ]}
                    />
                  </View>
                )}

                {batteryPointerCoordinates && (
                  <View pointerEvents="none" style={styles.gridPointerOverlay}>
                    <Svg
                      pointerEvents="none"
                      style={styles.gridPointerOverlay}
                      width="100%"
                      height="100%"
                    >
                      <Path
                        d={batteryPointerCoordinates.path}
                        stroke={BATTERY_POINTER_CONFIG.lineColor}
                        strokeWidth={getScaledLineThickness(
                          BATTERY_POINTER_CONFIG,
                          bubbleScale,
                        )}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                    {BATTERY_POINTER_CONFIG.enableGlow &&
                      BATTERY_POINTER_CONFIG.animationEffect !== "plain" && (
                        <Animated.View
                          style={[
                            styles.gridPointerDotGlow,
                            {
                              width: batteryPointerGlowSize,
                              height: batteryPointerGlowSize,
                              borderRadius: batteryPointerGlowSize / 2,
                              backgroundColor:
                                BATTERY_POINTER_CONFIG.dotGlowColor,
                              opacity: batteryPointerDotOpacity,
                              transform: [
                                { translateX: batteryPointerGlowX },
                                { translateY: batteryPointerGlowY },
                                { scale: batteryPointerGlowScale },
                              ],
                            },
                          ]}
                        />
                      )}
                    <Animated.View
                      style={[
                        styles.gridPointerDot,
                        {
                          width: batteryPointerDotSize,
                          height: batteryPointerDotSize,
                          borderRadius: batteryPointerDotSize / 2,
                          backgroundColor: BATTERY_POINTER_CONFIG.dotColor,
                          opacity: batteryPointerDotOpacity,
                          transform: [
                            { translateX: batteryPointerDotX },
                            { translateY: batteryPointerDotY },
                          ],
                        },
                      ]}
                    />
                  </View>
                )}

                {pvPointerCoordinates && (
                  <View pointerEvents="none" style={styles.gridPointerOverlay}>
                    <Svg
                      pointerEvents="none"
                      style={styles.gridPointerOverlay}
                      width="100%"
                      height="100%"
                    >
                      <Path
                        d={pvPointerCoordinates.path}
                        stroke={PV_POINTER_CONFIG.lineColor}
                        strokeWidth={getScaledLineThickness(
                          PV_POINTER_CONFIG,
                          bubbleScale,
                        )}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                    {PV_POINTER_CONFIG.enableGlow &&
                      PV_POINTER_CONFIG.animationEffect !== "plain" && (
                        <Animated.View
                          style={[
                            styles.gridPointerDotGlow,
                            {
                              width: pvPointerGlowSize,
                              height: pvPointerGlowSize,
                              borderRadius: pvPointerGlowSize / 2,
                              backgroundColor: PV_POINTER_CONFIG.dotGlowColor,
                              opacity: pvPointerDotOpacity,
                              transform: [
                                { translateX: pvPointerGlowX },
                                { translateY: pvPointerGlowY },
                                { scale: pvPointerGlowScale },
                              ],
                            },
                          ]}
                        />
                      )}
                    <Animated.View
                      style={[
                        styles.gridPointerDot,
                        {
                          width: pvPointerDotSize,
                          height: pvPointerDotSize,
                          borderRadius: pvPointerDotSize / 2,
                          backgroundColor: PV_POINTER_CONFIG.dotColor,
                          opacity: pvPointerDotOpacity,
                          transform: [
                            { translateX: pvPointerDotX },
                            { translateY: pvPointerDotY },
                          ],
                        },
                      ]}
                    />
                  </View>
                )}

                {loadPointerCoordinates && (
                  <View pointerEvents="none" style={styles.gridPointerOverlay}>
                    <Svg
                      pointerEvents="none"
                      style={styles.gridPointerOverlay}
                      width="100%"
                      height="100%"
                    >
                      <Path
                        d={loadPointerCoordinates.path}
                        stroke={LOAD_POINTER_CONFIG.lineColor}
                        strokeWidth={getScaledLineThickness(
                          LOAD_POINTER_CONFIG,
                          bubbleScale,
                        )}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                    {LOAD_POINTER_CONFIG.enableGlow &&
                      LOAD_POINTER_CONFIG.animationEffect !== "plain" && (
                        <Animated.View
                          style={[
                            styles.gridPointerDotGlow,
                            {
                              width: loadPointerGlowSize,
                              height: loadPointerGlowSize,
                              borderRadius: loadPointerGlowSize / 2,
                              backgroundColor: LOAD_POINTER_CONFIG.dotGlowColor,
                              opacity: loadPointerDotOpacity,
                              transform: [
                                { translateX: loadPointerGlowX },
                                { translateY: loadPointerGlowY },
                                { scale: loadPointerGlowScale },
                              ],
                            },
                          ]}
                        />
                      )}
                    <Animated.View
                      style={[
                        styles.gridPointerDot,
                        {
                          width: loadPointerDotSize,
                          height: loadPointerDotSize,
                          borderRadius: loadPointerDotSize / 2,
                          backgroundColor: LOAD_POINTER_CONFIG.dotColor,
                          opacity: loadPointerDotOpacity,
                          transform: [
                            { translateX: loadPointerDotX },
                            { translateY: loadPointerDotY },
                          ],
                        },
                      ]}
                    />
                  </View>
                )}

                <View
                  style={[
                    styles.infoBubble,
                    responsiveBubbleStyle,
                    styles.pvBubble,
                    getResponsiveBubblePositionStyle(
                      "pv",
                      houseOverlayWidth,
                      houseOverlayHeight,
                      bubbleScale,
                    ),
                  ]}
                  onLayout={({ nativeEvent }) =>
                    setPvBubbleLayout(nativeEvent.layout)
                  }
                >
                  <Text style={[styles.infoBubbleLabel, responsiveBubbleLabelStyle]}>
                    PV
                  </Text>
                  <Text style={[styles.infoBubbleValue, responsiveBubbleValueStyle]}>
                    {formatKwValue(plantData.production)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoBubble,
                    responsiveBubbleStyle,
                    styles.gridBubble,
                    getResponsiveBubblePositionStyle(
                      "grid",
                      houseOverlayWidth,
                      houseOverlayHeight,
                      bubbleScale,
                    ),
                  ]}
                  onLayout={({ nativeEvent }) =>
                    setGridBubbleLayout(nativeEvent.layout)
                  }
                >
                  <Text style={[styles.infoBubbleLabel, responsiveBubbleLabelStyle]}>
                    Grid
                  </Text>
                  <Text style={[styles.infoBubbleValue, responsiveBubbleValueStyle]}>
                    {formatKwValue(plantData.grid)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoBubble,
                    responsiveBubbleStyle,
                    styles.batteryBubble,
                    gridBubbleLayout && {
                      width:
                        gridBubbleLayout.width +
                        BATTERY_BUBBLE_CONFIG.widthExtra * bubbleScale,
                      height:
                        gridBubbleLayout.height +
                        BATTERY_BUBBLE_CONFIG.heightExtra * bubbleScale,
                    },
                    getResponsiveBubblePositionStyle(
                      "battery",
                      houseOverlayWidth,
                      houseOverlayHeight,
                      bubbleScale,
                    ),
                  ]}
                  onLayout={({ nativeEvent }) =>
                    setBatteryBubbleLayout(nativeEvent.layout)
                  }
                >
                  <Text style={[styles.batteryLabel, responsiveBatteryLabelStyle]}>
                    Battery
                  </Text>
                  <Text
                    style={[styles.batteryValue, responsiveBatteryValueStyle]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {formatKwValue(plantData.battery)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoBubble,
                    responsiveBubbleStyle,
                    styles.loadBubble,
                    getResponsiveBubblePositionStyle(
                      "load",
                      houseOverlayWidth,
                      houseOverlayHeight,
                      bubbleScale,
                    ),
                  ]}
                  onLayout={({ nativeEvent }) =>
                    setLoadBubbleLayout(nativeEvent.layout)
                  }
                >
                  <Text style={[styles.infoBubbleLabel, responsiveBubbleLabelStyle]}>
                    Load
                  </Text>
                  <Text style={[styles.infoBubbleValue, responsiveBubbleValueStyle]}>
                    {formatKwValue(plantData.load)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.powerFlowWrapper}>
              <PowerFlowDiagram data={plantData} />
            </View>
          </View>

          <View style={styles.dashboardSection}>
            <View style={styles.dashboardMetricRow}>
              {dashboardMetricCards.map((item) => (
                <View key={item.key} style={styles.dashboardMetricCard}>
                  <Ionicons
                    name={item.icon}
                    size={DASHBOARD_LAYOUT.metricIconSize}
                    color={item.color}
                  />

                  <View style={styles.dashboardMetricTextBlock}>
                    <Text style={styles.dashboardMetricLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.dashboardMetricValue}>
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.energySourceCard}>
              <Text style={styles.dashboardSectionTitle}>
                Sumber Penggunaan Energi
              </Text>

              <View style={styles.energySourceRow}>
                {energySourceItems.map((item) => (
                  <View key={item.key} style={styles.energySourceItem}>
                    {item.iconLibrary === "FontAwesome5" ? (
                      <FontAwesome5
                        name={item.icon}
                        size={DASHBOARD_LAYOUT.sourceIconSize}
                        color={item.color}
                      />
                    ) : (
                      <Ionicons
                        name={item.icon}
                        size={DASHBOARD_LAYOUT.sourceIconSize}
                        color={item.color}
                      />
                    )}
                    <Text
                      style={[
                        styles.energySourcePercent,
                        { color: item.color },
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.energySourceBar}>
                {energySourceItems.map((item) => (
                  <View
                    key={item.key}
                    style={[
                      styles.energySourceBarSegment,
                      { flex: item.barFlex, backgroundColor: item.color },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.monthlySavingsSection}>
              <Text style={styles.dashboardSectionTitle}>
                Penghematan Bulanan
              </Text>
              <Text style={styles.dashboardSectionMeta}>
                Diperbaharui 10 menit yang lalu
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.monthlySavingsContent}
              >
                {monthlySavingItems.map((item) => (
                  <View key={item.key} style={styles.monthlySavingCard}>
                    <Text style={styles.monthlySavingMonth}>{item.month}</Text>
                    <Ionicons
                      name="sunny-outline"
                      size={DASHBOARD_LAYOUT.monthlyIconSize}
                      color="rgba(248,250,252,0.36)"
                    />
                    <Text style={styles.monthlySavingValue}>{item.value}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.environmentImpactCard}>
              {environmentImpactItems.map((item) => (
                <View key={item.key} style={styles.environmentImpactItem}>
                  <Ionicons
                    name={item.icon}
                    size={DASHBOARD_LAYOUT.impactIconSize}
                    color={appColors.accent}
                  />
                  <Text style={styles.environmentImpactValue}>
                    {item.value}
                  </Text>
                  <Text style={styles.environmentImpactLabel}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.segmentCard}>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === "day" && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveSegment("day")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeSegment === "day" && styles.segmentTextActive,
                  ]}
                >
                  Day
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === "month" && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveSegment("month")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeSegment === "month" && styles.segmentTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === "year" && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveSegment("year")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeSegment === "year" && styles.segmentTextActive,
                  ]}
                >
                  Year
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeSegment === "lifetime" && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveSegment("lifetime")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeSegment === "lifetime" && styles.segmentTextActive,
                  ]}
                >
                  Lifetime
                </Text>
              </TouchableOpacity>
            </View>

            {activeSegment === "day" ? (
              <View style={styles.dayPickerWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayPickerContent}
                >
                  {dayOptions.map((day) => {
                    const isSelected = day === selectedDay;

                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayChip,
                          isSelected && styles.dayChipActive,
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text
                          style={[
                            styles.dayChipText,
                            isSelected && styles.dayChipTextActive,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.dateText}>
                  {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
                </Text>
              </View>
            ) : activeSegment === "month" ? (
              <View style={styles.dayPickerWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayPickerContent}
                >
                  {monthOptions.map((month) => {
                    const isSelected = month.value === selectedMonth;

                    return (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.monthChip,
                          isSelected && styles.monthChipActive,
                        ]}
                        onPress={() => setSelectedMonth(month.value)}
                      >
                        <Text
                          style={[
                            styles.monthChipText,
                            isSelected && styles.monthChipTextActive,
                          ]}
                        >
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.dateText}>
                  {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
                </Text>
              </View>
            ) : activeSegment === "year" ? (
              <View style={styles.dayPickerWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayPickerContent}
                >
                  {yearOptions.map((year) => {
                    const isSelected = year === selectedYear;

                    return (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearChip,
                          isSelected && styles.yearChipActive,
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text
                          style={[
                            styles.yearChipText,
                            isSelected && styles.yearChipTextActive,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.dateText}>
                  {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
                </Text>
              </View>
            ) : (
              <View style={styles.dayPickerWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayPickerContent}
                >
                  {lifetimeOptions.map((range) => {
                    const isSelected = range === selectedLifetimeRange;

                    return (
                      <TouchableOpacity
                        key={range}
                        style={[
                          styles.yearChip,
                          isSelected && styles.yearChipActive,
                        ]}
                        onPress={() => setSelectedLifetimeRange(range)}
                      >
                        <Text
                          style={[
                            styles.yearChipText,
                            isSelected && styles.yearChipTextActive,
                          ]}
                        >
                          {range}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.dateText}>
                  {`${selectedLifetimeRange} Years`}
                </Text>
              </View>
            )}

            {(activeSegment === "day" ||
              activeSegment === "month" ||
              activeSegment === "year" ||
              activeSegment === "lifetime") && (
              <DailyOverviewChart
                series={dailySeries}
                chartWidth={overviewChartWidth}
                visibleSeries={visiblePowerSeries}
                onToggleSeries={togglePowerSeries}
                currentTime={chartCurrentTime}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  stickyTopBar: {
    width: "100%",
    alignSelf: "stretch",

    minHeight: PLANT_HEADER_BOX.minHeight,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: PLANT_HEADER_BOX.marginBottom,

    paddingVertical: PLANT_HEADER_BOX.paddingVertical,
    borderRadius: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: appColors.bubble,

    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderBottomColor: "rgba(8,174,234,0.22)",

    shadowColor: appColors.accent,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
    zIndex: 10,
  },
  headerCard: {
    marginHorizontal: WEATHER_LAYOUT.cardMarginHorizontal,
    marginTop: WEATHER_LAYOUT.cardMarginTop,
    marginBottom: WEATHER_LAYOUT.cardMarginBottom,
    paddingHorizontal: WEATHER_LAYOUT.cardPaddingHorizontal,
    paddingTop: WEATHER_LAYOUT.cardPaddingTop,
    paddingBottom: WEATHER_LAYOUT.cardPaddingBottom,
    borderRadius: WEATHER_LAYOUT.cardRadius,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.22)",
    shadowColor: appColors.accent,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
    justifyContent: "flex-start",
  },
  weatherTopRow: {
    minHeight: WEATHER_LAYOUT.topRowMinHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherMainInfo: {
    flex: 1,
    justifyContent: "center",
  },
  weatherCity: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.city,
    fontWeight: "700",
    letterSpacing: 0,
    marginBottom: WEATHER_LAYOUT.cityMarginBottom,
  },
  weatherCoordinates: {
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0,
    marginTop: -2,
    marginBottom: 0,
  },
  weatherTemp: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.temperature,
    lineHeight: WEATHER_FONT_SIZE.temperatureLineHeight,
    fontWeight: "700",
    letterSpacing: 0,
  },
  weatherStatus: {
    width: WEATHER_LAYOUT.statusWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
  },
  weatherIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,174,234,0.1)",
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.18)",
  },
  weatherCondition: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.condition,
    lineHeight: WEATHER_FONT_SIZE.conditionLineHeight,
    fontWeight: "600",
    letterSpacing: 0,
    marginTop: WEATHER_LAYOUT.conditionMarginTop,
    textAlign: "center",
    width: "100%",
  },
  weatherRange: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.range,
    lineHeight: WEATHER_FONT_SIZE.rangeLineHeight,
    fontWeight: "400",
    letterSpacing: 0,
    marginTop: WEATHER_LAYOUT.rangeMarginTop,
    textAlign: "center",
    width: "100%",
  },
  weatherDaysContent: {
    paddingRight: WEATHER_LAYOUT.daysPaddingRight,
  },
  weatherDayItem: {
    width: WEATHER_LAYOUT.dayItemWidth,
    alignItems: "center",
    marginRight: WEATHER_LAYOUT.dayItemGap,
  },
  weatherDayNumber: {
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.dayNumber,
    lineHeight: WEATHER_FONT_SIZE.dayNumberLineHeight,
    fontWeight: "400",
    letterSpacing: 0,
    marginBottom: WEATHER_LAYOUT.dayNumberMarginBottom,
  },
  weatherDayIcon: {
    marginBottom: WEATHER_LAYOUT.dayIconMarginBottom,
  },
  weatherDayTemp: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: WEATHER_FONT_SIZE.dayTemperature,
    lineHeight: WEATHER_FONT_SIZE.dayTemperatureLineHeight,
    fontWeight: "400",
    letterSpacing: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  leftHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },
  backButton: {
    width: PLANT_HEADER_BUTTON.backButtonSize,
    height: PLANT_HEADER_BUTTON.backButtonSize,
    justifyContent: "center",
    alignItems: "center",
    marginRight: PLANT_HEADER_BUTTON.backMarginRight,
    backgroundColor: "transparent",
    transform: [
      { translateX: PLANT_HEADER_BUTTON.backOffsetX },
      { translateY: PLANT_HEADER_BUTTON.backOffsetY },
    ],
  },
  plantName: {
    fontSize: PLANT_HEADER_TEXT.nameFontSize,
    lineHeight: PLANT_HEADER_TEXT.nameLineHeight,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
    letterSpacing: 0,
  },
  plantTitleBlock: {
    flex: 1,
  },
  plantMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: PLANT_HEADER_TEXT.productionMarginTop,
  },
  plantProductionMeta: {
    color: appColors.accent,
    fontFamily: appFont,
    fontSize: PLANT_HEADER_TEXT.productionFontSize,
    lineHeight: PLANT_HEADER_TEXT.productionLineHeight,
    fontWeight: "800",
    letterSpacing: 0,
  },
  menuButton: {
    width: PLANT_HEADER_BUTTON.menuButtonSize,
    height: PLANT_HEADER_BUTTON.menuButtonSize,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,7,19,0.38)",
    alignItems: "flex-end",
    paddingTop: 112,
    paddingRight: 24,
  },
  menuPopup: {
    width: 176,
    borderRadius: 18,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.22)",
    paddingVertical: 8,
    shadowColor: appColors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemText: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "600",
  },
  menuItemDanger: {
    color: "#EF4444",
  },
  refreshLoadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,7,19,0.72)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  refreshLoadingCard: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.2)",
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: appColors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  refreshLoadingTitle: {
    marginTop: 16,
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0,
  },
  refreshLoadingText: {
    marginTop: 6,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0,
    textAlign: "center",
  },
  content: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  fetchStatusStack: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  fetchStatusCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  fetchStatusCardError: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.35)",
  },
  fetchStatusCardWarning: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.3)",
  },
  fetchStatusTitle: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
  },
  fetchStatusText: {
    marginTop: 4,
    color: appColors.textSoft,
    fontFamily: appFont,
    fontSize: 13,
    lineHeight: 18,
  },
  dashboardSection: {
    marginTop: DASHBOARD_LAYOUT.sectionMarginTop,
    marginBottom: DASHBOARD_LAYOUT.sectionMarginBottom,
  },
  dashboardMetricRow: {
    flexDirection: "row",
    gap: DASHBOARD_LAYOUT.cardGap,
  },
  dashboardMetricCard: {
    flex: 1,
    minHeight: DASHBOARD_LAYOUT.metricCardHeight,
    borderRadius: DASHBOARD_LAYOUT.cardRadius,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.14)",
    paddingHorizontal: DASHBOARD_LAYOUT.metricCardPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: appColors.accent,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  dashboardMetricTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  dashboardMetricLabel: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.metricLabel,
    lineHeight: DASHBOARD_FONT_SIZE.metricLabel + 4,
    fontWeight: "500",
    letterSpacing: 0,
    flexShrink: 1,
  },
  dashboardMetricValue: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.metricValue,
    lineHeight: DASHBOARD_FONT_SIZE.metricValue + 5,
    fontWeight: "500",
    letterSpacing: 0,
    marginTop: 4,
  },
  energySourceCard: {
    marginTop: DASHBOARD_LAYOUT.cardGap + 10,
    borderRadius: DASHBOARD_LAYOUT.cardRadius,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.14)",
    padding: DASHBOARD_LAYOUT.sourceCardPadding,
    shadowColor: appColors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  dashboardSectionTitle: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.sectionTitle,
    lineHeight: DASHBOARD_FONT_SIZE.sectionTitle + 7,
    fontWeight: "700",
    letterSpacing: 0,
  },
  dashboardSectionMeta: {
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.sectionMeta,
    lineHeight: DASHBOARD_FONT_SIZE.sectionMeta + 6,
    fontWeight: "400",
    letterSpacing: 0,
    marginTop: 1,
  },
  sectionEmptyText: {
    marginTop: 16,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 14,
    lineHeight: 20,
  },
  energySourceRow: {
    marginTop: DASHBOARD_LAYOUT.sourceRowMarginTop,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  energySourceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 88,
  },
  energySourcePercent: {
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.sourcePercent,
    lineHeight: DASHBOARD_FONT_SIZE.sourcePercent + 6,
    fontWeight: "500",
    letterSpacing: 0,
    marginLeft: 10,
  },
  energySourceBar: {
    height: DASHBOARD_LAYOUT.sourceBarHeight,
    borderRadius: DASHBOARD_LAYOUT.sourceBarHeight,
    marginTop: DASHBOARD_LAYOUT.sourceBarMarginTop,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  energySourceBarSegment: {
    height: "100%",
  },
  monthlySavingsSection: {
    marginTop: DASHBOARD_LAYOUT.monthlyMarginTop,
  },
  monthlySavingsContent: {
    paddingTop: 22,
    paddingRight: 18,
  },
  monthlySavingCard: {
    width: DASHBOARD_LAYOUT.monthlyCardWidth,
    minHeight: DASHBOARD_LAYOUT.monthlyCardHeight,
    borderRadius: DASHBOARD_LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: "rgba(248,250,252,0.1)",
    backgroundColor: "rgba(17,24,39,0.44)",
    marginRight: DASHBOARD_LAYOUT.monthlyCardGap,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 28,
    shadowColor: appColors.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  monthlySavingMonth: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.monthTitle,
    lineHeight: DASHBOARD_FONT_SIZE.monthTitle + 6,
    fontWeight: "700",
    letterSpacing: 0,
  },
  monthlySavingValue: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.monthValue,
    lineHeight: DASHBOARD_FONT_SIZE.monthValue + 6,
    fontWeight: "400",
    letterSpacing: 0,
  },
  environmentImpactCard: {
    marginTop: DASHBOARD_LAYOUT.impactCardMarginTop,
    borderRadius: DASHBOARD_LAYOUT.cardRadius,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.14)",
    paddingVertical: DASHBOARD_LAYOUT.impactCardPaddingVertical,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    shadowColor: appColors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  environmentImpactItem: {
    flex: 1,
    alignItems: "center",
  },
  environmentImpactValue: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.impactValue,
    lineHeight: DASHBOARD_FONT_SIZE.impactValue + 7,
    fontWeight: "400",
    letterSpacing: 0,
    marginTop: 14,
  },
  environmentImpactLabel: {
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: DASHBOARD_FONT_SIZE.impactLabel,
    lineHeight: DASHBOARD_FONT_SIZE.impactLabel + 5,
    fontWeight: "400",
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 4,
  },
  powerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 10,
  },
  powerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.18)",
  },
  powerRightTitle: {
    fontSize: 16,
    color: "#374151",
  },
  gridStatus: {
    marginTop: 4,
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },
  segmentCard: {
    marginTop: 16,
    backgroundColor: appColors.bubble,
    borderRadius: WEATHER_LAYOUT.cardRadius,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.22)",
    shadowColor: appColors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    overflow: "hidden",
  },
  segmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: appColors.input,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentButtonActive: {
    backgroundColor: appColors.accent,
  },
  segmentText: {
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 14,
  },
  segmentTextActive: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 28,
    color: "#6B7280",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: appColors.textSoft,
    fontFamily: appFont,
  },
  chartSection: {
    marginTop: 14,
    paddingTop: 2,
  },
  chartCurrentTimeText: {
    color: appColors.textSoft,
    fontFamily: appFont,
    fontSize: POWER_CHART_LAYOUT.currentTimeFontSize,
    fontWeight: "600",
    letterSpacing: 0,
    marginBottom: 4,
    textAlign: "center",
  },
  chartEmptyStateText: {
    marginTop: 8,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 13,
    textAlign: "center",
  },
  chartSwitchRow: {
    marginTop: POWER_CHART_LAYOUT.switchMarginTop,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: POWER_CHART_LAYOUT.switchGap,
  },
  chartSwitchButton: {
    width: POWER_CHART_LAYOUT.switchWidth,
    height: POWER_CHART_LAYOUT.switchHeight,
    borderRadius: POWER_CHART_LAYOUT.switchHeight / 2,
    padding: POWER_CHART_LAYOUT.switchPadding,
    justifyContent: "center",
  },
  chartSwitchKnob: {
    width:
      POWER_CHART_LAYOUT.switchHeight - POWER_CHART_LAYOUT.switchPadding * 2,
    height:
      POWER_CHART_LAYOUT.switchHeight - POWER_CHART_LAYOUT.switchPadding * 2,
    borderRadius: POWER_CHART_LAYOUT.switchHeight / 2,
  },
  dayScrollContent: {
    paddingRight: 12,
  },
  dateRowCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayPickerWrap: {
    marginBottom: 8,
  },
  dayPickerContent: {
    paddingRight: 12,
    paddingBottom: 8,
  },
  dayChip: {
    minWidth: 42,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "transparent",
  },
  dayChipActive: {
    backgroundColor: appColors.accent,
    borderColor: appColors.accent,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  dayChipTextActive: {
    color: appColors.text,
  },
  monthChip: {
    minWidth: 96,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  monthChipActive: {
    backgroundColor: appColors.accent,
    borderColor: appColors.accent,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  monthChipTextActive: {
    color: appColors.text,
  },
  yearChip: {
    minWidth: 74,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  yearChipActive: {
    backgroundColor: appColors.accent,
    borderColor: appColors.accent,
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  yearChipTextActive: {
    color: appColors.text,
  },
  powerFlowSection: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  houseImageOnly: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  houseImage: {
    width: "100%",
  },
  powerFlowWrapper: {
    backgroundColor: appColors.bubble,
    borderRadius: WEATHER_LAYOUT.cardRadius,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(8,174,234,0.22)",
    shadowColor: appColors.accent,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    overflow: "hidden",
    alignItems: "center",
  },
  houseOverlayWrap: {
    position: "relative",
    width: "100%",
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  gridPointerOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  gridPointerDotGlow: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridPointerDot: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  infoBubble: {
    position: "absolute",
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  infoBubbleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  infoBubbleSub: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 1,
  },
  infoBubbleValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  pvBubble: {
    maxWidth: 118,
  },
  gridBubble: {
    maxWidth: 118,
  },
  batteryBubble: {
    maxWidth: 118,
  },
  loadBubble: {
    maxWidth: 118,
  },
  batteryLabel: {
    fontSize: BATTERY_BUBBLE_CONFIG.titleFontSize,
    fontWeight: BATTERY_BUBBLE_CONFIG.titleFontWeight,
    color: "#1F2937",
  },
  batteryValue: {
    fontSize: BATTERY_BUBBLE_CONFIG.valueFontSize,
    fontWeight: BATTERY_BUBBLE_CONFIG.valueFontWeight,
    color: "#111827",
    marginTop: 2,
  },
});
