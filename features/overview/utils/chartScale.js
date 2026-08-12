//========== NUMBER HELPERS ==========
function getNiceStep(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalizedValue = value / magnitude;
  const niceValue =
    normalizedValue <= 1
      ? 1
      : normalizedValue <= 1.5
        ? 1.5
      : normalizedValue <= 2
        ? 2
        : normalizedValue <= 2.5
          ? 2.5
          : normalizedValue <= 3
            ? 3
            : normalizedValue <= 4
              ? 4
              : normalizedValue <= 5
                ? 5
                : normalizedValue <= 7.5
                  ? 7.5
                  : 10;

  return niceValue * magnitude;
}

function cleanTick(value) {
  return Math.abs(value) < 1e-10 ? 0 : Number(value.toPrecision(10));
}

//========== CHART DATA HELPERS ==========
export function calculateYAxisRange(values, targetTickCount = 5) {
  const finiteValues = (values || []).map(Number).filter(Number.isFinite);

  if (!finiteValues.length || finiteValues.every((value) => value === 0)) {
    return { min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] };
  }

  const rawMin = Math.min(0, ...finiteValues);
  const rawMax = Math.max(0, ...finiteValues);
  const rawSpan = Math.max(rawMax - rawMin, Math.abs(rawMax), Math.abs(rawMin));
  const paddedMin = rawMin < 0 ? rawMin * 1.08 : 0;
  const paddedMax = rawMax > 0 ? rawMax * 1.08 : 0;
  const step = getNiceStep(rawSpan / Math.max(targetTickCount - 1, 1));
  const min = Math.min(0, Math.floor(paddedMin / step) * step);
  const max = Math.max(0, Math.ceil(paddedMax / step) * step);
  const ticks = [];

  for (let value = min; value <= max + step / 2; value += step) {
    ticks.push(cleanTick(value));
  }

  return { min: cleanTick(min), max: cleanTick(max), ticks };
}

export function getVisibleSeriesValues(normalizedData, visibleSeries) {
  return Object.entries(normalizedData || {}).flatMap(([key, points]) =>
    visibleSeries[key] ? points.map((point) => point.value) : [],
  );
}

export function getAggregateValues(items, keys) {
  return (items || []).flatMap((item) =>
    keys.map((key) => item[key]).filter((value) => Number.isFinite(value)),
  );
}
