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
  requestPasswordReset,
} from "@/features/auth/services/authService";
import { isValidEmail } from "@/features/auth/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showAlert } from "@/utils/showAlert";

//===== (Constants) ======
const RESET_SEND_FAILED_MESSAGE =
  "Kode reset password gagal dikirim. Silakan coba lagi nanti.";

//===== (ForgotPasswordScreen) ======
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  //===== (handleSendCode) ======
  const handleSendCode = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      showAlert("Gagal", "Email harus diisi.");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      showAlert("Gagal", "Format email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const payload = { method: "email", email: normalizedEmail };
      const { response, responseText, data: json } =
        await requestPasswordReset(payload);

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
        showAlert("Gagal", json?.message || RESET_SEND_FAILED_MESSAGE);
      }
    } catch (error) {
      console.error("[forgot-password] network/error", {
        message: error?.message,
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.forgotPassword,
      });
      showAlert("Gagal", RESET_SEND_FAILED_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Forgot Password?"
      subtitle="Masukkan alamat email Anda untuk menerima kode verifikasi"
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

      <AuthPrimaryButton
        loading={loading}
        label="Send Reset Code"
        onPress={handleSendCode}
      />

      <View style={styles.bottomRow}>
        <Text style={styles.bottomRegularText}>Remember your password? </Text>
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
