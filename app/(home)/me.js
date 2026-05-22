import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useContext } from 'react';
import { useRouter } from 'expo-router';
import { appColors, appFont } from '@/config/theme';
import { AuthContext } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { removeToken, removeUserInfo, removeRememberMe } from '@/auth/token';


function MenuRow({
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

function ChoiceButton({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.choiceButton,
        {
          backgroundColor: active ? colors.accent : colors.input,
          borderColor: active ? colors.accent : colors.inputBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceButtonText,
          { color: active ? '#FFFFFF' : colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MeScreen() {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);
  const { colors, themeMode, setThemeMode, language, setLanguage, t } =
    useAppSettings();

  const handleLogout = async () => {
    try {
      await removeToken();
      await removeUserInfo();
      await removeRememberMe();

      setUser(null);

      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <MenuRow
          title={t('editInformation')}
          icon={<Feather name="lock" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('configureWifiDatalogger')}
          icon={<Ionicons name="wifi-outline" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('localDebugging')}
          icon={<MaterialCommunityIcons name="tools" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('setting')}
          icon={<Ionicons name="settings-outline" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('logout')}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.accent} />}
          showArrow={false}
          onPress={handleLogout}
          colors={colors}
        />

        <MenuRow
          title={t('deleteAccount')}
          icon={<Ionicons name="close" size={22} color="#7C8596" />}
          showArrow={false}
          danger
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('theme')}
          icon={<Ionicons name="contrast-outline" size={20} color={colors.accent} />}
          showArrow={false}
          colors={colors}
        >
          <View style={styles.choiceGroup}>
            <ChoiceButton
              label={t('darkMode')}
              active={themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
              colors={colors}
            />
            <ChoiceButton
              label={t('lightMode')}
              active={themeMode === 'light'}
              onPress={() => setThemeMode('light')}
              colors={colors}
            />
          </View>
        </MenuRow>

        <MenuRow
          title={t('notificationSetting')}
          icon={<Ionicons name="notifications-outline" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('language')}
          icon={<Ionicons name="globe-outline" size={20} color={colors.accent} />}
          showArrow={false}
          colors={colors}
        >
          <View style={styles.choiceGroup}>
            <ChoiceButton
              label="English"
              active={language === 'en'}
              onPress={() => setLanguage('en')}
              colors={colors}
            />
            <ChoiceButton
              label="Indonesia"
              active={language === 'id'}
              onPress={() => setLanguage('id')}
              colors={colors}
            />
          </View>
        </MenuRow>

        <MenuRow
          title={t('cache')}
          icon={<Ionicons name="trash-outline" size={20} color={colors.accent} />}
          rightText="185 mb"
          showArrow={false}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('checkForUpdate')}
          icon={<Ionicons name="refresh-outline" size={20} color={colors.accent} />}
          rightText="v8.0.0.1"
          showArrow={false}
          onPress={() => {}}
          colors={colors}
        />

        <MenuRow
          title={t('about')}
          icon={<Ionicons name="alert-circle-outline" size={20} color={colors.accent} />}
          onPress={() => {}}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 120,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: appColors.bubbleBorder,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 16,
    color: appColors.text,
    fontWeight: '500',
    fontFamily: appFont,
  },
  rowTitleDanger: {
    color: appColors.textMuted,
  },
  rightText: {
    fontSize: 15,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  choiceGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: appFont,
  },
});
