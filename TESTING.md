# Panduan Pengujian

## Tujuan

Pengujian menjaga kontrak aplikasi ketika kode dipindahkan atau
disederhanakan. Refactor struktural tidak boleh mengubah:

- route dan parameter navigasi;
- endpoint, HTTP method, dan payload;
- key penyimpanan lokal;
- hasil normalisasi serta perhitungan energi;
- teks, tampilan, dan interaksi pengguna.

## Jenis test

### Unit test

Digunakan untuk API client, service domain, validator, normalizer, helper
tanggal, dan perhitungan chart.

### Component test

Digunakan untuk komponen yang memiliki interaksi atau beberapa visual state.
Komponen presentasional yang sangat sederhana tidak harus memiliki test
terpisah.

### Screen smoke test

Memastikan screen penting dapat dirender, memanggil service yang benar, dan
mempertahankan route utama. Detail logika sebaiknya diuji pada hook atau
service agar screen test tidak rapuh.

### Pemeriksaan visual

Bandingkan login, daftar plant, overview, perangkat, form plant, pengelolaan
akses, dan profil pada mode terang/gelap serta ukuran ponsel kecil/besar.

## Menjalankan test

```bash
npm test -- --runInBand
```

Tanpa cache:

```bash
npm test -- --runInBand --no-cache
```

Coverage:

```bash
npm run test:coverage -- --runInBand
```

## Mencoba di Android Emulator

1. Buka Android Studio dan jalankan perangkat dari **Device Manager**.
2. Pastikan konfigurasi `.env` menunjuk API yang dapat dijangkau emulator.
3. Dari root proyek, jalankan:

```bash
npm run android
```

Jika cache Metro bermasalah, hentikan proses lalu jalankan `npx expo start
-c`. Untuk HP Android fisik, jalankan `npm start` dan pindai QR melalui Expo
Go.

Saat pemeriksaan visual, cek mode terang/gelap, lebar sekitar 360–430 dp,
header, bubble power-flow, chart, dan bottom tab agar tidak terpotong atau
saling tumpang tindih.

## Pemeriksaan lengkap

```bash
npm run lint
npm test -- --runInBand
npx tsc --noEmit
npx expo export --platform web
```

Jika salah satu pemeriksaan gagal, bedakan kegagalan kontrak aplikasi dari
masalah environment atau mock sebelum mengubah kode produksi.
