//===== (Imports) ======
import {
  AUTH_FONT,
  AUTH_PRIMARY_NAVY,
} from "@/features/auth/constants/styles";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

//===== (AuthPrimaryButton) ======
export default function AuthPrimaryButton({ loading, label, onPress, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, style, loading && styles.buttonBusy]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[styles.primaryButtonText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: AUTH_PRIMARY_NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: AUTH_PRIMARY_NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonBusy: { opacity: 0.78 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: AUTH_FONT,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
