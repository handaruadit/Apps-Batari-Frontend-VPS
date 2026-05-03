import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { appColors, appFont } from '@/config/theme';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/context/AuthContext';
import { removeToken, removeUserInfo, removeRememberMe } from '@/auth/token';


function MenuRow({
  icon,
  title,
  rightText,
  showArrow = true,
  danger = false,
  children,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.row}
      disabled={!onPress && !children}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>
          {title}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {children}
        {rightText ? (
          <Text style={[styles.rightText, danger && styles.rowTitleDanger]}>
            {rightText}
          </Text>
        ) : null}
        {showArrow && !children ? (
          <Ionicons name="chevron-forward" size={20} color="#00AEEF" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function MeScreen() {
  const router = useRouter();
const { setUser } = useContext(AuthContext);

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
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <MenuRow
          title="Edit Information"
          icon={<Feather name="lock" size={20} color="#00AEEF" />}
          onPress={() => {}}
        />

        <MenuRow
          title="Configure Wifi Datalogger"
          icon={<Ionicons name="wifi-outline" size={20} color="#00AEEF" />}
          onPress={() => {}}
        />

        <MenuRow
          title="Local Debugging"
          icon={<MaterialCommunityIcons name="tools" size={20} color="#00AEEF" />}
          onPress={() => {}}
        />

        <MenuRow
          title="Setting"
          icon={<Ionicons name="settings-outline" size={20} color="#00AEEF" />}
          onPress={() => {}}
        />

        <MenuRow
          title="Log out"
          icon={<Ionicons name="log-out-outline" size={20} color="#00AEEF" />}
          showArrow={false}
          onPress={handleLogout}
        />

        <MenuRow
          title="Delete Account"
          icon={<Ionicons name="close" size={22} color="#7C8596" />}
          showArrow={false}
          danger
          onPress={() => {}}
        />

        <MenuRow
          title="Dark Mode"
          icon={<Ionicons name="moon" size={20} color="#00AEEF" />}
          showArrow={false}
        >
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#334155', true: '#8ED8FF' }}
            thumbColor={darkMode ? '#00AEEF' : '#CBD5E1'}
          />
        </MenuRow>

        <MenuRow
          title="Notification Setting"
          icon={<Ionicons name="notifications-outline" size={20} color="#00AEEF" />}
          onPress={() => {}}
        />

        <MenuRow
          title="Languages"
          icon={<Ionicons name="globe-outline" size={20} color="#00AEEF" />}
          rightText="English"
          onPress={() => {}}
        />

        <MenuRow
          title="Cache"
          icon={<Ionicons name="trash-outline" size={20} color="#00AEEF" />}
          rightText="185 mb"
          showArrow={false}
          onPress={() => {}}
        />

        <MenuRow
          title="Check for Update"
          icon={<Ionicons name="refresh-outline" size={20} color="#00AEEF" />}
          rightText="v8.0.0.1"
          showArrow={false}
          onPress={() => {}}
        />

        <MenuRow
          title="About"
          icon={<Ionicons name="alert-circle-outline" size={20} color="#00AEEF" />}
          onPress={() => {}}
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
});
