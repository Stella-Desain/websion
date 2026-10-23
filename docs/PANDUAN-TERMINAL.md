# Upload Websion ke GitHub dan terbitkan GitHub Pages

Panduan untuk Windows PowerShell. Jalankan tiap blok secara berurutan. Jika muncul error, selesaikan dulu sebelum melanjutkan. Tidak perlu mengubah kode website.

Git menyimpan riwayat file di komputer. GitHub menyimpan repository secara online. GitHub Pages menampilkan file website dari repository tersebut.

## 1. Ekstrak ZIP dan masuk ke folder website

Contoh ini menganggap ZIP disimpan di `E:\Downloads`. Sesuaikan baris pertama jika lokasinya berbeda. Gunakan folder ekstrak yang belum ada.

```powershell
Set-Location "E:\Downloads"
Expand-Archive -LiteralPath ".\websion-github-pages.zip" -DestinationPath ".\hasil-websion"
Set-Location ".\hasil-websion\websion"
Get-ChildItem -Force
```

Pastikan daftar file menampilkan `index.html`, `assets`, `vendor`, `.nojekyll`, dan `.github`. Folder inilah yang diunggah, bukan folder induknya.

## 2. Pastikan Git dan GitHub CLI tersedia

```powershell
git --version
gh --version
```

