//===== (Imports) ======
import { getToken } from '@/auth/token';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildChartEndpoint } from '../utils/chartData';
import {
  getDayTimeRange,
  normalizeDayPowerSeries,
} from '../utils/chartPresentation';
import { mergeChartSeries, normalizeChartSeries } from '../utils/powerData';

export function useDayComparison({
  activeSegment,
  resolvedPlantId,
  selectedDay,
  selectedMonth,
  selectedYear,
  selectedSourceDeviceId,
}) {
  const [isComparisonActive, setIsComparisonActive] = useState(false);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [comparisonSeries, setComparisonSeries] = useState(null);

  const cacheRef = useRef({});
  const activeRequestRef = useRef(0);

  const toggleComparison = useCallback(() => {
    setIsComparisonActive((prev) => {
      console.log("[useDayComparison] toggling comparison to:", !prev);
      return !prev;
    });
  }, []);

  useEffect(() => {
    // If not active or not in day mode, clear comparison series
    if (
      !isComparisonActive ||
      activeSegment !== "day" ||
      !resolvedPlantId ||
      !selectedDay
    ) {
      setComparisonSeries(null);
      return;
    }

    // Compute H-1 (previous day)
    const currentMidnight = new Date(
      selectedYear,
      selectedMonth - 1,
      selectedDay,
      0,
      0,
      0,
      0,
    );
    const prevMidnight = new Date(
      currentMidnight.getTime() - 24 * 60 * 60 * 1000,
    );
    const prevDay = prevMidnight.getDate();
    const prevMonth = prevMidnight.getMonth() + 1;
    const prevYear = prevMidnight.getFullYear();

    const cacheKey = `${resolvedPlantId}-${prevYear}-${prevMonth}-${prevDay}-${selectedSourceDeviceId || "plant"}`;

    const { startTimestamp: currentStart } = getDayTimeRange(
      selectedDay,
      selectedMonth,
      selectedYear,
    );
    const { startTimestamp: prevStart } = getDayTimeRange(
      prevDay,
      prevMonth,
      prevYear,
    );
    const timeShift = currentStart - prevStart;

    const processAndShift = (rawData) => {
      // 1. Normalize the raw backend response into chart series format
      const merged = mergeChartSeries(normalizeChartSeries(rawData));
      // 2. Extract clean [{ timestamp, value }] for each series
      const normalizedDay = normalizeDayPowerSeries(merged);
      // 3. Shift the timestamps to align with today's 24-hour X-axis
      const shifted = {};
      Object.keys(normalizedDay || {}).forEach((key) => {
        shifted[key] = (normalizedDay[key] || []).map((point) => ({
          timestamp: point.timestamp + timeShift,
          value: point.value,
        }));
      });
      return shifted;
    };

    if (cacheRef.current[cacheKey]) {
      setComparisonSeries(cacheRef.current[cacheKey]);
      setIsLoadingComparison(false);
      return;
    }

    const requestId = ++activeRequestRef.current;
    setIsLoadingComparison(true);

    (async () => {
      try {
        const token = await getToken();
        if (!token || requestId !== activeRequestRef.current) {
          return;
        }

        const endpoint = buildChartEndpoint(
          "day",
          resolvedPlantId,
          prevDay,
          prevMonth,
          prevYear,
          selectedSourceDeviceId,
        );

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (requestId !== activeRequestRef.current) {
          return;
        }

        const json = await response.json().catch(() => null);
        console.log("[useDayComparison] fetch response:", {
          status: response.status,
          ok: response.ok,
          endpoint,
          hasData: json?.data != null,
          dataKeys: json?.data ? Object.keys(json.data) : null,
        });

        if (response.ok && json?.data != null) {
          const shifted = processAndShift(json.data);
          const sampleKey = Object.keys(shifted)[0];
          console.log("[useDayComparison] shifted data counts:", {
            seriesCount: Object.keys(shifted).length,
            sampleKey,
            samplePointsCount: shifted[sampleKey]?.length,
          });
          cacheRef.current[cacheKey] = shifted;
          setComparisonSeries(shifted);
        } else {
          setComparisonSeries(null);
        }
      } catch (error) {
        if (requestId === activeRequestRef.current) {
          console.warn(
            "Failed to fetch comparison day data:",
            error?.message || error,
          );
          setComparisonSeries(null);
        }
      } finally {
        if (requestId === activeRequestRef.current) {
          setIsLoadingComparison(false);
        }
      }
    })();
  }, [
    activeSegment,
    isComparisonActive,
    resolvedPlantId,
    selectedDay,
    selectedMonth,
    selectedYear,
    selectedSourceDeviceId,
  ]);

  return {
    comparisonSeries,
    isComparisonActive,
    isLoadingComparison,
    toggleComparison,
  };
}
