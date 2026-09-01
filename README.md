# Nota Toko

Aplikasi kasir dan pembukuan sederhana untuk toko kecil. Berjalan penuh di
browser, tanpa server dan tanpa internet. Bisa dipasang ke layar HP sebagai
aplikasi (PWA).

**➡️ Buka aplikasinya: https://imam111172-dot.github.io/nota-ornament/**

## Fitur

- **Kasir** — buat nota dari katalog, atur jumlah dan diskon, keluarkan teks
  nota siap kirim WhatsApp atau dicetak.
- **Pembayaran fleksibel** — lunas, uang muka (DP), atau bon. Sisanya otomatis
  jadi piutang dan boleh dicicil berkali-kali.
- **Katalog** — barang dan jasa beserta harga, foto, dan penjelasan singkat.
  Bisa menghasilkan teks katalog siap sebar.
- **Pelanggan** — data kontak, riwayat belanja, sisa piutang, chat WhatsApp
  langsung.
- **Kas** — pengeluaran, pemasukan lain, dan jejak seluruh pembayaran.
- **Hutang & piutang** — daftar tagihan dengan jatuh tempo dan penanda lewat
  tempo.
- **Laporan** — penjualan, arus kas, dan hutang-piutang per periode, dalam
  bentuk teks siap kirim.
- **Log aktivitas** — setiap perubahan tercatat beserta nilai sebelum dan
  sesudahnya, dilindungi sandi.

## Cara pakai

Buka https://imam111172-dot.github.io/nota-ornament/ lalu di Chrome HP pilih
menu titik tiga → **Add to Home screen**. Di laptop, Chrome → **Install page as app**.

Bisa juga dijalankan tanpa internet: unduh isi repositori ini lalu klik dua kali
`index.html`. Petunjuk lengkap ada di [CARA-PAKAI.txt](CARA-PAKAI.txt).

## Di mana data disimpan

Seluruh data tersimpan di dalam browser perangkat yang dipakai
(`localStorage`) — tidak dikirim ke mana pun dan tidak tersimpan di GitHub.
Karena itu:

- Data di HP dan di laptop terpisah, tidak otomatis sama.
- Membersihkan data browser akan menghapus data aplikasi.

Rutinlah membuka **Atur → Unduh Cadangan**. Berkas cadangan itu juga dipakai
untuk memindahkan data antar perangkat.

> **Catatan keamanan.** Sandi log disimpan dalam bentuk teracak (SHA-256
> bergaram), bukan apa adanya. Namun seluruh data tetap berada di browser,
> sehingga orang yang menguasai perangkat masih bisa membacanya lewat alat
> pengembang. Kunci ini penghalang dari pembukaan sembarangan, bukan pengaman
> tingkat tinggi.

## Berkas

| Berkas | Kegunaan |
| --- | --- |
| `index.html` | seluruh aplikasi |
| `manifest.webmanifest` | identitas aplikasi (nama, ikon) |
| `sw.js` | membuat aplikasi bisa dibuka tanpa internet |
| `jalankan-server.bat` | menjalankan aplikasi dari komputer sendiri |
| `CARA-PAKAI.txt` | petunjuk pemakaian |
