//===== (Imports) ======
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { createPlant, updatePlant } from "@/services/plantService";

//===== (getParamValue) ======
function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

//===== (getInitialText) ======
function getInitialText(value) {
  const item = getParamValue(value);

  if (item == null) {
    return "";
  }

  return String(item);
}

//===== (usePlantForm) ======
export default function usePlantForm(t) {
  const params = useLocalSearchParams();
  const editPlantId = getParamValue(params.plantId);
  const isEditMode =
    getParamValue(params.mode) === "edit" && Boolean(editPlantId);

  const [name, setName] = useState(() => getInitialText(params.name));
  const [address, setAddress] = useState(() =>
    getInitialText(params.location),
  );
  const [province, setProvince] = useState(() =>
    getInitialText(params.province),
  );
  const [city, setCity] = useState(() => getInitialText(params.city));
  const [longitude, setLongitude] = useState(() =>
    getInitialText(params.longitude),
  );
  const [latitude, setLatitude] = useState(() =>
    getInitialText(params.latitude),
  );
  const [timezone, setTimezone] = useState(() =>
    getInitialText(params.timezone),
  );
  const [systemType, setSystemType] = useState(() =>
    getInitialText(params.systemType),
  );
  const [installedCapacity, setInstalledCapacity] = useState(() =>
    getInitialText(params.pvCapacity),
  );
  const [batteryCapacity, setBatteryCapacity] = useState(() =>
    getInitialText(params.batteryCapacity),
  );
  const [currency, setCurrency] = useState(() =>
    getInitialText(params.currency),
  );
  const [tilt, setTilt] = useState(() => getInitialText(params.tilt) || "12");
  const [azimuth, setAzimuth] = useState(() => {
    const raw = getInitialText(params.azimuth);
    if (!raw || raw === "0") return "Selatan (0°)";
    if (raw === "45") return "Barat Daya (45°)";
    if (raw === "90") return "Barat (90°)";
    if (raw === "135") return "Barat Laut (135°)";
    if (raw === "180" || raw === "-180") return "Utara (180°)";
    if (raw === "-135") return "Timur Laut (-135°)";
    if (raw === "-90") return "Timur (-90°)";
    if (raw === "-45") return "Tenggara (-45°)";
    return raw;
  });

  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [systemTypeModalVisible, setSystemTypeModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [azimuthModalVisible, setAzimuthModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  //===== (handleSave) ======
  const handleSave = async () => {
    if (
      !name ||
      !address ||
      !city ||
      !province ||
      !longitude ||
      !latitude ||
      !systemType ||
      !timezone
    ) {
      Alert.alert(t("warning"), t("fillRequired"));
      return;
    }

    const longitudeNumber = Number(longitude);
    const latitudeNumber = Number(latitude);
    const installedCapacityNumber = installedCapacity
      ? Number(installedCapacity)
      : null;
    const batteryCapacityNumber = batteryCapacity
      ? Number(batteryCapacity)
      : null;

    if (!Number.isFinite(longitudeNumber) || !Number.isFinite(latitudeNumber)) {
      Alert.alert(t("warning"), t("coordinateNumber"));
      return;
    }

    if (installedCapacity && !Number.isFinite(installedCapacityNumber)) {
      Alert.alert(t("warning"), t("capacityNumber"));
      return;
    }

    if (
      systemType === "Sistem penyimpanan" &&
      batteryCapacity &&
      !Number.isFinite(batteryCapacityNumber)
    ) {
      Alert.alert(t("warning"), t("batteryCapacityNumber"));
      return;
    }

    const parseAzimuthValue = (azStr) => {
      const s = String(azStr || "");
      if (s.includes("0°") || s === "0") return 0;
      if (s.includes("45°")) return 45;
      if (s.includes("90°")) return 90;
      if (s.includes("135°")) return 135;
      if (s.includes("180°")) return 180;
      if (s.includes("-135°")) return -135;
      if (s.includes("-90°")) return -90;
      if (s.includes("-45°")) return -45;
      const num = parseFloat(s);
      return Number.isFinite(num) ? num : 0;
    };

    const tiltNumber = tilt ? Number(tilt) : 12;

    const payload = {
      name: name.trim(),
      location: address.trim(),
      city: city.trim(),
      province: province.trim(),
      longitude: longitudeNumber,
      latitude: latitudeNumber,
      timezone,
      system_type: systemType,
      pv_capacity: installedCapacityNumber || 0,
      battery_capacity:
        systemType === "Sistem penyimpanan" ? batteryCapacityNumber || 0 : 0,
      tilt: Number.isFinite(tiltNumber) ? tiltNumber : 12,
      azimuth: parseAzimuthValue(azimuth),
    };

    payload.currency = currency || "Rp";

    setIsSaving(true);

    try {
      if (isEditMode) {
        await updatePlant(editPlantId, payload);
      } else {
        await createPlant(payload);
      }

      Alert.alert(
        t("success"),
        isEditMode ? t("plantUpdated") : t("plantCreated"),
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      if (error.code === "AUTH_EXPIRED") {
        Alert.alert(
          "Error",
          t("sessionExpiredAlert"),
        );
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert(
        t("failed"),
        error.message ||
          (isEditMode
            ? t("plantSaveFailed")
            : t("plantCreateFailed")),
      );
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  //===== (handleSelectTimezone) ======
  const handleSelectTimezone = (selectedTimezone) => {
    setTimezone(selectedTimezone);
    setTimezoneModalVisible(false);
  };

  //===== (handleSelectSystemType) ======
  const handleSelectSystemType = (selectedSystemType) => {
    setSystemType(selectedSystemType);
    setSystemTypeModalVisible(false);

    if (selectedSystemType !== "Sistem penyimpanan") {
      setBatteryCapacity("");
    }
  };

  //===== (handleSelectCurrency) ======
  const handleSelectCurrency = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setCurrencyModalVisible(false);
  };

  //===== (handleSelectAzimuth) ======
  const handleSelectAzimuth = (selectedAzimuth) => {
    setAzimuth(selectedAzimuth);
    setAzimuthModalVisible(false);
  };

  return {
    address,
    azimuth,
    azimuthModalVisible,
    batteryCapacity,
    city,
    currency,
    currencyModalVisible,
    handleSave,
    handleSelectAzimuth,
    handleSelectCurrency,
    handleSelectSystemType,
    handleSelectTimezone,
    installedCapacity,
    isEditMode,
    isSaving,
    latitude,
    longitude,
    name,
    province,
    setAddress,
    setAzimuth,
    setAzimuthModalVisible,
    setBatteryCapacity,
    setCity,
    setCurrencyModalVisible,
    setInstalledCapacity,
    setLatitude,
    setLongitude,
    setName,
    setProvince,
    setSystemTypeModalVisible,
    setTilt,
    setTimezoneModalVisible,
    systemType,
    systemTypeModalVisible,
    tilt,
    timezone,
    timezoneModalVisible,
  };
}
