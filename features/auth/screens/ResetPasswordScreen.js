//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_ACCENT_ORANGE,
  AUTH_FONT,
  AUTH_TEXT_MUTED,
} from "@/features/auth/constants/styles";
import {
  AUTH_BASE_URL,
  AUTH_ENDPOINTS,
  resetPassword,
} from "@/features/auth/services/authService";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showAlert } from "@/utils/showAlert";

//===== (ResetPasswordScreen) ======
export default function ResetPasswordScreen() {
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

  //===== (handleResetPassword) ======
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert("Gagal", "Password baru dan konfirmasi harus diisi.");
      return;
    }
    if (newPassword.length < 6) {
      showAlert("Gagal", "Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Gagal", "Password dan konfirmasi tidak sama.");
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
      const { response, responseText, data: json } =
        await resetPassword(payload);

      if (response.ok && (json.success || json.status === "success")) {
        showAlert(
          "Password Berhasil Diubah",
          json.message || "Password berhasil diubah. Silakan login kembali.",
          [{ text: "Login Sekarang", onPress: () => router.replace("/(auth)/login") }],
        );
      } else {
        console.warn("[reset-password] request failed", {
          status: response.status,
          body: responseText,
        });
        showAlert("Gagal", json.message || "Kode salah atau kedaluwarsa.");
      }
    } catch (error) {
      console.error("[reset-password] network/error", {
        message: error?.message,
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.resetPassword,
      });
      showAlert("Gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Reset Password"
      subtitle="Buat password baru yang aman untuk akun Batari Energy Anda"
    >
      <AuthField
        label="New Password"
        iconName="lock-closed-outline"
        isPassword
        placeholder="Minimal 6 karakter"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <AuthField
        label="Confirm New Password"
        iconName="shield-checkmark-outline"
        isPassword
        placeholder="Ulangi password baru"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <AuthPrimaryButton
        loading={loading}
        label="Update Password"
        onPress={handleResetPassword}
      />

      <View style={styles.bottomRow}>
        <Text style={styles.bottomRegularText}>Batal ubah password? </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.loginLinkText}>Kembali ke Login</Text>
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
