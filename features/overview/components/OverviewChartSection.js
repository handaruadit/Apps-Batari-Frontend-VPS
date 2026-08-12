//===== (Imports) ======
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import OverviewChart from './charts/OverviewChart';
import styles from '../styles/overview.styles';

//===== (OverviewChartSection) ======
export default function OverviewChartSection({
  activeSegment,
  chartError,
  chartStatus,
  chartCurrentTime,
  chartYearRange,
  colors,
  dailySeries,
  dayOptions,
  dayPickerScrollRef,
  goNextMonth,
  goNextYear,
  goPrevMonth,
  goPrevYear,
  isLightMode,
  monthOptions,
  monthPickerScrollRef,
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
                    onPress={() => setSelectedDay(day)}
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
                  onPress={() => setSelectedMonth(month.value)}
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

      <OverviewChart
        chartError={chartError}
        chartStatus={chartStatus}
        chartWidth={overviewChartWidth}
        currentTime={chartCurrentTime}
        lastTimestamp={plantData.latestDataTimestamp}
        onFullscreenPress={() => setIsChartLandscapeVisible(true)}
        onToggleSeries={togglePowerSeries}
        period={activeSegment}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        series={dailySeries}
        visibleSeries={visiblePowerSeries}
        yearRange={chartYearRange}
      />
    </View>
  );
}
