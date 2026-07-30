//===== (Imports) ======
import { styles } from "@/features/access/styles";
import { Text, TouchableOpacity, View } from "react-native";

//===== (AccessUserRow) ======
export default function AccessUserRow({
  user,
  colors,
  actionLabel,
  activeOpacity,
  disabled,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled}
      style={[styles.userRow, { borderTopColor: colors.bubbleBorder }]}
    >
      <View style={styles.userInfo}>
        <Text style={[styles.userEmail, { color: colors.text }]}>
          {user.email || "-"}
        </Text>
        <Text style={[styles.userPhone, { color: colors.textMuted }]}>
          {user.phone || "-"}
        </Text>
      </View>
      <Text style={[styles.roleText, { color: colors.accent }]}>
        {actionLabel}
      </Text>
    </TouchableOpacity>
  );
}
