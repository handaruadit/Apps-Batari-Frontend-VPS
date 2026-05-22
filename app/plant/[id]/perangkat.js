import { appColors, appFont } from "@/config/theme";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { fetchPlantDevices } from "@/services/plantService";
import { useFocusEffect } from "@react-navigation/native";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);
  return Number.isFinite(number) ? String(Number(number.toFixed(4))) : String(value);
}

function formatLocation(plant) {
  const cityProvince = [plant?.city, plant?.province]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(", ");

  return cityProvince || "-";
}

function formatWeather(plant) {
  const weather = plant?.weatherConditionText || plant?.weather || "-";
  const temperature =
    plant?.weatherTemperature === null || plant?.weatherTemperature === undefined
      ? "-"
      : `${plant.weatherTemperature}°C`;

  return `${weather} / ${temperature}`;
}

function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

const HIDDEN_BATTERY_PARAMETERS = new Set(["sw_bal", "sw_chg", "sw_dis"]);
const BATTERY_GROUP_KEYS = new Set(["baterai", "battery", "data_bms", "setting_bms"]);
const DEFAULT_BATTERY_PARAMS = [
  "power",
  "cells_1",
  "cells_2",
  "cells_3",
  "cells_4",
  "voltage",
  "current",
  "soc",
  "cycle",
  "alarm",
];

function normalizeParameterKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function formatBatteryParameterLabel(value) {
  const key = normalizeParameterKey(value);
  const cellMatch = key.match(/^cells?_(\d+)$/);

  if (cellMatch) {
    return `Cell ${cellMatch[1]}`;
  }

  const knownLabels = {
    power: "Power",
    alarm: "Alarm",
    current: "Current",
    cycle: "Cycle",
    soc: "SoC",
    voltage: "Voltage",
  };

  if (knownLabels[key]) {
    return knownLabels[key];
  }

  return String(value || "-")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "-";
}

function getBatteryParameterUnit(key) {
  const normalizedKey = normalizeParameterKey(key);

  if (normalizedKey === "power") {
    return "kW";
  }

  if (/^cells?_\d+$/.test(normalizedKey) || normalizedKey === "voltage") {
    return "V";
  }

  if (normalizedKey === "current") {
    return "A";
  }

  if (normalizedKey === "soc") {
    return "%";
  }

  return "";
}

function formatBatteryParameterValue(value, key) {
  const formattedValue =
    value === null || value === undefined || value === "" ? "0" : formatValue(value);
  const unit = getBatteryParameterUnit(key);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function isBatteryCategory(value) {
  const key = normalizeParameterKey(value);
  return (
    key.includes("battery") ||
    key.includes("baterai") ||
    BATTERY_GROUP_KEYS.has(key)
  );
}

function pushBatteryParameter(rows, seenKeys, label, value) {
  const safeLabel = String(label || "").trim();

  if (!safeLabel) {
    return;
  }

  const normalizedKey = normalizeParameterKey(safeLabel);

  if (
    HIDDEN_BATTERY_PARAMETERS.has(normalizedKey) ||
    BATTERY_GROUP_KEYS.has(normalizedKey)
  ) {
    return;
  }

  if (seenKeys.has(normalizedKey)) {
    return;
  }

  seenKeys.add(normalizedKey);
  rows.push({
    key: normalizedKey,
    label: formatBatteryParameterLabel(safeLabel),
    value,
  });
}

function collectBatteryObjectParameters(source, rows, seenKeys, prefix = "") {
  if (!source || typeof source !== "object") {
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (
      ["id", "device_id", "deviceId", "created_at", "updated_at", "timestamp"].includes(
        key,
      )
    ) {
      return;
    }

    const normalizedKey = normalizeParameterKey(key);
    const shouldFlattenGroup = BATTERY_GROUP_KEYS.has(normalizedKey);
    const label = prefix && !shouldFlattenGroup ? `${prefix}_${key}` : key;
    const nextPrefix = shouldFlattenGroup ? prefix : label;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === "object") {
          collectBatteryObjectParameters(item, rows, seenKeys, nextPrefix);
        } else {
          pushBatteryParameter(rows, seenKeys, `${label}_${index + 1}`, item);
        }
      });
      return;
    }

    if (value && typeof value === "object") {
      collectBatteryObjectParameters(value, rows, seenKeys, nextPrefix);
      return;
    }

    pushBatteryParameter(rows, seenKeys, label, value);
  });
}

