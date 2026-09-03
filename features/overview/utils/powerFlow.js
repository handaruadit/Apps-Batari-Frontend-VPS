//===== (Imports) ======
import { Easing } from "react-native";
import {
  BATTERY_POINTER_CONFIG,
  BUBBLE_BASE_POSITION,
  DAY_SERIES_CONFIG,
  GRID_POINTER_CONFIG,
  LOAD_POINTER_CONFIG,
  LOWER_POWER_FLOW_DUMMY_DATA,
  LOWER_POWER_FLOW_SOURCE_ROUTE,
  MANUAL_BUBBLE_OFFSET,
  POWER_FLOW_OVERLAY_LAYOUT,
  POWER_SERIES_CONFIG,
  PV_POINTER_CONFIG,
  SELECTED_INFO_PRIMARY_KEYS,
  SOC_SELECTED_INFO_CONFIG,
} from "../constants/overviewConstants";
import { getApiNumber } from "./apiData";
import { normalizeSeriesRows } from "./powerData";
//===== (Power Flow Utilities) ======
//===== (getPowerSeriesLabel) ======
export const getPowerSeriesLabel = (item, t) => t(item?.labelKey) || item?.label || "";

//===== (getSelectedInfoConfig) ======
export function getSelectedInfoConfig() {
  const primaryItems = SELECTED_INFO_PRIMARY_KEYS.map((key) =>
    POWER_SERIES_CONFIG.find((item) => item.key === key),
  ).filter(Boolean);
  const primaryKeySet = new Set(SELECTED_INFO_PRIMARY_KEYS);
  const extraItems = POWER_SERIES_CONFIG.filter(
    (item) => !primaryKeySet.has(item.key),
  );

  return [...primaryItems, ...extraItems, SOC_SELECTED_INFO_CONFIG];
}

//===== (getDefaultVisiblePowerSeries) ======
export const getDefaultVisiblePowerSeries = () =>
  DAY_SERIES_CONFIG.reduce((items, item) => {
    items[item.key] = item.key === "production" || item.key === "load";
    return items;
  }, {});

//===== (buildLowerPowerFlowData) ======
export function buildLowerPowerFlowData(sourceData = {}) {
  const pvGenerateKwh = Number(sourceData.pvGenerateKwh || 0);
  const chargeKwh = Number(sourceData.chargeKwh || 0);
  const exportKwh = Number(sourceData.exportKwh || 0);
  const totalProductionKwh = pvGenerateKwh + chargeKwh + exportKwh;
  const hasTotal = totalProductionKwh !== 0;

  return {
    sourceRoute: LOWER_POWER_FLOW_SOURCE_ROUTE,
    productionFlow: {
      pvGenerateKwh,
      chargeKwh,
      exportKwh,
      totalProductionKwh,
    },
    productionFlowPercent: {
      pvGeneratePercent: hasTotal
        ? (pvGenerateKwh / totalProductionKwh) * 100
        : 0,
      chargePercent: hasTotal ? (chargeKwh / totalProductionKwh) * 100 : 0,
      exportPercent: hasTotal ? (exportKwh / totalProductionKwh) * 100 : 0,
    },
  };
}

//===== (getSeriesTotalValue) ======
export function getSeriesTotalValue(series) {
  return normalizeSeriesRows(series).reduce((total, row) => {
    const value = Number(getApiNumber(row));
    return Number.isFinite(value) ? total + Math.abs(value) : total;
  }, 0);
}

//===== (buildProductionPowerFlowData) ======
export function buildProductionPowerFlowData(plantData, useDemoData) {
  if (plantData?.isDeviceOnline === false) {
    return buildLowerPowerFlowData();
  }

  if (useDemoData) {
    return buildLowerPowerFlowData(LOWER_POWER_FLOW_DUMMY_DATA);
  }

  const chartSeries = plantData?.chartSeries || {};
  const pvGenerateKwh =
    getSeriesTotalValue(chartSeries.pvGenerate) ||
    Math.abs(Number(plantData?.pv ?? plantData?.production ?? 0));
  const chargeKwh =
    getSeriesTotalValue(chartSeries.charge) ||
    Math.max(0, Number(plantData?.battery || 0));
  const exportKwh =
    getSeriesTotalValue(chartSeries.export) ||
    Math.max(0, -Number(plantData?.grid || 0));

  return buildLowerPowerFlowData({
    pvGenerateKwh,
    chargeKwh,
    exportKwh,
  });
}

