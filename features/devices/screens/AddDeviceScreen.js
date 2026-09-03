import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { appFont } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import { linkDeviceToPlant } from "@/services/plantService";

//===== (getParamValue) ======
function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

//===== (Add Datalogger Screen) ======
export default function AddDataloggerScreen() {
  const params = useLocalSearchParams();
  const { colors, t } = useAppSettings();
  const plantId = getParamValue(params.id);
  const [deviceId, setDeviceId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  //===== (handleBack) ======
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(home)/plant");
    }
  }, []);

  //===== (Hardware Back Handler) ======
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  //===== (handleScanQr) ======
  const handleScanQr = () => {
    router.push({
      pathname: "/plant/[id]/qr-scanner",
      params: { id: plantId },
    });
  };

  //===== (handleSaveDevice) ======
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {t("addDatalogger")}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t("deviceId")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="BS26040012"
            placeholderTextColor={colors.textMuted}
            value={deviceId}
            onChangeText={setDeviceId}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.inputBorder }]}
            activeOpacity={0.85}
            onPress={handleScanQr}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.accent} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Scan QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.accent },
              isSaving && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSaveDevice}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Device</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: appFont,
  },
  headerSpacer: {
    width: 44,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: appFont,
    marginBottom: 14,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: appFont,
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: appFont,
  },
});
