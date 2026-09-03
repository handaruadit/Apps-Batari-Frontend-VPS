//===== (Imports) ======
import {
  getUserInfo,
  removeRememberMe,
  removeToken,
  removeUserInfo,
} from "@/auth/token";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import AboutModal from "@/features/profile/components/AboutModal";
import ChoiceButton from "@/features/profile/components/ChoiceButton";
import DeleteAccountModal from "@/features/profile/components/DeleteAccountModal";
import EditProfileModal from "@/features/profile/components/EditProfileModal";
import MenuRow from "@/features/profile/components/MenuRow";
import NotificationSettingsModal from "@/features/profile/components/NotificationSettingsModal";
import { profileStyles as styles } from "@/features/profile/styles";
import { clearAppCache, getAppCacheSize } from "@/features/profile/utils/cacheUtils";
import { fetchUserProfile } from "@/services/userService";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

//===== (ProfileScreen) ======
export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useContext(AuthContext);
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useAppSettings();

  // Modals State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cacheSize, setCacheSize] = useState("0 KB");

  // Load user profile & real cache size on mount
  useEffect(() => {
    getAppCacheSize().then(setCacheSize).catch(() => {});
    const loadProfile = async () => {
      try {
        const storedUser = await getUserInfo();
        if (storedUser) {
          setUser((prev) => ({ ...prev, ...storedUser }));
        }
        const remoteProfile = await fetchUserProfile();
        if (remoteProfile) {
          setUser((prev) => ({ ...prev, ...remoteProfile }));
        }
      } catch {
        // Fallback to local stored user
      }
    };

    loadProfile();
  }, [setUser]);

  // Compute Avatar Initials
  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Admin Batari";
  const displayEmail = user?.email || "admin@batarienergy.com";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AB";

  //===== (handleClearCache) ======
  const handleClearCache = () => {
    Alert.alert(
      t("cache"),
      "Bersihkan file cache dan data telemetri sementara? (Data akun & sesi login Anda akan tetap aman).",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: "Bersihkan",
          onPress: async () => {
            try {
              const newSize = await clearAppCache();
              setCacheSize(newSize);
            } catch {
              setCacheSize("0 KB");
            }

            Alert.alert(
              t("success"),
              "Cache sementara aplikasi berhasil dibersihkan.",
            );
          },
        },
      ],
    );
  };

  //===== (handleCheckForUpdate) ======
  const handleCheckForUpdate = () => {
    Alert.alert(
      t("checkForUpdate"),
      "Aplikasi Anda sudah menggunakan versi terbaru (v1.0.0 Stable).",
    );
  };

  //===== (handleLogout) ======
  const handleLogout = async () => {
    try {
      await removeToken();
      await removeUserInfo();
      await removeRememberMe();
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/(auth)/login");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      t("logout"),
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  };

  //===== (Render) ======
  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header Card */}
        <View
          style={[
            styles.profileHeaderCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>
              {displayEmail}
            </Text>
            {user?.role && (
              <View
                style={{
                  alignSelf: "flex-start",
                  marginTop: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: "rgba(24, 174, 230, 0.15)",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.accent,
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 1: Akun & Profil */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          {t("accountAndProfile")}
        </Text>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <MenuRow
            title={t("editInformation")}
            icon={<Feather name="user" size={19} color={colors.accent} />}
            onPress={() => setEditModalVisible(true)}
            colors={colors}
          />
          <MenuRow
            title={t("deleteAccount")}
            icon={<Ionicons name="trash-outline" size={19} color="#EF4444" />}
            showArrow={false}
            danger
            onPress={() => setDeleteModalVisible(true)}
            colors={colors}
          />
        </View>

        {/* Section 2: Preferensi */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          {t("preferences")}
        </Text>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <MenuRow
            title={t("theme")}
            icon={
              <Ionicons
                name="contrast-outline"
                size={19}
                color={colors.accent}
              />
            }
            showArrow={false}
            colors={colors}
          >
            <View style={styles.choiceGroup}>
              <ChoiceButton
                label={t("darkMode")}
                active={themeMode === "dark"}
                onPress={() => setThemeMode("dark")}
                colors={colors}
              />
              <ChoiceButton
                label={t("lightMode")}
                active={themeMode === "light"}
                onPress={() => setThemeMode("light")}
                colors={colors}
              />
            </View>
          </MenuRow>

          <MenuRow
            title={t("language")}
            icon={
              <Ionicons name="globe-outline" size={19} color={colors.accent} />
            }
            showArrow={false}
            colors={colors}
          >
            <View style={styles.choiceGroup}>
              <ChoiceButton
                label="English"
                active={language === "en"}
                onPress={() => setLanguage("en")}
                colors={colors}
              />
              <ChoiceButton
                label="Indonesia"
                active={language === "id"}
                onPress={() => setLanguage("id")}
                colors={colors}
              />
            </View>
          </MenuRow>

          <MenuRow
            title={t("notificationSetting")}
            icon={
              <Ionicons
                name="notifications-outline"
                size={19}
                color={colors.accent}
              />
            }
            onPress={() => setNotifModalVisible(true)}
            colors={colors}
          />
        </View>

        {/* Section 3: Sistem & Informasi */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          {t("systemAndInfo")}
        </Text>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <MenuRow
            title={t("cache")}
            icon={
              <Ionicons
                name="file-tray-full-outline"
                size={19}
                color={colors.accent}
              />
            }
            rightText={cacheSize}
            showArrow={false}
            onPress={handleClearCache}
            colors={colors}
          />

          <MenuRow
            title={t("checkForUpdate")}
            icon={
              <Ionicons
                name="cloud-download-outline"
                size={19}
                color={colors.accent}
              />
            }
            rightText="v1.0.0"
            showArrow={false}
            onPress={handleCheckForUpdate}
            colors={colors}
          />

          <MenuRow
            title={t("about")}
            icon={
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={colors.accent}
              />
            }
            onPress={() => setAboutModalVisible(true)}
            colors={colors}
          />

          <MenuRow
            title={t("logout")}
            icon={
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#EF4444"
              />
            }
            showArrow={false}
            danger
            onPress={confirmLogout}
            colors={colors}
          />
        </View>
      </ScrollView>

      {/* Connected Modals */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
        onProfileUpdated={(updated) => setUser(updated)}
        colors={colors}
        themeMode={themeMode}
        t={t}
      />

      <NotificationSettingsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        colors={colors}
        t={t}
      />

      <AboutModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        colors={colors}
        t={t}
      />

      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onAccountDeleted={handleLogout}
        colors={colors}
        t={t}
      />
    </View>
  );
}
