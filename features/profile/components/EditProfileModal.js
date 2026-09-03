//===== (Imports) ======
import { saveUserInfo } from "@/auth/token";
import { updateUserProfile } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles as styles } from "../styles";

//===== (EditProfileModal) ======
export default function EditProfileModal({
  visible,
  onClose,
  user,
  onProfileUpdated,
  colors,
  themeMode,
  t,
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef(null);

  const scrollToPassword = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 180);
  };

  // Sync user data on open
  useEffect(() => {
    if (visible && user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (password) {
      if (!oldPassword) {
        Alert.alert(t("warning"), "Masukkan kata sandi saat ini untuk mengubah kata sandi.");
        return;
      }
      if (password.length < 6) {
        Alert.alert(t("warning"), "Kata sandi baru minimal 6 karakter.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert(t("warning"), "Konfirmasi kata sandi baru tidak cocok.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const updatedData = await updateUserProfile({
        name: fullName.trim(),
        phone: phone.trim(),
        password: password ? password : undefined,
        oldPassword: password ? oldPassword : undefined,
      });

      const mergedUser = {
        ...user,
        ...updatedData,
        name: fullName.trim(),
        phone: phone.trim(),
      };

      await saveUserInfo(mergedUser);
      onProfileUpdated?.(mergedUser);

      Alert.alert(
        t("success"),
        "Informasi profil berhasil diperbarui.",
        [{ text: "OK", onPress: onClose }],
      );
    } catch (error) {
      Alert.alert("Gagal", error.message || "Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Solid full-screen backdrop so profile background never peeks through */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.72)" },
          ]}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1, justifyContent: "flex-end" }}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.bottomSheetCard,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
                maxHeight: "88%",
                elevation: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {t("editInformation")}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 36 }}
            >
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                {t("fullName")}
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Masukkan nama lengkap"
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    backgroundColor:
                      themeMode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.05)",
                    borderColor: colors.bubbleBorder,
                  },
                ]}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                {t("email")} (Read-only)
              </Text>
              <View
                style={[
                  styles.formInput,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor:
                      themeMode === "light" ? "#F1F5F9" : "rgba(255,255,255,0.02)",
                    borderColor: colors.bubbleBorder,
                    opacity: 0.75,
                  },
                ]}
              >
                <Text style={{ color: colors.text }}>{email || "-"}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                {t("phoneNumber")}
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="08123456789"
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    backgroundColor:
                      themeMode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.05)",
                    borderColor: colors.bubbleBorder,
                  },
                ]}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Password Section */}
            <View style={{ marginTop: 6, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accent, marginBottom: 8 }}>
                Ganti Kata Sandi (Opsional)
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  Kata Sandi Saat Ini
                </Text>
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  onFocus={scrollToPassword}
                  secureTextEntry
                  placeholder="Masukkan kata sandi lama jika ingin mengganti"
                  style={[
                    styles.formInput,
                    {
                      color: colors.text,
                      backgroundColor:
                        themeMode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.05)",
                      borderColor: colors.bubbleBorder,
                    },
                  ]}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                  {t("newPassword")}
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={scrollToPassword}
                  secureTextEntry
                  placeholder="Minimal 6 karakter"
                  style={[
                    styles.formInput,
                    {
                      color: colors.text,
                      backgroundColor:
                        themeMode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.05)",
                      borderColor: colors.bubbleBorder,
                    },
                  ]}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {password.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                    {t("confirmNewPassword")}
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={scrollToPassword}
                    secureTextEntry
                    placeholder="Ulangi kata sandi baru"
                    style={[
                      styles.formInput,
                      {
                        color: colors.text,
                        backgroundColor:
                          themeMode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.05)",
                        borderColor: colors.bubbleBorder,
                      },
                    ]}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: colors.bubbleBorder },
                ]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>
                  {t("cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: colors.accent },
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>{t("saveChanges")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
