//===== (Imports) ======
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

//===== (DeviceCardSkeleton) ======
export default function DeviceCardSkeleton({ count = 2 }) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={`device-skeleton-${index}`}
          style={[styles.card, { opacity: pulseAnim }]}
        >
          {/* Header row skeleton */}
          <View style={styles.headerRow}>
            <View style={styles.titlePlaceholder} />
            <View style={styles.badgePlaceholder} />
          </View>

          {/* Device ID row skeleton */}
          <View style={styles.idRow}>
            <View style={styles.idLabel} />
            <View style={styles.idValue} />
          </View>

          {/* Location row skeleton */}
          <View style={styles.locationPlaceholder} />

          {/* Telemetry tiles grid skeleton */}
          <View style={styles.tilesRow}>
            <View style={styles.tilePlaceholder} />
            <View style={styles.tilePlaceholder} />
          </View>

          {/* Battery section skeleton */}
          <View style={styles.batteryHeader} />
          <View style={styles.tilesRow}>
            <View style={styles.tilePlaceholder} />
            <View style={styles.tilePlaceholder} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titlePlaceholder: {
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  badgePlaceholder: {
    width: 64,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  idRow: {
    marginBottom: 12,
  },
  idLabel: {
    width: 70,
    height: 11,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 6,
  },
  idValue: {
    width: 160,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  locationPlaceholder: {
    width: "75%",
    height: 13,
    borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 16,
  },
  tilesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  tilePlaceholder: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  batteryHeader: {
    width: 120,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    marginBottom: 10,
    marginTop: 4,
  },
});
