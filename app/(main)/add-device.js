import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { appColors, appFont } from '@/config/theme';
import { useAppSettings } from '@/context/AppSettingsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createPlant, updatePlant } from '@/services/plantService';

const TIMEZONE_OPTIONS = [
  'Etc/GMT+12',
  'Etc/GMT+11',
  'Pacific/Midway',
  'Pacific/Niue',
  'Pacific/Pago_Pago',
  'Pacific/Samoa',
  'America/Adak',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Phoenix',
  'America/Chicago',
  'America/Mexico_City',
  'America/New_York',
  'America/Toronto',
  'America/Halifax',
  'America/St_Johns',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Atlantic/Azores',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Zurich',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Bucharest',
  'Europe/Helsinki',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Jerusalem',
  'Asia/Baghdad',
  'Asia/Riyadh',
  'Asia/Tehran',
  'Asia/Dubai',
  'Asia/Kabul',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Manila',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Guam',
  'Pacific/Auckland',
];

const SYSTEM_TYPE_OPTIONS = [
  'Sistem terikat grid',
  'Sistem penyimpanan',
];

const CURRENCY_OPTIONS = [
  'IDR',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'SGD',
  'MYR',
  'THB',
  'PHP',
  'VND',
  'KRW',
  'INR',
  'AUD',
  'NZD',
  'CAD',
  'CHF',
  'HKD',
  'TWD',
  'AED',
  'SAR',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'EGP',
  'ZAR',
  'NGN',
  'KES',
  'TRY',
  'RUB',
  'UAH',
  'PLN',
  'CZK',
  'SEK',
  'NOK',
  'DKK',
  'HUF',
  'RON',
  'BRL',
  'ARS',
  'CLP',
  'COP',
  'MXN',
  'PEN',
];

function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitialText(value) {
  const item = getParamValue(value);

  if (item == null) {
    return '';
  }

  return String(item);
}

