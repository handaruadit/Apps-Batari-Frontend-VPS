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
  verifyPasswordResetCode,
} from "@/features/auth/services/authService";
import { isValidResetCode } from "@/features/auth/utils/validators";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { showAlert } from "@/utils/showAlert";

//===== (VerifyCodeScreen) ======
export default function VerifyCodeScreen() {
  const { method = "email", email = "", phone = "" } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMethod = String(method || "email");
  const normalizedEmail = String(email || "").trim();
  const normalizedPhone = String(phone || "").trim();
  const contactLabel =
    resetMethod === "phone" ? normalizedPhone : normalizedEmail;

  //===== (handleVerify) ======
  const handleVerify = async () => {
    const normalizedCode = code.trim();

    if (!isValidResetCode(normalizedCode)) {
      showAlert("Gagal", "Masukkan kode verifikasi 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const payload =
        resetMethod === "phone"
          ? { method: "phone", phone: normalizedPhone, code: normalizedCode }
          : { method: "email", email: normalizedEmail, code: normalizedCode };
      const { response, responseText, data: json } =
        await verifyPasswordResetCode(payload);

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
        showAlert("Gagal", json.message || "Kode salah atau kedaluwarsa.");
      }
    } catch (error) {
      console.error("[verify-code] network/error", {
        message: error?.message,
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.verifyResetCode,
      });
      showAlert("Gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Verify Code"
      subtitle={`Masukkan kode 6 digit yang telah dikirimkan ke ${contactLabel}`}
    >
      <AuthField
        label="Verification Passcode"
        iconName="key-outline"
        inputStyle={styles.codeInput}
        placeholder="123456"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <AuthPrimaryButton
        loading={loading}
        label="Verify & Continue"
        onPress={handleVerify}
      />

      <View style={styles.bottomRow}>
        <Text style={styles.bottomRegularText}>Belum menerima kode? </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.resendLinkText}>Kirim Ulang</Text>
        </TouchableOpacity>
      </View>
    </AuthFormLayout>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  codeInput: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 6,
    textAlign: "center",
  },
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
  resendLinkText: {
    color: AUTH_ACCENT_ORANGE,
    fontFamily: AUTH_FONT,
    fontSize: 14,
    fontWeight: "700",
  },
});
