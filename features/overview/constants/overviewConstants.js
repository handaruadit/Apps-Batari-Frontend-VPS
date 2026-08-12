//===== (Overview Constants) ======
//===== (CHART_HEIGHT) ======
export const CHART_HEIGHT = 250;

//===== (LANDSCAPE_CHART_LAYOUT) ======
export const LANDSCAPE_CHART_LAYOUT = {
  horizontalPadding: 2,
  headerHeight: 44,
  bottomPadding: 2,
  minHeight: 300,
  axisTopPadding: 34,
  axisRightPadding: 42,
  axisBottomPadding: 26,
  axisLeftPadding: 38,
};

//===== (DEBUG_CHART) ======
export const DEBUG_CHART = process.env.EXPO_PUBLIC_DEBUG_CHART === "true";

//===== (DEBUG_LAYOUT) ======
export const DEBUG_LAYOUT = process.env.EXPO_PUBLIC_DEBUG_LAYOUT === "true";

//===== (WEATHER_LAYOUT) ======
export const WEATHER_LAYOUT = {
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

//========== POWER SERIES ==========
export const POWER_SERIES_CONFIG = [
  {
    key: "production",
    labelKey: "pv",
    label: "PV",
    color: "#1FB7FF",
    group: "consumption",
  },
  {
    key: "load",
    labelKey: "load",
    label: "Load",
    color: "#B96CFF",
    group: "consumption",
  },
  {
    key: "grid",
    labelKey: "grid",
    label: "Grid",
    color: "#FF9300",
    group: "consumption",
  },
  {
    key: "battery",
    labelKey: "battery",
    label: "Battery",
    color: "#99E500",
    group: "consumption",
  },
  {
    key: "pvGenerate",
    labelKey: "pvGenerate",
    label: "PV Generate",
    color: "#EF4444",
    group: "production",
  },
];

//========== ENERGY SERIES ==========
export const ENERGY_SERIES_CONFIG = [
  {
    key: "production",
    labelKey: "pv",
    label: "PV",
    color: "#1FB7FF",
    group: "consumption",
  },
  {
    key: "load",
    labelKey: "load",
    label: "Load",
    color: "#B96CFF",
    group: "consumption",
  },
  {
    key: "grid",
    labelKey: "grid",
    label: "Grid",
    color: "#FF9300",
    group: "consumption",
  },
  {
    key: "battery",
    labelKey: "battery",
    label: "Battery",
    color: "#99E500",
    group: "consumption",
  },
  {
    key: "pvGenerate",
    labelKey: "pvGenerate",
    label: "PV Generate",
    color: "#EF4444",
    group: "production",
  },
];

//========== SOC SERIES ==========
export const SOC_SERIES_CONFIG = {
  key: "soc",
  labelKey: "soc",
  label: "SoC",
  color: "#FACC15",
  group: "battery",
};

export const DAY_SERIES_CONFIG = [
  ...POWER_SERIES_CONFIG,
  SOC_SERIES_CONFIG,
];

export const SOC_SELECTED_INFO_CONFIG = SOC_SERIES_CONFIG;

//===== (SELECTED_INFO_PRIMARY_KEYS) ======
export const SELECTED_INFO_PRIMARY_KEYS = ["production", "grid", "battery", "load"];

//===== (SOC_FIELD_KEYS) ======
export const SOC_FIELD_KEYS = [
  "soc",
  "SoC",
  "SOC",
  "batterySoc",
  "battery_soc",
  "stateOfCharge",
  "state_of_charge",
  "batteryStateOfCharge",
  "socPercent",
  "socPercentage",
  "batterySocPercent",
  "batterySocPercentage",
];

//===== (GENERIC_PERCENT_FIELD_KEYS) ======
export const GENERIC_PERCENT_FIELD_KEYS = ["percent", "percentage"];

//===== (SELECTED_PERCENT_FIELD_KEYS) ======
export const SELECTED_PERCENT_FIELD_KEYS = {
  production: [
    "pvPercent",
    "pvPercentage",
    "productionPercent",
    "productionPercentage",
  ],
  grid: ["gridPercent", "gridPercentage"],
  battery: ["batteryPercent", "batteryPercentage"],
  load: ["loadPercent", "loadPercentage", "consumptionPercent"],
  pvGenerate: ["pvGeneratePercent", "pvGeneratePercentage"],
  export: ["exportPercent", "exportPercentage"],
  charge: ["chargePercent", "chargePercentage"],
  soc: ["socPercent", "socPercentage", ...SOC_FIELD_KEYS],
};

//===== (SELECTED_PERCENT_CATEGORY_KEYS) ======
export const SELECTED_PERCENT_CATEGORY_KEYS = {
  pv: ["production"],
  grid: ["grid"],
  battery: ["battery"],
  load: ["load"],
};

//===== (OVERVIEW_CHART_SWITCH_STORAGE_KEY) ======
export const OVERVIEW_CHART_SWITCH_STORAGE_KEY = "overviewChartSeriesVisibility:v3";

//===== (MENU_TOP_OFFSET) ======
export const MENU_TOP_OFFSET = 20;

//===== (MENU_RIGHT_OFFSET) ======
export const MENU_RIGHT_OFFSET = 24;

//===== (LOWER_POWER_FLOW_SOURCE_ROUTE) ======
export const LOWER_POWER_FLOW_SOURCE_ROUTE = "local://power-flow/production";

//===== (LOWER_POWER_FLOW_DUMMY_DATA) ======
export const LOWER_POWER_FLOW_DUMMY_DATA = {
  pvGenerateKwh: 3.45,
  chargeKwh: 1.28,
  exportKwh: 0.86,
};

//===== (BUBBLE_POSITION_CONFIG) ======
export const BUBBLE_POSITION_CONFIG = {
  bubbleLeftPct: 0.02,
};

//===== (POWER_FLOW_OVERLAY_LAYOUT) ======
export const POWER_FLOW_OVERLAY_LAYOUT = {
  baselineWidth: 390,
  baselineHeight: 360,
  minScale: 0.86,
  maxScale: 1,
  minHeight: 340,
  maxHeight: 360,
  bubbleWidth: 96,
  bubbleHeight: 58,
  bubblePaddingHorizontal: 8,
  bubblePaddingVertical: 6,
  bubbleBorderRadius: 18,
  bubbleLabelFontSize: 14,
  bubbleValueFontSize: 16,
};

//===== (BATTERY_BUBBLE_CONFIG) ======
export const BATTERY_BUBBLE_CONFIG = {
  widthExtra: 10, // tambah lebar Battery dari ukuran Grid
  heightExtra: 0,
  titleFontSize: 14,
  valueFontSize: 16,
  titleFontWeight: "700",
  valueFontWeight: "800",
};

//===== (MANUAL_BUBBLE_OFFSET) ======
export const MANUAL_BUBBLE_OFFSET = {
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

//===== (BUBBLE_LINE_CONFIG) ======
export const BUBBLE_LINE_CONFIG = {
  grid: {
    offsetX: 0,
    offsetY: 5,
    startOffsetX: 0,
    startOffsetY: -5,
    bendOffsetX: 0,
    bendOffsetY: -25,
    endOffsetX: 0,
    endOffsetY: -10,
    leadLength: 70,
    length: 1,
    verticalLength: 103,
    endAnchorPctX: 1,
    endAnchorPctY: 0.85,
    showEndHorizontalLine: false,
  },
  pv: {
    offsetX: 0,
    offsetY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    bendOffsetX: 0,
    bendOffsetY: 0,
    endOffsetX: 0,
    endOffsetY: 0,
    length: 70,
    verticalLength: 86,
    endAnchorPctX: 0.5,
    endAnchorPctY: 0.5,
  },
  battery: {
    offsetX: 0,
    offsetY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    bendOffsetX: 0,
    bendOffsetY: 0,
    endOffsetX: 0,
    endOffsetY: 0,
    length: 85,
    verticalLength: 80,
    endAnchorPctX: 0.4,
    endAnchorPctY: 0.59,
  },
  load: {
    offsetX: 0,
    offsetY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    bendOffsetX: 0,
    bendOffsetY: 0,
    endOffsetX: 0,
    endOffsetY: 0,
    length: 25,
    verticalLength: 85,
    endAnchorPctX: 0.5,
    endAnchorPctY: 0.5,
  },
  upsLoad: {
    offsetX: 0,
    offsetY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    bendOffsetX: 0,
    bendOffsetY: 0,
    endOffsetX: 0,
    endOffsetY: 0,
    length: 25,
    verticalLength: 80,
    endAnchorPctX: 0.5,
    endAnchorPctY: 0.5,
  },
};

//===== (GRID_POINTER_CONFIG) ======
export const GRID_POINTER_CONFIG = {
  lineOffsetX: BUBBLE_LINE_CONFIG.grid.offsetX,
  lineOffsetY: BUBBLE_LINE_CONFIG.grid.offsetY,
  lineStartOffsetX: BUBBLE_LINE_CONFIG.grid.startOffsetX,
  lineStartOffsetY: BUBBLE_LINE_CONFIG.grid.startOffsetY,
  startLeadLength: BUBBLE_LINE_CONFIG.grid.leadLength,
  lineBendOffsetX: BUBBLE_LINE_CONFIG.grid.bendOffsetX,
  lineBendOffsetY: BUBBLE_LINE_CONFIG.grid.bendOffsetY,
  lineEndOffsetX: BUBBLE_LINE_CONFIG.grid.endOffsetX,
  lineEndOffsetY: BUBBLE_LINE_CONFIG.grid.endOffsetY,
  verticalLineLength: BUBBLE_LINE_CONFIG.grid.verticalLength,
  horizontalLineLength: BUBBLE_LINE_CONFIG.grid.length,
  lineEndAnchorPctX: BUBBLE_LINE_CONFIG.grid.endAnchorPctX,
  lineEndAnchorPctY: BUBBLE_LINE_CONFIG.grid.endAnchorPctY,
  showEndHorizontalLine: BUBBLE_LINE_CONFIG.grid.showEndHorizontalLine,
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

//===== (BATTERY_POINTER_CONFIG) ======
export const BATTERY_POINTER_CONFIG = {
  lineOffsetX: BUBBLE_LINE_CONFIG.battery.offsetX,
  lineOffsetY: BUBBLE_LINE_CONFIG.battery.offsetY,
  lineStartOffsetX: BUBBLE_LINE_CONFIG.battery.startOffsetX,
  lineStartOffsetY: BUBBLE_LINE_CONFIG.battery.startOffsetY,
  lineBendOffsetX: BUBBLE_LINE_CONFIG.battery.bendOffsetX,
  lineBendOffsetY: BUBBLE_LINE_CONFIG.battery.bendOffsetY,
  lineEndOffsetX: BUBBLE_LINE_CONFIG.battery.endOffsetX,
  lineEndOffsetY: BUBBLE_LINE_CONFIG.battery.endOffsetY,
  horizontalLineLength: BUBBLE_LINE_CONFIG.battery.length,
  verticalLineLength: BUBBLE_LINE_CONFIG.battery.verticalLength,
  lineEndAnchorPctX: BUBBLE_LINE_CONFIG.battery.endAnchorPctX,
  lineEndAnchorPctY: BUBBLE_LINE_CONFIG.battery.endAnchorPctY,
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

//===== (PV_POINTER_CONFIG) ======
export const PV_POINTER_CONFIG = {
  lineOffsetX: BUBBLE_LINE_CONFIG.pv.offsetX,
  lineOffsetY: BUBBLE_LINE_CONFIG.pv.offsetY,
  lineStartOffsetX: BUBBLE_LINE_CONFIG.pv.startOffsetX,
  lineStartOffsetY: BUBBLE_LINE_CONFIG.pv.startOffsetY,
  lineBendOffsetX: BUBBLE_LINE_CONFIG.pv.bendOffsetX,
  lineBendOffsetY: BUBBLE_LINE_CONFIG.pv.bendOffsetY,
  lineEndOffsetX: BUBBLE_LINE_CONFIG.pv.endOffsetX,
  lineEndOffsetY: BUBBLE_LINE_CONFIG.pv.endOffsetY,
  horizontalLineLength: BUBBLE_LINE_CONFIG.pv.length,
  verticalLineLength: BUBBLE_LINE_CONFIG.pv.verticalLength,
  lineEndAnchorPctX: BUBBLE_LINE_CONFIG.pv.endAnchorPctX,
  lineEndAnchorPctY: BUBBLE_LINE_CONFIG.pv.endAnchorPctY,
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

//===== (LOAD_POINTER_CONFIG) ======
export const LOAD_POINTER_CONFIG = {
  lineOffsetX: BUBBLE_LINE_CONFIG.load.offsetX,
  lineOffsetY: BUBBLE_LINE_CONFIG.load.offsetY,
  lineStartOffsetX: BUBBLE_LINE_CONFIG.load.startOffsetX,
  lineStartOffsetY: BUBBLE_LINE_CONFIG.load.startOffsetY,
  lineBendOffsetX: BUBBLE_LINE_CONFIG.load.bendOffsetX,
  lineBendOffsetY: BUBBLE_LINE_CONFIG.load.bendOffsetY,
  lineEndOffsetX: BUBBLE_LINE_CONFIG.load.endOffsetX,
  lineEndOffsetY: BUBBLE_LINE_CONFIG.load.endOffsetY,
  horizontalLineLength: BUBBLE_LINE_CONFIG.load.length,
  verticalLineLength: BUBBLE_LINE_CONFIG.load.verticalLength,
  lineEndAnchorPctX: BUBBLE_LINE_CONFIG.load.endAnchorPctX,
  lineEndAnchorPctY: BUBBLE_LINE_CONFIG.load.endAnchorPctY,
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

//===== (BUBBLE_BASE_POSITION) ======
export const BUBBLE_BASE_POSITION = {
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

//===== (POWER_LATEST_ENDPOINT_CONFIG) ======
export const POWER_LATEST_ENDPOINT_CONFIG = [
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

//===== (POWER_CATEGORY_ALIASES) ======
export const POWER_CATEGORY_ALIASES = {
  pv: ["pv", "solar"],
  production: ["production"],
  grid: ["grid"],
  battery: ["battery", "baterai"],
  load: ["load", "out"],
};

//===== (POWER_TYPE_ALIASES) ======
export const POWER_TYPE_ALIASES = {
  power: ["power"],
  chargePower: ["chargePower", "charge_power", "chargepower"],
  vaPower: ["vaPower", "va_power", "vapower"],
  pvGenerate: ["pvGenerate", "pv_generate", "pvgenerate"],
  soc: ["soc", "stateOfCharge", "state_of_charge"],
};

//===== (POWER_CHART_LAYOUT) ======
export const POWER_CHART_LAYOUT = {
  paddingTop: 24,
  paddingRight: 12,
  paddingBottom: 34,
  paddingLeft: 44,
  axisTitleFontSize: 13,
  axisLabelFontSize: 11,
  timeLabelFontSize: 12,
  currentTimeFontSize: 13,
  lineStrokeWidth: 1.6,
  pointRadius: 3.5,
  switchWidth: 44,
  switchHeight: 22,
  switchPadding: 3,
  switchGap: 9,
  switchMarginTop: 10,
};

//===== (POWER_CHART_AGGREGATE_UNIT_FALLBACK) ======
export const POWER_CHART_AGGREGATE_UNIT_FALLBACK = "kWh";

//===== (POWER_CHART_TIME_TICKS) ======
export const POWER_CHART_TIME_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

//===== (POWER_CHART_DAY_CHIP_STEP) ======
export const POWER_CHART_DAY_CHIP_STEP = 50;

//===== (POWER_CHART_MONTH_CHIP_STEP) ======
export const POWER_CHART_MONTH_CHIP_STEP = 104;

//===== (MONITORING_ONLINE_THRESHOLD_MS) ======
export const MONITORING_ONLINE_THRESHOLD_MS = 15 * 60 * 1000;

//===== (ZERO_ENERGY_VALUES) ======
export const ZERO_ENERGY_VALUES = {
  energy: {
    consumptionKwh: 0,
    batteryKwh: 0,
    gridKwh: 0,
    totalKwh: 0,
  },
  energyPercent: {
    batteryPercent: 0,
    consumptionPercent: 0,
    gridPercent: 0,
  },
};

//===== (ZERO_POWER_VALUES) ======
export const ZERO_POWER_VALUES = {
  production: 0,
  pv: 0,
  grid: 0,
  battery: 0,
  upsLoad: 0,
  load: 0,
};

//===== (POWER_CHART_RESPONSIVE_WIDTH) ======
export const POWER_CHART_RESPONSIVE_WIDTH = {
  min: 240,
  max: 720,
  horizontalGap: 56,
  compactInnerWidth: 260,
  mediumInnerWidth: 340,
};

//===== (PLANT_HEADER_BOX) ======
export const PLANT_HEADER_BOX = {
  minHeight: 64,
  marginHorizontal: 0,
  marginTop: 0,
  marginBottom: 4,
  paddingHorizontal: 24,
  paddingVertical: 0,
  borderRadius: 0,
};

//===== (PLANT_HEADER_TEXT) ======
export const PLANT_HEADER_TEXT = {
  nameFontSize: 16,
  nameLineHeight: 22,
  productionFontSize: 20,
  productionLineHeight: 24,
  productionMarginTop: 2,
};

//===== (PLANT_HEADER_BUTTON) ======
export const PLANT_HEADER_BUTTON = {
  backButtonSize: 40,
  backIconSize: 40,
  backOffsetX: -20,
  backOffsetY: 0,
  backMarginRight: 14,
  menuButtonSize: 42,
  menuIconSize: 24,
};

//===== (DEMO_POWER_VALUES) ======
export const DEMO_POWER_VALUES = {
  production: 2.35,
  pv: 2.35,
  grid: 0.42,
  battery: -0.28,
  upsLoad: 0.86,
  load: 1.54,
  pvGenerate: 2.35,
  export: 0.42,
  charge: 0.28,
};

//===== (DEMO_ENERGY_VALUES) ======
export const DEMO_ENERGY_VALUES = {
  energy: {
    consumptionKwh: 4.8,
    batteryKwh: 1.4,
    gridKwh: 0.9,
    totalKwh: 7.1,
  },
  energyPercent: {
    batteryPercent: 20,
    consumptionPercent: 68,
    gridPercent: 12,
  },
};
