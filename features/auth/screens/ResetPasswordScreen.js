//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_BASE_URL,
  AUTH_ENDPOINTS,
  resetPassword,
} from "@/features/auth/services/authService";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

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
      const { response, responseText, data: json } =
        await resetPassword(payload);

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
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.resetPassword,
      });
      Alert.alert("Gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Reset Password"
      subtitle="Buat password baru untuk akunmu."
      subtitleLineHeight={21}
    >
      <AuthField
        label="New Password"
        placeholder="Minimal 6 karakter"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <AuthField
        label="Confirm New Password"
        placeholder="Ulangi password baru"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <AuthPrimaryButton
        loading={loading}
        label="Reset Password"
        onPress={handleResetPassword}
      />
    </AuthFormLayout>
  );
}
