//===== (Imports) ======
import { BASE_URL } from "@/config/api";
import { parseJsonSafe } from "@/features/auth/utils/json";

//===== (Constants) ======
const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const AUTH_BASE_URL = BASE_URL;

export const AUTH_ENDPOINTS = {
  login: `${BASE_URL}/api/auth/login`,
  register: `${BASE_URL}/api/auth/register`,
  forgotPassword: `${BASE_URL}/api/auth/forgot-password`,
  verifyResetCode: `${BASE_URL}/api/auth/verify-reset-code`,
  resetPassword: `${BASE_URL}/api/auth/reset-password`,
};

//===== (postJson) ======
async function postJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  return { response, data };
}

//===== (postJsonText) ======
async function postJsonText(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();

  return {
    response,
    responseText,
    data: parseJsonSafe(responseText),
  };
}

//===== (login) ======
export function login(credentials) {
  return postJson(AUTH_ENDPOINTS.login, credentials);
}

//===== (register) ======
export function register(account) {
  return postJson(AUTH_ENDPOINTS.register, account);
}

//===== (requestPasswordReset) ======
export function requestPasswordReset(contact) {
  return postJsonText(AUTH_ENDPOINTS.forgotPassword, contact);
}

//===== (verifyPasswordResetCode) ======
export function verifyPasswordResetCode(verification) {
  return postJsonText(AUTH_ENDPOINTS.verifyResetCode, verification);
}

//===== (resetPassword) ======
export function resetPassword(resetRequest) {
  return postJsonText(AUTH_ENDPOINTS.resetPassword, resetRequest);
}
