-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 29 Jan 2026 pada 08.08
-- Versi server: 11.8.3-MariaDB-log
-- Versi PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u444914729_bbm`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `ai_knowledge`
--

CREATE TABLE `ai_knowledge` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `ai_knowledge`
--

INSERT INTO `ai_knowledge` (`id`, `content`, `created_at`, `updated_at`) VALUES
(2, '1. Sistem Pengamanan Bertingkat (The Layered Security System)\nKeamanan finansial tidak hanya terdiri dari satu lapis. Patokan utamanya adalah memisahkan antara dana untuk \"bertahan hidup\" dan dana untuk \"ketenangan pikiran\".\n\nDana Darurat (Emergency Fund):\n\nTujuan: Menutup biaya hidup saat sumber pendapatan utama terhenti (misal: PHK).\n\nPatokan: Minimal 3x pengeluaran bulanan (untuk lajang), 6x (menikah), hingga 12x (memiliki anak/tanggungan banyak).\n\nCash Buffer (Bantalan Kas):\n\nTujuan: Menghadapi gangguan kecil dalam hidup (ban bocor, servis AC, kado mendadak) agar tidak mengganggu dana darurat atau anggaran investasi.\n\nPatokan: Minimal USD 2.000 (atau sekitar Rp 30 - 32 juta). Riset menunjukkan angka ini adalah \"ambang batas psikologis\" yang secara signifikan menurunkan tingkat stres dan meningkatkan kejernihan otak dalam mengambil keputusan hingga 20%.\n\n2. Piramida Prioritas Alokasi (The Spending Hierarchy)\nDalam mengelola arus kas, pengeluaran harus dibagi menjadi tiga kategori absolut untuk menghindari kebocoran dana pada hal-hal yang tidak esensial:\n\nLevel 1: Must Have (Kebutuhan Mutlak - 50%)\n\nBiaya tempat tinggal (cicilan/sewa), makan, transportasi kerja, dan utang produktif. Ini adalah biaya yang jika tidak dibayar akan merusak kualitas hidup atau reputasi finansial.\n\nLevel 2: Should Have (Kewajiban Masa Depan - 30%)\n\nPremi asuransi kesehatan, investasi dana pendidikan, dana pensiun, dan zakat/sedekah. Prita menekankan bahwa kategori ini sering dianggap opsional padahal sifatnya wajib untuk keamanan jangka panjang.\n\nLevel 3: Could Have (Gaya Hidup/Money Dial - 20%)\n\nPengeluaran untuk kesenangan (hobi, kopi, traveling). Patokannya adalah: Spending tanpa rasa bersalah, asalkan Level 1 dan 2 sudah terpenuhi.\n\n3. Strategi Operasional: Sistem Multi-Rekening\nPencatatan manual seringkali gagal karena faktor kelelahan mental. Patokan sistematis yang paling efektif adalah menggunakan rekening sebagai \"pos otomatis\":\n\nRekening Living: Tempat masuknya gaji dan untuk membayar semua kategori Must Have.\n\nRekening Saving/Investing: Rekening yang tidak memiliki akses kartu ATM/debit yang mudah untuk kategori Should Have.\n\nRekening Playing: Rekening khusus dengan saldo terbatas untuk kategori Could Have. Jika saldo di rekening ini habis, maka hiburan bulan tersebut selesai.\n\n4. Filosofi Investasi Jangka Panjang\nInvestasi bukan tentang menebak harga, melainkan tentang durasi dan tujuan:\n\nEmas sebagai Penjaga Nilai: Digunakan sebagai pengaman nilai aset terhadap inflasi, bukan alat spekulasi jangka pendek.\n\nPasar Modal (Saham/IHSG): Memanfaatkan pertumbuhan ekonomi nasional (seperti pencapaian IHSG di level 9.000) untuk pertumbuhan kekayaan jangka panjang.\n\nAset Properti: Membeli properti harus didasari oleh kesiapan arus kas untuk cicilan, bukan sekadar mengikuti tren, terutama di awal fase produktif (usia 20-an).\n\n5. Mindset: Financial Wellness vs. Financial Rich\nPatokan keberhasilan keuangan bukan hanya pada angka di rekening, tetapi pada:\n\nKejernihan Berpikir: Tidak menghabiskan waktu lebih dari 8 jam sebulan hanya untuk mencemaskan uang.\n\nKreativitas: Memiliki ruang mental untuk tetap kreatif dan produktif karena fondasi keuangan sudah stabil.\n\nSelf-Coaching: Memahami pola pengeluaran sendiri sehingga mampu melakukan koreksi mandiri tanpa harus selalu bergantung pada konsultan luar untuk hal-hal teknis harian.', '2026-01-29 07:58:38', '2026-01-29 07:58:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#9CA3AF',
  `type` enum('income','expense') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `color`, `type`, `created_at`) VALUES
(1, 'Food', '#F87171', 'expense', '2026-01-10 17:50:08'),
(4, 'Salary', '#34D399', 'income', '2026-01-10 17:50:08'),
(6, 'Shopping', '#F472B6', 'expense', '2026-01-10 17:50:08'),
(7, 'Health', '#2DD4BF', 'expense', '2026-01-10 17:50:08'),
(8, 'Vacation', '#9CA3AF', 'expense', '2026-01-10 17:50:08'),
(10, 'Bill', '#FBBF24', 'expense', '2026-01-10 18:20:50'),
(12, 'Social', '#A78BFA', 'expense', '2026-01-10 18:20:50'),
(13, 'Transportation', '#6B7280', 'expense', '2026-01-10 18:20:50'),
(15, 'Bonus', '#A3E635', 'income', '2026-01-10 19:15:00'),
(16, 'Groceries', '#A3E635', 'expense', '2026-01-11 03:25:14'),
(17, 'Investasi', '#60A5FA', 'expense', '2026-01-18 04:42:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data untuk tabel `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `role`, `content`, `created_at`) VALUES
(126, 'user', 'Analisis pengeluaran bulan ini 📊', '2026-01-17 21:14:56'),
(127, 'assistant', 'Hai Jeje! Aku cek data keuanganmu bulan ini nih. Keren banget, kamu berhasil menabung sekitar **Rp 6,996,030** dari total pemasukan **Rp 11,306,437**. 🎉\n\nSayangnya, datanya cuma ada ringkasan total aja. Untuk analisis detail (misalnya ke mana aja uangnya pergi), aku butuh data lebih lengkap, seperti:\n- **Daftar pengeluaran per kategori** (misal: makan, transportasi, hiburan, dll)\n- **Atau laporan transaksi** dari rekening/kartu kreditmu.\n\nKalau kamu punya datanya, bisa kasih tau ke aku ya! Aku siap bantu analisis dan kasih saran biar keuanganmu makin optimal. 💪✨\n\nKalau mau, kita juga bisa buat **target budget** bulan depan bareng-bareng? 😊', '2026-01-17 21:15:02'),
(128, 'user', 'pengeluaranku 3 hari terakhir?', '2026-01-17 21:15:28'),
(129, 'assistant', 'Hai Jeje! 😊 Maaf ya, JJ nggak punya data detail pengeluaran per hari atau periode singkat seperti 3 hari terakhir. Yang JJ punya cuma data bulanan secara keseluruhan.\n\nBiar kamu bisa pantau pengeluaran 3 hari terakhir, JJ sarankan catat di aplikasi catat keuangan atau catat manual di notes HP kamu setiap hari. Nanti setiap minggu atau bulan, kita bisa evaluasi bersama! \n\nKalau butuh bantuan bikin format catat harian, JJ bisa bantu bikin template sederhana, lho! 📝✨', '2026-01-17 21:15:34'),
(130, 'user', 'Pengeluaranku hari ini normal? 💸', '2026-01-17 21:24:21'),
(131, 'assistant', 'Hai Jeje! 😊 Mari kita lihat data keuanganmu bulan ini...\n\n**Analisis Pengeluaran Hari Ini:**\n\nDari transaksimu hari ini, aku hitung totalnya **Rp 424.935** dari:\n- Food: suthei (Rp 376.035) + buah (Rp 10.000) = **Rp 386.035**\n- Shopping: miniso (Rp 39.900) + diy (Rp 84.000) = **Rp 123.900**\n- Transportation: parkir (Rp 10.000)\n\n**Apakah ini normal?** 🤔\n\nBerdasarkan rata-rata pengeluaran bulan ini (Rp 4.311.407 untuk 31 hari ≈ Rp 139.077 per hari), pengeluaranmu hari ini **cukup tinggi** - hampir 3 kali lipat dari rata-rata harian! \n\nTapi tenang, ini bisa normal kalau:\n1. Ada kebutuhan spesial (makan di luar/celebrasi)\n2. Ada kebutuhan sekali pakai (belanja barang rumah tangga)\n3. Ada transaksi yang mencakup beberapa hari\n\n**Saran aku:** 📈\n- Coba buat budget harian sekitar **Rp 150.000-200.000** untuk pengeluaran rutin\n- Prioritaskan kebutuhan dulu (makanan, transportasi, tagihan)\n- Pisahkan budget untuk \"wants\" seperti belanja miniso/diy kalau memang penting\n\nKalau kamu ingin aku bantu analisis lebih detail atau buat budget khusus, aku siap bantu! 🤗\n\nPunya pertanyaan lain tentang keuanganmu? Aku di sini untuk bantu! 💪', '2026-01-17 21:24:34'),
(132, 'user', 'Analisis pengeluaran bulan ini 📊', '2026-01-17 21:33:03'),
(133, 'assistant', 'Hai Jeje! 🎉\n\nWah, senang banget bisa bantu Jeje menganalisis keuangan bulan ini! Yuk, kita bedah bersama-sama biar Jeje makin paham dengan pola pengeluaran Jeje bulan ini. 😊\n\n---\n\n### 📊 **ANALISIS PENGELOLARAN BULAN INI (Januari 2026)**\n\n#### **1. Ringkasan Keuangan Bulan Ini**\n- **Total Pemasukan:** Rp 11.306.437  \n- **Total Pengeluaran:** Rp 4.311.407  \n- **Total Tabungan/B saldo sekarang:** Rp 6.995.030  \n- **Laba Net (Pengeluaran <= Pemasukan):** +Rp 6.995.030 (atau sekitar **62%** dari pemasukan!)  \n\n**Wah, keren Jeje!**  💪 Bulan ini Jeje bisa menabung sangat baik sekali. Rasio simpanan yang tinggi seperti ini adalah tanda pengelolaan keuangan yang sehat!\n\n---\n\n#### **2. Breakdown Pengeluaran (Berdasarkan Kategori Terakhir)**\n\n| Kategori          | Jumlah      | Catatan Singkat |\n|-------------------|-------------|-----------------|\n| **Shopping**      | Rp 123.900  | Miniso & DIY    |\n| **Food**          | Rp 386.035  | Suthei & buah   |\n| **Transportation**| Rp 10.000   | Parkir          |\n| **Lainnya**       | Rp 3.791.472| Sisanya (belum tercatat detail) |\n\n---\n\n#### **3. Insight & Saran untuk Jeje**\n\n##### ✅ **Poin Positif:**\n1. **Pendapatan vs Pengeluaran**  \n   Jeje hanya menggunakan **38%** dari pendapatan bulan ini untuk kebutuhan hidup (termasuk sekali shopping). Ini berarti Jeje punya dana simpanan yang sangat sehat!\n   \n2. **Pengeluaran Makanan Terkendali**  \n   Untuk kategori makanan, Jeje sudah memantau dengan baik (sekitar 9% dari total pengeluaran). Shopping juga terbatas di angka Rp 123.900.\n\n##### 💡 **Area untuk Perbaikan:**\n1. **Kategori \"Lainnya\"**  \n   Rp 3.791.472 adalah jumlah cukup besar, tapi detailnya belum tercatat di transaksi terakhir. **Saran Jeje:** Yuk, coba kelompokkan kategori ini (misalnya: tagihan, transportasi rutin, kebutuhan harian). Dengan begitu, Jeje bisa lihat mana yang bisa dioptimalkan.\n\n2. **Siapkan Dana Darurat**  \n   Jika Jeje belum punya dana darurat 6 bulan, coba alokasikan sebagian simpanan ini. Misal: **Rp 3-4 juta** bisa ditempatkan di rekening khusus dana darurat.\n\n3. **Mulai Berinvestasi**  \n   Jeje punya saldo sehat dan pemasukan stabil. Kita bisa alokasikan sebagian simpanan untuk investasi rendah risiko, seperti **reksadana pasar uang** atau **emas digital**. Nanti bisa kita diskusikan lebih lanjut ya, Jeje!  💰\n\n---\n\n### 🎯 **Action Plan untuk Jeje (Bulan Depan)**\n1. **Catat Seluruh Pengeluaran**  \n   Mulai minggu depan, catat setiap transaksi (termasuk yang masuk kategori \"lainnya\"). Bisa pakai aplikasi seperti **Money Manager**, **Mint**, atau catat manual di notes.\n\n2. **Buat Anggaran Kategori**  \n   Contoh:  \n   - Makanan: ≤ 30% pemasukan  \n   - Shopping: ≤ 10% pemasukan  \n   - Transportasi: ≤ 10% pemasukan  \n   - Tabungan: ≥ 20% pemasukan (Jeje sudah lebih baik!)\n\n3. **Review Mingguan**  \n   Setiap akhir minggu, cek kembali catatan pengeluaran. Kalau terlalu boros, bisa langsung dikoreksi.\n\n---\n\nJeje, gimana? Apakah ada hal spesifik yang ingin Jeje tanyakan lebih dalam tentang analisis ini? Atau mungkin Jeje ingin fokus ke satu kategori tertentu?  😊\n\nAku siap membantu Jeje kapan saja!  🚀\n\nWarmly,  \n**BABA** - Financial Advisor & Teman Keuangan Jeje  💕', '2026-01-17 21:33:20'),
(134, 'user', 'ini akhir minggu, bagaimana pengeluaranku seminggu terakhir?', '2026-01-17 21:36:46'),
(135, 'assistant', 'Hei Jeje! 😊 Senang bisa ngobrol lagi sama kamu. \n\nUntuk pengeluaran seminggu terakhir, sayangnya data yang tersedia di sistemku hanya mencakup bulan ini (Januari 2026), bukan per hari atau per minggu. Dari data bulan ini, total pengeluaranmu Rp 4,310,407.00 dan saldo akhir Rp 6,996,030.00.\n\nTapi tenang, Jeje! Kita bisa analisis pola pengeluaranmu dari transaksi terakhir yang ada:\n\n**Transaksi terakhir (5 transaksi):**\n- Parkir: Rp 9,000 (transportasi)\n- Miniso: Rp 39,900 (belanja)\n- DIY: Rp 84,000 (belanja)\n- Suthei: Rp 376,035 (makanan - wow, cukup besar!)\n- Buah: Rp 10,000 (makanan)\n\n**Insight untukmu:**\n1. Pengeluaran makanan/Suthei Rp 376k cukup besar untuk satu kali makan - ini bisa jadi makan malam mewah atau pesanan keluarga ya. \n2. Total belanja Rp 123,900 (Miniso + DIY) - mungkin beli barang hobi/kebutuhan rumah tangga.\n3. Sisa saldo Rp 6,996,030 cukup sehat untuk kebutuhan sebulan.\n\n**Tips untuk akhir minggu Jeje:**\n🎯 Kalau mau hemat, bisa coba:\n- Planning makan di rumah untuk menghemat biaya makan luar\n- Prioritaskan kebutuhan vs keinginan saat belanja\n- Cek lagi item DIY/Miniso - apakah benar-benar dibutuhkan?\n\nMau aku bantu buat budget spesifik untuk minggu depan nggak, Jeje? Atau ada pengeluaran besar yang bikin pusing? 🤔', '2026-01-17 21:36:56'),
(136, 'user', 'saran apa yang bisa anda berikan untuk saya hari ini?', '2026-01-17 21:46:11'),
(137, 'assistant', 'Halo Jeje! Selamat pagi dan semangat hari Minggu! 🌞\n\nBerdasarkan data keuanganmu, aku punya beberapa saran yang bisa kamu pertimbangkan hari ini:\n\n## 💡 **Saran Utama untuk Jeje:**\n\n### 1. **Pantau Pengeluaran Besok (Senin)**\n- Hari ini kamu sudah habiskan **Rp 508.935** hanya dalam 4 transaksi! 🚨\n- Hutang dari makanan (suthei Rp 376k) dan belanja cukup tinggi\n- **Action:** Buat anggaran maksimal Rp 300.000 untuk Senin besok, ya Jeje! 📊\n\n### 2. **Analisis Mingguan Sederhana**\n- Total pengeluaran 7 hari terakhir: **Rp 1.378.057** (hampir Rp 200k/hari!)\n- Ini 52% lebih tinggi dari rata-rata bulan ini (Rp 331.570/hari)\n- **Insight:** Apakah ada pengeluaran \"liburan\" atau event spesial minggu ini? 🤔\n\n### 3. **Strategi Hemat Besok (Senin)**\nKarena gaji dan bonus besar bulan ini, tapi pola pengeluaran perlu dijaga:\n- **Target makan:** Maksimal Rp 100.000 (bisa hemat dari hari ini)\n- **Transportasi:** Pakai transportasi umum/orang jika mungkin (Rp 9-20k/hari)\n- **Belanja:** Tunda non-esensial dulu ya Jeje! 💕\n\n### 4. **Optimasi Dana Darurat & Investasi**\n- **Saldo saat ini:** Rp 6.996.030 (cukup bagus!)\n- **Potensi investasi kecil:** Bisa alokasikan Rp 1 juta untuk emas digital atau reksadana pasar uang (lihat IHSG naik 2.15% hari ini!) 📈\n- **Dana darurat:** Pastikan punya minimal 3-6x pengeluaran bulanan (sekitar Rp 2-3 juta)\n\n---\n\n## 🎯 **Rencana Hari Ini (Minggu, 18 Jan 2026)**\n- **Goal:** Istirahat & review keuangan Mingguan\n- **Aktivitas Finansial:** \n  - Catat rencana pengeluaran Senin\n  - Cek saldo di akhir hari\n  - Baca 1 artikel tentang investasi (coba cari info IHSG naik 2.15%!)\n\n---\n\n**Catatan:** Kamu sudah punya dasar keuangan yang bagus, Jeje! Dengan bonus besar Januari ini (Rp 8.7 juta!), kamu bisa mulai alokasikan ke tabungan dan investasi. 💪\n\nApa ada topik spesifik yang ingin Jeje dalami? Mau tanya cara menabung, investasi emas digital, atau buat anggaran mingguan? 🤗', '2026-01-17 21:46:29'),
(138, 'user', 'kamu siapa?', '2026-01-17 21:49:03'),
(139, 'assistant', 'Halo Jeje! 👋\n\nAku adalah **BABA**, asisten keuangan pribadimu sekaligus Financial Advisor yang akan membantumu mengelola keuangan dengan lebih baik.\n\nAku akan selalu memanggilmu dengan nama \"Jeje\" sebagai teman dekat kita. Setiap hari, aku akan membantumu:\n- 📊 Melacak pengeluaran dan pemasukan\n- 💡 Memberikan insight tentang kebiasaan keuanganmu\n- 🎯 Memberikan tips finansial yang praktis\n- 📈 Analisis pasar terkini\n\nJadi, Jika ada pertanyaan seputar uang, investasi, budgeting, atau hal finansial lainnya, silakan tanya ke aku ya, Jeje! 😊\n\nSudah siap mulai perjalanan keuangan yang lebih cerdas bersama aku? 🚀', '2026-01-17 21:49:15'),
(140, 'user', 'Pengeluaranku hari ini normal? 💸', '2026-01-18 02:52:29'),
(141, 'assistant', 'Hai Jeje! 😊\n\nCoba kita lihat dulu yuk pengeluaranmu hari ini. Kamu menghabiskan **Rp 304.740** untuk 2 transaksi: plastik dan tapioka (Rp 15.000) serta kula (Rp 289.740). \n\nDari data keuanganmu, rata-rata pengeluaran harian bulan ini adalah **Rp 329.653**. Jadi, pengeluaranmu hari ini sebenarnya **sedikit lebih rendah** dari rata-rata harian! ✅\n\nNamun, jika kita lihat 7 hari terakhir, pengeluaranmu cukup fluktuatif:\n- Rabu, 14 Jan: Rp 454.920\n- Kamis, 15 Jan: Rp 107.940\n- Jumat, 16 Jan: *tidak ada data*\n- Sabtu, 17 Jan: Rp 508.935\n- Minggu, 18 Jan: Rp 304.740\n\nPola ini cukup normal ya, terutama jika kamu punya kebutuhan yang tidak tetap setiap harinya. Tapi, dari 7 hari terakhir, rata-rata pengeluaran harianmu adalah **Rp 224.040**. Jadi, hari ini kamu menghabiskan lebih banyak dibandingkan rata-rata 7 hari terakhir.\n\n**Tips dariku untuk Jeje:** 🌟\n1. Coba pantau pola pengeluaranmu di awal minggu. Dari data, Senin-Jumat cenderung lebih tinggi dibanding akhir pekan.\n2. Kalau bisa, alokasikan budget khusus untuk kebutuhan mingguan dan coba patuhi batas tersebut.\n3. Catat setiap pengeluaran kecil-kecilan. Terkadang pengeluaran kecil yang sering menghabiskan budget.\n\nApakah ada pengeluaran hari ini yang membuatmu terkejut? Atau ada hal spesifik yang ingin Jeje diskusikan soal keuangan? Aku siap membantu! 💪', '2026-01-18 02:52:44'),
(142, 'user', 'Apakah keuanganku sehat? 🏥', '2026-01-18 04:16:16'),
(143, 'assistant', 'Hai Jeje! 😊\n\nBerdasarkan data keuanganmu bulan ini, keuanganku bisa bilang **cukup sehat** karena punya pemasukan lebih besar daripada pengeluaran. Tapi ada beberapa poin yang perlu kita perhatikan sama-sama ya! 📊\n\n### ✅ **Apa yang Bagus:**\n1. **Pemasukan > Pengeluaran** - Saldo positif Rp 6,691,290! Ini bagus karena artinya kamu bisa menabung atau berinvestasi 💰\n2. **Pemasukan yang cukup besar** - Bonus Tukin Rp 8.7 juta memberi cushion keuangan yang lumayan.\n3. **Rata-rata pengeluaran Rp 329.653/hari** - Terhitung wajar untuk lifestyle di Jakarta.\n\n### ⚠️ **Apa yang Perlu Diperhatikan:**\n1. **Pengeluaran makanan (Food + Groceries) sangat tinggi** - Total Rp 1.846.966 (39% dari total pengeluaran!) 😱\n   - Rata-rata makan Rp 500 ribu per hari\n   - Ini menghabiskan hampir separuh income bulanan\n\n2. **Pengeluaran tertinggi di Bill (Kos Rp 1.6 juta)** - Biaya hidup tetap memang harus dikelola.\n\n3. **Tidak ada pemasukan rutin (gaji/investasi)** - Hanya bonus sekali saja. Ini berarti income tidak stabil.\n\n### 🔍 **Analisis Kesehatan Finansial:**\n**Skor Kesehatan: 6.5/10**\n- **Positive:** Punya tabungan (saldo Rp 6.6M), tetapi income tidak rutin\n- **Negative:** Belum ada diversifikasi income, dan pengeluaran makanan sangat tinggi\n\n### 💡 **Tips untuk Jeje:**\n1. **Mulai track budget makanan** - Coba targetkan maksimal Rp 300 ribu/hari untuk makan & groceries\n2. **Mulai persiapan dana darurat** - Kalau punya saldo Rp 6.6M, mungkin bisa alokasikan Rp 3-4M untuk emergency fund di reksadana pasar uang\n3. **Cari income rutin** - Bonusnya habis kapan? Mulailah cari sumber penghasilan tetap\n4. **Investasi sederhana** - Dengan saldo segitu, bisa mulai belajar reksadana atau emas\n\n---\n\n**Mau aku bantu buatkan budget lebih detail?** Atau mau tanya soal cara mengelola bonusnya agar bisa bertahan lama? 😊\n\nIngat Jeje, kesehatan keuangan itu bukan cuma tentang punya saldo banyak, tapi juga punya sistem yang sustainable! 🌟', '2026-01-18 04:16:35'),
(144, 'user', 'Pengeluaranku hari ini normal? 💸', '2026-01-18 04:26:22'),
(145, 'assistant', 'Hai Jeje! 👋\n\nHari ini kamu mengeluarkan Rp 304.740 dari 2 transaksi (plastik & tapioka Rp 15.000 + kula Rp 289.740). Cek data nih... 🤔\n\n**Apakah pengeluaranmu hari ini normal?**\n\n- **Rata-rata pengeluaran harian bulan ini: Rp 329.653** → Rp 304.740 **di bawah rata-rata** ✅\n- **Rata-rata pengeluaran 7 hari terakhir: Rp 224.041** → hari ini **sedikit lebih tinggi** dari rata-rata mingguan, tapi masih wajar\n\n**Analisis BABA:**\nKamu belanja groceries (mungkin persiapan masak atau stok makanan), dan nominalnya masuk akal untuk kebutuhan sehari-hari. Yang bikin aku penasaran: **Rp 289.740 untuk \"kula\" itu cukup besar** 🤔 Apa itu kulkas? Atau barang kebutuhan lainnya? Kalau itu kebutuhan sekali beli, nggak masalah. Tapi kalau ini bahan makanan atau kebutuhan rutin, mungkin perlu cek lagi porsinya.\n\n**Tips BABA:**\n1. **Budget groceries** → Coba alokasikan maks 15-20% dari pemasukan bulan ini (sekitar Rp 1.13 juta × 15% = Rp 170.000/bulan)\n2. **Cek kembali** \"kula\" itu apa dan apakah itu kebutuhan rutin atau sekali beli saja\n3. **Pantau mingguan** → Kalau total pengeluaran groceries mingguan tetap tinggi, mungkin perlu rencana menu/masak di rumah untuk hemat\n\nSecara umum, **pengeluaranmu hari ini masih normal**, tapi coba kita pantau terus agar konsisten di bawah rata-rata ya! 💪\n\nAda lagi yang mau ditanya soal keuangan? BABA siap bantu! 😊', '2026-01-18 04:26:37'),
(146, 'user', 'Kula itu swalayan', '2026-01-18 04:29:28'),
(147, 'assistant', 'Oh, iya Jeje! 🤔 **Kula** itu memang salah satu *swalayan* atau *mini market* besar di Indonesia ya. Biasanya kita belanja kebutuhan sehari-hari di sana, mulai dari makanan ringan, minuman, sampai kebutuhan rumah tangga.\n\nKalau dilihat dari transaksi kamu hari ini, sepertinya kamu baru belanja di Kula dan menghabiskan sekitar **Rp 289.740** untuk kebutuhan groceries. Itu termasuk kategori **Groceries** (belanja bahan makanan/kebutuhan pokok).\n\n💡 **Tips Buat Jeje:**  \nSupaya pengeluaran di Kula nggak bikin kaget, bisa coba:\n1. **Buat list belanja** sebelum pergi – fokus ke kebutuhan utama aja\n2. **Cek promo** di aplikasi Kula atau di etalase depan\n3. **Bandingkan harga** kalau belanja online (biasanya ada diskon lebih besar)\n\nKalau Jeje mau, kita bisa bahas strategi **budgeting untuk groceries** biar lebih hemat. Mau coba? 😊', '2026-01-18 04:29:41'),
(148, 'user', 'Oke dengan pendapatan dan pengeluaranku, berapa jumlah investasi yg tepat dan dimana untuk saat ini?', '2026-01-18 04:35:11'),
(149, 'assistant', 'Hai Jeje! 👋\n\nPertanyaan yang sangat bagus dan penting! Berdasarkan data keuanganmu, aku akan analisis dulu kondisinya ya. \n\n**🔍 Analisis Singkat Keuangan Jeje:**\n- **Pemasukan bulan ini**: Rp 11.306.437 (termasuk bonus besar!)\n- **Pengeluaran bulan ini**: Rp 4.615.147\n- **Saldo setelah semua pengeluaran**: Rp 6.691.290 💰\n- **Rata-rata pengeluaran harian**: Rp 329.653\n- **Rata-rata pemasukan harian**: Rp 807.603\n\n**📈 Rekomendasi Investasi untuk Jeje:**\n\nBerdasarkan situasimu, aku saranikan **alokasi investasi yang aman dan terukur**:\n\n### **🎯 Total yang Bisa Diinvestasikan: Rp 2.500.000 - Rp 3.500.000**\n\n**Strategi Investasi yang Cocok:**\n1. **Dana Darurat (Wajib)**: Rp 1.500.000 - Rp 2.000.000 \n   - Simpan di rekening terpisah atau tabungan berjangka\n   - Target: 3x bulanan (sekitar Rp 1.000.000)\n   \n2. **Investasi Pasar Uang (Rp 500.000 - Rp 1.000.000)**\n   - Reksadana pasar uang atau deposito\n   - Risiko rendah, likuiditas tinggi\n   - Return: 5-7% per tahun\n\n3. **Investasi Saham/Reksadana Saham (Rp 500.000 - Rp 1.000.000)**\n   - Reksadana indeks atau ETF IHSG\n   - Target jangka menengah-panjang (3-5 tahun)\n   - IHSG saat ini: 9.075,41 (+2.15% today!)\n\n4. **Investasi Alternatif (Rp 500.000)**\n   - Emas digital (Lo x Kak Seto, Tokopedia Emas)\n   - Crypto kecil-kecilan (BTC $95k, tapi risiko tinggi!)\n\n**📌 Prioritas Utama:**\n✅ **JANGAN investasikan semuanya!** Pastikan cadangan operasional 3 bulan terpenuhi dulu  \n✅ Mulai dengan yang **risiko rendah** dulu, baru ke yang tinggi  \n✅ Investasi rutin setiap bulan > investasi sekali besar  \n\n**📍 Rekomendasi Platform:**\n- **Reksadana**: Bibit, Bareksa, atau Tokopedia Reksadana\n- **Emas**: Emas digital di OVO, GoPay, atau aplikasi khusus\n- **Saham**: E-MPN (Broker) atau Indodax (crypto)\n\n**⚠️ Catatan Penting:**\n- Ini hanya saran umum ya Jeje\n- Sesuaikan dengan profil risiko dan tujuan finansialmu\n- Konsultasi ke financial advisor resmi jika butuh strategi spesifik\n\n**🎯 Action Steps untuk Mulai:**\n1. **Minggu ini**: Buka rekening terpisah untuk dana darurat\n2. **Bulan depan**: Investasi rutin Rp 1.000.000/bulan ke reksadana pasar uang\n3. **Berdasarkan hasil**: Evaluasi setiap 3 bulan dan naikkan secara bertahap\n\nGimana Jeje? Apa ada yang mau didalami lebih lanjut atau ada target spesifik investasinya? 😊\n\n---\n*Catatan: Data di atas berdasarkan performa keuanganmu Januari 2026. Investasi selalu ada risiko, tapi dengan perencanaan yang matang, kamu bisa meminimalkannya!*\n\nAku siap bantu jika ada pertanyaan lain! 🚀', '2026-01-18 04:35:30'),
(150, 'user', 'Analisis pengeluaran bulan ini 📊', '2026-01-26 23:37:32'),
(151, 'user', 'Analisis pengeluaran bulan ini 📊', '2026-01-29 00:56:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key_name` varchar(50) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`id`, `key_name`, `value`, `created_at`, `updated_at`) VALUES
(1, 'user_pin', '4321', '2026-01-10 18:03:16', '2026-01-10 19:19:34'),
(2, 'backup_pin', '2098', '2026-01-10 18:03:16', '2026-01-10 18:03:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `title`, `amount`, `type`, `category`, `date`, `notes`, `created_at`) VALUES
(1, 'Gaji', 2570300.00, 'income', 'Salary', '2026-01-01', NULL, '2026-01-10 18:20:50'),
(2, 'Tukin', 8736137.00, 'income', 'Bonus', '2026-01-01', NULL, '2026-01-10 18:20:50'),
(3, 'CBB', 100000.00, 'expense', 'Bill', '2026-01-01', NULL, '2026-01-10 18:20:51'),
(4, 'Kas seksi', 100000.00, 'expense', 'Bill', '2026-01-01', NULL, '2026-01-10 18:20:51'),
(5, 'Paguyuban', 87361.00, 'expense', 'Bill', '2026-01-01', NULL, '2026-01-10 18:20:51'),
(6, 'Bebek cabe ijo', 23825.00, 'expense', 'Food', '2026-01-02', NULL, '2026-01-10 18:20:51'),
(7, 'Sewa toga', 150000.00, 'expense', 'Social', '2026-01-02', NULL, '2026-01-10 18:20:51'),
(8, 'Kantin 1x', 12000.00, 'expense', 'Food', '2026-01-02', NULL, '2026-01-10 18:20:51'),
(9, 'Martabak', 30875.00, 'expense', 'Food', '2026-01-03', NULL, '2026-01-10 18:20:51'),
(10, 'Grab', 7000.00, 'expense', 'Transportation', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(11, 'TJ PP', 7000.00, 'expense', 'Transportation', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(12, 'Kedai penuh nikmat', 139000.00, 'expense', 'Food', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(13, 'T ninety Nine', 61600.00, 'expense', 'Food', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(14, 'Papaya', 77000.00, 'expense', 'Food', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(15, 'Kula', 146489.00, 'expense', 'Groceries', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(16, 'Klik IDM', 174600.00, 'expense', 'Groceries', '2026-01-04', NULL, '2026-01-10 18:20:51'),
(17, 'Bensin', 25000.00, 'expense', 'Transportation', '2026-01-05', NULL, '2026-01-10 18:20:51'),
(18, 'Alfagift', 120600.00, 'expense', 'Groceries', '2026-01-06', NULL, '2026-01-10 18:20:51'),
(19, 'Buah', 10000.00, 'expense', 'Food', '2026-01-06', NULL, '2026-01-10 18:20:51'),
(20, 'Kos', 1600000.00, 'expense', 'Bill', '2026-01-06', NULL, '2026-01-10 18:20:51'),
(21, 'Tatei st', 35000.00, 'expense', 'Food', '2026-01-08', NULL, '2026-01-10 18:20:51'),
(22, 'Buah', 10000.00, 'expense', 'Food', '2026-01-09', NULL, '2026-01-10 18:20:51'),
(23, 'Bola Ubi', 15000.00, 'expense', 'Food', '2026-01-09', NULL, '2026-01-10 18:20:51'),
(24, 'Kula', 102512.00, 'expense', 'Groceries', '2026-01-10', NULL, '2026-01-10 18:20:51'),
(26, 'krupuk', 10000.00, 'expense', 'Food', '2026-01-10', NULL, '2026-01-11 02:32:54'),
(27, 'parkir ojol', 2000.00, 'expense', 'Transportation', '2026-01-10', NULL, '2026-01-11 02:33:53'),
(30, 'dp mua', 100000.00, 'expense', 'Bill', '2026-01-13', NULL, '2026-01-13 01:40:05'),
(31, 'buah', 10000.00, 'expense', 'Food', '2026-01-13', NULL, '2026-01-13 02:24:17'),
(32, 'sop daging', 25250.00, 'expense', 'Food', '2026-01-13', NULL, '2026-01-13 03:50:18'),
(33, 'pir', 37000.00, 'expense', 'Food', '2026-01-13', NULL, '2026-01-13 10:39:41'),
(34, 'pisang', 9500.00, 'expense', 'Food', '2026-01-13', NULL, '2026-01-13 10:39:52'),
(35, 'onde2', 10000.00, 'expense', 'Food', '2026-01-13', NULL, '2026-01-13 10:40:09'),
(36, 'shopee', 107617.00, 'expense', 'Shopping', '2026-01-14', NULL, '2026-01-14 07:34:39'),
(37, 'hotel', 347303.00, 'expense', 'Vacation', '2026-01-14', NULL, '2026-01-14 07:35:45'),
(38, 'bur sate', 12000.00, 'expense', 'Food', '2026-01-15', NULL, '2026-01-15 00:42:58'),
(39, 'onde2', 10000.00, 'expense', 'Food', '2026-01-15', NULL, '2026-01-15 13:19:39'),
(40, 'parkir ', 2000.00, 'expense', 'Transportation', '2026-01-15', NULL, '2026-01-15 13:19:51'),
(41, 'duren', 73940.00, 'expense', 'Food', '2026-01-15', NULL, '2026-01-15 13:20:22'),
(42, 'buah', 10000.00, 'expense', 'Food', '2026-01-15', NULL, '2026-01-15 13:20:33'),
(43, 'suthei', 376035.00, 'expense', 'Food', '2026-01-17', NULL, '2026-01-17 15:09:07'),
(44, 'diy', 84000.00, 'expense', 'Shopping', '2026-01-17', NULL, '2026-01-17 15:09:29'),
(45, 'miniso', 39900.00, 'expense', 'Shopping', '2026-01-17', NULL, '2026-01-17 15:09:52'),
(46, 'parkir', 9000.00, 'expense', 'Transportation', '2026-01-17', NULL, '2026-01-17 15:10:22'),
(49, 'kula', 289740.00, 'expense', 'Groceries', '2026-01-18', NULL, '2026-01-18 01:01:35'),
(50, 'plastik dan tapioka', 15000.00, 'expense', 'Groceries', '2026-01-18', NULL, '2026-01-18 01:17:39'),
(51, 'nikah nila', 100000.00, 'expense', 'Social', '2026-01-19', NULL, '2026-01-19 01:08:05'),
(52, 'klik idm', 76900.00, 'expense', 'Groceries', '2026-01-20', NULL, '2026-01-20 09:06:06'),
(53, 'kantin', 10000.00, 'expense', 'Food', '2026-01-21', NULL, '2026-01-21 02:20:50'),
(54, 'onde', 10000.00, 'expense', 'Food', '2026-01-21', NULL, '2026-01-21 10:28:53'),
(55, 'buah', 10000.00, 'expense', 'Food', '2026-01-22', NULL, '2026-01-22 02:28:00'),
(56, 'kantin 1x', 13000.00, 'expense', 'Food', '2026-01-26', NULL, '2026-01-26 00:34:51'),
(57, 'pp plm', 1812604.00, 'expense', 'Transportation', '2026-01-26', NULL, '2026-01-26 02:27:28'),
(58, 'shopee', 392218.00, 'expense', 'Shopping', '2026-01-26', NULL, '2026-01-26 03:47:38'),
(59, 'bensin', 22000.00, 'expense', 'Transportation', '2026-01-26', NULL, '2026-01-26 10:21:35'),
(60, 'dkriuk', 17000.00, 'expense', 'Food', '2026-01-26', NULL, '2026-01-26 10:21:45'),
(61, 'pir', 16562.00, 'expense', 'Food', '2026-01-26', NULL, '2026-01-27 01:54:42'),
(62, 'pir', 16500.00, 'expense', 'Food', '2026-01-27', NULL, '2026-01-27 06:48:40'),
(63, 'geybok', 19125.00, 'expense', 'Food', '2026-01-27', NULL, '2026-01-27 06:48:51'),
(64, 'bg maddin', 50000.00, 'expense', 'Social', '2026-01-27', NULL, '2026-01-27 07:30:56'),
(65, 'pir', 15000.00, 'expense', 'Food', '2026-01-28', NULL, '2026-01-28 02:16:03'),
(66, 'masjid', 50000.00, 'expense', 'Social', '2026-01-27', NULL, '2026-01-28 02:16:26'),
(67, 'sekeco', 18000.00, 'expense', 'Food', '2026-01-28', NULL, '2026-01-28 04:44:11'),
(68, 'nasgor', 15000.00, 'expense', 'Food', '2026-01-28', NULL, '2026-01-28 14:01:36'),
(69, 'pir', 15000.00, 'expense', 'Food', '2026-01-29', NULL, '2026-01-29 02:35:24');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `ai_knowledge`
--
ALTER TABLE `ai_knowledge`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `ai_knowledge`
--
ALTER TABLE `ai_knowledge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
