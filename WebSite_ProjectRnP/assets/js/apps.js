/*
 * DAFTAR APLIKASI PORTAL
 * --------------------------------------------------------------------------
 * Semua aplikasi berada di folder "apps/" dan didaftarkan di sini.
 * Path href dihitung dari index.html portal.
 *
 * Field:
 *   id          : identitas unik, tanpa spasi
 *   name        : nama aplikasi
 *   subtitle    : subjudul singkat
 *   description : deskripsi untuk kartu aplikasi
 *   category    : kategori aplikasi
 *   icon        : meeting | grid | chart | folder | shield | tools
 *   href        : path aplikasi, mis. "apps/nama-aplikasi/index.html"
 *   tags        : daftar fitur singkat (opsional)
 *   note        : catatan pada tombol (opsional)
 *   preview     : pratinjau ruangan untuk tampilan satu aplikasi (opsional)
 *
 * Untuk menambah aplikasi, salin objek di bawah, ubah datanya, lalu simpan
 * berkas aplikasi di folder apps/<nama-aplikasi>/index.html.
 */
window.PROJECT_RP_APPS = [
  {
    id: "e-mira",
    name: "e-MIRA",
    subtitle: "e-lektronik Manajemen Informasi Ruang & Agenda",
    description: "Kelola jadwal ruang rapat, pemesanan, dan agenda kegiatan Fungsi Project R&P Cilacap dalam satu aplikasi terintegrasi.",
    category: "Manajemen ruang & agenda",
    icon: "meeting",
    href: "apps/e-mira/index.html",
    tags: ["Jadwal ruang", "Agenda", "Notifikasi"],
    note: "Akses internal",
  },
  {
    id: "tracking-perizinan-grc",
    name: "Tracking Perizinan GRC",
    subtitle: "Monitoring Perizinan Green Refinery Cilacap",
    description: "Pantau status, progres, dan dokumen perizinan proyek Green Refinery Cilacap.",
    category: "Project",
    icon: "shield",
    href: "apps/tracking-perizinan-grc/index.html",
    tags: ["Perizinan", "Monitoring", "GRC"],
    note: "Akses internal"
  }
];