function getBatteryParameterRows(device) {
  const rows = [];
  const seenKeys = new Set();

  if (Array.isArray(device?.latestData)) {
    device.latestData.forEach((row) => {
      const categoryKey = normalizeParameterKey(row?.category);
      const typeKey = normalizeParameterKey(row?.type || row?.parameter || row?.name);

      if (!isBatteryCategory(categoryKey) && !isBatteryCategory(typeKey)) {
        return;
      }

      if (BATTERY_GROUP_KEYS.has(typeKey) && row?.value && typeof row.value === "object") {
        collectBatteryObjectParameters(row.value, rows, seenKeys);
        return;
      }

      pushBatteryParameter(
        rows,
        seenKeys,
        row?.type || row?.parameter || row?.name,
        row?.value,
      );
    });
  }

  [
    device?.battery,
    device?.batteries,
    device?.batteryData,
    device?.battery_data,
    device?.latestBatteryData,
    device?.latest_battery_data,
    device?.parameters?.battery,
    device?.parameters?.baterai,
  ].forEach((source) => {
    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (item?.type || item?.parameter || item?.name) {
          pushBatteryParameter(
            rows,
            seenKeys,
            item.type || item.parameter || item.name,
            item.value,
          );
          return;
        }

        collectBatteryObjectParameters(item, rows, seenKeys);
      });
      return;
    }

    collectBatteryObjectParameters(source, rows, seenKeys);
  });

  DEFAULT_BATTERY_PARAMS.forEach((key) => {
    pushBatteryParameter(rows, seenKeys, key, 0);
  });

  const defaultOrder = new Map(
    DEFAULT_BATTERY_PARAMS.map((key, index) => [normalizeParameterKey(key), index]),
  );

  return rows.sort((left, right) => {
    const leftOrder = defaultOrder.get(left.key);
    const rightOrder = defaultOrder.get(right.key);

    if (leftOrder !== undefined && rightOrder !== undefined) {
      return leftOrder - rightOrder;
    }

    if (leftOrder !== undefined) {
      return -1;
    }

    if (rightOrder !== undefined) {
      return 1;
    }

    return left.label.localeCompare(right.label);
  });
}

