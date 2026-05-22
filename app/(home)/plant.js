import { appColors, appFont } from "@/config/theme";
import DeviceCard from "@/components/DeviceCard";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEMO_PLANT_NAME,
  deletePlant,
  fetchPlantDevices,
  fetchPlants,
  isDemoPlant,
} from "@/services/plantService";

const PINNED_PLANTS_KEY = "batari:pinned-plants";
const MAX_PINNED_PLANTS = 3;
const STATUS_TIMESTAMP_FIELD_PATTERN =
  /(^|_)(last|latest|created|updated|inserted|received|seen)(_|$)|timestamp|datetime|date_time|time/i;

function parseStatusTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const milliseconds = value < 10000000000 ? value * 1000 : value;
    return Number.isFinite(milliseconds) ? milliseconds : null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function collectStatusTimestamps(source, timestamps = []) {
  if (!source || typeof source !== "object") {
    return timestamps;
  }

  if (Array.isArray(source)) {
    source.forEach((item) => collectStatusTimestamps(item, timestamps));
    return timestamps;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (STATUS_TIMESTAMP_FIELD_PATTERN.test(key)) {
      const timestamp = parseStatusTimestamp(value);

      if (timestamp) {
        timestamps.push(timestamp);
      }
    }

    if (value && typeof value === "object") {
      collectStatusTimestamps(value, timestamps);
    }
  });

  return timestamps;
}

function getLatestStatusTimestamp(source) {
  return Math.max(0, ...collectStatusTimestamps(source));
}

function getDeviceLatestDataTimestamp(device) {
  return Math.max(
    0,
    parseStatusTimestamp(device?.latestDataAt) || 0,
    parseStatusTimestamp(device?.latest_data_at) || 0,
    parseStatusTimestamp(device?.lastDataAt) || 0,
    parseStatusTimestamp(device?.last_data_at) || 0,
    parseStatusTimestamp(device?.timestamp) || 0,
  );
}

async function attachLatestDeviceTimestamps(plants) {
  return Promise.all(
    plants.map(async (plant) => {
      try {
        const result = await fetchPlantDevices(plant.id);
        const devices = Array.isArray(result?.devices) ? result.devices : [];
        const latestDataTimestamp = Math.max(
          0,
          ...devices.map(getDeviceLatestDataTimestamp),
        );

        return {
          ...plant,
          hasDeviceId: devices.length > 0,
          latestDataStatusTimestamp: latestDataTimestamp || null,
        };
      } catch (error) {
        console.warn(
          "Failed to load latest device timestamp for plant status:",
          plant?.id,
          error?.message || error,
        );

        return {
          ...plant,
          latestDataStatusTimestamp: getLatestStatusTimestamp(plant) || null,
        };
      }
    }),
  );
}

