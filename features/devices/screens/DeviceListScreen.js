//===== (Imports) ======
import { useFocusEffect } from "@react-navigation/native";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import DeviceCard from "@/features/devices/components/DeviceCard";
import styles from "@/features/devices/styles/deviceListStyles";
import {
  fetchPlantDevices,
  normalizePlantAccessRole,
  PLANT_ACCESS_ROLE_VALUES,
  unlinkDeviceFromPlant,
} from "@/services/plantService";

//===== (getParamValue) ======
function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

//===== (getAccessRoleFromPlant) ======
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

//===== (canCurrentUserUnlinkDevice) ======
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

//===== (Perangkat Screen) ======
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
  //===== (Resolved Plant ID) ======
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
  const activePlantIdRef = useRef(resolvedPlantId);

  //===== (Reset Plant Scoped State) ======
  useEffect(() => {
    activePlantIdRef.current = resolvedPlantId;
    setPlant(null);
    setDevices([]);
    setCanUnlinkDevice(false);
    setErrorMessage("");
    setIsLoading(true);
  }, [resolvedPlantId]);

  //===== (handleDeleteDevice) ======
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

  //===== (loadDevices) ======
  const loadDevices = useCallback(
    async ({ refreshing = false } = {}) => {
      const requestPlantId = resolvedPlantId;
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
        if (String(activePlantIdRef.current) !== String(requestPlantId)) {
          return;
        }
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
        if (String(activePlantIdRef.current) === String(requestPlantId)) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // The original screen refreshes when the selected device id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            devices.map((item, index) => (
              <DeviceCard
                key={`${item.device_id}-${item.id || index}`}
                item={item}
                index={index}
                plant={plant}
                canUnlinkDevice={canUnlinkDevice}
                onDelete={handleDeleteDevice}
                t={t}
                colors={colors}
                themeMode={themeMode}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
