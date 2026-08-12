//========== IMPORTS ==========
import { Text, TouchableOpacity, View } from "react-native";
import styles from "./chart.styles";

//========== COMPONENT ==========
export default function ChartLegend({
  colors,
  config,
  onToggleSeries,
  t,
  visibleSeries,
}) {
  return (
    <View style={styles.legend}>
      {config.map((item) => {
        const isVisible = visibleSeries[item.key] === true;
        const label = t(item.labelKey) || item.label;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: isVisible }}
            onPress={() => onToggleSeries(item.key)}
            style={[
              styles.legendItem,
              {
                backgroundColor: isVisible ? `${item.color}1F` : "transparent",
                borderColor: isVisible ? `${item.color}70` : colors.bubbleBorder,
              },
            ]}
          >
            <View
              style={[
                styles.legendDot,
                {
                  backgroundColor: isVisible ? item.color : "transparent",
                  borderColor: item.color,
                  borderWidth: isVisible ? 0 : 1.5,
                },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                { color: isVisible ? item.color : colors.textMuted },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
