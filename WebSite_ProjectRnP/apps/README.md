# Folder aplikasi

Semua aplikasi HTML portal disimpan di folder **`apps/`**. Setiap aplikasi
memiliki foldernya sendiri agar seluruh berkas pendukungnya tidak terpisah.

## Pola yang disarankan

```text
apps/
├── e-mira/
│   └── index.html          # e-MIRA (satu berkas mandiri)
├── tracking-perizinan-grc/
│   └── index.html          # Tracking Perizinan GRC (satu berkas mandiri)
├── nama-aplikasi-lain/
│   ├── index.html          # halaman utama aplikasi
│   ├── style.css
│   ├── app.js
│   └── gambar/
└── README.md
```

- **Aplikasi satu berkas:** cukup simpan sebagai
  `apps/nama-aplikasi/index.html` atau `apps/nama-aplikasi.html`.
- **Aplikasi dengan CSS/JS/gambar:** simpan seluruh aset di dalam folder
  aplikasi tersebut, misalnya `apps/nama-aplikasi/`. Jangan menaruh aset
  aplikasi di folder `assets/` milik portal agar tidak tercampur.
- Gunakan path relatif di dalam aplikasi, misalnya `style.css` atau
  `gambar/logo.png`, bukan path absolut.

## Mendaftarkan aplikasi ke portal

Tambahkan satu objek pada `assets/js/apps.js`:

```js
{
  id: "nama-aplikasi",
  name: "Nama Aplikasi",
  subtitle: "Keterangan singkat",
  description: "Deskripsi yang tampil pada kartu aplikasi.",
  category: "Kategori",
  icon: "grid",
  href: "apps/nama-aplikasi/index.html",
  tags: ["Fitur 1", "Fitur 2"]
}
```

Path `href` dihitung dari `index.html` portal. Setelah entri ditambahkan,
kartu dan jumlah aplikasi akan muncul otomatis.
