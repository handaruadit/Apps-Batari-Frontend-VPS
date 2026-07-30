//===== (Imports) ======
import {
  addPlantAccessUser,
  createPlant,
  fetchPlants,
  linkDeviceToPlant,
  normalizePlantAccessRole,
} from "@/services/plantService";

//===== (Mocks) ======
jest.mock("@/auth/token", () => ({
  clearAuth: jest.fn(async () => undefined),
  getToken: jest.fn(async () => "valid-token"),
  isTokenValid: jest.fn(() => true),
}));

//===== (createResponse) ======
function createResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    text: jest.fn(async () => JSON.stringify(body)),
  };
}

//===== (Plant Service Tests) ======
describe("plantService compatibility facade", () => {
  beforeEach(() => {
    global.fetch.mockReset();
  });

  it("returns the plant list from the existing response shape", async () => {
    global.fetch.mockResolvedValue(
      createResponse({ data: [{ id: 1, name: "Plant A" }] }),
    );

    await expect(fetchPlants()).resolves.toEqual([
      { id: 1, name: "Plant A" },
    ]);
  });

  it("keeps the create plant endpoint and payload", async () => {
    const payload = { name: "Plant A" };
    global.fetch.mockResolvedValue(
      createResponse({ status: "success", data: payload }),
    );

    await createPlant(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/plant/create"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("normalizes the existing access role aliases", () => {
    expect(normalizePlantAccessRole("view_only")).toBe("viewer");
    expect(normalizePlantAccessRole("manage access")).toBe("editor");
  });

  it("uses the normalized role when adding plant access", async () => {
    global.fetch.mockResolvedValue(createResponse({ data: [] }));

    await addPlantAccessUser(10, 20, "manage_access");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/plant/10/access"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: 20, role: "editor" }),
      }),
    );
  });

  it("rejects an empty device id before requesting the backend", async () => {
    await expect(linkDeviceToPlant(10, " ")).rejects.toThrow(
      "Device ID tidak boleh kosong.",
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
