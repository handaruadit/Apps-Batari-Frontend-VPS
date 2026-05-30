import { appFont } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  addPlantAccessUser,
  fetchPlantAccess,
  normalizePlantAccessRole,
  PLANT_ACCESS_ROLE_VALUES,
  removePlantAccessUser,
  searchPlantAccessUsers,
  updatePlantAccessUser,
} from "@/services/plantService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

const ACCESS_ROLE_OPTIONS = [
  { label: "View Only", value: PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY },
  { label: "Manage Access", value: PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS },
];

function formatRole(role) {
  if (role === "owner") return "Owner";

  const normalizedRole = normalizePlantAccessRole(role);

  if (normalizedRole === PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS) {
    return "Manage Access";
  }

  if (normalizedRole === PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY) {
    return "View Only";
  }

  return "-";
}

function getAccessUserId(user) {
  return user?.userId ?? user?.user_id ?? user?.id ?? null;
}

export default function ManageAccessScreen() {
  console.log("PLANT_ACCESS_ROLE_VALUES =", PLANT_ACCESS_ROLE_VALUES);
  
  const params = useLocalSearchParams();
  const plantId = getParamValue(params.id);
  const plantName = getParamValue(params.name) || "Plant";
  const { colors } = useAppSettings();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!plantId) return;

    setIsLoading(true);
    try {
      const result = await fetchPlantAccess(plantId);
      setUsers(result);
    } catch (error) {
      Alert.alert("Manage Access", error.message || "Gagal mengambil akses.");
    } finally {
      setIsLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  const handleSearch = async () => {
    const text = query.trim();

    if (!text) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchPlantAccessUsers(plantId, text);
      setSearchResults(result);
    } catch (error) {
      Alert.alert("Cari User", error.message || "Gagal mencari user.");
    } finally {
      setIsSearching(false);
    }
  };

  const executeAddUser = async (user, role) => {
    console.log("ROLE =", role);
    const userId = getAccessUserId(user);
    const normalizedRole = normalizePlantAccessRole(role);
    console.log("NORMALIZED =", normalizedRole);

    if (!userId) {
      Alert.alert("Tambah Access", "User tidak ditemukan.");
      return;
    }

    if (!normalizedRole) {
      Alert.alert(
        "Tambah Access",
        "Role tidak valid. Silakan pilih View Only atau Manage Access.",
      );
      return;
    }

    setIsUpdating(true);
    try {
      await addPlantAccessUser(plantId, userId, normalizedRole);
      await loadAccess();
      setQuery("");
      setSearchResults([]);
      Alert.alert("Tambah Access", "User berhasil ditambahkan ke plant.");
    } catch (error) {
      Alert.alert(
        "Tambah Access",
        error.message ||
          "Gagal menambahkan user. Pastikan email dan role sudah benar.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddUser = (user) => {
    const userId = getAccessUserId(user);

    if (!userId) {
      Alert.alert("Tambah Access", "User tidak ditemukan.");
      return;
    }

    const alreadyHasAccess = users.some(
      (accessUser) => String(getAccessUserId(accessUser)) === String(userId),
    );

    if (alreadyHasAccess) {
      Alert.alert("Tambah Access", "User sudah memiliki akses ke plant ini.");
      return;
    }

    Alert.alert("Tambah Access", "Apakah anda yakin menambahkan user ini?", [
      {
        text: "Ya",
        onPress: () => {
          Alert.alert("Pilih Permission", "Tentukan akses untuk user ini", [
            {
              text: "View Only",
              onPress: () =>
                executeAddUser(user, PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY),
            },
            {
              text: "Manage Access",
              onPress: () =>
                executeAddUser(user, PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS),
            },
            {
              text: "Batal",
              style: "cancel",
            },
          ]);
        },
      },
      {
        text: "Tidak",
        style: "cancel",
      },
    ]);
  };

  const handleUserAction = (user) => {
    if (user.role === "owner") {
      Alert.alert("Owner", "Owner tidak bisa diubah atau dihapus.");
      return;
    }

    Alert.alert(user.email || "User", "Pilih permission", [
      {
        text: "View Only",
        onPress: () =>
          handleUpdateRole(user, PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY),
      },
      {
        text: "Manage Access",
        onPress: () =>
          handleUpdateRole(user, PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS),
      },
      {
        text: "remove access",
        style: "destructive",
        onPress: () => handleRemoveUser(user),
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const handleUpdateRole = async (user, role) => {
    const userId = getAccessUserId(user);
    const normalizedRole = normalizePlantAccessRole(role);

    if (!userId) {
      Alert.alert("Update Access", "User tidak ditemukan.");
      return;
    }

    if (!normalizedRole) {
      Alert.alert(
        "Update Access",
        "Role tidak valid. Silakan pilih View Only atau Manage Access.",
      );
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updatePlantAccessUser(
        plantId,
        userId,
        normalizedRole,
      );
      setUsers(result);
    } catch (error) {
      Alert.alert(
        "Update Access",
        error.message ||
          "Gagal mengubah akses user. Pastikan role sudah benar.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveUser = async (user) => {
    const userId = getAccessUserId(user);

    if (!userId) {
      Alert.alert("Remove Access", "User tidak ditemukan.");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await removePlantAccessUser(plantId, userId);
      setUsers(result);
    } catch (error) {
      Alert.alert("Remove Access", error.message || "Gagal menghapus akses.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.text }]}>
              Manage Access
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {plantName}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Authorized Users
          </Text>

          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={getAccessUserId(user)}
                activeOpacity={user.role === "owner" ? 1 : 0.75}
                onPress={() => handleUserAction(user)}
                style={[
                  styles.userRow,
                  { borderTopColor: colors.bubbleBorder },
                ]}
              >
                <View style={styles.userInfo}>
                  <Text style={[styles.userEmail, { color: colors.text }]}>
                    {user.email || "-"}
                  </Text>
                  <Text style={[styles.userPhone, { color: colors.textMuted }]}>
                    {user.phone || "-"}
                  </Text>
                </View>
                <Text style={[styles.roleText, { color: colors.accent }]}>
                  {formatRole(user.role)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>+ Add</Text>
          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Email atau nomor telepon"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSearch}
              disabled={isSearching || isUpdating}
              style={[styles.searchButton, { backgroundColor: colors.accent }]}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {searchResults.map((user) => (
            <TouchableOpacity
              key={getAccessUserId(user)}
              activeOpacity={0.78}
              onPress={() => handleAddUser(user)}
              disabled={isUpdating}
              style={[styles.userRow, { borderTopColor: colors.bubbleBorder }]}
            >
              <View style={styles.userInfo}>
                <Text style={[styles.userEmail, { color: colors.text }]}>
                  {user.email || "-"}
                </Text>
                <Text style={[styles.userPhone, { color: colors.textMuted }]}>
                  {user.phone || "-"}
                </Text>
              </View>
              <Text style={[styles.roleText, { color: colors.accent }]}>
                Add
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: appFont,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 2,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  userRow: {
    minHeight: 58,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  userPhone: {
    marginTop: 2,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
  },
  roleText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "900",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
