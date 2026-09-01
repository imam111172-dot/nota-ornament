/**
 * Nota Toko — jembatan data ke Google Sheets
 * ------------------------------------------------------------
 * Menyimpan seluruh data toko di satu spreadsheet milik Anda.
 * Aplikasi di GitHub Pages memanggil berkas ini lewat internet.
 *
 * Langkah pemasangan ada di BACA-DULU.txt pada folder yang sama.
 */

/** Nama lembar tempat data disimpan. Jangan diubah setelah dipakai. */
var LEMBAR_DATA = 'data';

/** Satu sel Google Sheets memuat maksimal 50.000 huruf.
 *  Dipotong 40.000 agar aman. */
var BATAS_SEL = 40000;

/* ============================================================
   PINTU MASUK
   ============================================================ */

function doGet(e) {
  return tanggapi_({ aksi: 'uji' }, 'GET');
}

function doPost(e) {
  var permintaan;
  try {
    permintaan = JSON.parse(e.postData.contents);
  } catch (err) {
    return balas_({ ok: false, pesan: 'Isi permintaan tidak terbaca' });
  }
  return tanggapi_(permintaan, 'POST');
}

function tanggapi_(permintaan, cara) {
  var kunciAsli = PropertiesService.getScriptProperties().getProperty('KUNCI');

  if (permintaan.aksi === 'uji') {
    return balas_({
      ok: true,
      via: cara,
      pesan: 'Jembatan data aktif',
      kunciSudahDipasang: !!kunciAsli
    });
  }

  if (!kunciAsli) {
    return balas_({ ok: false, pesan: 'KUNCI belum dipasang di Project Settings' });
  }
  if (permintaan.kunci !== kunciAsli) {
    return balas_({ ok: false, pesan: 'Kunci salah' });
  }

  try {
    var hasil;
    if (permintaan.aksi === 'ambil') hasil = ambil_();
    else if (permintaan.aksi === 'simpan') hasil = simpan_(permintaan);
    else hasil = { ok: false, pesan: 'Aksi tidak dikenal: ' + permintaan.aksi };
    hasil.via = cara;
    return balas_(hasil);
  } catch (err) {
    return balas_({ ok: false, via: cara, pesan: 'Galat di server: ' + err.message });
  }
}

function balas_(objek) {
  return ContentService
    .createTextOutput(JSON.stringify(objek))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
   PENYIMPANAN
   ============================================================ */

function lembar_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var ss = null;

  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Nota Toko - Data');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  var lembar = ss.getSheetByName(LEMBAR_DATA);
  if (!lembar) {
    lembar = ss.insertSheet(LEMBAR_DATA);
    lembar.getRange('A1').setValue('Jangan diubah manual. Diisi otomatis oleh aplikasi Nota Toko.');
  }
  return lembar;
}

function ambil_() {
  var lembar = lembar_();
  var props = PropertiesService.getScriptProperties();
  var jumlah = Number(props.getProperty('JUMLAH_POTONGAN') || 0);

  if (!jumlah) {
    return { ok: true, kosong: true, versi: 0, waktu: '', data: null };
  }

  /* potongan disimpan mulai baris 2, kolom A */
  var nilai = lembar.getRange(2, 1, jumlah, 1).getValues();
  var teks = '';
  for (var i = 0; i < nilai.length; i++) teks += nilai[i][0];

  var data = null;
  try { data = JSON.parse(teks); } catch (err) {
    return { ok: false, pesan: 'Data di spreadsheet rusak: ' + err.message };
  }

  return {
    ok: true,
    kosong: false,
    versi: Number(props.getProperty('VERSI') || 0),
    waktu: props.getProperty('WAKTU') || '',
    perangkat: props.getProperty('PERANGKAT') || '',
    data: data
  };
}

function simpan_(permintaan) {
  var gembok = LockService.getScriptLock();
  if (!gembok.tryLock(20000)) {
    return { ok: false, pesan: 'Server sedang dipakai perangkat lain, coba lagi sebentar' };
  }

  try {
    var props = PropertiesService.getScriptProperties();
    var versiSekarang = Number(props.getProperty('VERSI') || 0);

    /* Penjaga tabrakan: perangkat harus menyebut versi terakhir yang ia lihat.
       Kalau server sudah lebih baru, simpanan ditolak agar data orang lain
       tidak tertimpa diam-diam. */
    if (permintaan.paksa !== true && Number(permintaan.versi) !== versiSekarang) {
      var kini = ambil_();
      kini.ok = false;
      kini.konflik = true;
      kini.pesan = 'Data di server sudah diperbarui perangkat lain';
      return kini;
    }

    var teks = JSON.stringify(permintaan.data);
    var potongan = [];
    for (var i = 0; i < teks.length; i += BATAS_SEL) {
      potongan.push([teks.substr(i, BATAS_SEL)]);
    }
    if (!potongan.length) potongan.push(['']);

    var lembar = lembar_();
    var jumlahLama = Number(props.getProperty('JUMLAH_POTONGAN') || 0);
    if (jumlahLama > 0) lembar.getRange(2, 1, jumlahLama, 1).clearContent();
    lembar.getRange(2, 1, potongan.length, 1).setValues(potongan);

    var versiBaru = versiSekarang + 1;
    var waktu = new Date().toISOString();
    props.setProperties({
      JUMLAH_POTONGAN: String(potongan.length),
      VERSI: String(versiBaru),
      WAKTU: waktu,
      PERANGKAT: String(permintaan.perangkat || '')
    });

    return { ok: true, versi: versiBaru, waktu: waktu, ukuran: teks.length };
  } finally {
    gembok.releaseLock();
  }
}

/* ============================================================
   BANTUAN
   ============================================================
   Jalankan sekali dari editor untuk memasang kunci rahasia.
   Ganti dulu isi variabel di bawah dengan kunci pilihan Anda. */

function pasangKunci() {

  /* GANTI HANYA BARIS DI BAWAH INI. Baris lainnya biarkan apa adanya. */
  var KUNCI_PILIHAN_ANDA = 'ganti-dengan-kunci-rahasia-anda';

  if (KUNCI_PILIHAN_ANDA.indexOf('ganti-dengan') === 0) {
    throw new Error('Ganti dulu isi KUNCI_PILIHAN_ANDA pada baris di atas.');
  }
  if (KUNCI_PILIHAN_ANDA.length < 8) {
    throw new Error('Kunci terlalu pendek. Pakai minimal 8 huruf atau angka.');
  }
  PropertiesService.getScriptProperties().setProperty('KUNCI', KUNCI_PILIHAN_ANDA);
  Logger.log('Kunci terpasang: ' + KUNCI_PILIHAN_ANDA);
  Logger.log('Salin kunci itu ke kolom "Kunci rahasia" pada tab Atur di aplikasi.');
}

/** Menampilkan alamat spreadsheet tempat data tersimpan. */
function lihatSpreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) { Logger.log('Belum ada data yang tersimpan.'); return; }
  Logger.log('https://docs.google.com/spreadsheets/d/' + id);
}
