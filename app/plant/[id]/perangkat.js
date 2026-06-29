import { appColors, appFont } from "@/config/theme";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  fetchPlantDevices,
  unlinkDeviceFromPlant,
  normalizePlantAccessRole,
  PLANT_ACCESS_ROLE_VALUES,
} from "@/services/plantService";
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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);
  return Number.isFinite(number)
    ? String(Number(number.toFixed(4)))
    : String(value);
}

function formatLocation(plant) {
  const cityProvince = [plant?.city, plant?.province]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(", ");

  return cityProvince || "-";
}

function formatAddress(plant) {
  return plant?.address || plant?.location || "-";
}

function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getAccessRoleFromPlant(value) {
  const role =
    value?.accessRole ??
    value?.access_role ??
    value?.plantAccessRole ??
    value?.plant_access_role ??
    value?.userRole ??
    value?.user_role ??
    value?.role ??
    value?.permission ??
    value?.access;

  if (role === "owner") {
    return "owner";
  }

  return normalizePlantAccessRole(role);
}

function canCurrentUserUnlinkDevice(plant, selectedDevice) {
  const role =
    getAccessRoleFromPlant(plant) || getAccessRoleFromPlant(selectedDevice);

  if (role === "owner") {
    return true;
  }

  if (role === PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY) {
    return false;
  }

  if (role === PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS) {
    return true;
  }

  return (
    plant?.canUnlinkDevice === true ||
    plant?.can_unlink_device === true ||
    plant?.canDeleteDevice === true ||
    plant?.can_delete_device === true ||
    plant?.canManage === true ||
    plant?.can_manage === true ||
    selectedDevice?.canUnlinkDevice === true ||
    selectedDevice?.can_unlink_device === true ||
    selectedDevice?.canDeleteDevice === true ||
    selectedDevice?.can_delete_device === true ||
    selectedDevice?.canManage === true ||
    selectedDevice?.can_manage === true ||
    selectedDevice?.canAddDatalogger === true ||
    selectedDevice?.can_add_datalogger === true
  );
}

const HIDDEN_BATTERY_PARAMETERS = new Set(["sw_bal", "sw_chg", "sw_dis"]);
const BATTERY_GROUP_KEYS = new Set([
  "baterai",
  "battery",
  "data_bms",
  "setting_bms",
]);
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

function formatBatteryParameterLabel(value, t = (key) => key) {
  const key = normalizeParameterKey(value);
  const cellMatch = key.match(/^cells?_(\d+)$/);

  if (cellMatch) {
    return `${t("cell")} ${cellMatch[1]}`;
  }

  const knownLabels = {
    power: t("power"),
    alarm: t("alarm"),
    current: t("current"),
    cycle: t("cycle"),
    soc: "SoC",
    voltage: t("voltage"),
  };

  if (knownLabels[key]) {
    return knownLabels[key];
  }

  return (
    String(value || "-")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "-"
  );
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
    value === null || value === undefined || value === ""
      ? "0"
      : formatValue(value);
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

function pushBatteryParameter(rows, seenKeys, label, value, t) {
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
    label: formatBatteryParameterLabel(safeLabel, t),
    value,
  });
}

function parseMaybeJson(value) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || !["{", "["].includes(trimmedValue[0])) {
    return value;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return value;
  }
}

function collectBatteryObjectParameters(
  source,
  rows,
  seenKeys,
  prefix = "",
  t,
) {
  source = parseMaybeJson(source);

  if (!source || typeof source !== "object") {
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (
      [
        "id",
        "device_id",
        "deviceId",
        "created_at",
        "updated_at",
        "timestamp",
      ].includes(key)
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
          collectBatteryObjectParameters(item, rows, seenKeys, nextPrefix, t);
        } else {
          pushBatteryParameter(
            rows,
            seenKeys,
            `${label}_${index + 1}`,
            item,
            t,
          );
        }
      });
      return;
    }

    const parsedValue = parseMaybeJson(value);

    if (parsedValue && typeof parsedValue === "object") {
      collectBatteryObjectParameters(
        parsedValue,
        rows,
        seenKeys,
        nextPrefix,
        t,
      );
      return;
    }

    pushBatteryParameter(rows, seenKeys, label, parsedValue, t);
  });
}

function collectBatterySource(source, rows, seenKeys, t) {
  const parsedSource = parseMaybeJson(source);

  if (Array.isArray(parsedSource)) {
    parsedSource.forEach((item) => {
      const parsedItem = parseMaybeJson(item);

      if (parsedItem?.type || parsedItem?.parameter || parsedItem?.name) {
        pushBatteryParameter(
          rows,
          seenKeys,
          parsedItem.type || parsedItem.parameter || parsedItem.name,
          parseMaybeJson(parsedItem.value),
          t,
        );
        return;
      }

      collectBatteryObjectParameters(parsedItem, rows, seenKeys, "", t);
    });
    return;
  }

  if (parsedSource && typeof parsedSource === "object") {
    const batteryEntries = Object.entries(parsedSource).filter(([key]) =>
      isBatteryCategory(key),
    );

    if (batteryEntries.length) {
      batteryEntries.forEach(([, value]) =>
        collectBatteryObjectParameters(value, rows, seenKeys, "", t),
      );
      return;
    }
  }

  collectBatteryObjectParameters(parsedSource, rows, seenKeys, "", t);
}

