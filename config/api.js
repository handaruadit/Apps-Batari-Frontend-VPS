const DEFAULT_ENV = "local";

const CONFIG = {
  ngrok: {
    BASE_URL: "https://had-seminar-ripeness.ngrok-free.dev",
  },
  local: {
    BASE_URL: "http://localhost:3000",
  },
};

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

const envName = String(process.env.EXPO_PUBLIC_API_ENV || DEFAULT_ENV).trim();
const envBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL);
const configuredBaseUrl =
  CONFIG[envName]?.BASE_URL || CONFIG[DEFAULT_ENV].BASE_URL;

export const BASE_URL = envBaseUrl || configuredBaseUrl;
export const API_ENVIRONMENT = envBaseUrl ? "custom" : envName;
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