Jika kedua versi tampil, lanjut ke langkah 3. Jika `gh` tidak dikenali dan `winget` tersedia, pasang [GitHub CLI resmi](https://github.com/cli/cli#installation):

```powershell
winget install --id GitHub.cli --exact --source winget
```

Jika Git belum ada, pasang juga:

```powershell
winget install --id Git.Git --exact --source winget
```

Setelah instalasi, tutup dan buka kembali PowerShell, masuk lagi ke folder website, lalu periksa versi.

### Jika `winget` juga tidak dikenali

Git sudah tersedia pada komputer tempat paket disiapkan. Untuk GitHub CLI, Anda dapat mengunduh installer Windows dari [rilis resmi GitHub CLI](https://github.com/cli/cli/releases/latest) langsung lewat PowerShell:

```powershell
$ghRelease = Invoke-RestMethod "https://api.github.com/repos/cli/cli/releases/latest"
$ghArchitecture = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -eq "Arm64") { "arm64" } else { "amd64" }
$ghInstaller = $ghRelease.assets | Where-Object { $_.name -like "*windows_$ghArchitecture.msi" } | Select-Object -First 1
if (-not $ghInstaller) { throw "Installer untuk arsitektur Windows ini tidak ditemukan. Buka halaman rilis resmi." }
$ghInstallerFile = Join-Path $env:TEMP $ghInstaller.name
Invoke-WebRequest -Uri $ghInstaller.browser_download_url -OutFile $ghInstallerFile
Start-Process -FilePath "msiexec.exe" -ArgumentList @("/i", ('"' + $ghInstallerFile + '"')) -Wait
```

Selesaikan jendela installer yang muncul. Buka ulang PowerShell dan periksa `gh --version`. Jika Git belum tersedia dan tidak ada winget, gunakan [installer Git untuk Windows](https://git-scm.com/downloads/win).

## 3. Login ke akun GitHub

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh auth status
```

Ikuti instruksi terminal dan selesaikan login di browser. Ini memakai alur login resmi [GitHub CLI](https://cli.github.com/manual/gh_auth_login).

## 4. Siapkan repository lokal

Pastikan PowerShell masih berada di folder yang berisi `index.html`. Blok ini memakai nama repository `websion`. Ganti nilainya jika Anda ingin nama lain.

```powershell
$RepoName = "websion"
$GitHubProfile = gh api user | ConvertFrom-Json
$GitHubUser = $GitHubProfile.login
$CommitEmail = "$($GitHubProfile.id)+$GitHubUser@users.noreply.github.com"

git init -b main
git config user.name "Bintang Saputra"
git config user.email "$CommitEmail"
git config core.autocrlf false
git add .
git status --short
git commit -m "Siapkan website Websion untuk GitHub Pages"
```

Email commit memakai alamat noreply akun GitHub. Pengaturan Git di atas berlaku pada repository ini. `git add` menyiapkan file; `git commit` menyimpan satu versi dalam riwayat lokal.

## 5. Buat repository GitHub dan upload

```powershell
gh repo create "$GitHubUser/$RepoName" --public --source=. --remote=origin --push
gh repo edit "$GitHubUser/$RepoName" --default-branch main
```

`--public` membuat repository dapat dilihat publik. `--source=.` memakai folder saat ini dan `--push` mengunggah commit. Lihat [dokumentasi gh repo create](https://cli.github.com/manual/gh_repo_create).

GitHub Pages tersedia untuk repository publik pada akun GitHub Free. Lihat [panduan GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

Jika nama repository sudah dipakai, pilih `$RepoName` lain sebelum menjalankan perintah pembuatan. Tidak perlu mengulang `git init` atau commit yang sudah berhasil.

## 6. Aktifkan GitHub Pages lewat terminal

```powershell
gh api --method POST "repos/$GitHubUser/$RepoName/pages" --input .github/pages.json
```

Konfigurasi yang disertakan memilih branch `main`, folder root `/`. `.nojekyll` membuat file statis dilayani tanpa pemrosesan Jekyll. Referensi: [API GitHub Pages](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site), [input JSON gh api](https://cli.github.com/manual/gh_api), dan [file statis GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#static-site-generators).

Jika Pages ternyata sudah aktif pada repository tersebut, ubah metode menjadi `PUT`:

```powershell
gh api --method PUT "repos/$GitHubUser/$RepoName/pages" --input .github/pages.json
```

## 7. Lihat alamat dan status publikasi

```powershell
gh api "repos/$GitHubUser/$RepoName/pages" --jq .html_url
gh api "repos/$GitHubUser/$RepoName/pages" --jq .status
gh run list --repo "$GitHubUser/$RepoName" --limit 5
```

Alamat umumnya `https://USERNAME.github.io/websion/`, mengikuti nilai `$RepoName`. Perintah pertama memberikan alamat yang sebenarnya. Status `built` berarti proses publikasi selesai. Buka alamat tersebut di browser.

Perubahan dapat memerlukan hingga 10 menit untuk terbit setelah push menurut [dokumentasi GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site). Bila belum tampil, periksa hasil build:

```powershell
gh run list --repo "$GitHubUser/$RepoName" --limit 5
```

Jika ada run yang gagal, salin ID pada daftar lalu jalankan `gh run view ID_RUN --repo "$GitHubUser/$RepoName" --log-failed`, dengan `ID_RUN` diganti angka yang sebenarnya.

## 8. Upload pembaruan di kemudian hari

Setelah Anda sendiri mengedit file yang diinginkan, masuk ke folder repository dan jalankan:

```powershell
git status
git add .
git commit -m "Perbarui website Websion"
git push origin main
```

Pages akan menerbitkan pembaruan dari branch yang sudah diatur. Tidak perlu membuat repository atau mengaktifkan Pages lagi.

## Jika terjadi masalah

- `gh` tidak dikenali: buka ulang terminal setelah instalasi, lalu periksa versi.
- `Author identity unknown`: jalankan dua baris `git config user.name` dan `git config user.email` pada langkah 4.
- `remote origin already exists`: periksa `git remote -v`. Folder paket baru seharusnya belum memiliki remote; pastikan Anda berada di folder yang benar.
- API mengembalikan `404`/`403`: periksa nama repository, akun di `gh auth status`, dan hak admin repository. Pages mungkin juga dibatasi kebijakan organisasi.
- Website `404` sesaat setelah aktivasi: periksa status build; pastikan sumbernya `main` dan `/` serta `index.html` ada di root repository.
- Gambar/video hilang: pastikan folder `assets` dan `vendor` ikut terunggah dan path/nama file tidak diubah.

Paket ini belum pernah diunggah atau dipublikasikan oleh proses persiapan. Perintah yang mengubah GitHub hanya berjalan saat Anda menjalankannya sendiri.
