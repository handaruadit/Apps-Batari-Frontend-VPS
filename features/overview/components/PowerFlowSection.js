//===== (Imports) ======
import PowerFlowDiagram from '@/components/PowerFlowDiagram';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BATTERY_BUBBLE_CONFIG,
  BATTERY_POINTER_CONFIG,
  GRID_POINTER_CONFIG,
  LOAD_POINTER_CONFIG,
  POWER_FLOW_OVERLAY_LAYOUT,
  PV_POINTER_CONFIG,
} from '../constants/overviewConstants';
import { usePowerFlowPresentation } from '../hooks/usePowerFlowPresentation';
import styles from '../styles/overview.styles';
import { formatKwValue } from '../utils/dateTime';
import {
  getResponsiveBubblePositionStyle,
  getScaledLineThickness,
} from '../utils/powerFlow';

//===== (PowerFlowSection) ======
export default function PowerFlowSection({
  colors,
  dataSourceMenuVisible,
  dataSourceOptions,
  isLightMode,
  lowerPowerFlowData,
  plantData,
  pointerLineColor,
  selectedDataSource,
  selectedDataSourceLabel,
  setDataSourceMenuVisible,
  setSelectedDataSource,
  t,
  windowWidth,
}) {
  const presentation = usePowerFlowPresentation({ plantData, windowWidth });
  const {
    batteryPointerCoordinates,
    batteryPointerDotOpacity,
    batteryPointerDotSize,
    batteryPointerDotX,
    batteryPointerDotY,
    batteryPointerGlowScale,
    batteryPointerGlowSize,
    batteryPointerGlowX,
    batteryPointerGlowY,
    bubbleScale,
    gridPointerCoordinates,
    gridPointerDotOpacity,
    gridPointerDotSize,
    gridPointerDotX,
    gridPointerDotY,
    gridPointerGlowScale,
    gridPointerGlowSize,
    gridPointerGlowX,
    gridPointerGlowY,
    houseOverlayHeight,
    houseOverlayWidth,
    loadPointerCoordinates,
    loadPointerDotOpacity,
    loadPointerDotSize,
    loadPointerDotX,
    loadPointerDotY,
    loadPointerGlowScale,
    loadPointerGlowSize,
    loadPointerGlowX,
    loadPointerGlowY,
    pvPointerCoordinates,
    pvPointerDotOpacity,
    pvPointerDotSize,
    pvPointerDotX,
    pvPointerDotY,
    pvPointerGlowScale,
    pvPointerGlowSize,
    pvPointerGlowX,
    pvPointerGlowY,
    responsiveBatteryLabelStyle,
    responsiveBatteryValueStyle,
    responsiveBubbleLabelStyle,
    responsiveBubbleStyle,
    responsiveBubbleValueStyle,
    setBatteryBubbleLayout,
    setGridBubbleLayout,
    setHouseOverlayLayout,
    setLoadBubbleLayout,
    setPvBubbleLayout,
    shouldAnimateBatteryPointer,
    shouldAnimateGridPointer,
    shouldAnimateLoadPointer,
    shouldAnimatePvPointer,
  } = presentation;

  return (
    <View style={styles.powerFlowSection}>
      <View style={styles.houseImageOnly}>
        <View
          style={[
            styles.houseOverlayWrap,
            { height: houseOverlayHeight },
          ]}
          onLayout={({ nativeEvent }) =>
            setHouseOverlayLayout(nativeEvent.layout)
          }
        >

          <Image
            source={require("@/assets/images/Asset App Batari Alternative.png")}
            style={[styles.houseImage, { height: houseOverlayHeight }]}
            resizeMode="contain"
          />

          {gridPointerCoordinates && (
            <View pointerEvents="none" style={styles.gridPointerOverlay}>
              <Svg
                pointerEvents="none"
                style={styles.gridPointerOverlay}
                width="100%"
                height="100%"
              >
                <Path
                  d={gridPointerCoordinates.path}
                  stroke={pointerLineColor}
                  strokeWidth={getScaledLineThickness(
                    GRID_POINTER_CONFIG,
                    bubbleScale,
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              {shouldAnimateGridPointer &&
                GRID_POINTER_CONFIG.enableGlow &&
                GRID_POINTER_CONFIG.animationEffect !== "plain" && (
                  <Animated.View
                    style={[
                      styles.gridPointerDotGlow,
                      {
                        width: gridPointerGlowSize,
                        height: gridPointerGlowSize,
                        borderRadius: gridPointerGlowSize / 2,
                        backgroundColor: GRID_POINTER_CONFIG.dotGlowColor,
                        opacity: gridPointerDotOpacity,
                        transform: [
                          { translateX: gridPointerGlowX },
                          { translateY: gridPointerGlowY },
                          { scale: gridPointerGlowScale },
                        ],
                      },
                    ]}
                  />
                )}
              {shouldAnimateGridPointer && (
                <Animated.View
                  style={[
                    styles.gridPointerDot,
                    {
                      width: gridPointerDotSize,
                      height: gridPointerDotSize,
                      borderRadius: gridPointerDotSize / 2,
                      backgroundColor: GRID_POINTER_CONFIG.dotColor,
                      opacity: gridPointerDotOpacity,
                      transform: [
                        { translateX: gridPointerDotX },
                        { translateY: gridPointerDotY },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          )}

          {batteryPointerCoordinates && (
            <View pointerEvents="none" style={styles.gridPointerOverlay}>
              <Svg
                pointerEvents="none"
                style={styles.gridPointerOverlay}
                width="100%"
                height="100%"
              >
                <Path
                  d={batteryPointerCoordinates.path}
                  stroke={pointerLineColor}
                  strokeWidth={getScaledLineThickness(
                    BATTERY_POINTER_CONFIG,
                    bubbleScale,
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              {shouldAnimateBatteryPointer &&
                BATTERY_POINTER_CONFIG.enableGlow &&
                BATTERY_POINTER_CONFIG.animationEffect !== "plain" && (
                  <Animated.View
                    style={[
                      styles.gridPointerDotGlow,
                      {
                        width: batteryPointerGlowSize,
                        height: batteryPointerGlowSize,
                        borderRadius: batteryPointerGlowSize / 2,
                        backgroundColor:
                          BATTERY_POINTER_CONFIG.dotGlowColor,
                        opacity: batteryPointerDotOpacity,
                        transform: [
                          { translateX: batteryPointerGlowX },
                          { translateY: batteryPointerGlowY },
                          { scale: batteryPointerGlowScale },
                        ],
                      },
                    ]}
                  />
                )}
              {shouldAnimateBatteryPointer && (
                <Animated.View
                  style={[
                    styles.gridPointerDot,
                    {
                      width: batteryPointerDotSize,
                      height: batteryPointerDotSize,
                      borderRadius: batteryPointerDotSize / 2,
                      backgroundColor: BATTERY_POINTER_CONFIG.dotColor,
                      opacity: batteryPointerDotOpacity,
                      transform: [
                        { translateX: batteryPointerDotX },
                        { translateY: batteryPointerDotY },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          )}

          {pvPointerCoordinates && (
            <View pointerEvents="none" style={styles.gridPointerOverlay}>
              <Svg
                pointerEvents="none"
                style={styles.gridPointerOverlay}
                width="100%"
                height="100%"
              >
                <Path
                  d={pvPointerCoordinates.path}
                  stroke={pointerLineColor}
                  strokeWidth={getScaledLineThickness(
                    PV_POINTER_CONFIG,
                    bubbleScale,
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              {shouldAnimatePvPointer &&
                PV_POINTER_CONFIG.enableGlow &&
                PV_POINTER_CONFIG.animationEffect !== "plain" && (
                  <Animated.View
                    style={[
                      styles.gridPointerDotGlow,
                      {
                        width: pvPointerGlowSize,
                        height: pvPointerGlowSize,
                        borderRadius: pvPointerGlowSize / 2,
                        backgroundColor: PV_POINTER_CONFIG.dotGlowColor,
                        opacity: pvPointerDotOpacity,
                        transform: [
                          { translateX: pvPointerGlowX },
                          { translateY: pvPointerGlowY },
                          { scale: pvPointerGlowScale },
                        ],
                      },
                    ]}
                  />
                )}
              {shouldAnimatePvPointer && (
                <Animated.View
                  style={[
                    styles.gridPointerDot,
                    {
                      width: pvPointerDotSize,
                      height: pvPointerDotSize,
                      borderRadius: pvPointerDotSize / 2,
                      backgroundColor: PV_POINTER_CONFIG.dotColor,
                      opacity: pvPointerDotOpacity,
                      transform: [
                        { translateX: pvPointerDotX },
                        { translateY: pvPointerDotY },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          )}

          {loadPointerCoordinates && (
            <View pointerEvents="none" style={styles.gridPointerOverlay}>
              <Svg
                pointerEvents="none"
                style={styles.gridPointerOverlay}
                width="100%"
                height="100%"
              >
                <Path
                  d={loadPointerCoordinates.path}
                  stroke={pointerLineColor}
                  strokeWidth={getScaledLineThickness(
                    LOAD_POINTER_CONFIG,
                    bubbleScale,
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
              {shouldAnimateLoadPointer &&
                LOAD_POINTER_CONFIG.enableGlow &&
                LOAD_POINTER_CONFIG.animationEffect !== "plain" && (
                  <Animated.View
                    style={[
                      styles.gridPointerDotGlow,
                      {
                        width: loadPointerGlowSize,
                        height: loadPointerGlowSize,
                        borderRadius: loadPointerGlowSize / 2,
                        backgroundColor: LOAD_POINTER_CONFIG.dotGlowColor,
                        opacity: loadPointerDotOpacity,
                        transform: [
                          { translateX: loadPointerGlowX },
                          { translateY: loadPointerGlowY },
                          { scale: loadPointerGlowScale },
                        ],
                      },
                    ]}
                  />
                )}
              {shouldAnimateLoadPointer && (
                <Animated.View
                  style={[
                    styles.gridPointerDot,
                    {
                      width: loadPointerDotSize,
                      height: loadPointerDotSize,
                      borderRadius: loadPointerDotSize / 2,
                      backgroundColor: LOAD_POINTER_CONFIG.dotColor,
                      opacity: loadPointerDotOpacity,
                      transform: [
                        { translateX: loadPointerDotX },
                        { translateY: loadPointerDotY },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          )}

          <View
            style={[
              styles.infoBubble,
              responsiveBubbleStyle,
              isLightMode && styles.infoBubbleLight,
              styles.pvBubble,
              getResponsiveBubblePositionStyle(
                "pv",
                houseOverlayWidth,
                houseOverlayHeight,
                bubbleScale,
              ),
            ]}
            onLayout={({ nativeEvent }) =>
              setPvBubbleLayout(nativeEvent.layout)
            }
          >
            <Text
              style={[
                styles.infoBubbleLabel,
                responsiveBubbleLabelStyle,
                isLightMode && { color: colors.accent },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {t("pv")}
            </Text>
            <Text
              style={[
                styles.infoBubbleValue,
                responsiveBubbleValueStyle,
                isLightMode && { color: colors.text },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.62}
            >
              {formatKwValue(plantData.production)}
            </Text>
          </View>

          <View
            style={[
              styles.infoBubble,
              responsiveBubbleStyle,
              isLightMode && styles.infoBubbleLight,
              styles.gridBubble,
              getResponsiveBubblePositionStyle(
                "grid",
                houseOverlayWidth,
                houseOverlayHeight,
                bubbleScale,
              ),
            ]}
            onLayout={({ nativeEvent }) =>
              setGridBubbleLayout(nativeEvent.layout)
            }
          >
            <Text
              style={[
                styles.infoBubbleLabel,
                responsiveBubbleLabelStyle,
                isLightMode && { color: colors.accent },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {t("grid")}
            </Text>
            <Text
              style={[
                styles.infoBubbleValue,
                responsiveBubbleValueStyle,
                isLightMode && { color: colors.text },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.62}
            >
              {formatKwValue(plantData.grid)}
            </Text>
          </View>

          <View
            style={[
              styles.infoBubble,
              responsiveBubbleStyle,
              isLightMode && styles.infoBubbleLight,
              styles.batteryBubble,
              {
                width:
                  POWER_FLOW_OVERLAY_LAYOUT.bubbleWidth * bubbleScale +
                  BATTERY_BUBBLE_CONFIG.widthExtra * bubbleScale,
                height:
                  POWER_FLOW_OVERLAY_LAYOUT.bubbleHeight * bubbleScale +
                  BATTERY_BUBBLE_CONFIG.heightExtra * bubbleScale,
              },
              getResponsiveBubblePositionStyle(
                "battery",
                houseOverlayWidth,
                houseOverlayHeight,
                bubbleScale,
              ),
            ]}
            onLayout={({ nativeEvent }) =>
              setBatteryBubbleLayout(nativeEvent.layout)
            }
          >
            <Text
              style={[
                styles.batteryLabel,
                responsiveBatteryLabelStyle,
                isLightMode && { color: colors.accent },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {t("battery")}
            </Text>
            <Text
              style={[
                styles.batteryValue,
                responsiveBatteryValueStyle,
                isLightMode && { color: colors.text },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {formatKwValue(plantData.battery)}
            </Text>
          </View>

          <View
            style={[
              styles.infoBubble,
              responsiveBubbleStyle,
              isLightMode && styles.infoBubbleLight,
              styles.loadBubble,
              getResponsiveBubblePositionStyle(
                "load",
                houseOverlayWidth,
                houseOverlayHeight,
                bubbleScale,
              ),
            ]}
            onLayout={({ nativeEvent }) =>
              setLoadBubbleLayout(nativeEvent.layout)
            }
          >
            <Text
              style={[
                styles.infoBubbleLabel,
                responsiveBubbleLabelStyle,
                isLightMode && { color: colors.accent },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {t("load")}
            </Text>
            <Text
              style={[
                styles.infoBubbleValue,
                responsiveBubbleValueStyle,
                isLightMode && { color: colors.text },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.62}
            >
              {formatKwValue(plantData.load)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dataSourceDropdownRow}>
        <View style={styles.dataSourceDropdownWrap}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.dataSourceDropdownButton,
              dataSourceMenuVisible && styles.dataSourceDropdownButtonOpen,
              isLightMode && {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
              },
            ]}
            onPress={() =>
              setDataSourceMenuVisible((current) => !current)
            }
          >
            <Text
              style={[
                styles.dataSourceDropdownText,
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {selectedDataSourceLabel}
            </Text>
            <Ionicons
              name={
                dataSourceMenuVisible ? "chevron-up" : "chevron-down"
              }
              size={15}
              color={colors.accent}
            />
          </TouchableOpacity>

          {dataSourceMenuVisible && (
            <View
              style={[
                styles.dataSourceDropdownMenu,
                isLightMode && {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              {dataSourceOptions.map((item) => {
                const isSelected = item.key === selectedDataSource;

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.78}
                    style={styles.dataSourceDropdownItem}
                    onPress={() => {
                      setSelectedDataSource(item.key);
                      setDataSourceMenuVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dataSourceDropdownItemText,
                        {
                          color: isSelected
                            ? colors.accent
                            : colors.text,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
      <View
        style={[
          styles.powerFlowWrapper,
          isLightMode && {
            backgroundColor: colors.bubble,
            borderColor: colors.bubbleBorder,
          },
        ]}
      >
        <PowerFlowDiagram data={plantData} />
        <PowerFlowDiagram
          data={lowerPowerFlowData}
          variant="production"
        />
      </View>
    </View>

  );
}
