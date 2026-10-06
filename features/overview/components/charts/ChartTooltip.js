//========== IMPORTS ==========
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
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
        localStyles.tooltipCard,
        {
          left,
          top,
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
        },
      ]}
    >
      <View style={localStyles.headerRow}>
        <Ionicons
          name="time-outline"
          size={12}
          color={colors.accent}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.tooltipTitle, localStyles.titleText, { color: colors.text }]}>
          {title}
        </Text>
      </View>

      <View
        style={[
          localStyles.divider,
          { backgroundColor: colors.bubbleBorder || "rgba(255,255,255,0.08)" },
        ]}
      />

      {rows.map((row) => (
        <View key={row.key} style={styles.tooltipRow}>
          <View style={[styles.tooltipDot, { backgroundColor: row.color }]} />
          <Text
            style={[styles.tooltipLabel, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {row.label}
          </Text>
          <View style={{ alignItems: "flex-end", marginLeft: 4 }}>
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

const localStyles = StyleSheet.create({
  tooltipCard: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  titleText: {
    marginBottom: 0,
    fontSize: 11.5,
    fontWeight: "800",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginBottom: 6,
    marginTop: 2,
  },
});
