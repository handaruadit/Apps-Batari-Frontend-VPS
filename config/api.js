//===== (Environment Constants) ======
const DEFAULT_ENV = "vps";

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

//===== (Environment Selection) ======
const envName = String(
  process.env.EXPO_PUBLIC_API_ENV || DEFAULT_ENV,
).trim();
const envBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL);
const selectedEnvName = CONFIG[envName] ? envName : DEFAULT_ENV;
const configuredBaseUrl = CONFIG[selectedEnvName].BASE_URL;

//===== (API Configuration Exports) ======
export const BASE_URL = envBaseUrl || configuredBaseUrl;
export const API_ENVIRONMENT = envBaseUrl ? "custom" : selectedEnvName;
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
