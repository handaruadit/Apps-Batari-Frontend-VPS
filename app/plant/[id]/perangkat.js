import { appColors, appFont } from "@/config/theme";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerangkatScreen() {
  const inverterList = [
    {
      id: 1,
      name: "Inverter",
      sn: "2508145015",
      pvPower: "230.00W",
      dailyPv: "22.60kWh",
      cumulativePv: "4.56MWh",
    },
    {
      id: 2,
      name: "Inverter",
      sn: "2508145016",
      pvPower: "210.00W",
      dailyPv: "21.10kWh",
      cumulativePv: "4.21MWh",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.quantityText}>
            Inverter Quantity: {inverterList.length}
          </Text>

          {inverterList.map((item, index) => (
            <View key={item.id} style={styles.headerCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.inverterTitle}>
                  {item.name} {index + 1}
                </Text>
                <Text style={styles.snText}>{item.sn}</Text>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>PV Power</Text>
                  <Text style={styles.metricValue}>{item.pvPower}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Daily PV</Text>
                  <Text style={styles.metricValue}>{item.dailyPv}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Cumulative PV</Text>
                  <Text style={styles.metricValue}>{item.cumulativePv}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "500",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  headerCard: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: 26,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  inverterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
  },
  snText: {
    fontSize: 14,
    fontWeight: "600",
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "900",
    color: appColors.text,
    fontFamily: appFont,
  },
});
