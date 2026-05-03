import React, { useState } from "react";
import { appColors, appFont } from "@/config/theme";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DeviceCard({ device, onPress, onEdit, onDelete }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(device);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(device);
  };

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.imageWrapper}>
          <ImageBackground
            source={require("@/assets/images/solar-bg.jpg")}
            style={styles.bg}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay}>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={10}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {device.location}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.popupMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={18} color={appColors.accent} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  imageWrapper: {
    height: 130,
  },
  bg: {
    flex: 1,
  },
  imageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageOverlay: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  topRight: {
    alignItems: "flex-end",
  },
  textSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: appColors.bubble,
  },
  title: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 4,
    letterSpacing: 0,
  },
  subtitle: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: appFont,
    letterSpacing: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingRight: 22,
  },
  popupMenu: {
    width: 150,
    backgroundColor: appColors.bubble,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    color: appColors.text,
    fontWeight: "500",
    fontFamily: appFont,
  },
  deleteText: {
    color: "#DC2626",
  },
});