export default function PerangkatScreen() {
  const { colors, themeMode } = useAppSettings();
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const { selectedDevice } = useContext(AuthContext);
  const localId = getParamValue(localParams.id);
  const localPlantId = getParamValue(localParams.plantId);
  const globalId = getParamValue(globalParams.id);
  const globalPlantId = getParamValue(globalParams.plantId);
  const resolvedPlantId = useMemo(
    () =>
      localPlantId ??
      localId ??
      globalPlantId ??
      globalId ??
      (selectedDevice?.id == null ? undefined : String(selectedDevice.id)),
    [globalId, globalPlantId, localId, localPlantId, selectedDevice?.id],
  );
  const [plant, setPlant] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDevices = useCallback(
    async ({ refreshing = false } = {}) => {
      console.log("PERANGKAT_ROUTE_IDS:", {
        localId,
        localPlantId,
        globalId,
        globalPlantId,
        selectedDeviceId: selectedDevice?.id,
      });
      console.log("PERANGKAT_RESOLVED_PLANT_ID:", resolvedPlantId);

      if (!resolvedPlantId) {
        setErrorMessage("ID plant tidak ditemukan.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setErrorMessage("");
        const result = await fetchPlantDevices(resolvedPlantId);
        console.log("PERANGKAT_RESPONSE_DATA:", result);
        setPlant(result?.plant || null);
        setDevices(Array.isArray(result?.devices) ? result.devices : []);
      } catch (error) {
        console.log("PERANGKAT_ERROR:", error?.message || error);
        if (error.code === "AUTH_EXPIRED") {
          Alert.alert(
            "Error",
            "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
          );
          router.replace("/(auth)/login");
          return;
        }

        setErrorMessage(error.message || "Gagal mengambil data device.");
        Alert.alert("Gagal", error.message || "Gagal mengambil data device.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      globalId,
      globalPlantId,
      localId,
      localPlantId,
      resolvedPlantId,
      router,
      selectedDevice?.id,
    ],
  );

  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [loadDevices]),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDevices({ refreshing: true })}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.content}>
          <Text style={[styles.quantityText, { color: colors.textMuted }]}>
            Inverter Quantity: {devices.length}
          </Text>

          {isLoading ? (
            <View
              style={[
                styles.stateCard,
                themeMode === "light" && {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                Loading device...
              </Text>
            </View>
          ) : errorMessage ? (
            <View
              style={[
                styles.stateCard,
                themeMode === "light" && {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                {errorMessage}
              </Text>
            </View>
          ) : devices.length === 0 ? (
            <View
              style={[
                styles.stateCard,
                themeMode === "light" && {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                Belum ada device terhubung.
              </Text>
            </View>
          ) : (
            devices.map((item, index) => {
              const batteryParameterRows = getBatteryParameterRows(item);

              return (
                <View
                  key={`${item.device_id}-${item.id || index}`}
                  style={[
                    styles.headerCard,
                    themeMode === "light" && {
                      backgroundColor: colors.bubble,
                      borderColor: colors.bubbleBorder,
                      shadowOpacity: 0.08,
                    },
                  ]}
                >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.inverterTitle, { color: colors.text }]}>
                    Inverter {index + 1}
                  </Text>
                  <Text style={[styles.snText, { color: colors.textMuted }]}>
                    {item.device_id}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                    Device ID
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {item.device_id || "-"}
                  </Text>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                    Address
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {plant?.location || "-"}
                  </Text>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      City, Province
                    </Text>
                    <Text style={[styles.metricValueSmall, { color: colors.text }]}>
                      {formatLocation(plant)}
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Weather
                    </Text>
                    <Text style={[styles.metricValueSmall, { color: colors.text }]}>
                      {formatWeather(plant)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.parameterSection,
                    themeMode === "light" && {
                      borderTopColor: colors.bubbleBorder,
                    },
                  ]}
                >
                  <Text style={[styles.parameterTitle, { color: colors.text }]}>
                    Battery Parameters
                  </Text>
                  {batteryParameterRows.length > 0 ? (
                    batteryParameterRows.map((row) => (
                      <View
                        key={`battery-${row.key}`}
                        style={[
                          styles.parameterRow,
                          themeMode === "light" && {
                            borderBottomColor: "rgba(8,174,234,0.14)",
                          },
                        ]}
                      >
                        <Text style={[styles.parameterType, { color: colors.text }]}>
                          {row.label}
                        </Text>
                        <Text style={[styles.parameterValue, { color: colors.accent }]}>
                          {formatBatteryParameterValue(row.value, row.key)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text
                      style={[
                        styles.emptyParameterText,
                        { color: colors.textMuted },
                      ]}
                    >
                      No data available
                    </Text>
                  )}
                </View>
              </View>
              );
            })
          )}
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
  stateCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    alignItems: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  inverterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
  },
  snText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: appColors.textMuted,
    fontFamily: appFont,
    textAlign: "right",
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
  metricValueSmall: {
    fontSize: 14,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
  },
  infoBlock: {
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
    lineHeight: 20,
  },
  parameterSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: appColors.bubbleBorder,
    paddingTop: 14,
  },
  parameterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 10,
  },
  parameterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  parameterNameWrap: {
    flex: 1,
  },
  parameterCategory: {
    fontSize: 12,
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 2,
  },
  parameterType: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "800",
    color: appColors.accent,
    fontFamily: appFont,
    textAlign: "right",
  },
  emptyParameterText: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
});
