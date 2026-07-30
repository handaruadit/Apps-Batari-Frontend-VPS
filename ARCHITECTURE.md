# Arsitektur BySense

Dokumen ini menjelaskan lokasi kode dan aturan sederhana yang dipakai agar
fitur mudah dipelajari, dibaca, dan dirawat.

## Struktur folder

- `app/`: route Expo Router. File di sini sebaiknya hanya meneruskan ke screen
  pada folder `features/`.
- `features/`: implementasi berdasarkan domain, misalnya auth, overview,
  plant, dan device.
- `components/`: komponen UI yang dipakai oleh lebih dari satu fitur.
- `services/`: infrastruktur bersama seperti API client dan compatibility
  facade.
- `context/`: state global aplikasi.
- `locales/`: kamus terjemahan.
- `config/`: konfigurasi API dan theme.
- `auth/`: penyimpanan dan pembacaan sesi pengguna.

## Susunan file

Gunakan susunan berikut jika bagian tersebut tersedia:

```js
//===== (Imports) ======

//===== (Constants) ======

//===== (namaHelper) ======

//===== (namaHandler) ======

//===== (NamaComponent) ======

//===== (Styles) ======
```

Komentar section dipasang pada setiap fungsi bernama dan blok besar. Callback
inline yang pendek tidak membutuhkan header karena nama operasi di sekitarnya
sudah menjelaskan tujuannya.

## Aturan tanggung jawab

1. Route mengatur navigasi, bukan mengambil atau menormalisasi data.
2. Service berkomunikasi dengan API dan tidak merender UI.
3. Hook mengatur state serta lifecycle sebuah fitur.
4. Utilitas berisi fungsi murni yang mudah diuji.
5. Component menerima data melalui props dan fokus pada tampilan.
6. Kode baru hanya masuk ke `components/` jika dipakai lintas fitur.

## Kontrak yang harus dipertahankan

- Route lama tidak boleh berubah tanpa compatibility redirect.
- Endpoint, HTTP method, payload, dan bentuk hasil service harus tetap stabil.
- Key AsyncStorage dan SecureStore tidak boleh diubah tanpa migrasi data.
- Pesan dan tampilan pengguna tidak boleh berubah dalam refactor struktural.

## Pemeriksaan sebelum selesai

```bash
npm run lint
npm test -- --runInBand
npx tsc --noEmit
npx expo export --platform web
```

Untuk perubahan visual, bandingkan screen utama pada ukuran ponsel kecil dan
besar sebelum perubahan digabungkan.
