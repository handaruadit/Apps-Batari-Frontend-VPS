import { getToken } from "@/auth/token";
import { BASE_URL } from "@/config/api";

async function getAdminHeaders() {
  const token = await getToken();

  if (!token) {
    throw new Error("Sesi admin tidak ditemukan.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function unwrapAdminData(body) {
  return Array.isArray(body) ? body : body?.data ?? [];
}

export async function fetchAdminDeviceAccess() {
  const response = await fetch(`${BASE_URL}/api/admin/device-access`, {
    method: "GET",
    headers: await getAdminHeaders(),
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    throw new Error(body?.message || "Gagal mengambil data akses device.");
  }

  return unwrapAdminData(body);
}

export async function updateAdminDeviceAccess(payload) {
  const response = await fetch(`${BASE_URL}/api/admin/device-access`, {
    method: "PATCH",
    headers: await getAdminHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    throw new Error(body?.message || "Gagal mengubah akses device.");
  }

  return body?.data ?? body;
}

export async function createAdminDevice(deviceId) {
  const response = await fetch(`${BASE_URL}/api/admin/devices`, {
    method: "POST",
    headers: await getAdminHeaders(),
    body: JSON.stringify({ deviceId }),
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    throw new Error(body?.message || "Gagal menambahkan Device ID.");
  }

  return body?.data ?? body;
}
