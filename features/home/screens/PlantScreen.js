import DeviceCard from "@/components/DeviceCard";
import PlantCardSkeleton from "@/components/device-card/PlantCardSkeleton";
import { getPlantConnectionStatus } from "@/components/device-card/helpers";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  MAX_PINNED_PLANTS,
  PINNED_PLANTS_KEY,
} from "@/features/home/constants/plants";
import { plantStyles as styles } from "@/features/home/styles/plantStyles";
import { attachLatestDeviceTimestamps } from "@/features/home/utils/plantStatus";
import { usePlantStatusWatcher } from "@/hooks/usePlantStatusWatcher";
import {
  DEMO_PLANT_NAME,
  deletePlant,
  fetchPlants,
  isDemoPlant,
} from "@/services/plantService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//===== (PlantScreen) ======
export default function PlantScreen() {
  const { colors, t, themeMode } = useAppSettings();
  const isLight = themeMode === "light";
  const { setSelectedDevice } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "online" | "offline"
  const [plantList, setPlantList] = useState([]);
  const plantListRef = useRef([]);
  const flatListRef = useRef(null);
  const [pinnedPlantIds, setPinnedPlantIds] = useState([]);
  const [activeMenuPlantId, setActiveMenuPlantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavigatingOverview, setIsNavigatingOverview] = useState(false);

  const [headerAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  // Watch for station online/offline status changes and trigger notifications
  usePlantStatusWatcher(plantList);

  //===== (handleMenuOpen) ======
  const handleMenuOpen = (index, plantId) => {
    setActiveMenuPlantId((prev) => (prev === plantId ? null : plantId));
    if (flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.35,
        });
      } catch {
        // Safe fallback
      }
    }
  };

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
        t("cannotEdit"),
        `${DEMO_PLANT_NAME} ${t("demoPlantCannotEdit")}`,
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
        t("cannotDelete"),
        `${DEMO_PLANT_NAME} ${t("demoPlantCannotDelete")}`,
      );
      return;
    }

    Alert.alert(t("deletePlant"), `${t("deletePlantConfirm")} (${device.name})`, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
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
            Alert.alert(t("success"), t("plantDeletedSuccess"));
          } catch (error) {
            if (error.code === "AUTH_EXPIRED") {
              Alert.alert(
                "Error",
                t("sessionExpiredAlert"),
              );
              router.replace("/(auth)/login");
              return;
            }

            Alert.alert(t("failed"), error.message || t("plantDeleteFailed"));
            console.error(error);
          }
        },
      },
    ]);
  };

  //===== (fetchSensorData) ======
  const fetchSensorData = useCallback(async (forceLoader = false) => {
    if (forceLoader || plantListRef.current.length === 0) {
      setIsLoading(true);
    }
    try {
      const plants = await fetchPlants();
      const plantsWithStatus = await attachLatestDeviceTimestamps(plants);
      setPlantList(plantsWithStatus);
      plantListRef.current = plantsWithStatus;
      const availableIds = new Set(plants.map((item) => String(item.id)));
      const nextPinnedIds = pinnedPlantIds.filter((id) => availableIds.has(id));

      if (nextPinnedIds.length !== pinnedPlantIds.length) {
        await savePinnedPlantIds(nextPinnedIds);
      }
    } catch (error) {
      if (error.code === "AUTH_EXPIRED") {
        Alert.alert(
          "Error",
          t("sessionExpiredAlert"),
        );
        router.replace("/(auth)/login");
        return;
      }

      if (String(error?.message || "").includes("Too many requests")) {
        return;
      }

      Alert.alert(
        "Error",
        error.message || t("networkOrServerError"),
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pinnedPlantIds, savePinnedPlantIds, t]);

  //===== (Plant Focus Effect) ======
  useFocusEffect(
    useCallback(() => {
      setIsNavigatingOverview(false);
      fetchSensorData();
    }, [fetchSensorData]),
  );

  //===== (Pull to Refresh) ======
  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchSensorData(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSensorData]);

  //===== (Filtered Plants) ======
  const filteredDevices = useMemo(() => {
    return plantList.filter((item) => {
      // 1. Status Filter (All, Online, Offline)
      if (statusFilter !== "all") {
        const status = getPlantConnectionStatus(item);
        const isOnline = Boolean(
          status?.isOnline || status?.key === "online" || status?.statusKey === "online"
        );
        if (statusFilter === "online" && !isOnline) {
          return false;
        }
        if (statusFilter === "offline" && isOnline) {
          return false;
        }
      }

      // 2. Keyword Search
      if (!search.trim()) return true;
      const keyword = search.trim().toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword) ||
        item.city?.toLowerCase().includes(keyword) ||
        item.province?.toLowerCase().includes(keyword)
      );
    });
  }, [search, plantList, statusFilter]);

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
      Alert.alert(t("pinPlant"), t("maxPinnedPlantsAlert"));
      return;
    }

    await savePinnedPlantIds([...pinnedPlantIds, plantId]);
  };

  //===== (handleSelectDevice) ======
  const handleSelectDevice = (device) => {
    if (activeMenuPlantId) {
      setActiveMenuPlantId(null);
      return;
    }

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
    setActiveMenuPlantId(null);
    router.push("/(main)/add-device");
  };

  //===== (handleAddDatalogger) ======
  const handleAddDatalogger = (device) => {
    setActiveMenuPlantId(null);
    router.push({
      pathname: "/plant/[id]/Add-device",
      params: { id: String(device.id), from: "plantList" },
    });
  };

  //===== (handleManageAccess) ======
  const handleManageAccess = (device) => {
    setActiveMenuPlantId(null);
    router.push({
      pathname: "/plant/[id]/manage-access",
      params: {
        id: String(device.id),
        name: device.name || "",
      },
    });
  };

  const fleetStats = useMemo(() => {
    let onlineCount = 0;
    let offlineCount = 0;
    let totalCap = 0;

    for (const p of plantList) {
      const status = getPlantConnectionStatus(p);
      if (status?.isOnline || status?.key === "online" || status?.statusKey === "online") {
        onlineCount++;
      } else {
        offlineCount++;
      }
      const cap = Number(p.pv_capacity ?? p.installed_capacity ?? p.capacity ?? 0);
      if (!Number.isNaN(cap) && cap > 0) {
        totalCap += cap;
      }
    }

    return {
      total: plantList.length,
      online: onlineCount,
      offline: offlineCount,
      totalCapacity:
        totalCap >= 1000
          ? `${(totalCap / 1000).toFixed(1)} MWp`
          : `${totalCap.toFixed(1)} kWp`,
    };
  }, [plantList]);

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 0],
  });
  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  //===== (Render) ======
  return (
    <View style={[styles.container, { backgroundColor: colors.screen }]}>
      <View style={styles.contentWrapper}>
        <Animated.View
          style={{
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          }}
        >
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              {/* Opsi 1: BySense Brand Header */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                <Image
                  source={require("@/assets/images/app-icon-1024.png")}
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 7,
                    marginRight: 8,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.text,
                      fontSize: 22,
                      letterSpacing: -0.4,
                      lineHeight: 28,
                    },
                  ]}
                >
                  By<Text style={{ color: "#18AEE6" }}>Sense</Text>
                </Text>
              </View>

              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {plantList.length > 0
                  ? `${plantList.length} ${t("registeredStations") || "stasiun terdaftar"}`
                  : t("monitoringFleet") || "Pemantauan Pembangkit"}
              </Text>
            </View>

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

          {plantList.length > 0 && (
            <View
              style={[
                styles.fleetCard,
                {
                  backgroundColor: colors.bubble,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <View style={styles.fleetHeaderRow}>
                <View style={styles.fleetTitleRow}>
                  <Ionicons name="flash" size={14} color="#18AEE6" />
                  <Text style={[styles.fleetTitleText, { color: colors.text }]}>
                    {t("fleetOverview") || "Ringkasan Armada"}
                  </Text>
                </View>

                <View style={styles.fleetPill}>
                  <Text style={styles.fleetPillText}>
                    {fleetStats.totalCapacity}
                  </Text>
                </View>
              </View>

              <View style={styles.fleetStatsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setStatusFilter("all")}
                  style={[
                    styles.fleetStatItem,
                    statusFilter === "all" && {
                      backgroundColor: isLight
                        ? "rgba(24, 174, 230, 0.12)"
                        : "rgba(24, 174, 230, 0.18)",
                      borderColor: "rgba(24, 174, 230, 0.35)",
                    },
                  ]}
                >
                  <Text style={[styles.fleetStatValue, { color: colors.text }]}>
                    {fleetStats.total}
                  </Text>
                  <Text style={[styles.fleetStatLabel, { color: colors.textMuted }]}>
                    {t("totalPlants") || "Total Unit"}
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.fleetDivider,
                    { backgroundColor: colors.bubbleBorder },
                  ]}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setStatusFilter("online")}
                  style={[
                    styles.fleetStatItem,
                    statusFilter === "online" && {
                      backgroundColor: isLight
                        ? "rgba(22, 163, 74, 0.12)"
                        : "rgba(22, 163, 74, 0.18)",
                      borderColor: "rgba(22, 163, 74, 0.35)",
                    },
                  ]}
                >
                  <Text style={[styles.fleetStatValue, { color: "#16A34A" }]}>
                    {fleetStats.online}
                  </Text>
                  <Text style={[styles.fleetStatLabel, { color: colors.textMuted }]}>
                    {t("online") || "Online"}
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.fleetDivider,
                    { backgroundColor: colors.bubbleBorder },
                  ]}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setStatusFilter("offline")}
                  style={[
                    styles.fleetStatItem,
                    statusFilter === "offline" && {
                      backgroundColor: isLight
                        ? "rgba(220, 38, 38, 0.12)"
                        : "rgba(220, 38, 38, 0.18)",
                      borderColor: "rgba(220, 38, 38, 0.35)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.fleetStatValue,
                      {
                        color:
                          fleetStats.offline > 0 ? "#DC2626" : colors.textMuted,
                      },
                    ]}
                  >
                    {fleetStats.offline}
                  </Text>
                  <Text style={[styles.fleetStatLabel, { color: colors.textMuted }]}>
                    {t("offline") || "Offline"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <TextInput
              placeholder={t("searchPlantPlaceholder")}
              placeholderTextColor={colors.textMuted}
              value={search}
              onFocus={() => setActiveMenuPlantId(null)}
              onChangeText={(val) => {
                setSearch(val);
                setActiveMenuPlantId(null);
              }}
              style={[styles.searchInput, { color: colors.text, flex: 1 }]}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearch("");
                  setActiveMenuPlantId(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {search.trim().length > 0 && (
            <Text style={[styles.searchCountText, { color: colors.textMuted }]}>
              {`${filteredDevices.length} ${t("plantsFound") || "stasiun ditemukan"}`}
            </Text>
          )}
        </Animated.View>

        {isLoading ? (
          <PlantCardSkeleton count={3} />
        ) : (
        <FlatList
          ref={flatListRef}
          data={sortedDevices}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              colors={[colors.accent || "#18AEE6"]}
              tintColor={colors.accent || "#18AEE6"}
            />
          }
          onScrollBeginDrag={() => setActiveMenuPlantId(null)}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.35,
              });
            }, 120);
          }}
          renderItem={({ item, index }) => (
            <DeviceCard
              device={item}
              index={index}
              menuVisible={activeMenuPlantId === item.id}
              onMenuOpen={() => handleMenuOpen(index, item.id)}
              onCloseMenu={() => setActiveMenuPlantId(null)}
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
            plantList.length > 0 ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 36,
                  paddingHorizontal: 20,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor:
                      statusFilter === "offline"
                        ? "rgba(22, 163, 74, 0.12)"
                        : "rgba(24, 174, 230, 0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Ionicons
                    name={
                      statusFilter === "offline"
                        ? "checkmark-circle-outline"
                        : "filter-outline"
                    }
                    size={30}
                    color={statusFilter === "offline" ? "#16A34A" : "#18AEE6"}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  {statusFilter === "offline"
                    ? t("noOfflineStations")
                    : statusFilter === "online"
                      ? t("noOnlineStations")
                      : t("noStationsFound")}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    textAlign: "center",
                    marginBottom: 18,
                    paddingHorizontal: 20,
                  }}
                >
                  {statusFilter === "offline"
                    ? t("allStationsOperatingNormally")
                    : search.trim().length > 0
                      ? `${t("noStationsMatchSearch")} "${search}".`
                      : t("noStationsInFilter")}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.bubble,
                    borderWidth: 1,
                    borderColor: colors.bubbleBorder,
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setStatusFilter("all");
                    setSearch("");
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color="#18AEE6"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#18AEE6",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t("showAllStations")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 40,
                  paddingHorizontal: 20,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "rgba(24, 174, 230, 0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="sunny-outline" size={36} color="#18AEE6" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {t("noPlantsRegistered")}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    textAlign: "center",
                    marginBottom: 20,
                    paddingHorizontal: 20,
                  }}
                >
                  {t("emptyPlants")}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#18AEE6",
                    paddingVertical: 13,
                    paddingHorizontal: 22,
                    borderRadius: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#18AEE6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  activeOpacity={0.85}
                  onPress={handleAddDevice}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {t("addNewPlant")}
                  </Text>
                </TouchableOpacity>
              </View>
            )
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
      </View>
    </View>
  );
}
