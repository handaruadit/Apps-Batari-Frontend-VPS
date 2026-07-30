//===== (Imports) ======
import { styles } from "@/components/device-card/styles";
import { Animated, Text, View } from "react-native";

//===== (ConnectionStatus) ======
export default function ConnectionStatus({ status, pulseAnim }) {
  const statusColor = status.isOnline ? "#16A34A" : "#DC2626";

  return (
    <View style={styles.statusRow}>
      <Animated.View
        style={[
          styles.statusDot,
          {
            backgroundColor: statusColor,
            opacity: pulseAnim,
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0.45, 1],
                  outputRange: [0.82, 1.18],
                }),
              },
            ],
          },
        ]}
      />
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status.label}
      </Text>
    </View>
  );
}
