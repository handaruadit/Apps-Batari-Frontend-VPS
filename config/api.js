import Constants from "expo-constants";
import { NativeModules } from "react-native";

//===== (Environment Constants) ======
const DEFAULT_ENV = "vps";
const DEFAULT_LOCAL_API_PORT = "3001";

const CONFIG = {
  vps: {
    BASE_URL: "http://89.116.33.75:3001",
  },
};

//===== (trimTrailingSlash) ======
function trimTrailingSlash(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

//===== (Expo Development Host) ======
function getHostFromRuntimeUri(value) {
  const uri = String(value || "").trim();
  if (!uri) return "";

  const uriMatch = uri.match(
    /^(?:(?:https?|exp):\/\/)?\[?([^\]/:]+)\]?(?::\d+)?(?:[/?#]|$)/i,
  );

  return uriMatch?.[1] || "";
}

function getExpoDevelopmentHost() {
  const browserHost =
    typeof window !== "undefined" ? window.location?.hostname : "";
  const runtimeUris = [
    NativeModules.SourceCode?.scriptURL,
    Constants.linkingUri,
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    browserHost,
  ];

  for (const runtimeUri of runtimeUris) {
    const host = getHostFromRuntimeUri(runtimeUri);
    if (host) return host;
  }

  return "";
}

//===== (Environment Selection) ======
const envName = String(
  process.env.EXPO_PUBLIC_API_ENV || DEFAULT_ENV,
).trim();
const envBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL);
const selectedEnvName = CONFIG[envName] ? envName : DEFAULT_ENV;
const configuredBaseUrl = CONFIG[selectedEnvName].BASE_URL;
const useExpoHost =
  process.env.EXPO_PUBLIC_API_USE_EXPO_HOST === "true";
const expoDevelopmentHost = getExpoDevelopmentHost();
const localApiPort =
  String(process.env.EXPO_PUBLIC_API_PORT || DEFAULT_LOCAL_API_PORT).trim();
const expoHostBaseUrl =
  useExpoHost && expoDevelopmentHost
    ? `http://${expoDevelopmentHost}:${localApiPort}`
    : "";

//===== (API Configuration Exports) ======
export const BASE_URL = expoHostBaseUrl || envBaseUrl || configuredBaseUrl;
export const API_ENVIRONMENT = expoHostBaseUrl
  ? "expo-host"
  : envBaseUrl
    ? "custom"
    : selectedEnvName;
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
