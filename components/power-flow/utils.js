//===== (Imports) ======

import {
  POWER_FLOW_RING,
  POWER_FLOW_SEGMENT_ORDER,
  POWER_FLOW_SEGMENTS,
} from "./constants";

//===== (Value Formatting Functions) ======

//===== (formatValue) ======
export function formatValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}

//===== (formatPercent) ======
export function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${Math.round(number)}%`;
}

//===== (scaleValue) ======
export function scaleValue(value, scale) {
  return Math.round(value * scale);
}

//===== (Ring Calculation Functions) ======

//===== (normalizeAngle) ======
function normalizeAngle(angle) {
  return ((Number(angle) % 360) + 360) % 360;
}

//===== (getAngleSpan) ======
function getAngleSpan(startAngle, endAngle) {
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);
  const span = end - start;

  if (start === end) {
    return 0;
  }

  return span > 0 ? span : span + 360;
}

//===== (getSafeRingValue) ======
export function getSafeRingValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

//===== (getRingSegmentRatios) ======
export function getRingSegmentRatios(values) {
  const safeValues = POWER_FLOW_SEGMENT_ORDER.reduce((result, key) => {
    result[key] = getSafeRingValue(values?.[key]);
    return result;
  }, {});
  const total = POWER_FLOW_SEGMENT_ORDER.reduce(
    (sum, key) => sum + safeValues[key],
    0,
  );

  if (total <= 0) {
    const equalRatio = 1 / POWER_FLOW_SEGMENT_ORDER.length;
    return POWER_FLOW_SEGMENT_ORDER.reduce((result, key) => {
      result[key] = equalRatio;
      return result;
    }, {});
  }

  return POWER_FLOW_SEGMENT_ORDER.reduce((result, key) => {
    result[key] = safeValues[key] / total;
    return result;
  }, {});
}

//===== (getSectionPercent) ======
export function getSectionPercent(value, total) {
  const safeValue = getSafeRingValue(value);
  const safeTotal = getSafeRingValue(total);

  if (safeTotal <= 0) {
    return 0;
  }

  return (safeValue / safeTotal) * 100;
}

//===== (getRingSegmentLength) ======
function getRingSegmentLength(segmentKey, segmentRatios) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  const ratio = Number(segmentRatios?.[segmentKey]);
  const angleSpan = Number.isFinite(ratio)
    ? ratio * 360 + POWER_FLOW_RING.joinOverlapAngle
    : getAngleSpan(segment.startAngle, segment.endAngle) +
      POWER_FLOW_RING.joinOverlapAngle;
  const angleLength = POWER_FLOW_RING.circumference * (angleSpan / 360);
  const fallbackLength = POWER_FLOW_RING.circumference * segment.proportion;

  return Number.isFinite(angleLength) ? angleLength : fallbackLength;
}

//===== (getRingDashArray) ======
export function getRingDashArray(segmentKey, segmentRatios) {
  const segmentLength = Math.max(
    0,
    getRingSegmentLength(segmentKey, segmentRatios),
  );
  const gapLength = Math.max(0, POWER_FLOW_RING.circumference - segmentLength);

  return `${segmentLength} ${gapLength}`;
}

//===== (getRingRotation) ======
export function getRingRotation(segmentKey, segmentRatios) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  const segmentIndex = POWER_FLOW_SEGMENT_ORDER.indexOf(segmentKey);

  if (segmentIndex < 0 || !segmentRatios) {
    return normalizeAngle(segment.startAngle + POWER_FLOW_RING.rotationOffset) - 90;
  }

  const baseStartAngle = POWER_FLOW_SEGMENTS.pv.startAngle;
  const cumulativeAngle = POWER_FLOW_SEGMENT_ORDER.slice(0, segmentIndex).reduce(
    (sum, key) => sum + (Number(segmentRatios[key]) || 0) * 360,
    0,
  );

  return normalizeAngle(
    baseStartAngle + cumulativeAngle + POWER_FLOW_RING.rotationOffset,
  ) - 90;
}

//===== (getRingStrokeWidth) ======
export function getRingStrokeWidth(segmentKey, isSelected) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  return isSelected ? segment.activeStrokeWidth : segment.strokeWidth;
}

//===== (Interaction Style Functions) ======

//===== (getActiveGlowStyle) ======
export function getActiveGlowStyle() {
  return null;
}
