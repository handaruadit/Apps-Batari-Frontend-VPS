//===== (Imports) ======
import {
  removeRememberMe,
  removeToken,
  removeUserInfo,
} from "@/auth/token";
import { AuthContext } from "@/context/AuthContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import ChoiceButton from "@/features/profile/components/ChoiceButton";
import MenuRow from "@/features/profile/components/MenuRow";
import { profileStyles as styles } from "@/features/profile/styles";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ScrollView, View } from "react-native";

//===== (ProfileScreen) ======
export default function ProfileScreen() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useAppSettings();

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
    }
  };

  //===== (Render) ======
  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <MenuRow
          title={t("editInformation")}
          icon={<Feather name="lock" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("configureWifiDatalogger")}
          icon={<Ionicons name="wifi-outline" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("localDebugging")}
          icon={
            <MaterialCommunityIcons
              name="tools"
              size={20}
              color={colors.accent}
            />
          }
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("setting")}
          icon={
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.accent}
            />
          }
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("logout")}
          icon={
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.accent}
            />
          }
          showArrow={false}
          onPress={handleLogout}
          colors={colors}
        />

        <MenuRow
          title={t("deleteAccount")}
          icon={<Ionicons name="close" size={22} color="#7C8596" />}
          showArrow={false}
          danger
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("theme")}
          icon={
            <Ionicons
              name="contrast-outline"
              size={20}
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
          title={t("notificationSetting")}
          icon={
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.accent}
            />
          }
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("language")}
          icon={
            <Ionicons name="globe-outline" size={20} color={colors.accent} />
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
          title={t("cache")}
          icon={
            <Ionicons name="trash-outline" size={20} color={colors.accent} />
          }
          rightText="185 mb"
          showArrow={false}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("checkForUpdate")}
          icon={
            <Ionicons name="refresh-outline" size={20} color={colors.accent} />
          }
          rightText="v8.0.0.1"
          showArrow={false}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t("about")}
          icon={
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.accent}
            />
          }
          onPress={() => {}}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}
