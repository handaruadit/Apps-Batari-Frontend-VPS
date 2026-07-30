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

  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [systemTypeModalVisible, setSystemTypeModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
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
    };

    if (currency) {
      payload.currency = currency;
    }

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
      );
      router.back();
    } catch (error) {
      if (error.code === "AUTH_EXPIRED") {
        Alert.alert(
          "Error",
          "Sesi Anda telah habis atau token tidak valid. Silakan login kembali.",
        );
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert(
        t("failed"),
        error.message ||
          (isEditMode
            ? "Gagal menyimpan perubahan plant."
            : "Gagal menyimpan plant."),
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

  return {
    address,
    batteryCapacity,
    city,
    currency,
    currencyModalVisible,
    handleSave,
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
    setBatteryCapacity,
    setCity,
    setCurrencyModalVisible,
    setInstalledCapacity,
    setLatitude,
    setLongitude,
    setName,
    setProvince,
    setSystemTypeModalVisible,
    setTimezoneModalVisible,
    systemType,
    systemTypeModalVisible,
    timezone,
    timezoneModalVisible,
  };
}
