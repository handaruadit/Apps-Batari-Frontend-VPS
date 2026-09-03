//===== (Imports) ======
import { apiRequest, createServiceError } from "@/services/apiClient";

//===== (fetchUserProfile) ======
export async function fetchUserProfile() {
  const { response, body } = await apiRequest("/api/auth/profile", {
    method: "GET",
    auth: true,
  });

  if (!response.ok) {
    throw createServiceError(
      body?.message || "Gagal memuat profil pengguna",
      "GET_PROFILE_ERROR",
      response.status,
      body,
    );
  }

  return body?.data || body;
}

//===== (updateUserProfile) ======
export async function updateUserProfile({ name, phone, password, oldPassword }) {
  const { response, body } = await apiRequest("/api/auth/profile", {
    method: "PUT",
    auth: true,
    body: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(password ? { password, oldPassword } : {}),
    },
  });

  if (!response.ok) {
    throw createServiceError(
      body?.message || "Gagal memperbarui profil pengguna",
      "UPDATE_PROFILE_ERROR",
      response.status,
      body,
    );
  }

  return body?.data || body;
}

//===== (deleteUserAccount) ======
export async function deleteUserAccount({ password }) {
  const { response, body } = await apiRequest("/api/auth/account", {
    method: "DELETE",
    auth: true,
    body: { password },
  });

  if (!response.ok) {
    throw createServiceError(
      body?.message || "Gagal menghapus akun",
      "DELETE_ACCOUNT_ERROR",
      response.status,
      body,
    );
  }

  return body;
}
