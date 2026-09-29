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
      {/* Form Section with Unified Rounded Card */}
      <View style={styles.formSection}>
        <View style={styles.cardSurface}>
          {/* Header Block inside Card */}
          <View style={styles.headerBlock}>
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

          {children}
        </View>
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
  headerBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 220,
    height: 84,
    marginBottom: 8,
  },
  title: {
    color: "#0F172A",
    fontFamily: AUTH_FONT,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#64748B",
    fontFamily: AUTH_FONT,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  formSection: {
    width: "100%",
    paddingHorizontal: 0,
  },
  cardSurface: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  footerTagline: {
    color: "rgba(255, 255, 255, 0.70)",
    fontFamily: AUTH_FONT,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  pressableWrapper: {
    flex: 1,
  },
});
