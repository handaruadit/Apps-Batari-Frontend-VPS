//===== (Imports) ======
import { login as loginUser } from "@/features/auth/services/authService";
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
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//===== (clamp) ======
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

//===== (LoginScreen) ======
const LoginScreen = () => {
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [savedEmails, setSavedEmails] = useState([]);
  const [showEmailOptions, setShowEmailOptions] = useState(false);

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

  //===== (Update Check Effect) ======
  useEffect(() => {
    checkAppUpdate();
  }, []);

  //===== (Intro Animation Effect) ======
  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [introAnim]);

  //===== (Remembered Accounts Effect) ======
  useEffect(() => {
    //===== (loadSavedEmails) ======
    const loadSavedEmails = async () => {
      const accounts = await getRememberedAccounts();
      setSavedEmails(accounts);
    };

    loadSavedEmails();
  }, []);

  //===== (handleLogin) ======
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Login gagal", "Email dan password harus diisi.");
      return;
    }

    setLoading(true);

    let loginSuccess = false;
    let redirectPath = "/(home)/plant";

    try {
      const { response, data: jsonResponse } = await loginUser({
        email,
        password,
      });

      if (
        response.ok &&
        jsonResponse.status === "success" &&
        jsonResponse.token
      ) {
        const userToken = jsonResponse.token;

        await saveToken(userToken);
        await setRememberMe(remember);

        if (remember) {
          await saveRememberedAccount(email, password);
        }

        const userInfo = jsonResponse.user ??
          getUserFromToken(userToken) ?? { email };

        await saveUserInfo(userInfo);

        setUser(userInfo);

        redirectPath = "/(home)/plant";
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
        router.replace(redirectPath);
      }
    }
  };

  //===== (Animation Styles) ======
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

  //===== (Saved Email Options) ======
  const visibleSavedEmails = savedEmails.filter((item) =>
    item.toLowerCase().includes(email.trim().toLowerCase()),
  );

  const isEmailDropdownOpen = showEmailOptions && visibleSavedEmails.length > 0;

  //===== (handleSelectSavedEmail) ======
  const handleSelectSavedEmail = async (selectedEmail) => {
    setEmail(selectedEmail);

    const savedPassword = await getRememberedPassword(selectedEmail);

    if (savedPassword) {
      setPassword(savedPassword);
    }

    setShowEmailOptions(false);
  };

  //===== (Render) ======
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
            contentContainerStyle={[
              styles.scrollContent,
              { minHeight: height },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              style={styles.screen}
              onPress={() => {
                setShowEmailOptions(false);
              }}
            >
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

                  <Pressable onPress={(event) => event.stopPropagation()}>
                    <View
                      style={[
                        styles.inputWrapper,
                        { minHeight: inputHeight },
                        focusedField === "email" && styles.inputWrapperFocused,
                        isEmailDropdownOpen && styles.emailInputOpen,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="batari@gmail.com"
                        placeholderTextColor="#6E7480"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setPassword("");
                          setShowEmailOptions(true);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoFocus={false}
                        selectionColor="#18AEE6"
                        cursorColor="#18AEE6"
                        onFocus={() => {
                          setFocusedField("email");
                          setShowEmailOptions(true);
                        }}
                        onBlur={() => setFocusedField(null)}
                      />

                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={focusedField === "email" ? "#18AEE6" : "#64748B"}
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
                      onFocus={() => {
                        setFocusedField("password");
                        setShowEmailOptions(false);
                      }}
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
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default LoginScreen;