export default function PlantScreen() {
  const { colors, themeMode } = useAppSettings();
  const { setSelectedDevice } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [plantList, setPlantList] = useState([]);
  const [pinnedPlantIds, setPinnedPlantIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigatingOverview, setIsNavigatingOverview] = useState(false);

  const savePinnedPlantIds = useCallback(async (ids) => {
    setPinnedPlantIds(ids);
    await AsyncStorage.setItem(PINNED_PLANTS_KEY, JSON.stringify(ids));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPinnedPlants = async () => {
      try {
        const stored = await AsyncStorage.getItem(PINNED_PLANTS_KEY);
        const ids = stored ? JSON.parse(stored) : [];

        if (isMounted && Array.isArray(ids)) {
          setPinnedPlantIds(ids.map(String));
        }
      } catch {
        if (isMounted) {
          setPinnedPlantIds([]);
        }
      }
    };

    loadPinnedPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditDevice = (device) => {
    if (isDemoPlant(device)) {
      Alert.alert(
        "Tidak bisa diedit",
        `${DEMO_PLANT_NAME} tidak bisa diedit karena digunakan sebagai contoh/demo.`,
      );
      return;
    }

    router.push({
      pathname: "/(main)/add-device",
      params: {
        mode: "edit",
        plantId: String(device.id),
        name: device.name || "",
        location: device.location || "",
        city: device.city || "",
        province: device.province || "",
        longitude: device.longitude == null ? "" : String(device.longitude),
        latitude: device.latitude == null ? "" : String(device.latitude),
        timezone: device.timezone || "",
        systemType: device.system_type || device.systemType || "",
        pvCapacity:
          device.pv_capacity == null
            ? device.installed_capacity == null
              ? ""
              : String(device.installed_capacity)
            : String(device.pv_capacity),
        batteryCapacity:
          device.battery_capacity == null ? "" : String(device.battery_capacity),
        currency: device.currency || "",
      },
    });
  };

  const handleDeleteDevice = (device) => {
    if (isDemoPlant(device)) {
      Alert.alert(
        "Tidak bisa dihapus",
        `${DEMO_PLANT_NAME} tidak bisa dihapus karena digunakan sebagai contoh/demo.`,
      );
      return;
    }

    Alert.alert("Hapus Plant", `Yakin ingin menghapus ${device.name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlant(device.id);
            const nextPinnedIds = pinnedPlantIds.filter(
              (id) => id !== String(device.id),
            );
            setPlantList((currentList) =>
              currentList.filter((item) => String(item.id) !== String(device.id)),
            );
            await savePinnedPlantIds(nextPinnedIds);
            Alert.alert("Berhasil", "Plant berhasil dihapus.");
          } catch (error) {
            if (error.code === "AUTH_EXPIRED") {
              Alert.alert(
                "Error",
                "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
              );
              router.replace("/(auth)/login");
              return;
            }

            Alert.alert("Gagal", error.message || "Gagal menghapus plant.");
            console.error(error);
          }
        },
      },
    ]);
  };

  const fetchSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const plants = await fetchPlants();
      const plantsWithStatus = await attachLatestDeviceTimestamps(plants);
      setPlantList(plantsWithStatus);
      const availableIds = new Set(plants.map((item) => String(item.id)));
      const nextPinnedIds = pinnedPlantIds.filter((id) => availableIds.has(id));

      if (nextPinnedIds.length !== pinnedPlantIds.length) {
        await savePinnedPlantIds(nextPinnedIds);
      }
    } catch (error) {
      if (error.code === "AUTH_EXPIRED") {
        Alert.alert(
          "Error",
          "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
        );
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert("Error", error.message || "Terjadi masalah jaringan atau server mati.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pinnedPlantIds, savePinnedPlantIds]);

  useFocusEffect(
    useCallback(() => {
      setIsNavigatingOverview(false);
      fetchSensorData();
    }, [fetchSensorData]),
  );

  const filteredDevices = useMemo(() => {
    return plantList.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.system_type?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword)
      );
    });
  }, [search, plantList]);

  const sortedDevices = useMemo(() => {
    const pinnedOrder = new Map(
      pinnedPlantIds.map((id, index) => [String(id), index]),
    );

    return filteredDevices
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const leftPinOrder = pinnedOrder.get(String(left.item.id));
        const rightPinOrder = pinnedOrder.get(String(right.item.id));
        const leftPinned = leftPinOrder !== undefined;
        const rightPinned = rightPinOrder !== undefined;

        if (leftPinned && rightPinned) {
          return leftPinOrder - rightPinOrder;
        }

        if (leftPinned) {
          return -1;
        }

        if (rightPinned) {
          return 1;
        }

        return left.index - right.index;
      })
      .map(({ item }) => item);
  }, [filteredDevices, pinnedPlantIds]);

  const handlePinToggle = async (device) => {
    const plantId = String(device.id);
    const isPinned = pinnedPlantIds.includes(plantId);

    if (isPinned) {
      await savePinnedPlantIds(pinnedPlantIds.filter((id) => id !== plantId));
      return;
    }

    if (pinnedPlantIds.length >= MAX_PINNED_PLANTS) {
      Alert.alert("Pin Plant", "Maksimal hanya 3 plant yang bisa dipin.");
      return;
    }

    await savePinnedPlantIds([...pinnedPlantIds, plantId]);
  };

  const handleSelectDevice = (device) => {
    if (isNavigatingOverview) {
      return;
    }

    setIsNavigatingOverview(true);
    setSelectedDevice(device);
    setTimeout(() => {
      router.push(`/plant/${device.id}/overview`);
    }, 80);
  };

  const handleAddDevice = () => {
    router.push("/(main)/add-device");
  };

  const handleAddDatalogger = (device) => {
    router.push({
      pathname: "/plant/[id]/Add-device",
      params: { id: String(device.id) },
    });
  };

  const handleManageAccess = (device) => {
    router.push({
      pathname: "/plant/[id]/manage-access",
      params: {
        id: String(device.id),
        name: device.name || "",
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screen }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Plant</Text>

        <TouchableOpacity
          style={[
            styles.addButton,
            themeMode === "light" && {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleAddDevice}
        >
          <Ionicons
            name="add"
            size={24}
            color={themeMode === "light" ? colors.accent : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.bubble,
            borderColor: colors.bubbleBorder,
          },
        ]}
      >
        <TextInput
          placeholder="Cari nama plant / SN / lokasi"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Memuat data plant...
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedDevices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPress={() => handleSelectDevice(item)}
              onPinToggle={(device) => handlePinToggle(device)}
              onAddDatalogger={(device) => handleAddDatalogger(device)}
              onEdit={(device) => handleEditDevice(device)}
              onDelete={(device) => handleDeleteDevice(device)}
              onManageAccess={(device) => handleManageAccess(device)}
              isPinned={pinnedPlantIds.includes(String(item.id))}
              canEdit={item.canEdit === true && !isDemoPlant(item)}
              canAddDatalogger={
                item.canAddDatalogger === true && !isDemoPlant(item)
              }
              canManageAccess={item.canManage === true && !isDemoPlant(item)}
              canDelete={item.canDelete === true && !isDemoPlant(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada plant.
            </Text>
          }
        />
      )}

      {isNavigatingOverview && (
        <View
          style={[styles.navigationOverlay, { backgroundColor: colors.screen }]}
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.navigationLoadingText, { color: colors.textSoft }]}>
            Membuka overview...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  searchBox: {
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: appColors.bubble,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    paddingHorizontal: 16,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    color: appColors.text,
    fontFamily: appFont,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginTop: 24,
    fontSize: 15,
  },
  navigationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.screen,
  },
  navigationLoadingText: {
    marginTop: 12,
    color: appColors.textSoft,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "600",
  },
});
