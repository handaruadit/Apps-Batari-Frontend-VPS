import { BASE_URL } from "@/config/api";
import {
  getUserFromToken,
  saveToken,
  saveUserInfo,
  setRememberMe,
} from "@/auth/token";
import { AuthContext } from "@/context/AuthContext";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appFont = Platform.select({
  android: "sans-serif",
  ios: "Helvetica Neue",
  default: "System",
});
const BATARI_LOGO_SIZE = 100;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const LoginScreen = () => {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const introAnim = useRef(new Animated.Value(0)).current;
  const isCompactHeight = height < 720;
  const isNarrow = width < 360;
  const logoSize = clamp(width * 0.24, isCompactHeight ? 72 : 84, 100);
  const heroHeight = clamp(height * 0.23, isCompactHeight ? 132 : 164, 188);
  const formTopPadding = isCompactHeight ? 22 : 45;
  const horizontalPadding = isNarrow ? 18 : 22;
  const buttonHeight = isCompactHeight ? 52 : 58;
  const inputHeight = isCompactHeight ? 46 : 48;
  const footerHeight = isCompactHeight ? 28 : 52;

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [introAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login gagal", "Email dan password harus diisi.");
      return;
    }

    const endpoint = `${BASE_URL}/api/auth/login`;

    setLoading(true);
    let loginSuccess = false;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const jsonResponse = await response.json();

      if (
        response.ok &&
        jsonResponse.status === "success" &&
        jsonResponse.token
      ) {
        const userToken = jsonResponse.token;
        await saveToken(userToken);
        await setRememberMe(remember);

        const userInfo = jsonResponse.user ??
          getUserFromToken(userToken) ?? { email };
        await saveUserInfo(userInfo);
        setUser(userInfo);

        loginSuccess = true;
      } else {
        Alert.alert(
          "Login gagal",
          jsonResponse.message || "Email atau password salah.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Login gagal",
        "Terjadi kesalahan jaringan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
      if (loginSuccess) {
        router.replace("/(home)/plant");
      }
    }
  };

  const heroAnimatedStyle = {
    opacity: introAnim,
    transform: [
      {
        translateY: introAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const formAnimatedStyle = {
    opacity: introAnim,
    transform: [
      {
        translateY: introAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <StatusBar barStyle="light-content" backgroundColor="#0C1222" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.screen}>
            <ImageBackground
              source={require("@/assets/images/solar-bg.jpg")}
              style={[styles.hero, { height: heroHeight }]}
              imageStyle={styles.backgroundPhoto}
            >
              <View style={styles.heroOverlay} />
              <Animated.View
                style={[
                  styles.brandBlock,
                  { paddingTop: isCompactHeight ? 8 : 14 },
                  heroAnimatedStyle,
                ]}
              >
                <View
                  style={[
                    styles.logoFrame,
                    {
                      width: logoSize,
                      height: logoSize,
                      borderRadius: logoSize / 2,
                    },
                  ]}
                >
                  <Image
                    source={require("@/assets/images/batari-logo.jpeg")}
                    style={[
                      styles.logo,
                      {
                        width: logoSize,
                        height: logoSize,
                        borderRadius: logoSize / 2,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.welcome,
                    {
                      fontSize: isCompactHeight ? 26 : 31,
                      marginTop: isCompactHeight ? 4 : 8,
                    },
                  ]}
                >
                  Welcome
                </Text>
              </Animated.View>
            </ImageBackground>

            <Animated.View
              style={[
                styles.formSection,
                {
                  paddingHorizontal: horizontalPadding,
                  paddingTop: formTopPadding,
                },
                formAnimatedStyle,
              ]}
            >
              <View style={styles.formSurface}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { minHeight: inputHeight },
                    focusedField === "email" && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="hallo@batari.com"
                    placeholderTextColor="#6E7480"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                    selectionColor="#18AEE6"
                    cursorColor="#18AEE6"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedField === "email" ? "#18AEE6" : "#64748B"}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { minHeight: inputHeight },
                    focusedField === "password" && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="password"
                    placeholderTextColor="#6E7480"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor="#18AEE6"
                    cursorColor="#18AEE6"
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    onPress={() => setShowPassword((value) => !value)}
                    hitSlop={10}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={21}
                      color={
                        focusedField === "password" ? "#18AEE6" : "#64748B"
                      }
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.rememberRow}
                  onPress={() => setRemember(!remember)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: remember }}
                >
                  <View
                    style={[styles.checkbox, remember && styles.checkboxActive]}
                  >
                    {remember ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </Pressable>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    { minHeight: buttonHeight },
                    loading && styles.loginButtonBusy,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginText}>Log In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.linkRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push("/(auth)/forgot-password")}
                  >
                    <Text style={styles.link}>Forgot password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push("/(auth)/register")}
                  >
                    <Text style={styles.link}>Create new account</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.orText}>OR</Text>

                <TouchableOpacity
                  style={[styles.googleButton, { minHeight: buttonHeight }]}
                  activeOpacity={0.8}
                >
                  <AntDesign
                    name="google"
                    size={22}
                    color="#111827"
                    style={styles.socialIcon}
                  />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.facebookButton, { minHeight: buttonHeight }]}
                  activeOpacity={0.8}
                >
                  <FontAwesome
                    name="facebook"
                    size={24}
                    color="#FFFFFF"
                    style={styles.socialIcon}
                  />
                  <Text style={styles.facebookText}>
                    Continue with Facebook
                  </Text>
                </TouchableOpacity>

                <Text style={styles.tagline}>
                  Powering your home with battery.
                </Text>
              </View>
            </Animated.View>

            <ImageBackground
              source={require("@/assets/images/solar-bg.jpg")}
              style={[styles.footerPhotoBlock, { height: footerHeight }]}
              imageStyle={styles.footerPhoto}
            />
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0C1222",
  },
  container: {
    flex: 1,
    backgroundColor: "#0C1222",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#0C1222",
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    width: "100%",
    backgroundColor: "#0C1222",
  },
  hero: {
    height: 188,
    justifyContent: "center",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backgroundPhoto: {
    opacity: 0.24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 18, 34, 0.62)",
  },
  brandBlock: {
    alignItems: "center",
    paddingTop: 14,
  },
  logoFrame: {
    width: BATARI_LOGO_SIZE,
    height: BATARI_LOGO_SIZE,
    borderRadius: BATARI_LOGO_SIZE / 2,
    backgroundColor: "#0C1222",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    marginBottom: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: BATARI_LOGO_SIZE,
    height: BATARI_LOGO_SIZE,
    borderRadius: BATARI_LOGO_SIZE / 2,
  },
  tagline: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 14,
  },
  welcome: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 31,
    fontWeight: "600",
    letterSpacing: 0,
    marginTop: 8,
  },
  formSection: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 12,
  },
  formSurface: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  label: {
    fontSize: 18,
    color: "#F8FAFC",
    fontFamily: appFont,
    fontWeight: "500",
    letterSpacing: 0,
    marginBottom: 8,
  },
  inputWrapper: {
    minHeight: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: "#18AEE6",
    shadowColor: "#18AEE6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#111827",
    fontFamily: appFont,
    fontWeight: "400",
    letterSpacing: 0,
    paddingVertical: 12,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -8,
    marginBottom: 22,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  checkboxActive: {
    backgroundColor: "#1DA8DF",
    borderColor: "#1DA8DF",
  },
  rememberText: {
    color: "#F8FAFC",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 0,
  },
  loginButton: {
    backgroundColor: "#18AEE6",
    minHeight: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#18AEE6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  loginButtonBusy: {
    opacity: 0.75,
  },
  loginText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 0,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  link: {
    color: "#168CC8",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0,
  },
  orText: {
    color: "#168CC8",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 18,
  },
  googleButton: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  googleText: {
    color: "#111827",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0,
  },
  facebookButton: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: "#3D68D5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  facebookText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0,
  },
  socialIcon: {
    marginRight: 14,
  },
  footerPhotoBlock: {
    height: 52,
    backgroundColor: "#0C1222",
    overflow: "hidden",
  },
  footerPhoto: {
    opacity: 0.18,
  },
});

export default LoginScreen;
