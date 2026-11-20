# Upload ulang e-MIRA V.1.0 · Cloud

## Data Anda tidak ada di file HTML

Data pekerja, pemesanan, ruangan, dan fungsi **tidak disimpan di dalam
`index.html`**. Data tersebut tersimpan di:

- `localStorage` browser (cache lokal), dan/atau
- tabel `app_state` di Supabase setelah sinkronisasi.

Mengganti `index.html` tidak menghapus data tersebut, selama alamat situs
(origin) tetap sama dan data situs browser tidak dibersihkan. Versi 2.2 juga
sudah menonaktifkan pembersihan `localStorage` otomatis yang ada pada versi
awal, sehingga data pekerja tidak terhapus saat pertama kali membuka versi
baru.

## Sebelum upload: buat cadangan

Lakukan pada perangkat yang memiliki data pekerja terlengkap:

1. Login sebagai **Super User**.
2. Buka menu **Pusat Data** (ikon database di header).
3. Pada bagian **Cadangan Data**, klik **Unduh**.
4. Simpan berkas JSON tersebut di komputer.

Berkas cadangan berisi **pekerja dan pemesanan**, tetapi tidak berisi akun.
**Jangan mengunggah berkas cadangan JSON ke GitHub** karena berisi data
internal.

Cadangan ini hanya digunakan jika setelah update data pekerja tidak muncul.

## Berkas yang wajib diunggah

Minimal:

```text
apps/e-mira/index.html
```

Versi 2.1 memiliki fallback konfigurasi inline dan CDN Supabase, sehingga
`index.html` saja tetap dapat login.

## Berkas yang disarankan ikut diunggah

Agar tidak bergantung pada CDN dan tidak ada request 404:

```text
apps/e-mira/index.html
apps/e-mira/supabase-config.js
assets/vendor/supabase.js
```

Pertahankan struktur folder persis seperti di atas. Jangan meletakkan
`index.html` di root repo jika aplikasi sebelumnya berada di
`apps/e-mira/`.

## Yang tidak perlu diunggah ulang

- `README.md`
- `DEPLOY-E-MIRA.md`
- `supabase/setup.sql` dan `supabase/grants.sql` — sudah dijalankan; jangan
  dijalankan ulang tanpa alasan.
- Aset portal (`assets/css`, `assets/js`, logo, gambar) — tidak berubah, kecuali
  Anda juga mengubah portal.
- Berkas cadangan JSON pekerja.

## Setelah upload

1. Tunggu GitHub Pages/Netlify selesai deploy.
2. Buka dengan incognito atau hard refresh.
3. Pastikan footer menampilkan:

   ```text
   e-MIRA V.1.0 · Cloud
   ```

4. Login sebagai Super User.
5. Buka **Data Pekerja** dan pastikan data masih ada.
6. Jika data pekerja tidak muncul:
   - buka **Pusat Data → Pulihkan/Pilih Berkas**;
   - pilih berkas cadangan JSON yang dibuat sebelumnya;
   - konfirmasi pemulihan.
7. Setelah data tampil, buat akun baru dari menu **Akun**. Akun baru akan masuk
   ke Supabase dan bisa dipakai di perangkat lain.

## Jika memakai alamat baru

`localStorage` terikat pada alamat situs. Jika e-MIRA dipindahkan ke domain
atau URL GitHub Pages yang berbeda, data lokal lama tidak otomatis terbaca.
Dalam kondisi ini, pulihkan dari berkas cadangan setelah login.
