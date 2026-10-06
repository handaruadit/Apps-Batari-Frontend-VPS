//========== IMPORTS ==========
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";

//========== COMPONENT ==========
export default function ChartSkeleton({
  colors,
  height = 286,
  isLightMode = false,
  width = 340,
}) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const padLeft = 44;
  const padRight = 18;
  const padTop = 32;
  const padBottom = 28;
  const innerWidth = Math.max(10, width - padLeft - padRight);
  const innerHeight = Math.max(10, height - padTop - padBottom);

  const gridLineColor = isLightMode
    ? "rgba(8, 174, 234, 0.12)"
    : "rgba(248, 250, 252, 0.08)";
  const placeholderFill = isLightMode
    ? "rgba(15, 23, 42, 0.08)"
    : "rgba(255, 255, 255, 0.08)";
  const curveColor = isLightMode
    ? "rgba(24, 174, 230, 0.35)"
    : "rgba(24, 174, 230, 0.45)";

  // Bell-curve placeholder path for solar diurnal generation
  const cp1X = padLeft + innerWidth * 0.28;
  const cp2X = padLeft + innerWidth * 0.45;
  const peakX = padLeft + innerWidth * 0.5;
  const peakY = padTop + innerHeight * 0.22;
  const cp3X = padLeft + innerWidth * 0.55;
  const cp4X = padLeft + innerWidth * 0.72;
  const endX = padLeft + innerWidth * 0.82;
  const baselineY = padTop + innerHeight;

  const dummyCurvePath = `M ${padLeft + innerWidth * 0.18} ${baselineY} C ${cp1X} ${baselineY}, ${cp2X} ${peakY}, ${peakX} ${peakY} C ${cp3X} ${peakY}, ${cp4X} ${baselineY}, ${endX} ${baselineY}`;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Top toolbar placeholder */}
      <Animated.View
        style={[
          styles.toolbarPlaceholder,
          { opacity: pulseAnim },
        ]}
      >
        <View
          style={[
            styles.pillPlaceholder,
            { backgroundColor: placeholderFill },
          ]}
        />
        <View
          style={[
            styles.iconPlaceholder,
            { backgroundColor: placeholderFill },
          ]}
        />
      </Animated.View>

      {/* SVG skeleton canvas */}
      <Animated.View style={{ opacity: pulseAnim }}>
        <Svg width={width} height={height - 48}>
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padTop + innerHeight * ratio;
            return (
              <Line
                key={`grid-${index}`}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={gridLineColor}
                strokeWidth={ratio === 1 ? 1.5 : 1}
                strokeDasharray={ratio === 1 ? undefined : "4 4"}
              />
            );
          })}

          {/* Diurnal bell-curve line */}
          <Path
            d={dummyCurvePath}
            fill="none"
            stroke={curveColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />

          {/* Subtle axis tick placeholders */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padTop + innerHeight * ratio;
            return (
              <Rect
                key={`tick-${index}`}
                x={padLeft - 24}
                y={y - 3}
                width={16}
                height={6}
                rx={3}
                fill={placeholderFill}
              />
            );
          })}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "flex-start",
  },
  toolbarPlaceholder: {
    height: 36,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  pillPlaceholder: {
    width: 90,
    height: 28,
    borderRadius: 14,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
});