//===== (getResponsiveBubblePositionStyle) ======
export function getResponsiveBubblePositionStyle(key, boxWidth, boxHeight, scale) {
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

//===== (clampResponsiveValue) ======
export function clampResponsiveValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

//===== (getPowerFlowOverlayHeight) ======
export function getPowerFlowOverlayHeight(width) {
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

//===== (getPowerFlowOverlayScale) ======
export function getPowerFlowOverlayScale(width, height) {
  const scaleX = width / POWER_FLOW_OVERLAY_LAYOUT.baselineWidth;
  const scaleY = height / POWER_FLOW_OVERLAY_LAYOUT.baselineHeight;

  return clampResponsiveValue(
    Math.min(scaleX, scaleY),
    POWER_FLOW_OVERLAY_LAYOUT.minScale,
    POWER_FLOW_OVERLAY_LAYOUT.maxScale,
  );
}

//===== (getScaledLineThickness) ======
export function getScaledLineThickness(config, scale) {
  return Math.max(1, config.lineThickness * scale);
}

//===== (getGridPointerCoordinates) ======
export function getGridPointerCoordinates(containerLayout, gridBubbleLayout, scale) {
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
  const leadX = config.leadAnchorPctX != null
    ? containerLayout.width * config.leadAnchorPctX
    : startX + (config.startLeadLength || 0) * scale;
  const leadY = startY;
  const bendX = leadX + (config.lineBendOffsetX || 0) * scale;
  const verticalLength =
    config.verticalLineLength == null
      ? targetEndY - startY
      : config.verticalLineLength * scale;
  const bendY = leadY + verticalLength + (config.lineBendOffsetY || 0) * scale;
  const showEndHorizontalLine = config.showEndHorizontalLine !== false;
  const endX = showEndHorizontalLine
    ? config.horizontalLineLength == null
      ? targetEndX + (config.lineOffsetX + config.lineEndOffsetX) * scale
      : startX +
        config.horizontalLineLength * scale +
        config.lineEndOffsetX * scale
    : bendX;
  const endY = showEndHorizontalLine
    ? bendY + (config.lineEndOffsetY || 0) * scale
    : bendY;
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
    path: showEndHorizontalLine
      ? `M ${startX} ${startY} L ${leadX} ${leadY} L ${bendX} ${bendY} L ${endX} ${endY}`
      : `M ${startX} ${startY} L ${leadX} ${leadY} L ${bendX} ${bendY}`,
    leadProgress,
    bendProgress,
    showEndHorizontalLine,
  };
}

//===== (getBatteryPointerCoordinates) ======
export function getBatteryPointerCoordinates(
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
  const targetEndX = containerLayout.width * config.lineEndAnchorPctX;
  const targetEndY = containerLayout.height * config.lineEndAnchorPctY;
  const endX = targetEndX + (config.lineEndOffsetX || 0) * scale;
  const endY = targetEndY + (config.lineEndOffsetY || 0) * scale;
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
  const bendX = config.bendAnchorPctX != null
    ? containerLayout.width * config.bendAnchorPctX
    : config.horizontalLineLength == null
      ? endX + (config.lineBendOffsetX || 0) * scale
      : startX + config.horizontalLineLength * scale;
  const bendY =
    config.verticalLineLength == null
      ? startY + (config.lineBendOffsetY || 0) * scale
      : startY + (config.lineBendOffsetY || 0) * scale;
  const finalEndX =
    config.horizontalLineLength == null
      ? endX
      : bendX + (config.lineEndOffsetX || 0) * scale;
  const finalEndY =
    config.verticalLineLength == null
      ? endY
      : bendY -
        config.verticalLineLength * scale +
        (config.lineEndOffsetY || 0) * scale;
  const firstSegmentLength = Math.hypot(bendX - startX, bendY - startY);
  const secondSegmentLength = Math.hypot(finalEndX - bendX, finalEndY - bendY);
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
    endX: finalEndX,
    endY: finalEndY,
    path: `M ${startX} ${startY} L ${bendX} ${bendY} L ${finalEndX} ${finalEndY}`,
    bendProgress,
  };
}

//===== (getPvPointerCoordinates) ======
export function getPvPointerCoordinates(containerLayout, pvBubbleLayout, scale) {
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

//===== (getLoadPointerCoordinates) ======
export function getLoadPointerCoordinates(containerLayout, loadBubbleLayout, scale) {
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

//===== (lockPointerEndpoint) ======
export function lockPointerEndpoint(coordinates, endpointRef) {
  if (!coordinates) {
    return null;
  }

  if (!endpointRef.current) {
    endpointRef.current = {
      endX: coordinates.endX,
      endY: coordinates.endY,
    };
  }

  const lockedCoordinates = {
    ...coordinates,
    endX: endpointRef.current.endX,
    endY: endpointRef.current.endY,
  };

  if (lockedCoordinates.leadX != null && lockedCoordinates.leadY != null) {
    lockedCoordinates.path =
      `M ${lockedCoordinates.startX} ${lockedCoordinates.startY} ` +
      `L ${lockedCoordinates.leadX} ${lockedCoordinates.leadY} ` +
      `L ${lockedCoordinates.bendX} ${lockedCoordinates.bendY}`;

    if (lockedCoordinates.showEndHorizontalLine !== false) {
      lockedCoordinates.path += ` L ${lockedCoordinates.endX} ${lockedCoordinates.endY}`;
    }
  } else {
    lockedCoordinates.path =
      `M ${lockedCoordinates.startX} ${lockedCoordinates.startY} ` +
      `L ${lockedCoordinates.bendX} ${lockedCoordinates.bendY} ` +
      `L ${lockedCoordinates.endX} ${lockedCoordinates.endY}`;
  }

  return lockedCoordinates;
}

//===== (getPointerAnimationEasing) ======
export function getPointerAnimationEasing(config) {
  if (config.animationEasing === "linear") {
    return Easing.linear;
  }

  return Easing.linear;
}
