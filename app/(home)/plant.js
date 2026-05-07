import { clearAuth, getToken, isTokenValid } from "@/auth/token";
import { appColors, appFont } from "@/config/theme";
import DeviceCard from "@/components/DeviceCard";
import { AuthContext } from "@/context/AuthContext";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
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
import { BASE_URL } from "@/config/api";

export default function PlantScreen() {
  const { setSelectedDevice } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [plantList, setPlantList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditDevice = (device) => {
    console.log("Edit device:", device);
    // misalnya arahkan ke halaman edit
    // router.push(`/plant/${device.id}/edit`);
  };

  const handleDeleteDevice = (device) => {
    Alert.alert("Hapus Device", `Yakin ingin menghapus ${device.name}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          console.log("Device dihapus:", device);
        },
      },
    ]);
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const token = await getToken();
      if (!token || !isTokenValid(token)) {
        await clearAuth();
        Alert.alert(
          "Error",
          "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
        );
        setIsLoading(false);
        router.replace("/(auth)/login");
        return;
      }


      const endpoint = `${BASE_URL}/api/plant/`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        setPlantList(jsonResponse.data);
      } else {
        Alert.alert(
          "Gagal",
          jsonResponse.message || "Gagal mengambil data perangkat",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi masalah jaringan atau server mati.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    router.push(`/plant/${device.id}/overview`);
  };

  const handleAddDevice = () => {
    router.push("/(main)/add-device");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant</Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={handleAddDevice}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Cari nama plant / SN / lokasi"
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Memuat data plant...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPress={() => handleSelectDevice(item)}
              onEdit={(device) => handleEditDevice(device)}
              onDelete={(device) => handleDeleteDevice(device)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada plant.</Text>
          }
        />
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
});
