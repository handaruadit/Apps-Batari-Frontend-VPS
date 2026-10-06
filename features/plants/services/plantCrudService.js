import { apiRequest } from "@/services/apiClient";
import { assertPlantId, throwApiError } from "./plantShared";

//===== (fetchPlants) ======
export async function fetchPlants() {
  const [telemetryResult, plantResult] = await Promise.allSettled([
    apiRequest("/api/data/stations"),
    apiRequest("/api/plant/"),
  ]);

  if (
    telemetryResult.status === "rejected" &&
    telemetryResult.reason?.code === "AUTH_EXPIRED"
  ) {
    throw telemetryResult.reason;
  }
  if (
    plantResult.status === "rejected" &&
    plantResult.reason?.code === "AUTH_EXPIRED"
  ) {
    throw plantResult.reason;
  }

  let rawStations = [];
  if (
    telemetryResult.status === "fulfilled" &&
    Array.isArray(telemetryResult.value?.body?.data) &&
    telemetryResult.value.body.data.length > 0
  ) {
    rawStations = telemetryResult.value.body.data;
  } else if (
    telemetryResult.status === "fulfilled" &&
    Array.isArray(telemetryResult.value?.body) &&
    telemetryResult.value.body.length > 0
  ) {
    rawStations = telemetryResult.value.body;
  }

  let dbPlants = [];
  if (
    plantResult.status === "fulfilled" &&
    Array.isArray(plantResult.value?.body?.data)
  ) {
    dbPlants = plantResult.value.body.data;
  } else if (
    plantResult.status === "fulfilled" &&
    Array.isArray(plantResult.value?.body)
  ) {
    dbPlants = plantResult.value.body;
  }

  // Jika kedua endpoint gagal mendapatkan data
  if (rawStations.length === 0 && dbPlants.length === 0) {
    if (plantResult.status === "rejected") throw plantResult.reason;
    if (telemetryResult.status === "rejected") throw telemetryResult.reason;
    return [];
  }

  // Fallback jika /api/data/stations tidak merespon (misal di lingkungan offline/testing)
  if (rawStations.length === 0 && dbPlants.length > 0) {
    return dbPlants;
  }

  // 1. Sinkronisasi & pengayaan 31 stasiun operasional Deye Cloud dengan metadata database
  const finalStations = rawStations.map((st) => {
    const stIdStr = String(st.id || st.stationId);
    const stNameClean = String(st.name || st.stationName || "").trim().toLowerCase();

    const matchedDb = dbPlants.find(
      (dbp) =>
        (dbp.deye_station_id && String(dbp.deye_station_id) === stIdStr) ||
        String(dbp.id) === stIdStr ||
        (dbp.plantsId && String(dbp.plantsId) === stIdStr) ||
        (dbp.name && String(dbp.name).trim().toLowerCase() === stNameClean)
    );

    const role = (matchedDb?.role || "owner").toLowerCase();
    const isOwner = role === "owner";
    const isEditor = role === "editor" || role === "can_manage";

    const isOnline =
      st.status === "Online" ||
      st.connectionStatus === "NORMAL" ||
      st.connectStatus === 1;

    const latVal =
      Number(
        matchedDb?.latitude ??
          st.latitude ??
          (st.coordinates ? st.coordinates.split(",")[0] : 0)
      ) || undefined;
    const lngVal =
      Number(
        matchedDb?.longitude ??
          st.longitude ??
          (st.coordinates ? st.coordinates.split(",")[1] : 0)
      ) || undefined;
    const capVal = Number(
      matchedDb?.pv_capacity ??
        matchedDb?.capacity ??
        st.capacity ??
        st.installedCapacity ??
        0
    );

    return {
      ...st,
      id: matchedDb?.id ? matchedDb.id : (st.id || st.stationId),
      plantsId: matchedDb?.id ? String(matchedDb.id) : String(st.id || st.stationId),
      deye_station_id: st.id || st.stationId,
      name: matchedDb?.name || st.name || st.stationName,
      location: matchedDb?.location || matchedDb?.address || st.address || st.locationAddress || "",
      address: matchedDb?.location || matchedDb?.address || st.address || st.locationAddress || "",
      city: matchedDb?.city || st.city || "",
      province: matchedDb?.province || st.province || "",
      postalCode: matchedDb?.postal_code || matchedDb?.postalCode || st.postalCode || "10110",
      latitude: latVal,
      longitude: lngVal,
      pv_capacity: capVal,
      installed_capacity: capVal,
      capacity: capVal,
      status: st.status || (isOnline ? "Online" : "Offline"),
      connection_status: st.status || (isOnline ? "Online" : "Offline"),
      is_online: isOnline,
      production: st.status === "Offline" ? 0 : Number(st.production ?? st.pvKw ?? 0),
      pvKw: st.status === "Offline" ? 0 : Number(st.production ?? st.pvKw ?? 0),
      dailyProduction: Number(st.dailyProduction ?? 0),
      accumulativeProduction: Number(st.accumulativeProduction ?? 0),
      role: isOwner ? "owner" : isEditor ? "editor" : "viewer",
      accessRole: isOwner ? "owner" : isEditor ? "editor" : "viewer",
      canManage: matchedDb?.canManage ?? isOwner,
      canEdit: matchedDb?.canEdit ?? (isOwner || isEditor),
      canDelete: matchedDb?.canDelete ?? isOwner,
      canAddDatalogger: matchedDb?.canAddDatalogger ?? isOwner,
      latest_data_at: st.lastUpdateTime || matchedDb?.latest_data_at,
      latestDataStatusTimestamp: isOnline
        ? Date.now()
        : (st.lastUpdateTime ? new Date(st.lastUpdateTime).getTime() : null),
    };
  });

  // 2. Gabungkan custom database plants yang tidak memiliki mapping stasiun Deye Cloud (4 stasiun)
  if (dbPlants.length > 0) {
    const existingStationIds = new Set(
      finalStations.map((s) => String(s.deye_station_id || s.id))
    );
    const existingDbIds = new Set(
      finalStations.map((s) => String(s.id))
    );
    const existingNames = new Set(
      finalStations.map((s) => (s.name || "").trim().toLowerCase())
    );

    const customPlants = dbPlants.filter((dbp) => {
      const dbpIdStr = String(dbp.id);
      const dbpNameClean = (dbp.name || dbp.plantName || "").trim().toLowerCase();
      if (dbp.deye_station_id && existingStationIds.has(String(dbp.deye_station_id))) return false;
      if (existingDbIds.has(dbpIdStr)) return false;
      if (dbp.plantsId && existingStationIds.has(String(dbp.plantsId))) return false;
      if (dbpNameClean && existingNames.has(dbpNameClean)) return false;
      return true;
    });

    for (const dbp of customPlants) {
      const role = (dbp.role || "owner").toLowerCase();
      const isOwner = role === "owner";
      const isEditor = role === "editor" || role === "can_manage";
      const latVal = Number(dbp.latitude) || 0;
      const lngVal = Number(dbp.longitude) || 0;
      const resolvedCoords =
        dbp.coordinates ||
        (latVal !== 0 && lngVal !== 0 ? `${latVal}, ${lngVal}` : "");

      const isOnline = Boolean(dbp.is_online);
      const statusStr = isOnline ? "Online" : "Offline";
      const capVal = Number(dbp.pv_capacity || dbp.capacity || 0);

      finalStations.push({
        id: dbp.id,
        plantsId: String(dbp.id),
        name: dbp.name || dbp.plantName || "Unnamed Plant",
        location: dbp.location || dbp.address || "",
        address: dbp.location || dbp.address || "",
        city: dbp.city || "",
        province: dbp.province || "",
        coordinates: resolvedCoords,
        latitude: latVal !== 0 ? latVal : undefined,
        longitude: lngVal !== 0 ? lngVal : undefined,
        timeZone: dbp.timezone || dbp.timeZone || "Asia/Jakarta",
        status: statusStr,
        connection_status: statusStr,
        is_online: isOnline,
        capacity: capVal,
        pv_capacity: capVal,
        installed_capacity: capVal,
        production: 0,
        pvKw: 0,
        dailyProduction: 0,
        accumulativeProduction: 0,
        role: isOwner ? "owner" : isEditor ? "editor" : "viewer",
        accessRole: isOwner ? "owner" : isEditor ? "editor" : "viewer",
        canManage: dbp.canManage ?? isOwner,
        canEdit: dbp.canEdit ?? (isOwner || isEditor),
        canDelete: dbp.canDelete ?? isOwner,
        canAddDatalogger: dbp.canAddDatalogger ?? isOwner,
        latest_data_at: dbp.latest_data_at || null,
        latestDataStatusTimestamp: isOnline ? Date.now() : null,
      });
    }
  }

  return finalStations;
}

//===== (createPlant) ======
export async function createPlant(payload) {
  const { response, body } = await apiRequest("/api/plant/create", {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan plant");
  }

  return body;
}

//===== (updatePlant) ======
export async function updatePlant(plantId, payload) {
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}`,
    {
      method: "PUT",
      body: payload,
    },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menyimpan perubahan plant");
  }

  return body;
}

//===== (deletePlant) ======
export async function deletePlant(plantId) {
  assertPlantId(plantId);
  const { response, body } = await apiRequest(
    `/api/plant/${encodeURIComponent(plantId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throwApiError(response, body, "Gagal menghapus plant");
  }

  return body;
}

