import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColors, appFont } from "@/config/theme";
import { linkDeviceToPlant } from "@/services/plantService";

function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AddDataloggerScreen() {
  const params = useLocalSearchParams();
  const plantId = getParamValue(params.id);
  const [deviceId, setDeviceId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleScanQr = () => {
    router.push({
      pathname: "/plant/[id]/qr-scanner",
      params: { id: plantId },
    });
  };

  const handleSaveDevice = async () => {
    const trimmedDeviceId = deviceId.trim();

    if (!trimmedDeviceId) {
      Alert.alert("Peringatan", "Device ID tidak boleh kosong.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await linkDeviceToPlant(plantId, trimmedDeviceId);
      const successMessage = result?.data?.alreadyLinked
        ? "Device sudah terhubung."
        : "Device berhasil disimpan.";

      Alert.alert("Berhasil", successMessage, [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/plant/[id]/overview",
              params: { id: plantId },
            }),
        },
      ]);
    } catch (error) {
      if (error.code === "AUTH_EXPIRED") {
        Alert.alert(
          "Error",
          "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
        );
        router.replace("/(auth)/login");
        return;
      }

      const message = String(error.message || "");

      if (error.status === 404 || message.includes("tidak ditemukan")) {
        Alert.alert("Gagal", "Device ID tidak ditemukan.");
        return;
      }

      if (error.status === 409 || message.includes("sudah terhubung")) {
        Alert.alert("Gagal", message);
        return;
      }

      Alert.alert("Gagal", "Gagal menyimpan device. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Add Datalogger</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.label}>Device ID</Text>
          <TextInput
            style={styles.input}
            placeholder="BS26040012"
            placeholderTextColor="#6B7280"
            value={deviceId}
            onChangeText={setDeviceId}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handleScanQr}
          >
            <Ionicons name="qr-code-outline" size={20} color={appColors.text} />
            <Text style={styles.secondaryButtonText}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSaveDevice}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={appColors.text} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Device</Text>
            )}
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  headerSpacer: {
    width: 44,
  },
  sectionCard: {
    backgroundColor: appColors.bubble,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    padding: 16,
  },
  label: {
    color: appColors.textSoft,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 8,
  },
  input: {
    backgroundColor: appColors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    color: appColors.text,
    fontSize: 16,
    fontFamily: appFont,
    marginBottom: 14,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: appFont,
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.accent,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: appFont,
  },
});
