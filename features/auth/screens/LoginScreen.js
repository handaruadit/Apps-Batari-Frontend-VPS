//===== (Imports) ======
import { login as loginUser, googleLogin } from "@/features/auth/services/authService";
import styles from "@/features/auth/styles/loginScreen.styles";
import {
  getUserFromToken,
  saveToken,
  saveUserInfo,
  setRememberMe,
} from "@/auth/token";
import {
  getRememberedAccounts,
  getRememberedPassword,
  saveRememberedAccount,
} from "@/auth/rememberedAccounts";
import { AuthContext } from "@/context/AuthContext";
import { checkAppUpdate } from "@/services/updateService";
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from "@/config/api";
import { showAlert } from "@/utils/showAlert";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants, { ExecutionEnvironment } from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

//===== (Feature Flags) ======
const SHOW_GOOGLE_SIGN_IN = false;

//===== (LoginScreen) ======
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [savedEmails, setSavedEmails] = useState([]);
  const [showEmailOptions, setShowEmailOptions] = useState(false);

  const { setUser } = useContext(AuthContext);

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const introAnim = useRef(new Animated.Value(0)).current;

  //===== (Detect Expo Go vs Standalone) ======
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  //===== (Google Auth) ======
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID || "batari-client-id",
    webClientId: GOOGLE_WEB_CLIENT_ID || "batari-web-client-id",
    androidClientId: isExpoGo ? undefined : (GOOGLE_ANDROID_CLIENT_ID || "batari-android-client-id"),
    iosClientId: isExpoGo ? undefined : (GOOGLE_WEB_CLIENT_ID || "batari-ios-client-id"),
    responseType: "token",
    scopes: ["profile", "email"],
    redirectUri: isExpoGo
      ? "https://auth.expo.io/@idewbayus-team/Apps"
      : AuthSession.makeRedirectUri({
          native: "com.batarienergi.app:/oauthredirect",
          scheme: "bysense",
        }),
  });

  //===== (Update Check Effect) ======
  useEffect(() => {
    checkAppUpdate();
  }, []);

  //===== (Intro Animation Effect) ======
  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [introAnim]);

  //===== (Remembered Accounts Effect) ======
  useEffect(() => {
    const loadSavedEmails = async () => {
      const accounts = await getRememberedAccounts();
      setSavedEmails(accounts);
    };

    loadSavedEmails();
  }, []);

  //===== (Google Auth Response Effect) ======
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignIn(response.authentication || response.params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  //===== (handleGoogleSignIn) ======
  const handleGoogleSignIn = async (authResult) => {
    const accessToken = authResult?.accessToken || authResult?.access_token;
    const idToken = authResult?.idToken || authResult?.id_token;

    if (!accessToken && !idToken) return;

    setGoogleLoading(true);

    try {
      let googleUser = null;
      if (accessToken) {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        googleUser = await userInfoResponse.json();
      }

      if (!googleUser?.email) {
        showAlert("Login gagal", "Tidak bisa mendapatkan info akun Google.");
        return;
      }

      const result = await googleLogin({
        idToken: idToken || accessToken,
        user: googleUser,
      });

      if (result.success) {
        if (result.token) {
          await saveToken(result.token);
          await setRememberMe(true);
        }

        const userInfo = result.user || {
          email: googleUser.email,
          name: googleUser.name,
        };

        await saveUserInfo(userInfo);
        setUser(userInfo);

        router.replace("/(home)/plant");
      } else {
        showAlert("Login gagal", "Google Sign-In tidak berhasil.");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      showAlert("Login gagal", "Terjadi kesalahan saat login dengan Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  //===== (handleGooglePress) ======
  const handleGooglePress = async () => {
    if (!request) return;
    try {
      if (isExpoGo) {
        const authUrl = await request.makeAuthUrlAsync(Google.discovery);
        const returnUrl = AuthSession.getDefaultReturnUrl();
        const startUrl = `https://auth.expo.io/@idewbayus-team/Apps/start?authUrl=${encodeURIComponent(authUrl)}&returnUrl=${encodeURIComponent(returnUrl)}`;
        const res = await promptAsync({ url: startUrl });
        if (res?.type === "success") {
          handleGoogleSignIn(res.authentication || res.params);
        }
      } else {
        promptAsync();
      }
    } catch (err) {
      console.error("Google sign in prompt error:", err);
      showAlert("Login gagal", "Gagal membuka login Google.");
    }
  };

  //===== (handleLogin) ======
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Login gagal", "Email dan password harus diisi.");
      return;
    }

    setLoading(true);

    let loginSuccess = false;
    let redirectPath = "/(home)/plant";

    try {
      const { response: res, data: jsonResponse } = await loginUser({
        email: email.trim(),
        password,
      });

      if (
        res.ok &&
        (jsonResponse.status === "success" || jsonResponse.success) &&
        (jsonResponse.token || jsonResponse.tokens?.accessToken)
      ) {
        const userToken = jsonResponse.token || jsonResponse.tokens.accessToken;

        await saveToken(userToken);
        await setRememberMe(remember);

        if (remember) {
          await saveRememberedAccount(email.trim(), password);
        }

        const userInfo =
          jsonResponse.user ??
          getUserFromToken(userToken) ?? { email: email.trim() };

        await saveUserInfo(userInfo);
        setUser(userInfo);

        redirectPath = "/(home)/plant";
        loginSuccess = true;
      } else {
        showAlert(
          "Login gagal",
          jsonResponse.message || "Email atau password salah.",
        );
      }
    } catch (error) {
      console.error(error);
      showAlert(
        "Login gagal",
        "Terjadi kesalahan jaringan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);

      if (loginSuccess) {
        router.replace(redirectPath);
      }
    }
  };

  //===== (Saved Email Options) ======
  const visibleSavedEmails = savedEmails.filter((item) =>
    item.toLowerCase().includes(email.trim().toLowerCase()),
  );
  const isEmailDropdownOpen = showEmailOptions && visibleSavedEmails.length > 0;

  const handleSelectSavedEmail = async (selectedEmail) => {
    setEmail(selectedEmail);
    const savedPassword = await getRememberedPassword(selectedEmail);
    if (savedPassword) {
      setPassword(savedPassword);
    }
    setShowEmailOptions(false);
  };

  //===== (Animation Style) ======
  const animatedFormStyle = {
    opacity: introAnim,
    transform: [
      {
        translateY: introAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  //===== (Render) ======
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.outerContainer}>
        <ImageBackground
          source={require("@/assets/images/solar-bg.jpg")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.fullOverlay} />
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <Pressable
                style={styles.screen}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEmailOptions(false);
                }}
              >
                {/* Brand Block with transparent box */}
                <View style={styles.brandBlock}>
                  <Image
                    source={require("@/assets/images/batari-energy-logo.webp")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.welcome}>Welcome Back</Text>
                  <Text style={styles.subtitle}>
                    Sign in to your Batari Energy account
                  </Text>
                </View>

                {/* Form Section with Rounded Card */}
                <Animated.View style={[styles.formSection, animatedFormStyle]}>
                  <View style={styles.formCard}>
                    {/* Email Address */}
                    <Text style={styles.label}>Email Address</Text>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                      <View
                        style={[
                          styles.inputWrapper,
                          focusedField === "email" && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={focusedField === "email" ? "#18AEE6" : "#64748B"}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="batari@gmail.com"
                          placeholderTextColor="#94A3B8"
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            setPassword("");
                            setShowEmailOptions(true);
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          selectionColor="#18AEE6"
                          cursorColor="#18AEE6"
                          onFocus={() => {
                            setFocusedField("email");
                            setShowEmailOptions(true);
                          }}
                          onBlur={() => setFocusedField(null)}
                        />
                      </View>

                      {isEmailDropdownOpen ? (
                        <View style={styles.emailOptionsBox}>
                          {visibleSavedEmails.map((item) => (
                            <Pressable
                              key={item}
                              style={styles.emailOption}
                              onPress={() => handleSelectSavedEmail(item)}
                            >
                              <Ionicons
                                name="person-circle-outline"
                                size={20}
                                color="#64748B"
                              />
                              <Text style={styles.emailOptionText}>{item}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </Pressable>

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === "password" && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={focusedField === "password" ? "#18AEE6" : "#64748B"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        selectionColor="#18AEE6"
                        cursorColor="#18AEE6"
                        onFocus={() => {
                          setFocusedField("password");
                          setShowEmailOptions(false);
                        }}
                        onBlur={() => setFocusedField(null)}
                      />
                      <Pressable
                        onPress={() => setShowPassword((v) => !v)}
                        hitSlop={10}
                        style={styles.passwordToggle}
                      >
                        <Ionicons
                          name={showPassword ? "eye-outline" : "eye-off-outline"}
                          size={20}
                          color={focusedField === "password" ? "#18AEE6" : "#64748B"}
                        />
                      </Pressable>
                    </View>

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.rememberAndForgotRow}>
                      <Pressable
                        style={styles.rememberPressable}
                        onPress={() => setRemember(!remember)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: remember }}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            remember && styles.checkboxActive,
                          ]}
                        >
                          {remember ? (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text style={styles.rememberText}>Remember me</Text>
                      </Pressable>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push("/(auth)/forgot-password")}
                      >
                        <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Log In Button */}
                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        loading && styles.loginButtonBusy,
                      ]}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.loginText}>Log In</Text>
                      )}
                    </TouchableOpacity>

                    {/* Google Sign In Option (Hidden for now) */}
                    {SHOW_GOOGLE_SIGN_IN && (
                      <>
                        {/* Divider: OR */}
                        <View style={styles.dividerRow}>
                          <View style={styles.dividerLine} />
                          <Text style={styles.dividerText}>OR</Text>
                          <View style={styles.dividerLine} />
                        </View>

                        {/* Google Sign In Button */}
                        <TouchableOpacity
                          style={[
                            styles.googleButton,
                            googleLoading && styles.loginButtonBusy,
                          ]}
                          activeOpacity={0.8}
                          onPress={handleGooglePress}
                          disabled={!request || googleLoading}
                        >
                          {googleLoading ? (
                            <ActivityIndicator color="#0F172A" size="small" />
                          ) : (
                            <>
                              <AntDesign
                                name="google"
                                size={20}
                                color="#4285F4"
                                style={styles.googleIconContainer}
                              />
                              <Text style={styles.googleText}>Continue with Google</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Bottom Link: Don't have an account? Sign Up */}
                    <View style={styles.bottomLinkRow}>
                      <Text style={styles.bottomRegularText}>{"Don't have an account? "}</Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push("/(auth)/register")}
                      >
                        <Text style={styles.signUpLinkText}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>

                {/* Footer Tagline */}
                <Text style={styles.footerTagline}>
                  Igniting Innovation, Empowering The Nation
                </Text>
              </Pressable>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </>
  );
};

export default LoginScreen;
