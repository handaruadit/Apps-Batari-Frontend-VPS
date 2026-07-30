//===== (Imports) ======
import { AUTH_FONT } from "@/features/auth/constants/styles";
import { StyleSheet, Text, TextInput } from "react-native";

//===== (AuthField) ======
export default function AuthField({ label, inputStyle, ...inputProps }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={inputStyle ? [styles.input, inputStyle] : styles.input}
        placeholderTextColor="#6E7480"
      />
    </>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  label: {
    color: "#F8FAFC",
    fontFamily: AUTH_FONT,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    color: "#111827",
    fontFamily: AUTH_FONT,
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
