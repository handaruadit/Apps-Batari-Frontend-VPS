//===== (Imports) ======
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OverviewChart from './charts/OverviewChart';
import styles from '../styles/overview.styles';

//===== (LandscapeChartModal) ======
export default function LandscapeChartModal({
  activeSegment,
  chartError,
  chartStatus,
  chartCurrentTime,
  chartYearRange,
  colors,
  comparisonSeries,
  dailySeries,
  isChartLandscapeVisible,
  isComparisonActive,
  isLandscapeChartRotated,
  isLightMode,
  landscapeChartHeight,
  landscapeChartWidth,
  navigationColor,
  plantData,
  selectedDay,
  selectedMonth,
  selectedYear,
  setIsChartLandscapeVisible,
  t,
  togglePowerSeries,
  visiblePowerSeries,
}) {
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [tooltipDismissKey, setTooltipDismissKey] = useState(0);

  const handleDismissTooltip = () => {
    if (isTooltipActive) {
      setTooltipDismissKey((prev) => prev + 1);
      setIsTooltipActive(false);
    }
  };

  return (
    <Modal
      visible={isChartLandscapeVisible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
      onRequestClose={() => setIsChartLandscapeVisible(false)}
    >
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={[
          styles.chartLandscapeSafeArea,
          isLightMode && { backgroundColor: colors.screen },
        ]}
      >
        <View
          style={[
            styles.chartLandscapeHeader,
            isLightMode && { backgroundColor: colors.screen },
          ]}
          onTouchStart={() => {
            if (isTooltipActive) {
              handleDismissTooltip();
            }
          }}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setIsChartLandscapeVisible(false)}
            style={styles.chartLandscapeBackButton}
          >
            <Ionicons name="chevron-back" size={32} color={navigationColor} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.chartLandscapeBody,
            isLightMode && { backgroundColor: colors.screen },
          ]}
          onTouchStart={() => {
            if (isTooltipActive) {
              handleDismissTooltip();
            }
          }}
        >
          <View
            style={[
              styles.chartLandscapeFrame,
              isLandscapeChartRotated && {
                width: landscapeChartWidth,
                height: landscapeChartHeight,
                transform: [{ rotate: "90deg" }],
              },
            ]}
          >
            <OverviewChart
              chartError={chartError}
              chartStatus={chartStatus}
              chartWidth={landscapeChartWidth}
              chartHeight={landscapeChartHeight}
              comparisonSeries={comparisonSeries}
              currentTime={chartCurrentTime}
              isComparisonActive={isComparisonActive}
              lastTimestamp={plantData.latestDataTimestamp}
              mode="landscape"
              onToggleSeries={(key) => {
                handleDismissTooltip();
                togglePowerSeries?.(key);
              }}
              onTooltipChange={setIsTooltipActive}
              period={activeSegment}
              selectedDay={selectedDay}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              series={dailySeries}
              showCurrentTime={false}
              showLegend={false}
              tooltipDismissKey={tooltipDismissKey}
              visibleSeries={visiblePowerSeries}
              yearRange={chartYearRange}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
