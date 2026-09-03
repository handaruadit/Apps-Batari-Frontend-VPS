//===== (Imports) ======
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  PlantSelectField,
  PlantTextField,
} from "@/features/plants/components/PlantFormFields";
import PlantSelectModal from "@/features/plants/components/PlantSelectModal";
import {
  CURRENCY_OPTIONS,
  SYSTEM_TYPE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/features/plants/constants/plantFormOptions";
import usePlantForm from "@/features/plants/hooks/usePlantForm";
import styles from "@/features/plants/styles/plantFormStyles";
import { useAppSettings } from "@/context/AppSettingsContext";

//===== (Add Device Screen) ======
export default function AddDeviceScreen() {
  const { colors, t } = useAppSettings();
  const {
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
  } = usePlantForm(t);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      {/* Fixed Sticky Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.screen }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {isEditMode ? t("editPlant") : t("addPlant")}
          </Text>

          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("basicInfo")}
          </Text>

          <PlantTextField
            label={t("plantName")}
            required
            colors={colors}
            placeholder={t("enterPlantName")}
            value={name}
            onChangeText={setName}
          />
          <PlantTextField
            label={t("address")}
            required
            colors={colors}
            placeholder={t("enterAddress")}
            value={address}
            onChangeText={setAddress}
          />
          <PlantTextField
            label={t("province")}
            required
            colors={colors}
            placeholder={t("selectProvince")}
            value={province}
            onChangeText={setProvince}
          />
          <PlantTextField
            label={t("city")}
            required
            colors={colors}
            placeholder={t("selectCity")}
            value={city}
            onChangeText={setCity}
          />
          <PlantTextField
            label={t("longitude")}
            required
            colors={colors}
            placeholder={t("enterLongitude")}
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
          <PlantTextField
            label={t("latitude")}
            required
            colors={colors}
            placeholder={t("enterLatitude")}
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          <PlantSelectField
            label={t("timezone")}
            required
            colors={colors}
            placeholder={t("selectTimezone")}
            value={timezone}
            onPress={() => setTimezoneModalVisible(true)}
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("systemInfo")}
          </Text>

          <PlantSelectField
            label={t("systemType")}
            required
            colors={colors}
            placeholder={t("selectSystemType")}
            value={systemType}
            onPress={() => setSystemTypeModalVisible(true)}
          />

          {systemType === "Sistem terikat grid" && (
            <PlantTextField
              label={t("installedCapacity")}
              colors={colors}
              placeholder={t("enterInstalledCapacity")}
              value={installedCapacity}
              onChangeText={setInstalledCapacity}
              keyboardType="numeric"
            />
          )}

          {systemType === "Sistem penyimpanan" && (
            <>
              <PlantTextField
                label={t("installedCapacity")}
                colors={colors}
                placeholder={t("enterInstalledCapacity")}
                value={installedCapacity}
                onChangeText={setInstalledCapacity}
                keyboardType="numeric"
              />
              <PlantTextField
                label={t("batteryCapacity")}
                colors={colors}
                placeholder={t("enterBatteryCapacity")}
                value={batteryCapacity}
                onChangeText={setBatteryCapacity}
                keyboardType="numeric"
              />
            </>
          )}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("incomeInfo")}
          </Text>

          <PlantSelectField
            label={t("currency")}
            colors={colors}
            placeholder={t("selectCurrency")}
            value={currency}
            onPress={() => setCurrencyModalVisible(true)}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? t("saveChanges") : t("savePlant")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <PlantSelectModal
        visible={timezoneModalVisible}
        title={t("selectTimezone")}
        options={TIMEZONE_OPTIONS}
        onSelect={handleSelectTimezone}
        onClose={() => setTimezoneModalVisible(false)}
        closeLabel={t("close")}
        colors={colors}
        showsVerticalScrollIndicator={false}
      />
      <PlantSelectModal
        visible={systemTypeModalVisible}
        title={t("selectSystemType")}
        options={SYSTEM_TYPE_OPTIONS}
        onSelect={handleSelectSystemType}
        onClose={() => setSystemTypeModalVisible(false)}
        closeLabel={t("close")}
        colors={colors}
      />
      <PlantSelectModal
        visible={currencyModalVisible}
        title={t("selectCurrency")}
        options={CURRENCY_OPTIONS}
        onSelect={handleSelectCurrency}
        onClose={() => setCurrencyModalVisible(false)}
        closeLabel={t("close")}
        colors={colors}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
