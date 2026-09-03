//===== (Imports) ======
import { deleteUserAccount } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles as styles } from "../styles";

//===== (DeleteAccountModal) ======
export default function DeleteAccountModal({
  visible,
  onClose,
  onAccountDeleted,
  colors,
  t,
}) {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      Alert.alert(t("warning"), "Masukkan kata sandi Anda untuk mengonfirmasi penghapusan akun.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount({ password });
      Alert.alert(
        "Akun Dihapus",
        "Akun Anda telah berhasil dihapus dari sistem Batari.",
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              onAccountDeleted?.();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Gagal", error.message || "Gagal menghapus akun.");
    } finally {
      setIsDeleting(false);
    }
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
          <View style={styles.dangerIconWrapper}>
            <Ionicons name="warning-outline" size={38} color="#EF4444" />
          </View>

          <Text style={[styles.aboutAppTitle, { color: colors.text }]}>
            {t("deleteAccount")}
          </Text>

          <Text
            style={[
              styles.aboutDescription,
              { color: colors.textMuted, marginTop: 8, marginBottom: 14 },
            ]}
          >
            {t("confirmDeleteAccount")}
          </Text>

          <View style={{ width: "100%", marginBottom: 14 }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Masukkan kata sandi untuk konfirmasi"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.formInput,
                {
                  color: colors.text,
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                },
              ]}
            />
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { borderColor: colors.bubbleBorder },
              ]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>
                {t("cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                { backgroundColor: "#EF4444" },
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalConfirmText}>{t("deleteAccount")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
