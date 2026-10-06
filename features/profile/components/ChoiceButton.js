//===== (Imports) ======
import { profileStyles as styles } from "@/features/profile/styles";
import { Text, TouchableOpacity } from "react-native";

//===== (ChoiceButton) ======
export default function ChoiceButton({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      onPress={onPress}
      style={[
        styles.choiceButton,
        {
          minHeight: 34,
          paddingHorizontal: 12,
          backgroundColor: active ? colors.accent : colors.input,
          borderColor: active ? colors.accent : colors.inputBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceButtonText,
          {
            color: active ? "#FFFFFF" : colors.textSoft,
            fontWeight: active ? "800" : "600",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
