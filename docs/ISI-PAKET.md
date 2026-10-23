# Isi paket dan jaminan salinan

Tanggal: 24 Oktober 2026.

Ada 39 file website dengan ukuran total 18.582.583 byte, sekitar 17,72 MiB. Setiap file memiliki isi yang identik dengan sumber saat paket dibuat. Daftar SHA-256 ada di [CHECKSUMS.sha256](CHECKSUMS.sha256).

Yang dilakukan adalah memilih file yang dirujuk oleh `index.html`, script, stylesheet, dan import dinamis, lalu menyalinnya dengan path semula. Tidak ada pengubahan teks, layout, animasi, kontak, nama file, atau isi kode website.

Paket menyertakan kedua versi video, desktop dan HP, semua poster yang dipakai, lima foto testimoni, gambar ilustrasi, runtime React, runtime template, dan modul efek shader. File untuk layar atau kondisi yang belum aktif tetap diperlukan dan ikut disertakan.

File yang tidak dirujuk website tidak ikut ke paket: hasil screenshot, laporan audit, log server, file kerja, ekspor desain awal, scene laut, model kapal, serta percobaan gambar/video lama. Semua sumber tersebut tetap ada di folder kerja awal; tidak dihapus.

**Pembersihan dilakukan pada pemilihan file paket.** Karena permintaan terakhir adalah tidak mengubah apa pun, fungsi, CSS, dan kode bawaan yang berada di dalam file aktif dibiarkan utuh. Paket ini tidak mengklaim seluruh isi library atau kode internal sudah dipangkas sebagai dead code.

Berkas tambahan hanya mendukung pengiriman dan publikasi: README, panduan, checksum, `.gitignore`, `.nojekyll`, dan konfigurasi sumber GitHub Pages. Tidak ada token, akun login, folder `.git`, atau konfigurasi komputer yang dimasukkan ke ZIP.

## Struktur

```text
websion/
├── index.html
├── support.js
├── button-effects.css
├── navigation-scroll.js
├── hero-video.css
├── hero-video.js
├── process-section.css
├── process-video.js
├── footer-websion.css
├── footer-video.js
├── footer-cta.js
├── assets/
│   ├── hero/
│   ├── process/
│   ├── footer/
│   ├── testimonials/
│   └── gambar dan modul efek yang dipakai
├── vendor/
│   ├── react.js
│   └── react-dom.js
├── .github/
│   └── pages.json
├── .gitignore
├── .nojekyll
├── README.md
└── docs/
    ├── PANDUAN-TERMINAL.md
    ├── ISI-PAKET.md
    └── CHECKSUMS.sha256
```
