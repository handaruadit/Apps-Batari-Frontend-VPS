//===== (Imports) ======
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity } from "react-native";

import styles from "@/features/plants/styles/plantFormStyles";

//===== (Plant Field Label) ======
export function PlantFieldLabel({ label, required = false, colors }) {
  return (
    <Text style={[styles.label, { color: colors.textSoft }]}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

//===== (Plant Text Field) ======
export function PlantTextField({
  label,
  required = false,
  colors,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}) {
  return (
    <>
      <PlantFieldLabel label={label} required={required} colors={colors} />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.inputBorder,
            color: colors.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        value={value}
        onChangeText={onChangeText}
        {...(keyboardType === undefined ? {} : { keyboardType })}
      />
    </>
  );
}

//===== (Plant Select Field) ======
export function PlantSelectField({
  label,
  required = false,
  colors,
  placeholder,
  value,
  onPress,
}) {
  return (
    <>
      <PlantFieldLabel label={label} required={required} colors={colors} />
      <TouchableOpacity
        style={[
          styles.inputButton,
          { backgroundColor: colors.input, borderColor: colors.inputBorder },
        ]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text
          style={[
            value ? styles.inputButtonText : styles.placeholderText,
            { color: value ? colors.text : colors.textMuted },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </>
  );
}
