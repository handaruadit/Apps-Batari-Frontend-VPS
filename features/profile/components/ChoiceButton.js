//===== (Imports) ======
import { profileStyles as styles } from "@/features/profile/styles";
import { Text, TouchableOpacity } from "react-native";

//===== (ChoiceButton) ======
export default function ChoiceButton({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.choiceButton,
        {
          backgroundColor: active ? colors.accent : colors.input,
          borderColor: active ? colors.accent : colors.inputBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceButtonText,
          { color: active ? "#FFFFFF" : colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
