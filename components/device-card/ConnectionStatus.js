//===== (Imports) ======
import { styles } from "@/components/device-card/styles";
import React from "react";
import { Animated, Text, View } from "react-native";

//===== (ConnectionStatus Component) ======
export default function ConnectionStatus({ status, pulseAnim }) {
  const statusColor = status.isOnline ? "#16A34A" : "#DC2626";

  return (
    <View style={styles.statusRow}>
      <View
        style={{
          width: 14,
          height: 14,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 6,
        }}
      >
        {/* Breathing Aura Halo for Online status */}
        {status.isOnline && pulseAnim ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
              opacity: pulseAnim.interpolate({
                inputRange: [0.45, 1],
                outputRange: [0.65, 0],
              }),
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0.45, 1],
                    outputRange: [1.0, 2.4],
                  }),
                },
              ],
            }}
          />
        ) : null}

        {/* Solid Core Dot */}
        <Animated.View
          style={[
            styles.statusDot,
            {
              backgroundColor: statusColor,
              marginRight: 0,
              transform: [
                {
                  scale: pulseAnim
                    ? pulseAnim.interpolate({
                        inputRange: [0.45, 1],
                        outputRange: [0.92, 1.08],
                      })
                    : 1,
                },
              ],
            },
          ]}
        />
      </View>
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status.label}
      </Text>
    </View>
  );
}
