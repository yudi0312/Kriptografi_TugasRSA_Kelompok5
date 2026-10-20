# TenderVault — RSA Cryptography Demonstration

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=black)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

**Implementasi Algoritma Kriptografi Asimetris RSA Manual (*From Scratch*) dengan JavaScript BigInt**

*Tugas Mata Kuliah Kriptografi — Semester 5*

</div>

---

## 👥 Anggota Kelompok 5

| No | Nama Lengkap | NRP |
|:--:|:-------------|:---:|
| 1 | **Putu Yudi Nandanjaya Wiraguna** | `5027241080` |
| 2 | **Raihan Fahri Ghazali** | `5027241061` |
| 3 | **I Gede Bagus Saka Sinatrya** | `5027241088` |

---

## Tentang Proyek

**TenderVault** adalah aplikasi web interaktif berbasis visual yang mengimplementasikan algoritma kriptografi kunci publik **RSA (Rivest–Shamir–Adleman)** secara murni (*pure vanilla implementation*) tanpa bantuan *library* kriptografi pihak ketiga. 

Aplikasi ini dirancang dengan studi kasus **Sistem Pengamanan Penawaran Pengadaan Barang/Jasa (Procurement Security)**:
- **Penyedia Tender (Vendor)** mengenkripsi pesan penawaran rahasia (seperti rincian harga penawaran) menggunakan **Kunci Publik** panitia.
- **Panitia Pengadaan (Pejabat Pengadaan)** dapat membuka dan memulihkan kembali pesan tersebut hanya dengan memegang **Kunci Privat** pasangannya.

---

## Fitur Utama

- **Pembangkitan Kunci Fleksibel (*Key Generation*)**:
  - Pilihan input bilangan prima $p$ dan $q$ kustom dengan verifikasi otomatis bilangan prima (*primality check*).
  - Tombol **"Acak prima"** untuk menghasilkan bilangan prima acak secara otomatis menggunakan `crypto.getRandomValues`.
  - Pengecekan validasi $n > 255$ agar dapat menampung nilai representasi byte UTF-8.
- **Jejak Perhitungan Interaktif (*Live Math Trace*)**:
  - Menampilkan langkah demi langkah nilai $n = p \times q$.
  - Perhitungan fungsi totien Euler $\phi(n) = (p - 1)(q - 1)$.
  - Penentuan nilai eksponen publik $e$ yang relatif prima terhadap $\phi(n)$ ($\gcd(e, \phi(n)) = 1$).
  - Perhitungan eksponen privat $d$ melalui *Extended Euclidean Algorithm* (Invers Modular).
- **Enkripsi Pesan (*Encryption*)**:
  - Konversi teks UTF-8 ke representasi *byte array*.
  - Enkripsi per byte: $c = m^e \pmod n$ dengan algoritma *modular exponentiation* cepat.
  - Output berupa deretan angka integer desimal yang dipisahkan oleh spasi.
- **Dekripsi Pesan (*Decryption*)**:
  - Pemulihan kembali deretan integer ciphertext menjadi plaintext asli: $m = c^d \pmod n$.
  - Validasi ketat format ciphertext dan penanganan kesalahan rekonstruksi UTF-8.
- **Antarmuka Modern & Responsif**:
  - Tema *dark mode* elegan bertema *Cybersecurity & Procurement Operations*.
  - Indikator status langsung (*live error feedback* dan *status badge*).

---

## Dasar Teori & Alur Matematika RSA

```
+-------------------------------------------------------------+
|                     1. PEMBANGKITAN KUNCI                   |
|                                                             |
|  Pilih prima p & q  --->  Hitung n = p * q                  |
|                           Hitung φ(n) = (p - 1)(q - 1)      |
|                           Pilih e : gcd(e, φ(n)) = 1        |
|                           Hitung d : e * d ≡ 1 mod φ(n)     |
|                                                             |
|  Kunci Publik : (e, n)      |      Kunci Privat : (d, n)    |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     2. ENKRIPSI PESAN                       |
|                                                             |
|  Plaintext (m)  --->  mᵉ mod n  --->  Ciphertext (c)        |
|  (Menggunakan Kunci Publik)                                 |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     3. DEKRIPSI PESAN                       |
|                                                             |
|  Ciphertext (c) --->  cᵈ mod n  --->  Plaintext (m)         |
|  (Menggunakan Kunci Privat)                                 |
+-------------------------------------------------------------+
```

### 1. Pembangkitan Kunci (*Key Generation*)
1. Pilih dua bilangan prima sembarang $p$ dan $q$ dengan $p \neq q$.
2. Hitung modulus:
   $$n = p \times q$$
3. Hitung fungsi totien Euler:
   $$\phi(n) = (p - 1)(q - 1)$$
4. Tentukan eksponen publik $e$ sedemikian sehingga:
   $$1 < e < \phi(n) \quad \text{dan} \quad \gcd(e, \phi(n)) = 1$$
5. Tentukan eksponen privat $d$ menggunakan *Extended Euclidean Algorithm* sehingga:
   $$d \equiv e^{-1} \pmod{\phi(n)} \iff (e \times d) \pmod{\phi(n)} = 1$$

### 2. Enkripsi (*Encryption*)
Pesan teks dikonversi ke urutan byte integer $m \in [0, 255]$. Ciphertext $c$ diperoleh melalui:
$$c = m^e \pmod n$$

### 3. Dekripsi (*Decryption*)
Setiap integer ciphertext $c$ dikembalikan ke nilai aslinya $m$ menggunakan kunci privat:
$$m = c^d \pmod n$$

---

## Struktur Direktori

```text
├── index.html                   # Halaman antarmuka web TenderVault
├── styles.css                   # Lembar gaya CSS (desain modern & responsif)
├── app.js                       # Logika matematika RSA murni & interaksi DOM
├── Laporan_RSA_TenderVault.pdf  # Dokumen laporan tugas tertulis
└── README.md                    # Dokumentasi repositori
```

---

## Cara Menjalankan Proyek

Proyek ini tidak memerlukan instalasi dependensi luar atau *runtime build* tambahan (*zero-dependency*). Anda hanya membutuhkan peramban web modern (Google Chrome, Firefox, Safari, atau Microsoft Edge).

### Cara 1: Buka Langsung di Browser
1. *Clone* atau unduh repositori ini:
   ```bash
   git clone https://github.com/<username>/<nama-repo>.git
   cd <nama-repo>
   ```
2. Buka berkas `index.html` langsung dengan peramban favorit Anda (klik dua kali pada file `index.html`).

### Cara 2: Menggunakan Live Server (VS Code)
1. Buka folder proyek di **Visual Studio Code**.
2. Pasang ekstensi **Live Server**.
3. Klik kanan pada berkas `index.html` dan pilih **"Open with Live Server"**.

---


