
# Bang Bikin Bang 🚫

Bot Discord untuk sistem registrasi User Control Panel (UCP) melalui verifikasi OTP WhatsApp.  
OTP dikirim via API Fonnte dan data tersimpan ke MySQL (`playerucp`).

## 🚀 Fitur

- Registrasi UCP dengan username & nomor telepon
- Validasi:
  - Username hanya huruf/angka, min 5 karakter
  - Nomor telepon harus diawali `62`
  - Usia akun Discord minimal 7 hari
- OTP dikirim via WhatsApp (Fonnte API)
- Verifikasi OTP lewat tombol
- Simpan data ke database MySQL
- Hanya owner (by Discord ID) yang dapat akses perintah `/input`

## 🧪 Teknologi

- Node.js
- Discord.js v14
- Sequelize ORM
- MySQL
- Fonnte WhatsApp API

## 📦 Instalasi

```bash
git clone https://github.com/username/ban-bikin-bang.git
cd ban-bikin-bang
npm install
```

## ⚙️ Konfigurasi `.env`

Buat file `.env` dan isi seperti berikut:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id
OWNER_ID=your_discord_user_id
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
DB_PORT=3306
FONNTE_TOKEN=your_fonnte_token
```

## 🗃️ Struktur Database (Tabel: `playerucp`)

```sql
CREATE TABLE `playerucp` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ucp` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `verifycode` VARCHAR(5) NOT NULL,
  `DiscordID` VARCHAR(255) NOT NULL,
  `verified` BOOLEAN DEFAULT 0,
  `reg_date` DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ▶️ Menjalankan Bot

```bash
node index.js
```

## 💬 Contoh Alur

1. Jalankan perintah `/input`
2. Klik tombol `Register`
3. Isi username dan nomor
4. OTP dikirim ke WhatsApp
5. Klik tombol `Verifikasi OTP`
6. Masukkan kode OTP
7. Status tersimpan sebagai `verified`

## 📌 Catatan

- Hanya owner yang bisa menjalankan command `/input`
- Bot tidak akan melayani akun Discord baru (kurang dari 7 hari)

---

**Made with 💻 by Aruli Azmi**
