//===== (Imports) ======
import { appColors } from "@/config/theme";
import { profileStyles as styles } from "@/features/profile/styles";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

//===== (MenuRow) ======
export default function MenuRow({
  icon,
  title,
  rightText,
  showArrow = true,
  danger = false,
  children,
  onPress,
  colors = appColors,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.bubbleBorder }]}
      disabled={!onPress && !children}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text
          style={[
            styles.rowTitle,
            { color: colors.text },
            danger && { color: colors.textMuted },
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {children}
        {rightText ? (
          <Text
            style={[
              styles.rightText,
              { color: colors.textMuted },
              danger && { color: colors.textMuted },
            ]}
          >
            {rightText}
          </Text>
        ) : null}
        {showArrow && !children ? (
          <Ionicons name="chevron-forward" size={20} color={colors.accent} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
