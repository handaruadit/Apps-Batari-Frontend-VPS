//===== (Imports) ======
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import OverviewChart from './charts/OverviewChart';
import {
  POWER_CHART_DAY_CHIP_STEP,
  POWER_CHART_MONTH_CHIP_STEP,
} from '../constants/overviewConstants';
import styles from '../styles/overview.styles';

//===== (OverviewChartSection) ======
export default function OverviewChartSection({
  activeSegment,
  chartCurrentTime,
  chartError,
  chartStatus,
  chartTooltipDismissKey,
  chartYearRange,
  colors,
  comparisonSeries,
  dailySeries,
  dayOptions,
  dayPickerScrollRef,
  goNextMonth,
  goNextYear,
  goPrevMonth,
  goPrevYear,
  isComparisonActive,
  isLoadingComparison,
  isLightMode,
  monthOptions,
  monthPickerScrollRef,
  onToggleComparison,
  onTooltipChange,
  overviewChartWidth,
  plantData,
  selectedDay,
  selectedMonth,
  selectedMonthLabel,
  selectedYear,
  setActiveSegment,
  setIsChartLandscapeVisible,
  setSelectedDay,
  setSelectedMonth,
  setSelectedYear,
  t,
  todayMonth,
  todayYear,
  togglePowerSeries,
  visiblePowerSeries,
  yearOptions,
}) {
  const [internalTooltipActive, setInternalTooltipActive] = useState(false);
  const [internalDismissKey, setInternalDismissKey] = useState(0);

  const dayPickerWidth = useRef(0);
  const dayScrollX = useRef(0);
  const monthPickerWidth = useRef(0);
  const monthScrollX = useRef(0);

  const effectiveDismissKey = (chartTooltipDismissKey || 0) + internalDismissKey;

  const handleTooltipChange = (active) => {
    setInternalTooltipActive(active);
    onTooltipChange?.(active);
  };

  const dismissTooltip = () => {
    if (internalTooltipActive) {
      setInternalDismissKey((prev) => prev + 1);
      setInternalTooltipActive(false);
      onTooltipChange?.(false);
    }
  };

  // Flexible day selection: If already visible in viewport, stay still; otherwise smoothly center
  const handleSelectDay = (day) => {
    dismissTooltip();
    setSelectedDay(day);

    const containerWidth = dayPickerWidth.current || overviewChartWidth || 340;
    const currentX = dayScrollX.current || 0;
    const chipStep = POWER_CHART_DAY_CHIP_STEP; // 50
    const chipWidth = 42;
    const chipLeft = (day - 1) * chipStep;
    const chipRight = chipLeft + chipWidth;

    const edgeMargin = 20;
    const isComfortablyVisible =
      chipLeft >= currentX + edgeMargin &&
      chipRight <= currentX + containerWidth - edgeMargin;

    if (!isComfortablyVisible) {
      const targetX = Math.max(0, chipLeft - (containerWidth - chipWidth) / 2);
      dayPickerScrollRef.current?.scrollTo({
        x: targetX,
        animated: true,
      });
    }
  };

  // Flexible month selection: If already visible, stay still; otherwise smoothly center
  const handleSelectMonth = (monthValue) => {
    dismissTooltip();
    setSelectedMonth(monthValue);

    const containerWidth = monthPickerWidth.current || overviewChartWidth || 340;
    const currentX = monthScrollX.current || 0;
    const chipStep = POWER_CHART_MONTH_CHIP_STEP; // 104
    const chipWidth = 96;
    const chipLeft = (monthValue - 1) * chipStep;
    const chipRight = chipLeft + chipWidth;

    const edgeMargin = 20;
    const isComfortablyVisible =
      chipLeft >= currentX + edgeMargin &&
      chipRight <= currentX + containerWidth - edgeMargin;

    if (!isComfortablyVisible) {
      const targetX = Math.max(0, chipLeft - (containerWidth - chipWidth) / 2);
      monthPickerScrollRef.current?.scrollTo({
        x: targetX,
        animated: true,
      });
    }
  };

  // Center selected day smoothly when month or year changes or day segment is opened
  useEffect(() => {
    if (activeSegment !== "day") {
      return;
    }
    const containerWidth = dayPickerWidth.current || overviewChartWidth || 340;
    const chipStep = POWER_CHART_DAY_CHIP_STEP;
    const chipWidth = 42;
    const chipLeft = (selectedDay - 1) * chipStep;
    const targetX = Math.max(0, chipLeft - (containerWidth - chipWidth) / 2);

    const timer = setTimeout(() => {
      dayPickerScrollRef.current?.scrollTo({
        x: targetX,
        animated: true,
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [selectedMonth, selectedYear, activeSegment]);

  // Center selected month smoothly when year changes or month segment is opened
  useEffect(() => {
    if (activeSegment !== "month") {
      return;
    }
    const containerWidth = monthPickerWidth.current || overviewChartWidth || 340;
    const chipStep = POWER_CHART_MONTH_CHIP_STEP;
    const chipWidth = 96;
    const chipLeft = (selectedMonth - 1) * chipStep;
    const targetX = Math.max(0, chipLeft - (containerWidth - chipWidth) / 2);

    const timer = setTimeout(() => {
      monthPickerScrollRef.current?.scrollTo({
        x: targetX,
        animated: true,
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [selectedYear, activeSegment]);
  return (
    <View
      style={[
        styles.segmentCard,
        isLightMode && {
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
        },
      ]}
    >
      <View
        onTouchStart={() => {
          if (internalTooltipActive) {
            dismissTooltip();
          }
        }}
      >
        <View
          style={[
            styles.segmentRow,
            isLightMode && {
              backgroundColor: colors.bubble,
              borderWidth: 1,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
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
              isLightMode && {
                color:
                  activeSegment === "day"
                    ? colors.bubble
                    : colors.textMuted,
              },
            ]}
          >
            {t("day")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === "month" && styles.segmentButtonActive,
          ]}
          onPress={() => {
            setSelectedMonth(todayMonth);
            setSelectedYear(todayYear);
            setActiveSegment("month");
          }}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === "month" && styles.segmentTextActive,
              isLightMode && {
                color:
                  activeSegment === "month"
                    ? colors.bubble
                    : colors.textMuted,
              },
            ]}
          >
            {t("month")}
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
              isLightMode && {
                color:
                  activeSegment === "year"
                    ? colors.bubble
                    : colors.textMuted,
              },
            ]}
          >
            {t("year")}
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
              isLightMode && {
                color:
                  activeSegment === "lifetime"
                    ? colors.bubble
                    : colors.textMuted,
              },
            ]}
          >
            Lifetime
          </Text>
        </TouchableOpacity>
      </View>

      {activeSegment === "day" ? (
        <>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={goPrevMonth}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <Text
              style={[styles.monthNavigationText, { color: colors.text }]}
            >
              {new Date(
                selectedYear,
                selectedMonth - 1,
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            <TouchableOpacity
              onPress={goNextMonth}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dayPickerWrap}>
            <ScrollView
              ref={dayPickerScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayPickerContent}
              onLayout={(e) => {
                dayPickerWidth.current = e.nativeEvent.layout.width;
              }}
              onScroll={(e) => {
                dayScrollX.current = e.nativeEvent.contentOffset.x;
              }}
              scrollEventThrottle={16}
            >
              {dayOptions.map((day) => {
                const isSelected = day === selectedDay;

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      isLightMode && {
                        borderColor: colors.bubbleBorder,
                        backgroundColor: colors.bubble,
                      },
                      isSelected && styles.dayChipActive,
                    ]}
                    onPress={() => handleSelectDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        isSelected && styles.dayChipTextActive,
                        isLightMode && {
                          color: isSelected ? colors.bubble : colors.text,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.dateText, { color: colors.textSoft }]}>
              {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
            </Text>
          </View>
        </>
      ) : activeSegment === "month" ? (
        <View style={styles.dayPickerWrap}>
          <ScrollView
            ref={monthPickerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayPickerContent}
            onLayout={(e) => {
              monthPickerWidth.current = e.nativeEvent.layout.width;
            }}
            onScroll={(e) => {
              monthScrollX.current = e.nativeEvent.contentOffset.x;
            }}
            scrollEventThrottle={16}
          >
            {monthOptions.map((month) => {
              const isSelected = month.value === selectedMonth;

              return (
                <TouchableOpacity
                  key={month.value}
                  style={[
                    styles.monthChip,
                    isLightMode && {
                      borderColor: colors.bubbleBorder,
                      backgroundColor: colors.bubble,
                    },
                    isSelected && styles.monthChipActive,
                  ]}
                  onPress={() => handleSelectMonth(month.value)}
                >
                    <Text
                      style={[
                        styles.monthChipText,
                        isSelected && styles.monthChipTextActive,
                        isLightMode && {
                          color: isSelected ? colors.bubble : colors.text,
                        },
                      ]}
                    >
                      {month.label}
                    </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.dateText, { color: colors.textSoft }]}>
            {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
          </Text>
        </View>
      ) : activeSegment === "year" ? (
        <View style={styles.dayPickerWrap}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={goPrevYear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <Text
              style={[styles.monthNavigationText, { color: colors.text }]}
            >
              {selectedYear}
            </Text>

            <TouchableOpacity
              onPress={goNextYear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : activeSegment === "lifetime" ? (
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
                    isLightMode && {
                      borderColor: colors.bubbleBorder,
                      backgroundColor: colors.bubble,
                    },
                    isSelected && styles.yearChipActive,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      isSelected && styles.yearChipTextActive,
                      isLightMode && {
                        color: isSelected ? colors.bubble : colors.text,
                      },
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.dateText, { color: colors.textSoft }]}>
            {`${selectedDay} ${selectedMonthLabel} ${selectedYear}`}
          </Text>
        </View>
      ) : null}
      </View>

      <OverviewChart
        chartError={chartError}
        chartStatus={chartStatus}
        chartWidth={overviewChartWidth}
        comparisonSeries={comparisonSeries}
        currentTime={chartCurrentTime}
        isComparisonActive={isComparisonActive}
        isLoadingComparison={isLoadingComparison}
        lastTimestamp={plantData.latestDataTimestamp}
        onFullscreenPress={() => setIsChartLandscapeVisible(true)}
        onToggleComparison={onToggleComparison}
        onToggleSeries={(key) => {
          dismissTooltip();
          togglePowerSeries(key);
        }}
        onTooltipChange={handleTooltipChange}
        period={activeSegment}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        series={dailySeries}
        tooltipDismissKey={effectiveDismissKey}
        visibleSeries={visiblePowerSeries}
        yearRange={chartYearRange}
      />
    </View>
  );
}
