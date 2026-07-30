//===== (Imports) ======
import AuthField from "@/features/auth/components/AuthField";
import AuthFormLayout from "@/features/auth/components/AuthFormLayout";
import AuthPrimaryButton from "@/features/auth/components/AuthPrimaryButton";
import {
  AUTH_ACCENT_COLOR,
  AUTH_FONT,
} from "@/features/auth/constants/styles";
import {
  AUTH_BASE_URL,
  AUTH_ENDPOINTS,
  requestPasswordReset,
} from "@/features/auth/services/authService";
import {
  isValidEmail,
  isValidPhone,
} from "@/features/auth/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

//===== (Constants) ======
const RESET_METHODS = ["email", "phone"];
const RESET_SEND_FAILED_MESSAGE =
  "Kode reset password gagal dikirim. Silakan coba lagi nanti.";

//===== (ForgotPasswordScreen) ======
export default function ForgotPasswordScreen() {
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  //===== (handleSendCode) ======
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
        Alert.alert("Gagal", RESET_SEND_FAILED_MESSAGE);
      }
    } catch (error) {
      console.error("[forgot-password] network/error", {
        message: error?.message,
        baseUrl: AUTH_BASE_URL,
        endpoint: AUTH_ENDPOINTS.forgotPassword,
      });
      Alert.alert("Gagal", RESET_SEND_FAILED_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  //===== (Render) ======
  return (
    <AuthFormLayout
      title="Forgot Password?"
      subtitle="Pilih email atau nomor telepon untuk menerima kode reset."
      subtitleLineHeight={21}
    >
      <View style={styles.methodTabs}>
        {RESET_METHODS.map((item) => (
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
        <AuthField
          label="Email"
          placeholder="hallo@batari.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : (
        <AuthField
          label="Phone / Nomor Telepon"
          placeholder="081234567890"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}

      <AuthPrimaryButton
        loading={loading}
        label="Send Code"
        onPress={handleSendCode}
      />
    </AuthFormLayout>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
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
    backgroundColor: AUTH_ACCENT_COLOR,
    borderColor: AUTH_ACCENT_COLOR,
  },
  methodTabText: {
    color: AUTH_ACCENT_COLOR,
    fontFamily: AUTH_FONT,
    fontSize: 15,
    fontWeight: "700",
  },
  methodTabTextActive: {
    color: "#FFFFFF",
  },
});
