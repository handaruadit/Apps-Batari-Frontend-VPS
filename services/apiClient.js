import { clearAuth, getToken, isTokenValid } from "@/auth/token";
import { BASE_URL } from "@/config/api";

//===== (createServiceError) ======
export function createServiceError(message, code, status, body) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.body = body;
  return error;
}

//===== (getAuthHeaders) ======
export async function getAuthHeaders() {
  const token = await getToken();

  if (!token || !isTokenValid(token)) {
    await clearAuth();
    throw createServiceError(
      "Sesi Anda telah habis atau token tidak valid.",
      "AUTH_EXPIRED",
    );
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

//===== (extractResponseText) ======
function extractResponseText(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const preMatch = text.match(/<pre>([\s\S]*?)<\/pre>/i);
  if (preMatch?.[1]) {
    return preMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || text;
}

//===== (parseApiResponse) ======
export async function parseApiResponse(response) {
  if (typeof response.text !== "function") {
    return typeof response.json === "function" ? response.json() : {};
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, message: extractResponseText(text) };
  }
}

//===== (apiRequest) ======
export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    auth = true,
    headers: customHeaders,
    baseUrl = BASE_URL,
  } = {},
) {
  const headers = auth
    ? await getAuthHeaders()
    : {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...headers,
      ...customHeaders,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const responseBody = await parseApiResponse(response);

  return { response, body: responseBody };
}
