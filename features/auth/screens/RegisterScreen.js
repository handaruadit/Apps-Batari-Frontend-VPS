//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_ACCENT_ORANGE,
  AUTH_FONT,
  AUTH_TEXT_MUTED,
} from "@/features/auth/constants/styles";
import { register as registerAccount } from "@/features/auth/services/authService";
import {
  isValidEmail,
  isValidPhone,
} from "@/features/auth/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showAlert } from "@/utils/showAlert";

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
      showAlert("Register gagal", "Email harus diisi.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      showAlert("Register gagal", "Format email tidak valid.");
      return;
    }
    if (!normalizedPhone) {
      showAlert("Register gagal", "Nomor HP harus diisi.");
      return;
    }
    if (!isValidPhone(normalizedPhone)) {
      showAlert(
        "Register gagal",
        "Nomor HP hanya boleh berisi angka, spasi, tanda -, atau awalan +.",
      );
      return;
    }
    if (!password || !confirmPassword) {
      showAlert("Register gagal", "Password dan konfirmasi harus diisi.");
      return;
    }
    if (password.length < 6) {
      showAlert("Register gagal", "Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Register gagal", "Password dan konfirmasi tidak sama.");
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
        showAlert(
          "Akun Berhasil Dibuat",
          json.message || "Akun berhasil dibuat, silakan login.",
          [{ text: "Login Sekarang", onPress: () => router.replace("/(auth)/login") }],
        );
      } else {
        showAlert("Register gagal", json.message || "Email sudah digunakan.");
      }
    } catch {
      showAlert("Register gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Create Account"
      subtitle="Sign up to start monitoring your solar energy"
      scrollable
    >
      <AuthField
        label="Email Address"
        iconName="mail-outline"
        placeholder="batari@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AuthField
        label="Phone Number"
        iconName="call-outline"
        placeholder="081234567890"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <AuthField
        label="Password"
        iconName="lock-closed-outline"
        isPassword
        placeholder="Minimal 6 karakter"
        value={password}
        onChangeText={setPassword}
      />

      <AuthField
        label="Confirm Password"
        iconName="shield-checkmark-outline"
        isPassword
        placeholder="Ulangi password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <AuthPrimaryButton
        loading={loading}
        label="Create Account"
        onPress={handleRegister}
      />

      <View style={styles.bottomRow}>
        <Text style={styles.bottomRegularText}>Already have an account? </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.loginLinkText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </AuthFormLayout>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  bottomRegularText: {
    color: AUTH_TEXT_MUTED,
    fontFamily: AUTH_FONT,
    fontSize: 14,
  },
  loginLinkText: {
    color: AUTH_ACCENT_ORANGE,
    fontFamily: AUTH_FONT,
    fontSize: 14,
    fontWeight: "700",
  },
});
