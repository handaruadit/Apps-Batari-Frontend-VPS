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
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
          backgroundColor:
            actionLabel === "Owner"
              ? "rgba(16, 185, 129, 0.12)"
              : "rgba(24, 174, 230, 0.12)",
          borderColor:
            actionLabel === "Owner"
              ? "rgba(16, 185, 129, 0.28)"
              : "rgba(24, 174, 230, 0.28)",
          borderWidth: 1,
        }}
      >
        <Text
          style={[
            styles.roleText,
            {
              color: actionLabel === "Owner" ? "#10B981" : colors.accent,
            },
          ]}
        >
          {actionLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
