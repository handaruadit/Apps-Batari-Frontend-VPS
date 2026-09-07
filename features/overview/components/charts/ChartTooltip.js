//========== IMPORTS ==========
import { Text, View } from "react-native";
import styles from "./chart.styles";

//========== COMPONENT ==========
export default function ChartTooltip({ colors, left, rows, title, top = 30 }) {
  if (!rows.length) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.tooltip,
        {
          left,
          top,
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
        },
      ]}
    >
      <Text style={[styles.tooltipTitle, { color: colors.text }]}>{title}</Text>
      {rows.map((row) => (
        <View key={row.key} style={styles.tooltipRow}>
          <View style={[styles.tooltipDot, { backgroundColor: row.color }]} />
          <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>
            {row.label}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {row.value}
            </Text>
            {row.compareValue && (
              <Text
                style={{
                  fontSize: 8.5,
                  fontWeight: "600",
                  color: colors.textMuted,
                  marginTop: -1,
                }}
              >
                H-1: {row.compareValue}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
