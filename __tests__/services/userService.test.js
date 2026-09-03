//===== (Imports) ======
import {
  deleteUserAccount,
  fetchUserProfile,
  updateUserProfile,
} from "@/services/userService";
import { apiRequest } from "@/services/apiClient";

//===== (Mocks) ======
jest.mock("@/services/apiClient", () => ({
  apiRequest: jest.fn(),
  createServiceError: jest.fn((message, code, status, body) => {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    error.body = body;
    return error;
  }),
}));

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchUserProfile returns profile data on success", async () => {
    apiRequest.mockResolvedValueOnce({
      response: { ok: true, status: 200 },
      body: { status: "success", data: { id: "123", email: "test@example.com", name: "Tester" } },
    });

    const result = await fetchUserProfile();
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/profile", {
      method: "GET",
      auth: true,
    });
    expect(result).toEqual({ id: "123", email: "test@example.com", name: "Tester" });
  });

  it("updateUserProfile sends PUT request with updated payload", async () => {
    apiRequest.mockResolvedValueOnce({
      response: { ok: true, status: 200 },
      body: { status: "success", data: { id: "123", name: "New Name", phone: "0812345" } },
    });

    const result = await updateUserProfile({ name: "New Name", phone: "0812345" });
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/profile", {
      method: "PUT",
      auth: true,
      body: { name: "New Name", phone: "0812345" },
    });
    expect(result).toEqual({ id: "123", name: "New Name", phone: "0812345" });
  });

  it("deleteUserAccount sends DELETE request with password", async () => {
    apiRequest.mockResolvedValueOnce({
      response: { ok: true, status: 200 },
      body: { status: "success", message: "Account deleted" },
    });

    const result = await deleteUserAccount({ password: "secretPassword" });
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/account", {
      method: "DELETE",
      auth: true,
      body: { password: "secretPassword" },
    });
    expect(result.status).toBe("success");
  });
});
