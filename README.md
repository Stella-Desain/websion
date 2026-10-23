# Websion

Landing page Websion versi 24 Oktober 2026, siap diunggah ke GitHub Pages.

**Kode, tampilan, teks, animasi, dan fungsi website dipertahankan persis.** Seluruh 39 file website disalin tanpa perubahan isi atau nama. Paket hanya menyertakan dependensi yang dirujuk website; screenshot pemeriksaan, log, ekspor desain awal, scene laut, model kapal, dan aset versi lama tidak disertakan.

Panduan dari awal sampai tayang: **[PANDUAN TERMINAL](docs/PANDUAN-TERMINAL.md)**.

## Preview di komputer

Buka PowerShell di folder yang berisi `index.html`, lalu jalankan:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Buka [preview lokal](http://127.0.0.1:8000/). Tekan `Ctrl+C` di terminal untuk menghentikan server. Tidak perlu `npm install` atau proses build.

## Isi paket

- `index.html`: halaman utama dan logika interaksi yang sudah dipakai versi sekarang.
- File CSS/JS di root: gaya tombol, navigasi, serta video hero, proses, dan footer.
- `assets/`: gambar, video, foto testimoni, dan modul efek yang dirujuk website.
- `vendor/` dan `support.js`: dependensi yang masih digunakan untuk merender halaman.
- `.nojekyll`: pengaturan GitHub Pages untuk melayani berkas statis.
- `.github/pages.json`: sumber publikasi dari branch `main`, folder root.
- `docs/`: panduan terminal, catatan isi paket, dan checksum file website.

Lihat [catatan paket](docs/ISI-PAKET.md) untuk batas pembersihan. Kode di dalam file aktif tidak direfaktor atau dipangkas. Font masih memakai Google Fonts sebagaimana versi sekarang, sehingga perlu koneksi internet.

Paket ini belum membuat repository, mengunggah file, atau menerbitkan website. Langkah tersebut Anda jalankan sendiri lewat panduan.
