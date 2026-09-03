//===== (Imports) ======
import {
  AUTH_FONT,
} from "@/features/auth/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//===== (AuthFormLayout) ======
export default function AuthFormLayout({
  title,
  subtitle,
  subtitleLineHeight,
  children,
  showLogo = true,
  showBackButton = true,
  scrollable = false,
}) {
  const content = (
    <View style={scrollable ? styles.screenScrollable : styles.screen}>
      {/* Brand Block with transparent box */}
      <View style={styles.brandBlock}>
        {showLogo ? (
          <Image
            source={require("@/assets/images/batari-energy-logo.webp")}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : null}

        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              subtitleLineHeight ? { lineHeight: subtitleLineHeight } : undefined,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Form Section with Rounded Card */}
      <View style={styles.formSection}>
        <View style={styles.cardSurface}>{children}</View>
      </View>

      {/* Footer Tagline */}
      <Text style={styles.footerTagline}>
        Igniting Innovation, Empowering The Nation
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
              {/* Back Button */}
              {showBackButton ? (
                <Pressable
                  style={styles.backButton}
                  onPress={() => router.back()}
                  hitSlop={12}
                >
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </Pressable>
              ) : null}

              {scrollable ? (
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Pressable onPress={() => Keyboard.dismiss()}>
                    {content}
                  </Pressable>
                </ScrollView>
              ) : (
                <Pressable
                  style={styles.pressableWrapper}
                  onPress={() => Keyboard.dismiss()}
                >
                  {content}
                </Pressable>
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImageStyle: {
    resizeMode: "cover",
    opacity: 0.55,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 18, 34, 0.50)",
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  screen: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  screenScrollable: {
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 2,
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(12, 18, 34, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
  },
  brandBlock: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    alignSelf: "center",
    maxWidth: "94%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logo: {
    width: 265,
    height: 101,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: AUTH_FONT,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontFamily: AUTH_FONT,
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
    paddingHorizontal: 10,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formSection: {
    width: "100%",
    paddingHorizontal: 0,
  },
  cardSurface: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  footerTagline: {
    color: "rgba(255, 255, 255, 0.45)",
    fontFamily: AUTH_FONT,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  pressableWrapper: {
    flex: 1,
  },
});
