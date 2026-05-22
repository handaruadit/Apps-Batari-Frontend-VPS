import {
  clearAuth,
  getToken,
  getUserFromToken,
  getUserInfo,
  isTokenValid,
} from "@/auth/token";
import { appFont } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  fetchAdminDeviceAccess,
  createAdminDevice,
  updateAdminDeviceAccess,
} from "@/services/adminService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function flattenRows(users) {
  return users.flatMap((user) =>
    (user?.plants || []).map((plant) => ({
      userId: user.userId ?? user.id,
      email: user.email || "-",
      plantId: plant.plantId ?? plant.id,
      plantName: plant.plantName ?? plant.name ?? "-",
      deviceId: plant.deviceId ?? plant.device_id ?? "-",
      allowed: plant.allowed === true || plant.allowed === "true",
    })),
  );
}

export default function AdminDeviceAccessScreen() {
  const router = useRouter();
  const { colors } = useAppSettings();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingKey, setUpdatingKey] = useState("");
  const [newDeviceId, setNewDeviceId] = useState("");
  const [isCreatingDevice, setIsCreatingDevice] = useState(false);

  const loadAccess = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchAdminDeviceAccess();
      setRows(flattenRows(data));
    } catch (error) {
      Alert.alert("Admin Device Access", error?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const guard = async () => {
      const token = await getToken();

      if (!token || !isTokenValid(token)) {
        await clearAuth();
        router.replace("/(auth)/login");
        return;
      }

      const userInfo = (await getUserInfo()) ?? getUserFromToken(token);
      const role = String(userInfo?.role || "").toLowerCase();

      if (role !== "admin") {
        router.replace("/(home)/plant");
        return;
      }

      if (isMounted) {
        loadAccess();
      }
    };

    guard();

    return () => {
      isMounted = false;
    };
  }, [loadAccess, router]);

  const groupedRows = useMemo(() => {
    return rows.reduce((items, row) => {
      const key = `${row.userId}-${row.email}`;
      if (!items[key]) {
        items[key] = {
          userId: row.userId,
          email: row.email,
          rows: [],
        };
      }
      items[key].rows.push(row);
      return items;
    }, {});
  }, [rows]);

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/(auth)/login");
  };

  const toggleAccess = async (row, nextAllowed) => {
    const rowKey = `${row.userId}-${row.plantId}-${row.deviceId}`;
    const previousRows = rows;

    setUpdatingKey(rowKey);
    setRows((currentRows) =>
      currentRows.map((item) =>
        item.userId === row.userId &&
        item.plantId === row.plantId &&
        item.deviceId === row.deviceId
          ? { ...item, allowed: nextAllowed }
          : item,
      ),
    );

    try {
      await updateAdminDeviceAccess({
        userId: row.userId,
        plantId: row.plantId,
        deviceId: row.deviceId,
        allowed: nextAllowed,
      });
    } catch (error) {
      setRows(previousRows);
      Alert.alert("Gagal mengubah akses", error?.message || "Coba lagi.");
    } finally {
      setUpdatingKey("");
    }
  };

  const handleCreateDevice = async () => {
    const trimmedDeviceId = newDeviceId.trim();

    if (!trimmedDeviceId) {
      Alert.alert("Tambah Device ID", "Device ID tidak boleh kosong.");
      return;
    }

    setIsCreatingDevice(true);

    try {
      const device = await createAdminDevice(trimmedDeviceId);
      setNewDeviceId("");
      Alert.alert(
        "Tambah Device ID",
        `Device ID ${device?.deviceId || trimmedDeviceId.toUpperCase()} berhasil ditambahkan.`,
      );
      await loadAccess({ refresh: true });
    } catch (error) {
      Alert.alert(
        "Gagal menambahkan Device ID",
        error?.message || "Coba lagi.",
      );
    } finally {
      setIsCreatingDevice(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Admin Device Access
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Kelola izin monitoring device per user
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.bubbleBorder }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.accent} />
          <Text style={[styles.logoutText, { color: colors.accent }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.textMuted }]}>
            Memuat data akses...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAccess({ refresh: true })}
              tintColor={colors.accent}
            />
          }
        >
          {Object.values(groupedRows).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada user atau device yang bisa dikelola.
            </Text>
          ) : (
            Object.values(groupedRows).map((group) => (
              <View
                key={`${group.userId}-${group.email}`}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.bubble,
                    borderColor: colors.bubbleBorder,
                  },
                ]}
              >
                <Text style={[styles.userEmail, { color: colors.text }]}>
                  User: {group.email}
                </Text>

                {group.rows.map((row) => {
                  const rowKey = `${row.userId}-${row.plantId}-${row.deviceId}`;
                  const isUpdating = updatingKey === rowKey;

                  return (
                    <View
                      key={rowKey}
                      style={[
                        styles.accessRow,
                        { borderTopColor: colors.bubbleBorder },
                      ]}
                    >
                      <View style={styles.accessInfo}>
                        <Text style={[styles.accessLabel, { color: colors.textMuted }]}>
                          Plant
                        </Text>
                        <Text style={[styles.accessValue, { color: colors.text }]}>
                          {row.plantName}
                        </Text>
                        <Text style={[styles.accessLabel, { color: colors.textMuted }]}>
                          Device ID
                        </Text>
                        <Text style={[styles.accessValue, { color: colors.text }]}>
                          {row.deviceId}
                        </Text>
                      </View>

                      <View style={styles.switchWrap}>
                        {isUpdating ? (
                          <ActivityIndicator size="small" color={colors.accent} />
                        ) : null}
                        <Switch
                          value={row.allowed}
                          disabled={isUpdating}
                          onValueChange={(nextValue) => toggleAccess(row, nextValue)}
                          trackColor={{ false: "#CBD5E1", true: colors.accent }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}

          <View
            style={[
              styles.addDeviceCard,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
              },
            ]}
          >
            <Text style={[styles.addDeviceTitle, { color: colors.text }]}>
              Tambah Device ID
            </Text>
            <TextInput
              value={newDeviceId}
              onChangeText={setNewDeviceId}
              placeholder="Masukkan Device ID"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              editable={!isCreatingDevice}
              style={[
                styles.deviceInput,
                {
                  color: colors.text,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isCreatingDevice}
              onPress={handleCreateDevice}
              style={[
                styles.addDeviceButton,
                { backgroundColor: colors.accent },
                isCreatingDevice && styles.disabledButton,
              ]}
            >
              {isCreatingDevice ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addDeviceButtonText}>
                  Masukan Device ID
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 3,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    marginBottom: 14,
  },
  addDeviceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 2,
  },
  addDeviceTitle: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  deviceInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  addDeviceButton: {
    minHeight: 44,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.72,
  },
  addDeviceButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  userEmail: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },
  accessRow: {
    borderTopWidth: 1,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  accessInfo: {
    flex: 1,
  },
  accessLabel: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  accessValue: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  switchWrap: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
