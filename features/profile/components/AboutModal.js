//===== (Imports) ======
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles as styles } from "../styles";

//===== (AboutModal) ======
export default function AboutModal({ visible, onClose, colors, t }) {
  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centerModalBackdrop}>
        <Pressable style={styles.modalDismissArea} onPress={onClose} />

        <View
          style={[
            styles.centerModalCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          {/* Top-Right Close Button */}
          <TouchableOpacity
            style={styles.modalCloseIconButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.aboutIconWrapper}>
            <Ionicons name="sunny" size={40} color="#18AEE6" />
          </View>

          <Text style={[styles.aboutAppTitle, { color: colors.text }]}>
            Batari Energy Mobile
          </Text>
          <Text style={[styles.aboutVersionBadge, { color: colors.accent }]}>
            Version 1.0.0 (Build 2026.09)
          </Text>

          <Text style={[styles.aboutDescription, { color: colors.textMuted }]}>
            {t("aboutDescription")}
          </Text>

          <View
            style={[
              styles.aboutDivider,
              { backgroundColor: colors.bubbleBorder },
            ]}
          />

          <View style={styles.aboutLinkList}>
            <TouchableOpacity
              style={styles.aboutLinkRow}
              onPress={() => handleOpenLink("https://www.batarienergy.com")}
            >
              <Ionicons name="globe-outline" size={18} color={colors.accent} />
              <Text style={[styles.aboutLinkText, { color: colors.accent }]}>
                www.batarienergy.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutLinkRow}
              onPress={() => handleOpenLink("mailto:admin@batarienergy.com")}
            >
              <Ionicons name="mail-outline" size={18} color={colors.accent} />
              <Text style={[styles.aboutLinkText, { color: colors.accent }]}>
                admin@batarienergy.com
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.aboutCopyright, { color: colors.textMuted }]}>
            © 2026 Batari Energy. All rights reserved.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
