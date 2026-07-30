//===== (Imports) ======
import { styles } from "@/features/access/styles";
import { Text, View } from "react-native";

//===== (AccessCard) ======
export default function AccessCard({ title, colors, children }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}
