//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_ACCENT_COLOR,
  AUTH_FONT,
} from "@/features/auth/constants/styles";
import { register as registerAccount } from "@/features/auth/services/authService";
import {
  isValidEmail,
  isValidPhone,
} from "@/features/auth/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

//===== (RegisterScreen) ======
export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //===== (handleRegister) ======
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
    if (!isValidPhone(normalizedPhone)) {
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
      const { response, data: json } = await registerAccount({
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
      });

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

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Create New Account"
      subtitle="Register akun Batari baru."
    >
      <AuthField
        label="Email"
        placeholder="hallo@batari.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AuthField
        label="Phone / Nomor HP"
        placeholder="081234567890"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <AuthField
        label="Password"
        placeholder="Minimal 6 karakter"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AuthField
        label="Confirm Password"
        placeholder="Ulangi password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <AuthPrimaryButton
        loading={loading}
        label="Create Account"
        onPress={handleRegister}
      />

      <TouchableOpacity
        style={styles.secondaryLink}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </AuthFormLayout>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  secondaryLink: { alignItems: "center", marginTop: 22 },
  linkText: {
    color: AUTH_ACCENT_COLOR,
    fontFamily: AUTH_FONT,
    fontSize: 16,
    fontWeight: "600",
  },
});
