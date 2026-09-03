//===== (Layout Constants) ======

// Atur layout PowerFlowDiagram dari sini.
export const POWER_FLOW_LAYOUT = {
  containerPaddingTop: 8,
  containerPaddingBottom: 16,
  containerPaddingHorizontal: 8,
  containerMinHeight: 370,
  sideColumnWidth: 76,
  sideColumnGap: 24,
  metricBlockWidth: 76,
  metricBlockHeight: 108,
  metricIconHeight: 48,
  metricIconMarginBottom: 2,
  metricTitleHeight: 30,
  metricValueHeight: 32,
  metricValueMarginTop: 3,
  centerSectionWidth: 225,
  ringSize: 238,
  centerContentTop: 76,
  gridBlockWidth: 112,
  gridBlockHeight: 110,
  gridBlockMarginTop: 10,
  gridIconMarginBottom: 4,
};

//===== (Color Constants) ======

export const POWER_FLOW_COLORS = {
  pv: "#1FB7FF",
  grid: "#FF9300",
  battery: "#99E500",
};

export const PRODUCTION_FLOW_COLORS = {
  pv: "#EF4444",
  grid: "#4F46E5",
  battery: "#A855F7",
};

//===== (Ring Constants) ======

export const POWER_FLOW_RING = {
  radius: 76,
  circumference: 477,
  joinOverlapAngle: 0.8,
  rotationOffset: 30,
  glowStrokeWidth: 10,
  glowOpacity: 0.22,
};

// Atur sudut, panjang, dan ketebalan warna ring PowerFlowDiagram dari sini.
export const POWER_FLOW_SEGMENTS = {
  pv: {
    startAngle: 210,
    endAngle: 330,
    proportion: 0.27,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
  battery: {
    startAngle: 330,
    endAngle: 90,
    proportion: 0.2,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
  grid: {
    startAngle: 90,
    endAngle: 210,
    proportion: 0.3,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
};

export const POWER_FLOW_SEGMENT_ORDER = ["pv", "battery", "grid"];

//===== (Typography Constants) ======

// Atur posisi dan ukuran teks tengah lingkaran dari sini.
export const POWER_FLOW_CENTER_TEXT_CONFIG = {
  titleOffsetY: 6,
  valueOffsetY: 3,
  titleFontSize: 18,
  valueFontSize: 28,
  titleLineHeight: 22,
  valueLineHeight: 31,
  unitFontSize: 10,
};

// Atur posisi dan ukuran logo/nama/nilai/persen setiap segment dari sini.
export const POWER_FLOW_SEGMENT_LABEL_CONFIG = {
  pv: {
    iconOffsetY: 0,
    nameOffsetY: 0,
    valueOffsetY: 0,
    percentOffsetY: 0,
    iconSize: 38,
    nameFontSize: 12,
    valueFontSize: 20,
    unitFontSize: 10,
    percentFontSize: 14,
  },
  grid: {
    iconOffsetY: 0,
    nameOffsetY: 0,
    valueOffsetY: 0,
    percentOffsetY: 0,
    iconSize: 28,
    nameFontSize: 12,
    valueFontSize: 20,
    unitFontSize: 10,
    percentFontSize: 14,
  },
  battery: {
    iconOffsetY: 0,
    nameOffsetY: 0,
    valueOffsetY: 0,
    percentOffsetY: 0,
    iconSize: 34,
    nameFontSize: 12,
    valueFontSize: 20,
    unitFontSize: 10,
    percentFontSize: 14,
  },
};

// Atur ukuran font setiap angka 0kW secara manual dari sini.
export const POWER_FLOW_FONT_SIZE = {
  pv: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  battery: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  grid: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  center: {
    label: POWER_FLOW_CENTER_TEXT_CONFIG.titleFontSize,
    labelLineHeight: POWER_FLOW_CENTER_TEXT_CONFIG.titleLineHeight,
    value: POWER_FLOW_CENTER_TEXT_CONFIG.valueFontSize,
    valueLineHeight: POWER_FLOW_CENTER_TEXT_CONFIG.valueLineHeight,
    unit: POWER_FLOW_CENTER_TEXT_CONFIG.unitFontSize,
  },
};