export default function AddDeviceScreen() {
  const { colors, t } = useAppSettings();
  const params = useLocalSearchParams();
  const editPlantId = getParamValue(params.plantId);
  const isEditMode = getParamValue(params.mode) === 'edit' && Boolean(editPlantId);

  const [name, setName] = useState(() => getInitialText(params.name));
  const [address, setAddress] = useState(() => getInitialText(params.location));
  const [province, setProvince] = useState(() => getInitialText(params.province));
  const [city, setCity] = useState(() => getInitialText(params.city));
  const [longitude, setLongitude] = useState(() => getInitialText(params.longitude));
  const [latitude, setLatitude] = useState(() => getInitialText(params.latitude));
  const [timezone, setTimezone] = useState(() => getInitialText(params.timezone));
  const [systemType, setSystemType] = useState(() =>
    getInitialText(params.systemType),
  );
  const [installedCapacity, setInstalledCapacity] = useState(() =>
    getInitialText(params.pvCapacity),
  );
  const [batteryCapacity, setBatteryCapacity] = useState(() =>
    getInitialText(params.batteryCapacity),
  );
  const [currency, setCurrency] = useState(() => getInitialText(params.currency));

  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [systemTypeModalVisible, setSystemTypeModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      Alert.alert(
        t('warning'),
        t('fillRequired'),
      );
      return;
    }

    const longitudeNumber = Number(longitude);
    const latitudeNumber = Number(latitude);
    const installedCapacityNumber = installedCapacity
      ? Number(installedCapacity)
      : null;
    const batteryCapacityNumber = batteryCapacity ? Number(batteryCapacity) : null;

    if (!Number.isFinite(longitudeNumber) || !Number.isFinite(latitudeNumber)) {
      Alert.alert(t('warning'), t('coordinateNumber'));
      return;
    }

    if (installedCapacity && !Number.isFinite(installedCapacityNumber)) {
      Alert.alert(t('warning'), t('capacityNumber'));
      return;
    }

    if (
      systemType === 'Sistem penyimpanan' &&
      batteryCapacity &&
      !Number.isFinite(batteryCapacityNumber)
    ) {
      Alert.alert(t('warning'), t('batteryCapacityNumber'));
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
        systemType === 'Sistem penyimpanan' ? batteryCapacityNumber || 0 : 0,
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
        t('success'),
        isEditMode ? t('plantUpdated') : t('plantCreated'),
      );
      router.back();
    } catch (error) {
      if (error.code === 'AUTH_EXPIRED') {
        Alert.alert(
          'Error',
          'Sesi Anda telah habis atau token tidak valid. Silakan login kembali.',
        );
        router.replace('/(auth)/login');
        return;
      }

      Alert.alert(
        t('failed'),
        error.message ||
          (isEditMode ? 'Gagal menyimpan perubahan plant.' : 'Gagal menyimpan plant.'),
      );
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTimezone = (selectedTimezone) => {
    setTimezone(selectedTimezone);
    setTimezoneModalVisible(false);
  };

  const handleSelectSystemType = (selectedSystemType) => {
    setSystemType(selectedSystemType);
    setSystemTypeModalVisible(false);

    if (selectedSystemType !== 'Sistem penyimpanan') {
      setBatteryCapacity('');
    }
  };

  const handleSelectCurrency = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setCurrencyModalVisible(false);
  };

  const renderLabel = (label, required = false) => (
    <Text style={[styles.label, { color: colors.textSoft }]}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.screen }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screen }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {isEditMode ? t('editPlant') : t('addPlant')}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('basicInfo')}
          </Text>

          {renderLabel(t('plantName'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('enterPlantName')}
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={setName}
          />

          {renderLabel(t('address'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('enterAddress')}
            placeholderTextColor="#6B7280"
            value={address}
            onChangeText={setAddress}
          />

          {renderLabel(t('province'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('selectProvince')}
            placeholderTextColor="#6B7280"
            value={province}
            onChangeText={setProvince}
          />

          {renderLabel(t('city'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('selectCity')}
            placeholderTextColor="#6B7280"
            value={city}
            onChangeText={setCity}
          />

          {renderLabel(t('longitude'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('enterLongitude')}
            placeholderTextColor="#6B7280"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />

          {renderLabel(t('latitude'), true)}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder={t('enterLatitude')}
            placeholderTextColor="#6B7280"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />

          {renderLabel(t('timezone'), true)}
          <TouchableOpacity
            style={[
              styles.inputButton,
              { backgroundColor: colors.input, borderColor: colors.inputBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => setTimezoneModalVisible(true)}
          >
            <Text
              style={[
                timezone ? styles.inputButtonText : styles.placeholderText,
                { color: timezone ? colors.text : colors.textMuted },
              ]}
            >
              {timezone || t('selectTimezone')}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('systemInfo')}
          </Text>

          {renderLabel(t('systemType'), true)}
          <TouchableOpacity
            style={[
              styles.inputButton,
              { backgroundColor: colors.input, borderColor: colors.inputBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => setSystemTypeModalVisible(true)}
          >
            <Text
              style={[
                systemType ? styles.inputButtonText : styles.placeholderText,
                { color: systemType ? colors.text : colors.textMuted },
              ]}
            >
              {systemType || t('selectSystemType')}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {systemType === 'Sistem terikat grid' && (
            <>
              {renderLabel(t('installedCapacity'))}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder={t('enterInstalledCapacity')}
                placeholderTextColor="#6B7280"
                value={installedCapacity}
                onChangeText={setInstalledCapacity}
                keyboardType="numeric"
              />
            </>
          )}

          {systemType === 'Sistem penyimpanan' && (
            <>
              {renderLabel(t('installedCapacity'))}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder={t('enterInstalledCapacity')}
                placeholderTextColor="#6B7280"
                value={installedCapacity}
                onChangeText={setInstalledCapacity}
                keyboardType="numeric"
              />

              {renderLabel(t('batteryCapacity'))}
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder={t('enterBatteryCapacity')}
                placeholderTextColor="#6B7280"
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
            { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('incomeInfo')}
          </Text>

          {renderLabel(t('currency'))}
          <TouchableOpacity
            style={[
              styles.inputButton,
              { backgroundColor: colors.input, borderColor: colors.inputBorder },
            ]}
            activeOpacity={0.8}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <Text
              style={[
                currency ? styles.inputButtonText : styles.placeholderText,
                { color: currency ? colors.text : colors.textMuted },
              ]}
            >
              {currency || t('selectCurrency')}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </TouchableOpacity>
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
              {isEditMode ? t('saveChanges') : t('savePlant')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={timezoneModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTimezoneModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('selectTimezone')}
            </Text>

            <FlatList
              data={TIMEZONE_OPTIONS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.bubbleBorder },
                  ]}
                  onPress={() => handleSelectTimezone(item)}
                >
                  <Text style={[styles.optionItemText, { color: colors.textSoft }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.input }]}
              onPress={() => setTimezoneModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                {t('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={systemTypeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSystemTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('selectSystemType')}
            </Text>

            <FlatList
              data={SYSTEM_TYPE_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.bubbleBorder },
                  ]}
                  onPress={() => handleSelectSystemType(item)}
                >
                  <Text style={[styles.optionItemText, { color: colors.textSoft }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.input }]}
              onPress={() => setSystemTypeModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                {t('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.bubble, borderColor: colors.bubbleBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('selectCurrency')}
            </Text>

            <FlatList
              data={CURRENCY_OPTIONS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.bubbleBorder },
                  ]}
                  onPress={() => handleSelectCurrency(item)}
                >
                  <Text style={[styles.optionItemText, { color: colors.textSoft }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.input }]}
              onPress={() => setCurrencyModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                {t('close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
  },
  headerSpacer: {
    width: 44,
  },
  sectionCard: {
    backgroundColor: appColors.bubble,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 14,
  },
  label: {
    color: appColors.textSoft,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: appFont,
    marginBottom: 8,
    marginTop: 2,
  },
  required: {
    color: '#F87171',
  },
  input: {
    backgroundColor: appColors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    color: appColors.text,
    fontSize: 16,
    fontFamily: appFont,
    marginBottom: 14,
  },
  inputButton: {
    backgroundColor: appColors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  inputButtonText: {
    color: appColors.text,
    fontSize: 16,
    fontFamily: appFont,
  },
  placeholderText: {
    color: appColors.textMuted,
    fontSize: 16,
    fontFamily: appFont,
  },
  saveButton: {
    backgroundColor: appColors.accent,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: appColors.bubble,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 16,
    borderTopWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.bubbleBorder,
  },
  optionItemText: {
    color: appColors.textSoft,
    fontSize: 15,
  },
  closeButton: {
    marginTop: 14,
    backgroundColor: appColors.input,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: appColors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});
