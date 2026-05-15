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

export default function RegisterScreen() {
  const { height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedEmail) {
      Alert.alert("Register gagal", "Email harus diisi.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      Alert.alert("Register gagal", "Format email tidak valid.");
      return;
    }
    if (!normalizedPhone) {
      Alert.alert("Register gagal", "Nomor HP harus diisi.");
      return;
    }
    if (!/^[+0-9][0-9\s-]{7,18}$/.test(normalizedPhone)) {
      Alert.alert(
        "Register gagal",
        "Nomor HP hanya boleh berisi angka, spasi, tanda -, atau awalan +.",
      );
      return;
    }
    if (!password || !confirmPassword) {
      Alert.alert("Register gagal", "Password dan konfirmasi harus diisi.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Register gagal", "Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Register gagal", "Password dan konfirmasi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: normalizedPhone,
          password,
        }),
      });
      const json = await response.json();

      if (response.ok && (json.success || json.status === "success")) {
        Alert.alert(
          "Account created",
          json.message || "Account created successfully, please login.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
      } else {
        Alert.alert("Register gagal", json.message || "Email sudah digunakan.");
      }
    } catch {
      Alert.alert("Register gagal", "Terjadi kesalahan jaringan.");
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
              <Text style={styles.title}>Create New Account</Text>
              <Text style={styles.subtitle}>Register akun Batari baru.</Text>

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

              <Text style={styles.label}>Phone / Nomor HP</Text>
              <TextInput
                style={styles.input}
                placeholder="081234567890"
                placeholderTextColor="#6E7480"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#6E7480"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                placeholderTextColor="#6E7480"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonBusy]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryLink}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Text style={styles.linkText}>Back to Login</Text>
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
  secondaryLink: { alignItems: "center", marginTop: 22 },
  linkText: {
    color: "#18AEE6",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "600",
  },
});
