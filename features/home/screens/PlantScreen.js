//===== (Imports) ======
import DeviceCard from "@/components/DeviceCard";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  MAX_PINNED_PLANTS,
  PINNED_PLANTS_KEY,
} from "@/features/home/constants/plants";
import { plantStyles as styles } from "@/features/home/styles/plantStyles";
import { attachLatestDeviceTimestamps } from "@/features/home/utils/plantStatus";
import {
  DEMO_PLANT_NAME,
  deletePlant,
  fetchPlants,
  isDemoPlant,
} from "@/services/plantService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//===== (PlantScreen) ======
export default function PlantScreen() {
  const { colors, t, themeMode } = useAppSettings();
  const { setSelectedDevice } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [plantList, setPlantList] = useState([]);
  const [pinnedPlantIds, setPinnedPlantIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigatingOverview, setIsNavigatingOverview] = useState(false);

  //===== (savePinnedPlantIds) ======
  const savePinnedPlantIds = useCallback(async (ids) => {
    setPinnedPlantIds(ids);
    await AsyncStorage.setItem(PINNED_PLANTS_KEY, JSON.stringify(ids));
  }, []);

  //===== (Load Pinned Plants Effect) ======
  useEffect(() => {
    let isMounted = true;

    //===== (loadPinnedPlants) ======
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

  //===== (handleEditDevice) ======
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

  //===== (handleDeleteDevice) ======
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
              currentList.filter(
                (item) => String(item.id) !== String(device.id),
              ),
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

  //===== (fetchSensorData) ======
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

      Alert.alert(
        "Error",
        error.message || "Terjadi masalah jaringan atau server mati.",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pinnedPlantIds, savePinnedPlantIds]);

  //===== (Plant Focus Effect) ======
  useFocusEffect(
    useCallback(() => {
      setIsNavigatingOverview(false);
      fetchSensorData();
    }, [fetchSensorData]),
  );

  //===== (Filtered Plants) ======
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

  //===== (Sorted Plants) ======
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

  //===== (handlePinToggle) ======
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

  //===== (handleSelectDevice) ======
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

  //===== (handleAddDevice) ======
  const handleAddDevice = () => {
    router.push("/(main)/add-device");
  };

  //===== (handleAddDatalogger) ======
  const handleAddDatalogger = (device) => {
    router.push({
      pathname: "/plant/[id]/Add-device",
      params: { id: String(device.id) },
    });
  };

  //===== (handleManageAccess) ======
  const handleManageAccess = (device) => {
    router.push({
      pathname: "/plant/[id]/manage-access",
      params: {
        id: String(device.id),
        name: device.name || "",
      },
    });
  };

  //===== (Render) ======
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
          placeholder={t("searchPlantPlaceholder")}
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
            {t("loadingPlants")}
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
              {t("emptyPlants")}
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
          <Text
            style={[styles.navigationLoadingText, { color: colors.textSoft }]}
          >
            {t("openingOverview")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
