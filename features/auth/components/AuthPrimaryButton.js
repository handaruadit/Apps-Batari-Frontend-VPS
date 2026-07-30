//===== (Imports) ======
import {
  AUTH_ACCENT_COLOR,
  AUTH_FONT,
} from "@/features/auth/constants/styles";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

//===== (AuthPrimaryButton) ======
export default function AuthPrimaryButton({ loading, label, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, loading && styles.buttonBusy]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: AUTH_ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonBusy: { opacity: 0.76 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: AUTH_FONT,
    fontSize: 17,
    fontWeight: "600",
  },
});
