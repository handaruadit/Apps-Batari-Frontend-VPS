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

export default function VerifyCodeScreen() {
  const { height } = useWindowDimensions();
  const { method = "email", email = "", phone = "" } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMethod = String(method || "email");
  const normalizedEmail = String(email || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const contactLabel =
    resetMethod === "phone" ? normalizedPhone : normalizedEmail;

  const handleVerify = async () => {
    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      Alert.alert("Gagal", "Masukkan kode 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const payload =
        resetMethod === "phone"
          ? { method: "phone", phone: normalizedPhone, code: normalizedCode }
          : { method: "email", email: normalizedEmail, code: normalizedCode };
      const response = await fetch(`${BASE_URL}/api/auth/verify-reset-code`, {
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
        router.push({
          pathname: "/(auth)/reset-password",
          params: payload,
        });
      } else {
        console.warn("[verify-code] request failed", {
          status: response.status,
          body: responseText,
        });
        Alert.alert("Gagal", json.message || "Kode salah atau kedaluwarsa.");
      }
    } catch (error) {
      console.error("[verify-code] network/error", {
        message: error?.message,
        baseUrl: BASE_URL,
        endpoint: `${BASE_URL}/api/auth/verify-reset-code`,
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
              <Text style={styles.title}>Verify Code</Text>
              <Text style={styles.subtitle}>
                Masukkan kode 6 digit yang dikirim ke {contactLabel}.
              </Text>

              <Text style={styles.label}>Passcode</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor="#6E7480"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonBusy]}
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify Code</Text>
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
    fontSize: 18,
    letterSpacing: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    textAlign: "center",
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
