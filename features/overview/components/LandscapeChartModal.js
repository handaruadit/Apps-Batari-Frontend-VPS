//===== (Imports) ======
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DailyOverviewChart from './DailyOverviewChart';
import styles from '../styles/overview.styles';

//===== (LandscapeChartModal) ======
export default function LandscapeChartModal({
  activeSegment,
  chartCurrentTime,
  chartYearRange,
  colors,
  dailySeries,
  isChartLandscapeVisible,
  isChartLoading,
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
            {isChartLoading ? (
              <View
                style={[
                  styles.chartLoadingWrap,
                  {
                    width: landscapeChartWidth,
                    minHeight: landscapeChartHeight,
                  },
                ]}
              >
                <ActivityIndicator size="large" color={colors.accent} />
                <Text
                  style={[
                    styles.chartLoadingText,
                    { color: colors.textSoft },
                  ]}
                >
                  {t("loadingChart")}
                </Text>
              </View>
            ) : (
              <DailyOverviewChart
                series={dailySeries}
                chartWidth={landscapeChartWidth}
                chartHeight={landscapeChartHeight}
                visibleSeries={visiblePowerSeries}
                onToggleSeries={togglePowerSeries}
                currentTime={chartCurrentTime}
                showCurrentTime={false}
                showSwitches={false}
                mode="landscape"
                segment={activeSegment}
                selectedDay={selectedDay}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                yearRange={chartYearRange}
                selectedDataPercentages={plantData.selectedDataPercentages}
                socValue={plantData.soc}
                plantName={plantData.plantName}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
