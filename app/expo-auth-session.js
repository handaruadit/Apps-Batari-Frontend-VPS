//===== (Imports) ======
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useContext, useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthContext } from "@/context/AuthContext";
import { saveToken, saveUserInfo, setRememberMe } from "@/auth/token";
import { googleLogin } from "@/features/auth/services/authService";
import { showAlert } from "@/utils/showAlert";

WebBrowser.maybeCompleteAuthSession();

//===== (parseAuthUrl Helper) ======
function parseAuthUrl(url) {
  if (!url) return {};
  const hashIdx = url.indexOf("#");
  const queryIdx = url.indexOf("?");
  const paramsStr =
    hashIdx !== -1
      ? url.substring(hashIdx + 1)
      : queryIdx !== -1
        ? url.substring(queryIdx + 1)
        : "";
  const params = {};
  paramsStr.split("&").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) {
      params[decodeURIComponent(k)] = decodeURIComponent(v);
    }
  });
  return params;
}

//===== (Auth Session Callback Screen) ======
export default function ExpoAuthSessionScreen() {
  const { setUser } = useContext(AuthContext);
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const incomingUrl = Linking.useURL();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      if (isProcessingRef.current) return;

      const urlParams = parseAuthUrl(incomingUrl);
      const accessToken =
        urlParams.access_token ||
        localParams.access_token ||
        globalParams.access_token;
      const idToken =
        urlParams.id_token || localParams.id_token || globalParams.id_token;

      if (!accessToken && !idToken) {
        // If no direct token in URL, wait for WebBrowser to complete and redirect
        const timer = setTimeout(() => {
          if (isMounted) {
            router.replace("/(home)/plant");
          }
        }, 1500);
        return () => clearTimeout(timer);
      }

      isProcessingRef.current = true;

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
          router.replace("/(auth)/login");
          return;
        }

        const result = await googleLogin({
          idToken: idToken || accessToken,
          user: googleUser,
        });

        if (result.success && isMounted) {
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
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Google Auth Session processing error:", error);
        if (isMounted) {
          showAlert("Login gagal", "Terjadi kesalahan saat memproses login.");
          router.replace("/(auth)/login");
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [incomingUrl, localParams, globalParams, setUser]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0C1222",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color="#18AEE6" />
      <Text style={{ marginTop: 16, color: "#94A3B8", fontSize: 14 }}>
        Menyelesaikan login Google...
      </Text>
    </View>
  );
}
