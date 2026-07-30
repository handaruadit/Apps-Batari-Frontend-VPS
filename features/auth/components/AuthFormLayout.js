//===== (Imports) ======
import {
  AUTH_BACKGROUND_COLOR,
  AUTH_FONT,
} from "@/features/auth/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//===== (AuthFormLayout) ======
export default function AuthFormLayout({
  title,
  subtitle,
  subtitleLineHeight,
  children,
}) {
  const { height } = useWindowDimensions();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={AUTH_BACKGROUND_COLOR}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={[styles.content, { minHeight: height }]}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={30} color="#FFFFFF" />
            </Pressable>

            <View style={styles.formSurface}>
              <Text style={styles.title}>{title}</Text>
              <Text
                style={[
                  styles.subtitle,
                  subtitleLineHeight
                    ? { lineHeight: subtitleLineHeight }
                    : undefined,
                ]}
              >
                {subtitle}
              </Text>

              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AUTH_BACKGROUND_COLOR },
  container: { flex: 1, backgroundColor: AUTH_BACKGROUND_COLOR },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 14,
    zIndex: 2,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  formSurface: { width: "100%", maxWidth: 430, alignSelf: "center" },
  title: {
    color: "#FFFFFF",
    fontFamily: AUTH_FONT,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: AUTH_FONT,
    fontSize: 15,
    marginBottom: 28,
  },
});
