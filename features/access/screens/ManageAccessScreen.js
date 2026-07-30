//===== (Imports) ======
import AccessCard from "@/features/access/components/AccessCard";
import AccessSearchBar from "@/features/access/components/AccessSearchBar";
import AccessUserRow from "@/features/access/components/AccessUserRow";
import { styles } from "@/features/access/styles";
import {
  formatAccessRole,
  getAccessUserId,
  getParamValue,
} from "@/features/access/utils/accessUser";
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//===== (ManageAccessScreen) ======
export default function ManageAccessScreen() {
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

  //===== (loadAccess) ======
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

  //===== (Load Access Effect) ======
  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  //===== (handleSearch) ======
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

  //===== (executeAddUser) ======
  const executeAddUser = async (user, role) => {
    const userId = getAccessUserId(user);
    const normalizedRole = normalizePlantAccessRole(role);

    if (!userId) {
      Alert.alert("Tambah Access", "User tidak ditemukan.");
      return;
    }

    if (!normalizedRole) {
      Alert.alert(
        "Tambah Access",
        "Role tidak valid. Silakan pilih View Only atau Admin.",
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

  //===== (handleAddUser) ======
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
              text: "Admin",
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

  //===== (handleUserAction) ======
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
        text: "Admin",
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

  //===== (handleUpdateRole) ======
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
        "Role tidak valid. Silakan pilih View Only atau Admin.",
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

  //===== (handleRemoveUser) ======
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

  //===== (Render) ======
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
            onPress={() => router.replace("/plant")}
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

        <AccessCard title="Authorized Users" colors={colors}>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            users.map((user) => (
              <AccessUserRow
                key={getAccessUserId(user)}
                user={user}
                colors={colors}
                actionLabel={formatAccessRole(user.role)}
                activeOpacity={user.role === "owner" ? 1 : 0.75}
                onPress={() => handleUserAction(user)}
              />
            ))
          )}
        </AccessCard>

        <AccessCard title="+ Add" colors={colors}>
          <AccessSearchBar
            query={query}
            colors={colors}
            isSearching={isSearching}
            isUpdating={isUpdating}
            onChangeQuery={setQuery}
            onSearch={handleSearch}
          />

          {searchResults.map((user) => (
            <AccessUserRow
              key={getAccessUserId(user)}
              user={user}
              colors={colors}
              actionLabel="Add"
              activeOpacity={0.78}
              onPress={() => handleAddUser(user)}
              disabled={isUpdating}
            />
          ))}
        </AccessCard>
      </ScrollView>
    </SafeAreaView>
  );
}
