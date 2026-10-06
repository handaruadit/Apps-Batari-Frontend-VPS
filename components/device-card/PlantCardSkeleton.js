//===== (Imports) ======
import { useAppSettings } from "@/context/AppSettingsContext";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

//===== (PlantCardSkeleton Component) ======
export default function PlantCardSkeleton({ count = 3 }) {
  const { colors, themeMode } = useAppSettings();
  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const isLight = themeMode === "light";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const placeholderBg = isLight
    ? "rgba(0, 0, 0, 0.07)"
    : "rgba(255, 255, 255, 0.08)";

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.container}>
      {items.map((key) => (
        <Animated.View
          key={key}
          style={[
            styles.card,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
              opacity: pulseAnim,
            },
          ]}
        >
          {/* Image Placeholder */}
          <View style={[styles.imagePlaceholder, { backgroundColor: placeholderBg }]} />

          {/* Content Placeholder */}
          <View style={styles.content}>
            <View
              style={[
                styles.titleBar,
                { backgroundColor: placeholderBg, width: "62%" },
              ]}
            />
            <View
              style={[
                styles.subBar,
                { backgroundColor: placeholderBg, width: "42%" },
              ]}
            />
            <View style={styles.bottomRow}>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: placeholderBg, width: 70 },
                ]}
              />
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: placeholderBg, width: 55 },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  imagePlaceholder: {
    height: 130,
    width: "100%",
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  titleBar: {
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  subBar: {
    height: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  statusPill: {
    height: 16,
    borderRadius: 6,
  },
});
