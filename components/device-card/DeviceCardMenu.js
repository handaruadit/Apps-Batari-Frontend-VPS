//===== (Imports) ======
import { styles } from "@/components/device-card/styles";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//===== (MenuAction) ======
function MenuAction({
  icon,
  label,
  iconColor,
  textColor,
  danger = false,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text
        style={[
          styles.menuText,
          { color: textColor },
          danger && styles.deleteText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

//===== (DeviceCardMenu) ======
export default function DeviceCardMenu({
  visible,
  colors,
  themeMode,
  isPinned,
  canEdit,
  canAddDatalogger,
  canManageAccess,
  canDelete,
  t,
  onClose,
  onPinToggle,
  onEdit,
  onAddDatalogger,
  onManageAccess,
  onDelete,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[
            styles.popupMenu,
            themeMode === "light" && {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
              borderWidth: 1,
            },
          ]}
        >
          <MenuAction
            icon={isPinned ? "pin" : "pin-outline"}
            label={isPinned ? t("unpin") : t("pin")}
            iconColor={colors.accent}
            textColor={colors.text}
            onPress={onPinToggle}
          />

          {canEdit && (
            <MenuAction
              icon="create-outline"
              label={t("edit")}
              iconColor={colors.accent}
              textColor={colors.text}
              onPress={onEdit}
            />
          )}

          {canAddDatalogger && (
            <MenuAction
              icon="hardware-chip-outline"
              label={t("addDatalogger")}
              iconColor={colors.accent}
              textColor={colors.text}
              onPress={onAddDatalogger}
            />
          )}

          {canManageAccess && (
            <MenuAction
              icon="people-outline"
              label={t("manageAccess")}
              iconColor={colors.accent}
              textColor={colors.text}
              onPress={onManageAccess}
            />
          )}

          {canDelete && (
            <MenuAction
              icon="trash-outline"
              label={t("delete")}
              iconColor="#DC2626"
              textColor={colors.text}
              danger
              onPress={onDelete}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
