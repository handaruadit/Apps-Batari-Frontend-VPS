//===== (Imports) ======
import { AUTH_FONT } from "@/features/auth/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

//===== (AuthField) ======
export default function AuthField({
  label,
  iconName,
  isPassword = false,
  containerStyle,
  inputStyle,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
        ]}
      >
        {iconName ? (
          <Ionicons
            name={iconName}
            size={20}
            color={focused ? "#18AEE6" : "#64748B"}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          {...inputProps}
          secureTextEntry={isPassword ? !showPassword : false}
          style={[styles.input, inputStyle]}
          placeholderTextColor="#94A3B8"
          selectionColor="#18AEE6"
          cursorColor="#18AEE6"
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={focused ? "#18AEE6" : "#64748B"}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    color: "#F8FAFC",
    fontFamily: AUTH_FONT,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: "#18AEE6",
    backgroundColor: "#FFFFFF",
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: "#0F172A",
    fontFamily: AUTH_FONT,
    fontSize: 15,
    paddingVertical: 10,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 6,
  },
});
