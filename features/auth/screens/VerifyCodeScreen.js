//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_BASE_URL,
  AUTH_ENDPOINTS,
  verifyPasswordResetCode,
} from "@/features/auth/services/authService";
import { isValidResetCode } from "@/features/auth/utils/validators";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";

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
      Alert.alert("Gagal", "Masukkan kode 6 digit.");
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
        Alert.alert("Gagal", json.message || "Kode salah atau kedaluwarsa.");
      }
    } catch (error) {
      console.error("[verify-code] network/error", {
        message: error?.message,
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.verifyResetCode,
      });
      Alert.alert("Gagal", "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Verify Code"
      subtitle={`Masukkan kode 6 digit yang dikirim ke ${contactLabel}.`}
      subtitleLineHeight={21}
    >
      <AuthField
        label="Passcode"
        inputStyle={styles.codeInput}
        placeholder="123456"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <AuthPrimaryButton
        loading={loading}
        label="Verify Code"
        onPress={handleVerify}
      />
    </AuthFormLayout>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  codeInput: {
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
  },
});
