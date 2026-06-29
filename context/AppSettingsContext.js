import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAppColors } from "@/config/theme";

const THEME_STORAGE_KEY = "batari:theme-mode";
const LANGUAGE_STORAGE_KEY = "batari:language";

const translations = {
  en: {
    editInformation: "Edit Information",
    configureWifiDatalogger: "Configure Wifi Datalogger",
    localDebugging: "Local Debugging",
    setting: "Setting",
    logout: "Log out",
    deleteAccount: "Delete Account",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    notificationSetting: "Notification Setting",
    language: "Language",
    cache: "Cache",
    checkForUpdate: "Check for Update",
    about: "About",
    saveAsCsv: "Save as CSV",
    saving: "Saving...",
    loading: "Loading...",
    dailyCsvOnly: "Select Day mode to save daily CSV data.",
    csvSaved: "CSV file is ready.",
    csvFailed: "Save CSV failed",
    csvUnavailable: "Share/save is not available on this device.",
    selectedData: "Selected Data",
    time: "Time",
    date: "Date",
    month: "Month",
    year: "Year",
    day: "Day",
    searchPlantPlaceholder: "Search Plant Name/SN/Location",
    loadingPlants: "Loading plant data...",
    emptyPlants: "No plants yet.",
    openingOverview: "Opening overview...",
    plantData: "Plant Data",
    pv: "PV",
    grid: "Grid",
    battery: "Battery",
    load: "Load",
    consumption: "Consumption",
    production: "Production",
    selfConsumptionProductionRatio: "Self Consumption Production Ratio",
    monthlySavings: "Monthly Savings",
    pvGenerate: "PV Generate",
    export: "Export",
    charge: "Charge",
    co2Reduced: "CO2 Reduced",
    standardCoalSave: "Standard Coal Save",
    deforestationReduced: "Deforestation Reduced",
    percentage: "Percentage",
    inverter: "Inverter",
    inverterQuantity: "Inverter Quantity",
    deviceId: "Device ID",
    weather: "Weather",
    cityProvince: "City, Province",
    batteryParameters: "Battery Parameters",
    power: "Power",
    cell: "Cell",
    voltage: "Voltage",
    current: "Current",
    soc: "SoC",
    cycle: "Cycle",
    alarm: "Alarm",
    noDataAvailable: "No data available",
    noDeviceConnected: "No device connected.",
    loadingDevice: "Loading device...",
    loadingChart: "Loading chart data...",
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    janShort: "Jan",
    febShort: "Feb",
    marShort: "Mar",
    aprShort: "Apr",
    mayShort: "May",
    junShort: "Jun",
    julShort: "Jul",
    augShort: "Aug",
    sepShort: "Sep",
    octShort: "Oct",
    novShort: "Nov",
    decShort: "Dec",
    addDatalogger: "Add Datalogger",
    manageAccess: "Manage Access",
    delete: "Delete",
    edit: "Edit",
    pin: "Pin",
    unpin: "Unpin",
    refresh: "Refresh",
    addPlant: "Add Plant",
    editPlant: "Edit Plant",
    basicInfo: "Basic info",
    plantName: "Plant Name",
    enterPlantName: "Enter plant name",
    address: "Address",
    enterAddress: "Enter address",
    province: "Province",
    city: "City",
    selectProvince: "Select province",
    selectCity: "Select city",
    longitude: "Longitude",
    latitude: "Latitude",
    enterLongitude: "Enter longitude",
    enterLatitude: "Enter latitude",
    timezone: "Time zone",
    selectTimezone: "Select time zone",
    systemInfo: "System information",
    systemType: "System type",
    selectSystemType: "Select system type",
    installedCapacity: "Installed Capacity (kWp)",
    enterInstalledCapacity: "Enter installed capacity",
    batteryCapacity: "Battery Capacity (kWh)",
    enterBatteryCapacity: "Enter battery capacity",
    incomeInfo: "Income info",
    currency: "Currency",
    selectCurrency: "Select currency",
    savePlant: "Save Plant",
    saveChanges: "Save Changes",
    warning: "Warning",
    fillRequired: "Please fill all required fields marked with *.",
    coordinateNumber: "Longitude and latitude must be numbers.",
    capacityNumber: "Installed capacity must be a number.",
    batteryCapacityNumber: "Battery capacity must be a number.",
    success: "Success",
    plantCreated: "Plant has been added.",
    plantUpdated: "Plant changes have been saved.",
    failed: "Failed",
    close: "Close",
    me: "Me",
  },
  id: {
    editInformation: "Edit Informasi",
    configureWifiDatalogger: "Konfigurasi Wifi Datalogger",
    localDebugging: "Debug Lokal",
    setting: "Pengaturan",
    logout: "Keluar",
    deleteAccount: "Hapus Akun",
    theme: "Tema",
    darkMode: "Mode Gelap",
    lightMode: "Mode Terang",
    notificationSetting: "Pengaturan Notifikasi",
    language: "Bahasa",
    cache: "Cache",
    checkForUpdate: "Cek Pembaruan",
    about: "Tentang",
    saving: "Menyimpan...",
    loading: "Memuat...",
    saveAsCsv: "Simpan sebagai CSV",
    dailyCsvOnly: "Pilih mode Hari untuk menyimpan data CSV harian.",
    csvSaved: "File CSV siap disimpan.",
    csvFailed: "Simpan CSV gagal",
    csvUnavailable: "Fitur share/save tidak tersedia di perangkat ini.",
    selectedData: "Data Terpilih",
    time: "Waktu",
    date: "Tanggal",
    month: "Bulan",
    year: "Tahun",
    day: "Hari",
    searchPlantPlaceholder: "Cari Nama Plant/SN/Lokasi",
    loadingPlants: "Memuat data plant...",
    emptyPlants: "Belum ada plant.",
    openingOverview: "Membuka overview...",
    plantData: "Data Plant",
    pv: "FV",
    grid: "Jaringan",
    battery: "Baterai",
    load: "Beban",
    consumption: "Konsumsi",
    production: "Produksi",
    selfConsumptionProductionRatio: "Rasio produksi konsumsi sendiri",
    monthlySavings: "Penghematan Bulanan",
    pvGenerate: "Hasil FV",
    export: "Ekspor",
    charge: "Pengisian",
    co2Reduced: "CO2 berkurang",
    standardCoalSave: "Penghematan batubara standar",
    deforestationReduced: "Deforestasi berkurang",
    percentage: "Persentase",
    inverter: "Inverter",
    inverterQuantity: "Jumlah Inverter",
    deviceId: "ID perangkat",
    weather: "Cuaca",
    cityProvince: "Kota, Provinsi",
    batteryParameters: "Parameter Baterai",
    power: "Daya",
    cell: "Sel",
    voltage: "Voltase",
    current: "Arus",
    soc: "SoC",
    cycle: "Siklus",
    alarm: "Alarm",
    noDataAvailable: "Data tidak tersedia",
    noDeviceConnected: "Belum ada device terhubung.",
    loadingDevice: "Memuat device...",
    loadingChart: "Memuat data grafik...",
    january: "Januari",
    february: "Februari",
    march: "Maret",
    april: "April",
    may: "Mei",
    june: "Juni",
    july: "Juli",
    august: "Agustus",
    september: "September",
    october: "Oktober",
    november: "November",
    december: "Desember",
    janShort: "Jan",
    febShort: "Feb",
    marShort: "Mar",
    aprShort: "Apr",
    mayShort: "Mei",
    junShort: "Jun",
    julShort: "Jul",
    augShort: "Agu",
    sepShort: "Sep",
    octShort: "Okt",
    novShort: "Nov",
    decShort: "Des",
    addDatalogger: "Tambah Datalogger",
    manageAccess: "Kelola Akses",
    delete: "Hapus",
    edit: "Edit",
    pin: "Pin",
    unpin: "Lepas Pin",
    refresh: "Segarkan",
    addPlant: "Tambah Plant",
    editPlant: "Edit Plant",
    basicInfo: "Info dasar",
    plantName: "Nama Plant",
    enterPlantName: "Masukkan nama plant",
    address: "Alamat",
    enterAddress: "Masukkan alamat",
    province: "Provinsi",
    city: "Kota",
    selectProvince: "Pilih provinsi",
    selectCity: "Pilih kota",
    longitude: "Longitude",
    latitude: "Latitude",
    enterLongitude: "Masukkan longitude",
    enterLatitude: "Masukkan latitude",
    timezone: "Zona Waktu",
    selectTimezone: "Pilih zona waktu",
    systemInfo: "Informasi sistem",
    systemType: "Tipe sistem",
    selectSystemType: "Pilih tipe sistem",
    installedCapacity: "Kapasitas Terpasang (kWp)",
    enterInstalledCapacity: "Masukkan kapasitas terpasang",
    batteryCapacity: "Kapasitas Baterai (kWh)",
    enterBatteryCapacity: "Masukkan kapasitas baterai",
    incomeInfo: "Info penghasilan",
    currency: "Mata uang",
    selectCurrency: "Pilih mata uang",
    savePlant: "Simpan Plant",
    saveChanges: "Simpan Perubahan",
    warning: "Peringatan",
    fillRequired: "Mohon isi semua data wajib yang bertanda *.",
    coordinateNumber: "Longitude dan latitude harus berupa angka.",
    capacityNumber: "Kapasitas terpasang harus berupa angka.",
    batteryCapacityNumber: "Kapasitas baterai harus berupa angka.",
    success: "Berhasil",
    plantCreated: "Plant berhasil ditambahkan.",
    plantUpdated: "Perubahan plant berhasil disimpan.",
    failed: "Gagal",
    close: "Tutup",
    me: "Saya",
  },
};

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [themeMode, setThemeModeState] = useState("light");
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const [storedTheme, storedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
      ]);

      if (!isMounted) return;

      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeModeState(storedTheme);
      }

      if (storedLanguage === "en" || storedLanguage === "id") {
        setLanguageState(storedLanguage);
      }
    }

    loadSettings().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = async (nextThemeMode) => {
    const safeThemeMode = nextThemeMode === "light" ? "light" : "dark";
    setThemeModeState(safeThemeMode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, safeThemeMode);
  };

  const setLanguage = async (nextLanguage) => {
    const safeLanguage = nextLanguage === "id" ? "id" : "en";
    setLanguageState(safeLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
  };

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;

    return {
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      colors: getAppColors(themeMode),
      t: (key) => dictionary[key] || translations.en[key] || key,
    };
  }, [language, themeMode]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const value = useContext(AppSettingsContext);

  if (!value) {
    return {
      themeMode: "light",
      setThemeMode: async () => {},
      language: "en",
      setLanguage: async () => {},
      colors: getAppColors("light"),
      t: (key) => translations.en[key] || key,
    };
  }

  return value;
}
