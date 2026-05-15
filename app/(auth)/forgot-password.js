import { BASE_URL } from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value).trim());
const isValidPhone = (value) => /^[+0-9][0-9\s-]{7,18}$/.test(String(value).trim());
const RESET_SEND_FAILED_MESSAGE =
  "Kode reset password gagal dikirim. Silakan coba lagi nanti.";
const parseJsonSafe = (value) => {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export default function ForgotPasswordScreen() {
  const { height } = useWindowDimensions();
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const isEmailMethod = method === "email";
    const contactValue = isEmailMethod ? normalizedEmail : normalizedPhone;

    if (!contactValue) {
      Alert.alert(
        "Gagal",
        isEmailMethod ? "Email harus diisi." : "Nomor telepon harus diisi.",
      );
      return;
    }
    if (isEmailMethod && !isValidEmail(normalizedEmail)) {
      Alert.alert("Gagal", "Format email tidak valid.");
      return;
    }
    if (!isEmailMethod && !isValidPhone(normalizedPhone)) {
      Alert.alert("Gagal", "Format nomor telepon tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const payload = isEmailMethod
        ? { method: "email", email: normalizedEmail }
        : { method: "phone", phone: normalizedPhone };
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
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
          pathname: "/(auth)/verify-code",
          params: payload,
        });
      } else {
        console.warn("[forgot-password] request failed", {
          status: response.status,
          body: responseText,
        });
        Alert.alert("Gagal", RESET_SEND_FAILED_MESSAGE);
      }
    } catch (error) {
      console.error("[forgot-password] network/error", {
        message: error?.message,
        baseUrl: BASE_URL,
        endpoint: `${BASE_URL}/api/auth/forgot-password`,
      });
      Alert.alert("Gagal", RESET_SEND_FAILED_MESSAGE);
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
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Pilih email atau nomor telepon untuk menerima kode reset.
              </Text>

              <View style={styles.methodTabs}>
                {["email", "phone"].map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.methodTab,
                      method === item && styles.methodTabActive,
                    ]}
                    onPress={() => setMethod(item)}
                  >
                    <Text
                      style={[
                        styles.methodTabText,
                        method === item && styles.methodTabTextActive,
                      ]}
                    >
                      {item === "email" ? "Email" : "Phone"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {method === "email" ? (
                <>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="hallo@batari.com"
                    placeholderTextColor="#6E7480"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Phone / Nomor Telepon</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="081234567890"
                    placeholderTextColor="#6E7480"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonBusy]}
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Code</Text>
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
  methodTabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  methodTab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(24,174,230,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  methodTabActive: {
    backgroundColor: "#18AEE6",
    borderColor: "#18AEE6",
  },
  methodTabText: {
    color: "#18AEE6",
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "700",
  },
  methodTabTextActive: {
    color: "#FFFFFF",
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
