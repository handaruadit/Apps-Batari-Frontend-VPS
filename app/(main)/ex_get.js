import { clearAuth, getToken, isTokenValid } from '@/auth/token';
import { BASE_URL } from '@/config/api';
import { appColors, appFont } from '@/config/theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';

const DataScreen = () => {
  // State untuk menampung data yang bentuknya array/daftar (karena limit=10)
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const token = await getToken();

      if (!token || !isTokenValid(token)) {
        await clearAuth();
        Alert.alert('Error', 'Sesi Anda telah habis atau token tidak valid. Silakan login kembali.');
        setIsLoading(false);
        return;
      }

      const deviceId = 1;
      const category = 'grid';
      const limit = 10;

      // Rangkai URL menggunakan Template Literals (tanda backtick `)
      const endpoint = `${BASE_URL}/api/data/?plantId=${deviceId}&category=${category}&limit=${limit}`;

      // 3. Tembak API dengan metode GET dan sertakan Bearer Token
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Otentikasi masuk di sini
        },
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        // Asumsi data dari API bentuknya: { status: "success", data: [...] }
        // Sesuaikan 'jsonResponse.data' dengan struktur asli API Anda
        setDataList(jsonResponse.data);
      } else {
        Alert.alert('Gagal', jsonResponse.message || 'Gagal mengambil data perangkat');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi masalah jaringan atau server VPS tidak dapat diakses.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Desain komponen untuk setiap baris data (item)
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titleText}>Device: {item.deviceId}</Text>
      {/* Ganti item.value atau item.timestamp sesuai dengan nama kolom di database Anda */}
      <Text style={styles.text}>Kategori: {item.category}</Text>
      <Text style={styles.text}>Nilai: {item.value || 'N/A'}</Text> 
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Data Perangkat Grid</Text>
      
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={appColors.accent} />
          <Text style={styles.loadingText}>Memuat data perangkat...</Text>
        </View>
      ) : (
        // FlatList sangat optimal untuk merender data berulang secara performa
        <FlatList
          data={dataList}
          keyExtractor={(item, index) => index.toString()} // Gunakan ID unik jika API menyediakannya (misal: item.id)
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          // Tampilan jika data dari API ternyata kosong
          ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada data ditemukan.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: appColors.screen,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: appColors.text,
    fontFamily: appFont,
  },
  card: {
    backgroundColor: appColors.bubble,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2, // Bayangan untuk Android
    shadowColor: '#000', // Bayangan untuk iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: appColors.text,
    fontFamily: appFont,
  },
  text: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  loadingText: {
    marginTop: 10,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
});

export default DataScreen;