function getBatteryParameterRows(device, t) {
  const rows = [];
  const seenKeys = new Set();

  if (Array.isArray(device?.latestData)) {
    device.latestData.forEach((row) => {
      const categoryKey = normalizeParameterKey(row?.category);
      const typeKey = normalizeParameterKey(
        row?.type || row?.parameter || row?.name,
      );

      if (!isBatteryCategory(categoryKey) && !isBatteryCategory(typeKey)) {
        return;
      }

      const parsedRowValue = parseMaybeJson(row?.value);

      if (
        BATTERY_GROUP_KEYS.has(typeKey) &&
        parsedRowValue &&
        typeof parsedRowValue === "object"
      ) {
        collectBatteryObjectParameters(parsedRowValue, rows, seenKeys, "", t);
        return;
      }

      pushBatteryParameter(
        rows,
        seenKeys,
        row?.type || row?.parameter || row?.name,
        parsedRowValue,
        t,
      );
    });
  }

  [
    device?.latestData && !Array.isArray(device.latestData)
      ? device.latestData
      : null,
    device?.latest_data,
    device?.data_bms,
    device?.setting_bms,
    device?.baterai,
    device?.battery,
    device?.batteries,
    device?.batteryData,
    device?.battery_data,
    device?.latestBatteryData,
    device?.latest_battery_data,
    device?.parameters?.battery,
    device?.parameters?.baterai,
  ].forEach((source) => {
    collectBatterySource(source, rows, seenKeys, t);
  });

  DEFAULT_BATTERY_PARAMS.forEach((key) => {
    pushBatteryParameter(rows, seenKeys, key, 0, t);
  });

  const defaultOrder = new Map(
    DEFAULT_BATTERY_PARAMS.map((key, index) => [
      normalizeParameterKey(key),
      index,
    ]),
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
  const { colors, t, themeMode } = useAppSettings();
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
  const [canUnlinkDevice, setCanUnlinkDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDeleteDevice = (deviceId) => {
    if (!canUnlinkDevice) {
      Alert.alert(
        "Tidak diizinkan",
        "Akun view only tidak dapat melepas device dari plant.",
      );
      return;
    }

    if (!resolvedPlantId) {
      setErrorMessage("ID plant tidak ditemukan.");
      setCanUnlinkDevice(false);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!deviceId) {
      Alert.alert("Gagal", "Device ID tidak ditemukan.");
      return;
    }

    Alert.alert(
      "Hapus Device",
      "Apakah Anda yakin ingin melepas device ini dari plant?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await unlinkDeviceFromPlant(resolvedPlantId, deviceId);
              setDevices((prevDevices) =>
                prevDevices.filter((device) => device.device_id !== deviceId),
              );
            } catch (error) {
              if (error.code === "AUTH_EXPIRED") {
                Alert.alert(
                  "Error",
                  "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
                );
                router.replace("/(auth)/login");
                return;
              }

              Alert.alert(
                "Gagal",
                error.message || "Gagal melepas device dari plant.",
              );
            }
          },
        },
      ],
    );
  };

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
        console.log("DEVICE_RESPONSE", result);

        const nextPlant = result?.plant || null;
        const nextDevices = Array.isArray(result?.devices)
          ? result.devices
          : [];

        setPlant(nextPlant);
        setDevices(nextDevices);
        setCanUnlinkDevice(
          canCurrentUserUnlinkDevice(nextPlant, selectedDevice),
        );
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
            {t("inverterQuantity")}: {devices.length}
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
                {t("loadingDevice")}
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
                {t("noDeviceConnected")}
              </Text>
            </View>
          ) : (
            devices.map((item, index) => {
              const batteryParameterRows = getBatteryParameterRows(item, t);

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
                    <Text
                      style={[styles.inverterTitle, { color: colors.text }]}
                    >
                      {t("inverter")} {index + 1}
                    </Text>

                    {canUnlinkDevice && (
                      <View style={styles.cardHeaderRight}>
                        <TouchableOpacity
                          onPress={() => handleDeleteDevice(item.device_id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <MaterialIcons
                            name="delete-outline"
                            size={22}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View style={styles.infoBlock}>
                    <Text
                      style={[styles.metricLabel, { color: colors.textMuted }]}
                    >
                      {t("deviceId")}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {item.device_id || "-"}
                    </Text>
                  </View>

                  <View style={styles.infoBlock}>
                    <Text
                      style={[styles.metricLabel, { color: colors.textMuted }]}
                    >
                      {t("address")}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {formatAddress(plant)}
                    </Text>
                  </View>

                  <View style={styles.infoBlock}>
                    <Text
                      style={[styles.metricLabel, { color: colors.textMuted }]}
                    >
                      {t("cityProvince")}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {formatLocation(plant)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.parameterSection,
                      themeMode === "light" && {
                        borderTopColor: colors.bubbleBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.parameterTitle, { color: colors.text }]}
                    >
                      {t("batteryParameters")}
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
                          <Text
                            style={[
                              styles.parameterType,
                              { color: colors.text },
                            ]}
                          >
                            {row.label}
                          </Text>
                          <Text
                            style={[
                              styles.parameterValue,
                              { color: colors.accent },
                            ]}
                          >
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
                        {t("noDataAvailable")}
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
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 6,
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
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
