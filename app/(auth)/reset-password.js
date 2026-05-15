import { BASE_URL } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appFont = Platform.select({
  android: "sans-serif",
  ios: "Helvetica Neue",
  default: "System",
});

const parseJsonSafe = (value) => {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export default function ResetPasswordScreen() {
  const { height } = useWindowDimensions();
  const {
    method = "email",
    email = "",
    phone = "",
    code = "",
  } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMethod = String(method || "email");
  const normalizedEmail = String(email || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const normalizedCode = String(code || "").trim();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Gagal", "Password baru dan konfirmasi harus diisi.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Gagal", "Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Gagal", "Password dan konfirmasi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const payload =
        resetMethod === "phone"
          ? {
              method: "phone",
              phone: normalizedPhone,
              code: normalizedCode,
              newPassword,
            }
          : {
              method: "email",
              email: normalizedEmail,
              code: normalizedCode,
              newPassword,
            };
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      const json = parseJsonSafe(responseText);

      if (response.ok && (json.success || json.status === "success")) {
        Alert.alert(
          "Password updated",
          json.message || "Password updated successfully, please login again.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
      } else {
        console.warn("[reset-password] request failed", {
          status: response.status,
          body: responseText,
        });
        Alert.alert("Gagal", json.message || "Kode salah atau kedaluwarsa.");
      }
    } catch (error) {
      console.error("[reset-password] network/error", {
        message: error?.message,
        baseUrl: BASE_URL,
        endpoint: `${BASE_URL}/api/auth/reset-password`,
      });
      Alert.alert("Gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0C1222" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { minHeight: height }]}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
            </Pressable>

            <View style={styles.formSurface}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Buat password baru untuk akunmu.</Text>

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#6E7480"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Ulangi password baru"
                placeholderTextColor="#6E7480"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonBusy]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0C1222" },
  container: { flex: 1, backgroundColor: "#0C1222" },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 14,
    zIndex: 2,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  formSurface: { width: "100%", maxWidth: 430, alignSelf: "center" },
  title: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: appFont,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 28,
  },
  label: {
    color: "#F8FAFC",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    color: "#111827",
    fontFamily: appFont,
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: "#18AEE6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonBusy: { opacity: 0.76 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "600",
  },
});
