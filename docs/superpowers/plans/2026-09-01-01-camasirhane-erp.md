# Proje 1 — Çamaşırhane & Kuru Temizleme ERP — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bir çamaşırhanenin sipariş alma, yıkama aşaması takibi, barkod etiket basımı, kurye dağıtımı ve gün sonu kasa raporu akışlarını uçtan uca çalıştıran 4 uygulamalık bir sistem üretmek.

**Architecture:** Tek bir Express + PostgreSQL API veritabanına yazan tek bileşendir. WinForms kasa uygulaması, React web yönetim paneli ve React Native mobil uygulaması bu API'ye HTTP/JSON ile konuşur; hiçbiri veritabanına doğrudan bağlanmaz. Kimlik doğrulama JWT ile yapılır, rol bilgisi token içinde taşınır ve controller içinde kontrol edilir.

**Tech Stack:** Node.js 22 + Express 4 + `pg` + `bcryptjs` + `jsonwebtoken` · PostgreSQL 16 · React 18 + Vite + React Router + Axios · React Native (Expo SDK 51) · C# WinForms (net9.0-windows)

**Spec:** `docs/superpowers/specs/2026-09-01-summer2026-stages-design.md`

## Global Constraints

> ℹ️ **`curl` ile Türkçe karakterli sorgu:** Node'un HTTP ayrıştırıcısı istek satırında
> çıplak UTF-8 bayt kabul etmez ve `400 Bad Request` döner. Doğrulama komutlarında
> `?q=Şahin` yerine `-G --data-urlencode "q=Şahin"` kullanılmalıdır. Tarayıcı ve axios
> zaten otomatik olarak yüzde-kodlama yaptığı için uygulamalarda bu sorun yaşanmaz.

Bu bölüm her görev için geçerlidir; ayrıca tekrar edilmez.

- **Arayüzdeki her metin Türkçe.** Hata mesajları dahil. Kod tanımlayıcıları (değişken, fonksiyon, tablo, sütun, API yolu) İngilizce.
- **Kod seviyesi "junior-but-clean" (spec D2):** iş mantığı doğrudan route handler / form event handler içinde. Servis katmanı, repository katmanı, DTO sınıfı, dependency injection soyutlaması, tasarım deseni **yok**. Doğrulama basit `if` blokları. Otomatik test **yok**, CI **yok**.
- **Aynı işi iki yerde yapmak serbesttir.** Projeler arası ve proje içi bir miktar tekrar bilinçlidir.
- Arada kısa **Türkçe yorum** satırları bulunur; her satır yorumlanmaz.
- **API portu 3101**, **web portu 5101** (`plan.md` §3).
- **Veritabanı:** yerel PostgreSQL 16, veritabanı adı `laundry_erp`, rol `laundry_user` / şifre `laundry123`.
- **Demo hesapları kasten basittir:** `admin / 123456`, `kasiyer1 / 123456`, `kurye1 / 123456`.
- **Para birimi ₺**, tarih formatı `GG.AA.YYYY`, telefonlar `+90 5xx xxx xx xx`.
- Her uygulamada `.env.example` bulunur, `.env` commit edilmez.
- Her görev sonunda **commit** atılır. Commit mesajları Türkçe.

> ⚠️ **PostgreSQL parametre tuzağı:** Aynı `$n` parametresini hem bir kolona yazarken
> (`varchar`) hem de `CASE WHEN $n = '...'` içinde (`text`) kullanmayın —
> PostgreSQL `inconsistent types deduced for parameter` hatası verir. Değeri JS
> tarafında hesaplayıp ayrı bir parametre olarak gönderin.

## Sipariş Durumları (tüm uygulamalarda aynı)

| Kod | Arayüzde görünen | Sıra |
|-----|------------------|------|
| `alindi` | Teslim Alındı | 1 |
| `yikamada` | Yıkamada | 2 |
| `utude` | Ütüde | 3 |
| `hazir` | Hazır | 4 |
| `teslim_edildi` | Teslim Edildi | 5 |
| `iptal` | İptal | — |

## Dosya Yapısı

```
01-camasirhane-erp/
├── README.md                       # Türkçe tanıtım, kurulum, demo hesaplar, ekran görüntüleri
├── db/
│   └── schema.sql                  # tüm tablolar + indeksler
├── apps/
│   ├── api/                        # Express + PostgreSQL
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── server.js               # express kurulumu, route bağlama, dinleme
│   │   ├── db.js                   # pg Pool
│   │   ├── auth.js                 # login route + verifyToken middleware
│   │   ├── routes/
│   │   │   ├── customers.js
│   │   │   ├── services.js
│   │   │   ├── orders.js           # sipariş oluşturma/listeleme/detay/durum/barkod
│   │   │   ├── payments.js
│   │   │   ├── couriers.js
│   │   │   └── reports.js
│   │   └── scripts/
│   │       └── seed.js             # Türkçe demo verisi (şifreler burada hashlenir)
│   ├── web-admin/                  # React + Vite
│   │   ├── .env.example
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── App.jsx             # router + korumalı rotalar
│   │       ├── api.js              # axios örneği + token interceptor
│   │       ├── Layout.jsx          # sol menü + üst bar
│   │       ├── styles.css
│   │       └── pages/
│   │           ├── Login.jsx
│   │           ├── Dashboard.jsx
│   │           ├── Orders.jsx
│   │           ├── OrderDetail.jsx
│   │           ├── NewOrder.jsx
│   │           ├── Customers.jsx
│   │           ├── Services.jsx
│   │           └── Reports.jsx
│   ├── mobile/                     # React Native (Expo)
│   │   ├── app.json
│   │   ├── App.js                  # navigation + rol yönlendirme
│   │   └── src/
│   │       ├── api.js
│   │       └── screens/
│   │           ├── LoginScreen.js
│   │           ├── CourierTasksScreen.js
│   │           ├── TaskDetailScreen.js
│   │           ├── HomeScreen.js
│   │           └── TrackOrderScreen.js
│   └── desktop-winforms/           # Windows'ta iskeleti üretilir
│       └── CamasirhaneKasa/
│           ├── ApiClient.cs
│           ├── LoginForm.cs
│           ├── MainForm.cs
│           ├── NewOrderForm.cs
│           ├── LabelPrintForm.cs
│           ├── ScanStageForm.cs
│           └── DailyReportForm.cs
```

---

## Görev 0: Ortam Kurulumu (Faz 0)

**Files:**
- Modify: `plan.md` (Faz 0 tablosu)
- Modify: `~/.zshrc` (adb PATH)

**Interfaces:**
- Produces: Çalışan yerel PostgreSQL 16 servisi, `laundry_erp` veritabanı, `laundry_user` rolü; PATH'te `adb`.

> Not: .NET 8, Flutter, PHP ve MySQL bu projede kullanılmıyor. Her biri kendi projesi başlarken kurulur (`plan.md` §4).

- [ ] **Adım 1: PostgreSQL 16 kur ve başlat**

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
```

- [ ] **Adım 2: Kurulumu doğrula**

Çalıştır: `psql --version && pg_isready`
Beklenen: `psql (PostgreSQL) 16.x` ve `/tmp:5432 - accepting connections`

- [ ] **Adım 3: Veritabanı ve kullanıcıyı oluştur**

```bash
psql postgres -c "CREATE ROLE laundry_user WITH LOGIN PASSWORD 'laundry123';"
psql postgres -c "CREATE DATABASE laundry_erp OWNER laundry_user;"
```

- [ ] **Adım 4: Bağlantıyı doğrula**

Çalıştır: `PGPASSWORD=laundry123 psql -h localhost -U laundry_user -d laundry_erp -c "SELECT current_database(), current_user;"`
Beklenen: `laundry_erp | laundry_user`

- [ ] **Adım 5: adb'yi PATH'e ekle ve emülatörü doğrula**

```bash
echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
echo 'export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"' >> ~/.zshrc
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
emulator -list-avds
```

Beklenen çıktı: `Nexus_5X_API_27` ve `Pixel_4_API_33`

- [ ] **Adım 6: `plan.md` §4 tablosunu güncelle**

PostgreSQL satırını `❌ yok` → `✅ kurulu (16.x)`, adb satırını `✅ PATH'te` yap.

- [ ] **Adım 7: Commit**

```bash
git add plan.md
git commit -m "Faz 0: PostgreSQL 16 kuruldu, adb PATH'e eklendi"
```

---

## Görev 1: Veritabanı Şeması

**Files:**
- Create: `01-camasirhane-erp/db/schema.sql`

**Interfaces:**
- Produces: `users`, `customers`, `services`, `orders`, `order_items`, `order_status_history`, `courier_tasks`, `payments` tabloları. Sonraki tüm görevler bu sütun adlarını kullanır.

- [ ] **Adım 1: Şema dosyasını yaz**

```sql
-- Çamaşırhane ERP veritabanı şeması
-- Kullanım: psql -h localhost -U laundry_user -d laundry_erp -f db/schema.sql

DROP TABLE IF EXISTS payments, courier_tasks, order_status_history,
                     order_items, orders, services, customers, users CASCADE;

-- Personel: admin, kasiyer, kurye
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin','kasiyer','kurye')),
    phone         VARCHAR(25),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    id         SERIAL PRIMARY KEY,
    full_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(25)  NOT NULL,
    address    TEXT,
    district   VARCHAR(50),
    city       VARCHAR(50) DEFAULT 'İstanbul',
    notes      TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Hizmet listesi ve fiyatlar (yıkama, kuru temizleme, ütü, leke çıkarma)
CREATE TABLE services (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    category  VARCHAR(30)  NOT NULL CHECK (category IN ('yikama','kuru_temizleme','utu','leke')),
    unit      VARCHAR(10)  NOT NULL CHECK (unit IN ('adet','kg','m2')),
    price     NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
    id             SERIAL PRIMARY KEY,
    order_no       VARCHAR(20)  NOT NULL UNIQUE,
    customer_id    INTEGER      NOT NULL REFERENCES customers(id),
    status         VARCHAR(20)  NOT NULL DEFAULT 'alindi'
                   CHECK (status IN ('alindi','yikamada','utude','hazir','teslim_edildi','iptal')),
    delivery_type  VARCHAR(10)  NOT NULL DEFAULT 'magaza'
                   CHECK (delivery_type IN ('magaza','kurye')),
    total_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    promised_date  DATE,
    courier_id     INTEGER REFERENCES users(id),
    created_by     INTEGER NOT NULL REFERENCES users(id),
    notes          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered_at   TIMESTAMP
);

-- Her satır fiziksel bir parça grubudur; barkod etiketi bu satır için basılır
CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id),
    item_name  VARCHAR(100) NOT NULL,
    quantity   NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(10,2) NOT NULL,
    barcode    VARCHAR(40) NOT NULL UNIQUE,
    notes      TEXT
);

CREATE TABLE order_status_history (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    note       TEXT
);

-- Kurye alma / teslim görevleri
CREATE TABLE courier_tasks (
    id           SERIAL PRIMARY KEY,
    order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    courier_id   INTEGER NOT NULL REFERENCES users(id),
    task_type    VARCHAR(10) NOT NULL CHECK (task_type IN ('alma','teslim')),
    status       VARCHAR(15) NOT NULL DEFAULT 'bekliyor'
                 CHECK (status IN ('bekliyor','yolda','tamamlandi','basarisiz')),
    address      TEXT,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    note         TEXT
);

CREATE TABLE payments (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount      NUMERIC(10,2) NOT NULL,
    method      VARCHAR(10) NOT NULL CHECK (method IN ('nakit','kart','havale')),
    received_by INTEGER REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_created     ON orders(created_at);
CREATE INDEX idx_items_barcode      ON order_items(barcode);
CREATE INDEX idx_tasks_courier      ON courier_tasks(courier_id, status);
CREATE INDEX idx_customers_phone    ON customers(phone);
```

- [ ] **Adım 2: Şemayı uygula**

Çalıştır:
```bash
cd 01-camasirhane-erp
PGPASSWORD=laundry123 psql -h localhost -U laundry_user -d laundry_erp -f db/schema.sql
```
Beklenen: Hata yok; `CREATE TABLE` / `CREATE INDEX` satırları.

- [ ] **Adım 3: Tabloları doğrula**

Çalıştır: `PGPASSWORD=laundry123 psql -h localhost -U laundry_user -d laundry_erp -c "\dt"`
Beklenen: 8 tablo listelenir — `courier_tasks, customers, order_items, order_status_history, orders, payments, services, users`

- [ ] **Adım 4: Commit**

```bash
git add 01-camasirhane-erp/db/schema.sql
git commit -m "Proje 1: veritabanı şeması"
```

---

## Görev 2: API İskeleti, Veritabanı Bağlantısı ve Giriş

**Files:**
- Create: `01-camasirhane-erp/apps/api/package.json`
- Create: `01-camasirhane-erp/apps/api/.env.example`
- Create: `01-camasirhane-erp/apps/api/db.js`
- Create: `01-camasirhane-erp/apps/api/auth.js`
- Create: `01-camasirhane-erp/apps/api/server.js`

**Interfaces:**
- Produces:
  - `db.js` → `module.exports = pool` (node-postgres `Pool`), `pool.query(text, params)`
  - `auth.js` → `module.exports = { router, verifyToken }`
    - `router` : `POST /api/auth/login` ve `GET /api/auth/me`
    - `verifyToken(req, res, next)` : `Authorization: Bearer <token>` başlığını doğrular, `req.user = { id, username, role, full_name }` atar, geçersizse `401 { message: "Oturum geçersiz, lütfen tekrar giriş yapın." }`
  - Sunucu `http://localhost:3101` üzerinde dinler.

- [ ] **Adım 1: Node projesini oluştur ve bağımlılıkları kur**

```bash
cd 01-camasirhane-erp/apps/api
npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

- [ ] **Adım 2: `package.json` betiklerini düzenle**

```json
{
  "name": "camasirhane-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js"
  }
}
```

- [ ] **Adım 3: `.env.example` ve `.env` dosyalarını yaz**

```
PORT=3101
DB_HOST=localhost
DB_PORT=5432
DB_NAME=laundry_erp
DB_USER=laundry_user
DB_PASSWORD=laundry123
JWT_SECRET=camasirhane_gizli_anahtar_2026
```

`.env.example` bu içerikle commit edilir; `cp .env.example .env` ile `.env` üretilir (commit edilmez).

- [ ] **Adım 4: `db.js` yaz**

```js
// PostgreSQL bağlantı havuzu
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

- [ ] **Adım 5: `auth.js` yaz**

```js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();

// Giriş
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunludur." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const user = result.rows[0];
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token: token,
      user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası, giriş yapılamadı." });
  }
});

// Token doğrulama ara katmanı
function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Oturum geçersiz, lütfen tekrar giriş yapın." });
  }
  try {
    req.user = jwt.verify(header.substring(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Oturum geçersiz, lütfen tekrar giriş yapın." });
  }
}

// Giriş yapan kullanıcının bilgisi
router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = { router, verifyToken };
```

- [ ] **Adım 6: `server.js` yaz**

```js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const auth = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ durum: "calisiyor" });
});

app.use("/api/auth", auth.router);

// Sonraki görevlerde eklenecek route'lar buraya bağlanır:
// app.use("/api/customers", require("./routes/customers"));

const port = process.env.PORT || 3101;
app.listen(port, () => {
  console.log("Çamaşırhane API çalışıyor: http://localhost:" + port);
});
```

- [ ] **Adım 7: Sunucuyu başlat ve doğrula**

Çalıştır:
```bash
cd 01-camasirhane-erp/apps/api && cp .env.example .env && npm run dev
```
Başka bir terminalde: `curl -s http://localhost:3101/api/health`
Beklenen: `{"durum":"calisiyor"}`

- [ ] **Adım 8: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: API iskeleti, veritabanı bağlantısı ve giriş"
```

---

## Görev 3: Türkçe Demo Verisi

**Files:**
- Create: `01-camasirhane-erp/apps/api/scripts/seed.js`

**Interfaces:**
- Consumes: `db.js` (`pool`), Görev 1'deki tablolar
- Produces: 3 kullanıcı, 8 hizmet, 10 müşteri, 8 sipariş (farklı durumlarda), kurye görevleri ve ödemeler.
  Demo hesapları: `admin/123456`, `kasiyer1/123456`, `kurye1/123456`.

- [ ] **Adım 1: `scripts/seed.js` yaz**

```js
// Türkçe demo verisi yükler. Çalıştırma: npm run seed
const bcrypt = require("bcryptjs");
const pool = require("../db");

async function seed() {
  console.log("Demo verisi yükleniyor...");

  // Önce mevcut veriyi temizle
  await pool.query(`TRUNCATE payments, courier_tasks, order_status_history,
                    order_items, orders, services, customers, users RESTART IDENTITY CASCADE`);

  const sifre = bcrypt.hashSync("123456", 10);

  // Personel
  await pool.query(
    `INSERT INTO users (full_name, username, password_hash, role, phone) VALUES
     ('Ahmet Yılmaz',   'admin',    $1, 'admin',   '+90 532 111 22 33'),
     ('Zeynep Kaya',    'kasiyer1', $1, 'kasiyer', '+90 533 222 33 44'),
     ('Mustafa Demir',  'kurye1',   $1, 'kurye',   '+90 534 333 44 55')`,
    [sifre]
  );

  // Hizmetler ve fiyatlar
  await pool.query(
    `INSERT INTO services (name, category, unit, price) VALUES
     ('Gömlek Yıkama + Ütü',        'yikama',         'adet',  45.00),
     ('Takım Elbise Kuru Temizleme','kuru_temizleme', 'adet', 250.00),
     ('Palto / Kaban Kuru Temizleme','kuru_temizleme','adet', 320.00),
     ('Gelinlik Kuru Temizleme',    'kuru_temizleme', 'adet', 900.00),
     ('Battaniye Yıkama',           'yikama',         'adet', 180.00),
     ('Perde Yıkama',               'yikama',         'kg',    90.00),
     ('Halı Yıkama',                'yikama',         'm2',   120.00),
     ('Leke Çıkarma (Özel İşlem)',  'leke',           'adet',  75.00)`
  );

  // Müşteriler
  await pool.query(
    `INSERT INTO customers (full_name, phone, address, district) VALUES
     ('Elif Şahin',      '+90 535 401 11 21', 'Bağdat Cad. No:112 D:5',   'Kadıköy'),
     ('Burak Aydın',     '+90 536 402 12 22', 'Barbaros Bulvarı No:38',   'Beşiktaş'),
     ('Merve Doğan',     '+90 537 403 13 23', 'Çamlıca Mah. 12. Sok No:7','Üsküdar'),
     ('Emre Çelik',      '+90 538 404 14 24', 'Halaskargazi Cad. No:200', 'Şişli'),
     ('Ayşe Koç',        '+90 539 405 15 25', 'İncirli Cad. No:45 D:3',   'Bakırköy'),
     ('Kerem Arslan',    '+90 505 406 16 26', 'Nispetiye Cad. No:18',     'Beşiktaş'),
     ('Selin Yıldız',    '+90 506 407 17 27', 'Moda Cad. No:88 D:2',      'Kadıköy'),
     ('Onur Polat',      '+90 507 408 18 28', 'Atatürk Bulvarı No:15',    'Ataşehir'),
     ('Deniz Kurt',      '+90 508 409 19 29', 'Bahariye Cad. No:60',      'Kadıköy'),
     ('Hakan Öztürk',    '+90 509 410 20 30', 'Kartaltepe Mah. No:9',     'Bakırköy')`
  );

  // Siparişler — her durumdan örnek olsun
  const durumlar = ["alindi", "yikamada", "utude", "hazir", "hazir", "teslim_edildi", "teslim_edildi", "alindi"];
  const teslimTipleri = ["magaza", "kurye", "magaza", "kurye", "magaza", "kurye", "magaza", "kurye"];

  for (let i = 0; i < durumlar.length; i++) {
    const orderNo = "SP-2026-" + String(i + 1).padStart(5, "0");
    const customerId = (i % 10) + 1;
    const durum = durumlar[i];
    const teslimTipi = teslimTipleri[i];
    const kuryeId = teslimTipi === "kurye" ? 3 : null;

    const siparis = await pool.query(
      `INSERT INTO orders (order_no, customer_id, status, delivery_type, promised_date,
                           courier_id, created_by, created_at, delivered_at)
       VALUES ($1, $2, $3, $4, CURRENT_DATE + 2, $5, 2,
               NOW() - ($6 || ' days')::interval,
               CASE WHEN $3 = 'teslim_edildi' THEN NOW() ELSE NULL END)
       RETURNING id`,
      [orderNo, customerId, durum, teslimTipi, kuryeId, String(7 - i)]
    );
    const orderId = siparis.rows[0].id;

    // Her siparişe 2 kalem ekle
    let toplam = 0;
    for (let j = 0; j < 2; j++) {
      const serviceId = ((i + j) % 8) + 1;
      const hizmet = await pool.query("SELECT name, price FROM services WHERE id = $1", [serviceId]);
      const adet = j + 1;
      const birimFiyat = Number(hizmet.rows[0].price);
      const satirToplam = adet * birimFiyat;
      toplam += satirToplam;

      await pool.query(
        `INSERT INTO order_items (order_id, service_id, item_name, quantity, unit_price, line_total, barcode)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, serviceId, hizmet.rows[0].name, adet, birimFiyat, satirToplam,
         orderNo + "-" + String(j + 1).padStart(2, "0")]
      );
    }

    await pool.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [toplam, orderId]);

    // Durum geçmişi
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'alindi', 2, 'Sipariş oluşturuldu')",
      [orderId]
    );
    if (durum !== "alindi") {
      await pool.query(
        "INSERT INTO order_status_history (order_id, status, changed_by) VALUES ($1, $2, 2)",
        [orderId, durum]
      );
    }

    // Teslim edilenler ödenmiş sayılsın
    if (durum === "teslim_edildi") {
      await pool.query(
        "INSERT INTO payments (order_id, amount, method, received_by) VALUES ($1, $2, 'nakit', 2)",
        [orderId, toplam]
      );
      await pool.query("UPDATE orders SET paid_amount = $1 WHERE id = $2", [toplam, orderId]);
    }

    // Kurye görevleri
    if (teslimTipi === "kurye") {
      const musteri = await pool.query("SELECT address, district FROM customers WHERE id = $1", [customerId]);
      const adres = musteri.rows[0].address + " / " + musteri.rows[0].district;
      await pool.query(
        `INSERT INTO courier_tasks (order_id, courier_id, task_type, status, address, scheduled_at)
         VALUES ($1, 3, 'teslim', $2, $3, NOW() + interval '1 day')`,
        [orderId, durum === "teslim_edildi" ? "tamamlandi" : "bekliyor", adres]
      );
    }
  }

  console.log("Demo verisi yüklendi.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Demo verisi yüklenemedi:", err);
  process.exit(1);
});
```

- [ ] **Adım 2: Demo verisini yükle**

Çalıştır: `cd 01-camasirhane-erp/apps/api && npm run seed`
Beklenen: `Demo verisi yükleniyor...` ardından `Demo verisi yüklendi.`

- [ ] **Adım 3: Veriyi doğrula**

Çalıştır:
```bash
PGPASSWORD=laundry123 psql -h localhost -U laundry_user -d laundry_erp -c \
"SELECT (SELECT COUNT(*) FROM users) AS personel,
        (SELECT COUNT(*) FROM services) AS hizmet,
        (SELECT COUNT(*) FROM customers) AS musteri,
        (SELECT COUNT(*) FROM orders) AS siparis,
        (SELECT COUNT(*) FROM order_items) AS kalem;"
```
Beklenen: `3 | 8 | 10 | 8 | 16`

- [ ] **Adım 4: Girişi doğrula**

Çalıştır:
```bash
curl -s -X POST http://localhost:3101/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```
Beklenen: `token` alanı dolu, `user.role` = `admin`.

Hatalı şifreyi de dene:
```bash
curl -s -X POST http://localhost:3101/api/auth/login \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"yanlis"}'
```
Beklenen: `{"message":"Kullanıcı adı veya şifre hatalı."}`

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/api/scripts/seed.js
git commit -m "Proje 1: Türkçe demo verisi"
```

---

## Görev 4: Müşteri ve Hizmet Uçları

**Files:**
- Create: `01-camasirhane-erp/apps/api/routes/customers.js`
- Create: `01-camasirhane-erp/apps/api/routes/services.js`
- Modify: `01-camasirhane-erp/apps/api/server.js` (route bağlama)

**Interfaces:**
- Consumes: `pool` (`db.js`), `verifyToken` (`auth.js`)
- Produces:

| Metot | Yol | Rol | Gövde / Sorgu | Yanıt |
|-------|-----|-----|---------------|-------|
| GET | `/api/customers?q=` | tümü | `q`: ad, telefon **veya ilçe** içinde arama | `[{id, full_name, phone, address, district, city, notes, order_count}]` |
| GET | `/api/customers/:id` | tümü | — | müşteri nesnesi + `orders: [{id, order_no, status, total_amount, created_at}]` |
| POST | `/api/customers` | admin, kasiyer | `{full_name, phone, address, district, notes}` | `201` oluşturulan müşteri |
| PUT | `/api/customers/:id` | admin, kasiyer | aynı alanlar | güncellenen müşteri |
| GET | `/api/services?active=1` | tümü | — | `[{id, name, category, unit, price, is_active}]` |
| POST | `/api/services` | admin | `{name, category, unit, price}` | `201` oluşturulan hizmet |
| PUT | `/api/services/:id` | admin | `{name, category, unit, price, is_active}` | güncellenen hizmet |

- [ ] **Adım 1: `routes/customers.js` yaz**

```js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Müşteri listesi / arama
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  try {
    const result = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
       FROM customers c
       WHERE c.full_name ILIKE $1 OR c.phone ILIKE $1
       ORDER BY c.full_name`,
      ["%" + q + "%"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteriler getirilemedi." });
  }
});

// Müşteri detayı + siparişleri
router.get("/:id", async (req, res) => {
  try {
    const musteri = await pool.query("SELECT * FROM customers WHERE id = $1", [req.params.id]);
    if (musteri.rows.length === 0) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }
    const siparisler = await pool.query(
      `SELECT id, order_no, status, total_amount, created_at
       FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    const cevap = musteri.rows[0];
    cevap.orders = siparisler.rows;
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri getirilemedi." });
  }
});

// Yeni müşteri
router.post("/", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { full_name, phone, address, district, notes } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO customers (full_name, phone, address, district, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, phone, address || null, district || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri kaydedilemedi." });
  }
});

// Müşteri güncelle
router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { full_name, phone, address, district, notes } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }
  try {
    const result = await pool.query(
      `UPDATE customers SET full_name = $1, phone = $2, address = $3, district = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [full_name, phone, address || null, district || null, notes || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri güncellenemedi." });
  }
});

module.exports = router;
```

- [ ] **Adım 2: `routes/services.js` yaz**

Aynı kalıp: `router.use(verifyToken)`, `GET /` (aktif filtresi `req.query.active === "1"` ise `WHERE is_active = true`, sıralama `ORDER BY category, name`), `POST /` ve `PUT /:id` yalnızca `req.user.role === "admin"` ise çalışır, aksi hâlde `403 { message: "Bu işlem için yetkiniz yok." }`. Zorunlu alan kontrolü: `name`, `category`, `unit`, `price` boşsa `400 { message: "Hizmet adı, kategori, birim ve fiyat zorunludur." }`. `price` sayıya çevrilip `<= 0` ise `400 { message: "Fiyat sıfırdan büyük olmalıdır." }`.

- [ ] **Adım 3: Route'ları `server.js`'e bağla**

`app.use("/api/auth", auth.router);` satırının altına:

```js
app.use("/api/customers", require("./routes/customers"));
app.use("/api/services", require("./routes/services"));
```

- [ ] **Adım 4: Doğrula**

```bash
TOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s -G "http://localhost:3101/api/customers" --data-urlencode "q=Kadıköy" -H "Authorization: Bearer $TOKEN" | head -c 300
curl -s "http://localhost:3101/api/services?active=1" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json;print(len(json.load(sys.stdin)),'hizmet')"
curl -s http://localhost:3101/api/customers
```
Beklenen: ilk komut 3 müşteri (Kadıköy), ikincisi `8 hizmet`; token'sız son komut `{"message":"Oturum geçersiz, lütfen tekrar giriş yapın."}`.

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: müşteri ve hizmet uçları"
```

---

## Görev 5: Sipariş Oluşturma, Listeleme ve Detay

**Files:**
- Create: `01-camasirhane-erp/apps/api/routes/orders.js`
- Modify: `01-camasirhane-erp/apps/api/server.js`

**Interfaces:**
- Produces:

| Metot | Yol | Gövde / Sorgu | Yanıt |
|-------|-----|---------------|-------|
| POST | `/api/orders` | `{customer_id, delivery_type, promised_date, notes, items:[{service_id, item_name, quantity, notes}]}` | `201 {id, order_no, total_amount, items:[{id, barcode, item_name, quantity, unit_price, line_total}]}` |
| GET | `/api/orders?status=&q=&date=` | `status` durum kodu, `q` sipariş no/müşteri adı, `date` `YYYY-MM-DD` | `[{id, order_no, status, customer_name, customer_phone, total_amount, paid_amount, delivery_type, promised_date, created_at, item_count}]` |
| GET | `/api/orders/:id` | — | sipariş + `customer`, `items`, `history`, `payments`, `courier_task` |

**Sipariş numarası:** `SP-<yıl>-<5 hane sıra>` → `SP-2026-00009`
**Barkod:** `<order_no>-<2 hane kalem sırası>` → `SP-2026-00009-01`

- [ ] **Adım 1: `routes/orders.js` — yeni sipariş ucunu yaz**

```js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Yeni sipariş oluştur
router.post("/", async (req, res) => {
  const { customer_id, delivery_type, promised_date, notes, items } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: "Müşteri seçilmelidir." });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Siparişe en az bir hizmet eklenmelidir." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Sipariş numarasını üret
    const yil = new Date().getFullYear();
    const sayac = await client.query(
      "SELECT COUNT(*) FROM orders WHERE order_no LIKE $1",
      ["SP-" + yil + "-%"]
    );
    const sira = parseInt(sayac.rows[0].count) + 1;
    const orderNo = "SP-" + yil + "-" + String(sira).padStart(5, "0");

    const siparis = await client.query(
      `INSERT INTO orders (order_no, customer_id, delivery_type, promised_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, order_no`,
      [orderNo, customer_id, delivery_type || "magaza", promised_date || null,
       notes || null, req.user.id]
    );
    const orderId = siparis.rows[0].id;

    // Kalemler ve barkodlar
    let toplam = 0;
    const eklenenKalemler = [];
    for (let i = 0; i < items.length; i++) {
      const kalem = items[i];
      const hizmet = await client.query("SELECT name, price FROM services WHERE id = $1", [kalem.service_id]);
      if (hizmet.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Seçilen hizmet bulunamadı." });
      }
      const adet = Number(kalem.quantity);
      if (!adet || adet <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Miktar sıfırdan büyük olmalıdır." });
      }
      const birimFiyat = Number(hizmet.rows[0].price);
      const satirToplam = adet * birimFiyat;
      toplam += satirToplam;

      const barkod = orderNo + "-" + String(i + 1).padStart(2, "0");
      const eklenen = await client.query(
        `INSERT INTO order_items (order_id, service_id, item_name, quantity, unit_price, line_total, barcode, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, barcode, item_name, quantity, unit_price, line_total`,
        [orderId, kalem.service_id, kalem.item_name || hizmet.rows[0].name,
         adet, birimFiyat, satirToplam, barkod, kalem.notes || null]
      );
      eklenenKalemler.push(eklenen.rows[0]);
    }

    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [toplam, orderId]);
    await client.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'alindi', $2, 'Sipariş oluşturuldu')",
      [orderId, req.user.id]
    );

    // Kurye teslimi seçildiyse görev aç
    if (delivery_type === "kurye") {
      const musteri = await client.query("SELECT address, district FROM customers WHERE id = $1", [customer_id]);
      const adres = (musteri.rows[0].address || "") + " / " + (musteri.rows[0].district || "");
      await client.query(
        `INSERT INTO courier_tasks (order_id, courier_id, task_type, address, scheduled_at)
         SELECT $1, id, 'teslim', $2, NOW() + interval '1 day' FROM users WHERE role = 'kurye' AND is_active = true LIMIT 1`,
        [orderId, adres]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      id: orderId,
      order_no: orderNo,
      total_amount: toplam,
      items: eklenenKalemler,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Sipariş oluşturulamadı." });
  } finally {
    client.release();
  }
});
```

- [ ] **Adım 2: Listeleme ve detay uçlarını aynı dosyaya ekle**

```js
// Sipariş listesi — durum, arama ve tarih filtreli
router.get("/", async (req, res) => {
  const { status, q, date } = req.query;
  try {
    let sql = `SELECT o.id, o.order_no, o.status, o.total_amount, o.paid_amount,
                      o.delivery_type, o.promised_date, o.created_at,
                      c.full_name AS customer_name, c.phone AS customer_phone,
                      (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
               FROM orders o
               JOIN customers c ON c.id = o.customer_id
               WHERE 1 = 1`;
    const params = [];

    if (status) {
      params.push(status);
      sql += " AND o.status = $" + params.length;
    }
    if (q) {
      params.push("%" + q + "%");
      sql += " AND (o.order_no ILIKE $" + params.length + " OR c.full_name ILIKE $" + params.length + ")";
    }
    if (date) {
      params.push(date);
      sql += " AND DATE(o.created_at) = $" + params.length;
    }
    sql += " ORDER BY o.created_at DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Siparişler getirilemedi." });
  }
});

// Sipariş detayı
router.get("/:id", async (req, res) => {
  try {
    const siparis = await pool.query(
      `SELECT o.*, u.full_name AS created_by_name
       FROM orders o LEFT JOIN users u ON u.id = o.created_by
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (siparis.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const cevap = siparis.rows[0];
    const musteri = await pool.query("SELECT * FROM customers WHERE id = $1", [cevap.customer_id]);
    const kalemler = await pool.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [req.params.id]);
    const gecmis = await pool.query(
      `SELECT h.*, u.full_name AS changed_by_name
       FROM order_status_history h LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.order_id = $1 ORDER BY h.changed_at`,
      [req.params.id]
    );
    const odemeler = await pool.query("SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at", [req.params.id]);
    const gorev = await pool.query("SELECT * FROM courier_tasks WHERE order_id = $1 ORDER BY id DESC LIMIT 1", [req.params.id]);

    cevap.customer = musteri.rows[0];
    cevap.items = kalemler.rows;
    cevap.history = gecmis.rows;
    cevap.payments = odemeler.rows;
    cevap.courier_task = gorev.rows[0] || null;
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş getirilemedi." });
  }
});

module.exports = router;
```

- [ ] **Adım 3: `server.js`'e bağla**

```js
app.use("/api/orders", require("./routes/orders"));
```

- [ ] **Adım 4: Doğrula**

```bash
TOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"kasiyer1","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s -X POST http://localhost:3101/api/orders -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"delivery_type":"kurye","items":[{"service_id":1,"quantity":3},{"service_id":2,"quantity":1}]}'
```
Beklenen: `order_no` = `SP-2026-00009`, `total_amount` = `385`, 2 kalem, barkodlar `SP-2026-00009-01` ve `SP-2026-00009-02`.

Kalemsiz sipariş denemesi:
```bash
curl -s -X POST http://localhost:3101/api/orders -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"customer_id":1,"items":[]}'
```
Beklenen: `{"message":"Siparişe en az bir hizmet eklenmelidir."}`

```bash
curl -s "http://localhost:3101/api/orders?status=hazir" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json;print(len(json.load(sys.stdin)),'hazır sipariş')"
curl -s http://localhost:3101/api/orders/9 -H "Authorization: Bearer $TOKEN" | head -c 400
```
Beklenen: `2 hazır sipariş`; detayda `customer`, `items`, `history`, `courier_task` alanları dolu.

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: sipariş oluşturma, listeleme ve detay"
```

---

## Görev 6: Aşama Güncelleme, Barkod ile Arama ve Müşteri Takibi

**Files:**
- Modify: `01-camasirhane-erp/apps/api/routes/orders.js` (yeni uçlar; `module.exports` satırının üstüne)

**Interfaces:**
- Produces:

| Metot | Yol | Kimlik | Gövde | Yanıt |
|-------|-----|--------|-------|-------|
| PUT | `/api/orders/:id/status` | token | `{status, note}` | `{id, order_no, status}` |
| GET | `/api/orders/barcode/:barcode` | token | — | `{order_id, order_no, status, item_name, quantity, customer_name, customer_phone}` |
| PUT | `/api/orders/barcode/:barcode/status` | token | `{status}` | aşama güncellenmiş sipariş |
| GET | `/api/track/:code` | **token yok** | `code` = sipariş no **veya** barkod | `{order_no, status, status_label, promised_date, created_at, customer_name, item_count, history:[{status, status_label, changed_at}]}` |

**Kural:** `iptal` dışındaki geçişler sırayı atlayabilir (kullanıcı hatası toleransı — bilinçli olarak katı bir durum makinesi yazılmıyor). `teslim_edildi` yapıldığında `delivered_at = NOW()` yazılır. Zaten `teslim_edildi` olan sipariş tekrar güncellenmek istenirse `400 { message: "Teslim edilmiş sipariş güncellenemez." }`.

- [ ] **Adım 1: Durum etiketi yardımcısını dosyanın en üstüne ekle**

```js
// Durum kodlarının Türkçe karşılıkları
const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};
```

- [ ] **Adım 2: Aşama güncelleme ucunu yaz**

```js
// Sipariş aşamasını güncelle
router.put("/:id/status", async (req, res) => {
  const { status, note } = req.body;

  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }

  try {
    const mevcut = await pool.query("SELECT status FROM orders WHERE id = $1", [req.params.id]);
    if (mevcut.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }
    if (mevcut.rows[0].status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    // delivered_at'i JS tarafinda hesapliyoruz; ayni parametreyi hem kolonda hem
    // CASE icinde kullanmak PostgreSQL'de tip cakismasina yol aciyor
    const teslimTarihi = status === "teslim_edildi" ? new Date() : null;

    const result = await pool.query(
      `UPDATE orders SET status = $1, delivered_at = COALESCE($2, delivered_at)
       WHERE id = $3 RETURNING id, order_no, status`,
      [status, teslimTarihi, req.params.id]
    );
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, $2, $3, $4)",
      [req.params.id, status, req.user.id, note || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});

// Barkod ile kalem/sipariş bul (kasa uygulaması barkod okutunca kullanır)
router.get("/barcode/:barcode", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.order_id, i.item_name, i.quantity, o.order_no, o.status,
              c.full_name AS customer_name, c.phone AS customer_phone
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       JOIN customers c ON c.id = o.customer_id
       WHERE i.barcode = $1`,
      [req.params.barcode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Barkod sorgulanamadı." });
  }
});

// Barkod okutup doğrudan aşama güncelle
router.put("/barcode/:barcode/status", async (req, res) => {
  const { status } = req.body;
  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }
  try {
    const kalem = await pool.query("SELECT order_id FROM order_items WHERE barcode = $1", [req.params.barcode]);
    if (kalem.rows.length === 0) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }
    const orderId = kalem.rows[0].order_id;

    const mevcut = await pool.query("SELECT status FROM orders WHERE id = $1", [orderId]);
    if (mevcut.rows[0].status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    const teslimTarihi = status === "teslim_edildi" ? new Date() : null;

    const result = await pool.query(
      `UPDATE orders SET status = $1, delivered_at = COALESCE($2, delivered_at)
       WHERE id = $3 RETURNING id, order_no, status`,
      [status, teslimTarihi, orderId]
    );
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, $2, $3, 'Barkod okutularak güncellendi')",
      [orderId, status, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});
```

- [ ] **Adım 3: Müşteri takip ucunu yaz (token gerektirmez)**

Bu uç `verifyToken` altında **olmamalı**. Ayrı bir router olarak `routes/track.js` dosyasına yazılır:

```js
// Müşteri takip ucu — giriş gerektirmez, sipariş no veya barkod ile sorgulanır
const express = require("express");
const pool = require("../db");

const router = express.Router();

const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

router.get("/:code", async (req, res) => {
  const kod = req.params.code.trim();
  try {
    // Hem sipariş numarası hem barkod kabul edilir
    const result = await pool.query(
      `SELECT o.id, o.order_no, o.status, o.promised_date, o.created_at,
              c.full_name AS customer_name,
              (SELECT COUNT(*) FROM order_items i2 WHERE i2.order_id = o.id) AS item_count
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.order_no = $1
          OR o.id = (SELECT order_id FROM order_items WHERE barcode = $1)`,
      [kod]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı. Lütfen numarayı kontrol edin." });
    }

    const siparis = result.rows[0];
    const gecmis = await pool.query(
      "SELECT status, changed_at FROM order_status_history WHERE order_id = $1 ORDER BY changed_at",
      [siparis.id]
    );

    res.json({
      order_no: siparis.order_no,
      status: siparis.status,
      status_label: DURUM_ETIKETLERI[siparis.status],
      promised_date: siparis.promised_date,
      created_at: siparis.created_at,
      customer_name: siparis.customer_name,
      item_count: Number(siparis.item_count),
      history: gecmis.rows.map((s) => ({
        status: s.status,
        status_label: DURUM_ETIKETLERI[s.status],
        changed_at: s.changed_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş sorgulanamadı." });
  }
});

module.exports = router;
```

`server.js`'e ekle: `app.use("/api/track", require("./routes/track"));`

- [ ] **Adım 4: Doğrula**

```bash
TOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"kasiyer1","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s http://localhost:3101/api/orders/barcode/SP-2026-00001-01 -H "Authorization: Bearer $TOKEN"
curl -s -X PUT http://localhost:3101/api/orders/barcode/SP-2026-00001-01/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"yikamada"}'
curl -s http://localhost:3101/api/track/SP-2026-00001
curl -s http://localhost:3101/api/track/YOK-123
```
Beklenen: 1) barkod kaydı döner · 2) `{"status":"yikamada"}` · 3) `status_label` = `Yıkamada`, `history` 2+ kayıt, **token olmadan çalışır** · 4) `{"message":"Sipariş bulunamadı. Lütfen numarayı kontrol edin."}`

Teslim edilmiş siparişi güncellemeyi dene (seed'de 6. ve 7. sipariş teslim edildi):
```bash
curl -s -X PUT http://localhost:3101/api/orders/6/status -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"status":"yikamada"}'
```
Beklenen: `{"message":"Teslim edilmiş sipariş güncellenemez."}`

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: aşama güncelleme, barkod arama ve müşteri takip ucu"
```

---

## Görev 7: Ödemeler ve Kurye Görevleri

**Files:**
- Create: `01-camasirhane-erp/apps/api/routes/payments.js`
- Create: `01-camasirhane-erp/apps/api/routes/couriers.js`
- Modify: `01-camasirhane-erp/apps/api/server.js`

**Interfaces:**
- Produces:

| Metot | Yol | Rol | Gövde | Yanıt |
|-------|-----|-----|-------|-------|
| POST | `/api/payments` | admin, kasiyer | `{order_id, amount, method}` | `201 {payment, order:{id, total_amount, paid_amount, remaining}}` |
| GET | `/api/couriers/tasks?status=` | kurye → kendi görevleri, admin → tümü | — | `[{id, order_id, order_no, task_type, task_type_label, status, address, scheduled_at, customer_name, customer_phone, total_amount, paid_amount}]` |
| PUT | `/api/couriers/tasks/:id/status` | kurye (kendi görevi), admin | `{status, note}` | güncellenen görev |

**Kural (ödeme):** `amount` ≤ 0 → `400 { message: "Tutar sıfırdan büyük olmalıdır." }`. Kalan borçtan fazla ödeme → `400 { message: "Ödeme tutarı kalan borçtan fazla olamaz." }`. Ödeme sonrası `orders.paid_amount` yeniden hesaplanır (`SELECT COALESCE(SUM(amount),0) FROM payments WHERE order_id = $1`).

**Kural (kurye):** Görev `tamamlandi` yapılırsa `completed_at = NOW()` yazılır; görev tipi `teslim` ise sipariş `teslim_edildi` durumuna geçer ve `order_status_history`'ye `'Kurye teslim etti'` notuyla kayıt düşer. Kurye kendi görevi olmayan bir görevi güncellemeye çalışırsa `403 { message: "Bu görev size ait değil." }`.

- [ ] **Adım 1: `routes/payments.js` yaz**

```js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

router.post("/", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  const { order_id, amount, method } = req.body;
  const tutar = Number(amount);

  if (!order_id || !tutar || tutar <= 0) {
    return res.status(400).json({ message: "Tutar sıfırdan büyük olmalıdır." });
  }
  if (!["nakit", "kart", "havale"].includes(method)) {
    return res.status(400).json({ message: "Ödeme yöntemi nakit, kart veya havale olmalıdır." });
  }

  try {
    const siparis = await pool.query("SELECT total_amount, paid_amount FROM orders WHERE id = $1", [order_id]);
    if (siparis.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const kalan = Number(siparis.rows[0].total_amount) - Number(siparis.rows[0].paid_amount);
    if (tutar > kalan) {
      return res.status(400).json({ message: "Ödeme tutarı kalan borçtan fazla olamaz. Kalan: " + kalan.toFixed(2) + " ₺" });
    }

    const odeme = await pool.query(
      "INSERT INTO payments (order_id, amount, method, received_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [order_id, tutar, method, req.user.id]
    );

    const guncel = await pool.query(
      `UPDATE orders
       SET paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = $1)
       WHERE id = $1 RETURNING id, total_amount, paid_amount`,
      [order_id]
    );

    const o = guncel.rows[0];
    res.status(201).json({
      payment: odeme.rows[0],
      order: {
        id: o.id,
        total_amount: Number(o.total_amount),
        paid_amount: Number(o.paid_amount),
        remaining: Number(o.total_amount) - Number(o.paid_amount),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ödeme kaydedilemedi." });
  }
});

module.exports = router;
```

- [ ] **Adım 2: `routes/couriers.js` yaz**

```js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

const GOREV_ETIKETLERI = { alma: "Alma", teslim: "Teslim" };

// Kurye görev listesi
router.get("/tasks", async (req, res) => {
  try {
    let sql = `SELECT t.*, o.order_no, o.total_amount, o.paid_amount,
                      c.full_name AS customer_name, c.phone AS customer_phone
               FROM courier_tasks t
               JOIN orders o ON o.id = t.order_id
               JOIN customers c ON c.id = o.customer_id
               WHERE 1 = 1`;
    const params = [];

    // Kurye sadece kendi görevlerini görür
    if (req.user.role === "kurye") {
      params.push(req.user.id);
      sql += " AND t.courier_id = $" + params.length;
    }
    if (req.query.status) {
      params.push(req.query.status);
      sql += " AND t.status = $" + params.length;
    }
    sql += " ORDER BY t.scheduled_at";

    const result = await pool.query(sql, params);
    res.json(result.rows.map((g) => ({ ...g, task_type_label: GOREV_ETIKETLERI[g.task_type] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görevler getirilemedi." });
  }
});

// Görev durumunu güncelle
router.put("/tasks/:id/status", async (req, res) => {
  const { status, note } = req.body;
  if (!["bekliyor", "yolda", "tamamlandi", "basarisiz"].includes(status)) {
    return res.status(400).json({ message: "Geçersiz görev durumu." });
  }

  try {
    const gorev = await pool.query("SELECT * FROM courier_tasks WHERE id = $1", [req.params.id]);
    if (gorev.rows.length === 0) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }
    if (req.user.role === "kurye" && gorev.rows[0].courier_id !== req.user.id) {
      return res.status(403).json({ message: "Bu görev size ait değil." });
    }

    const guncel = await pool.query(
      `UPDATE courier_tasks
       SET status = $1, note = $2,
           completed_at = CASE WHEN $1 = 'tamamlandi' THEN NOW() ELSE completed_at END
       WHERE id = $3 RETURNING *`,
      [status, note || gorev.rows[0].note, req.params.id]
    );

    // Teslim görevi tamamlandıysa siparişi de teslim edildi yap
    if (status === "tamamlandi" && gorev.rows[0].task_type === "teslim") {
      await pool.query(
        "UPDATE orders SET status = 'teslim_edildi', delivered_at = NOW() WHERE id = $1",
        [gorev.rows[0].order_id]
      );
      await pool.query(
        "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'teslim_edildi', $2, 'Kurye teslim etti')",
        [gorev.rows[0].order_id, req.user.id]
      );
    }

    res.json(guncel.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görev güncellenemedi." });
  }
});

module.exports = router;
```

- [ ] **Adım 3: `server.js`'e bağla**

```js
app.use("/api/payments", require("./routes/payments"));
app.use("/api/couriers", require("./routes/couriers"));
```

- [ ] **Adım 4: Doğrula**

```bash
KTOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"kurye1","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
STOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"kasiyer1","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s "http://localhost:3101/api/couriers/tasks?status=bekliyor" -H "Authorization: Bearer $KTOKEN" | head -c 400
curl -s -X POST http://localhost:3101/api/payments -H "Authorization: Bearer $STOKEN" \
  -H "Content-Type: application/json" -d '{"order_id":1,"amount":50,"method":"nakit"}'
curl -s -X POST http://localhost:3101/api/payments -H "Authorization: Bearer $STOKEN" \
  -H "Content-Type: application/json" -d '{"order_id":1,"amount":99999,"method":"nakit"}'
```
Beklenen: 1) bekleyen görevler listesi · 2) `remaining` = toplam − 50 · 3) `Ödeme tutarı kalan borçtan fazla olamaz. Kalan: ... ₺`

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: ödemeler ve kurye görevleri"
```

---

## Görev 8: Raporlar

**Files:**
- Create: `01-camasirhane-erp/apps/api/routes/reports.js`
- Modify: `01-camasirhane-erp/apps/api/server.js`

**Interfaces:**
- Produces:

| Metot | Yol | Rol | Yanıt |
|-------|-----|-----|-------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | admin, kasiyer | `{date, order_count, total_amount, collected:{nakit, kart, havale, toplam}, delivered_count, orders:[{order_no, customer_name, total_amount, paid_amount, status}]}` |
| GET | `/api/reports/summary` | tümü | `{status_counts:{alindi, yikamada, utude, hazir, teslim_edildi}, today:{order_count, total_amount}, month:{order_count, total_amount}, pending_courier_tasks, unpaid_total, top_services:[{name, order_count, revenue}]}` |

`date` verilmezse bugün kullanılır. Gün sonu kasa raporu WinForms uygulamasının ana ekranından basılır.

- [ ] **Adım 1: `routes/reports.js` yaz**

```js
const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Gün sonu kasa raporu
router.get("/daily", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  const tarih = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const siparisler = await pool.query(
      `SELECT o.order_no, o.total_amount, o.paid_amount, o.status, c.full_name AS customer_name
       FROM orders o JOIN customers c ON c.id = o.customer_id
       WHERE DATE(o.created_at) = $1 ORDER BY o.created_at`,
      [tarih]
    );

    const tahsilat = await pool.query(
      `SELECT method, COALESCE(SUM(amount), 0) AS tutar
       FROM payments WHERE DATE(created_at) = $1 GROUP BY method`,
      [tarih]
    );

    const teslim = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE DATE(delivered_at) = $1",
      [tarih]
    );

    const kasa = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    tahsilat.rows.forEach((s) => {
      kasa[s.method] = Number(s.tutar);
      kasa.toplam += Number(s.tutar);
    });

    let ciro = 0;
    siparisler.rows.forEach((s) => (ciro += Number(s.total_amount)));

    res.json({
      date: tarih,
      order_count: siparisler.rows.length,
      total_amount: ciro,
      collected: kasa,
      delivered_count: Number(teslim.rows[0].count),
      orders: siparisler.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rapor hazırlanamadı." });
  }
});

// Yönetim paneli özeti
router.get("/summary", async (req, res) => {
  try {
    const durumlar = await pool.query("SELECT status, COUNT(*) FROM orders GROUP BY status");
    const bugun = await pool.query(
      "SELECT COUNT(*) AS adet, COALESCE(SUM(total_amount), 0) AS ciro FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    const ay = await pool.query(
      `SELECT COUNT(*) AS adet, COALESCE(SUM(total_amount), 0) AS ciro FROM orders
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`
    );
    const bekleyenGorev = await pool.query(
      "SELECT COUNT(*) FROM courier_tasks WHERE status IN ('bekliyor','yolda')"
    );
    const borc = await pool.query(
      `SELECT COALESCE(SUM(total_amount - paid_amount), 0) AS tutar FROM orders
       WHERE status <> 'iptal' AND total_amount > paid_amount`
    );
    const enCokHizmet = await pool.query(
      `SELECT s.name, COUNT(DISTINCT i.order_id) AS order_count, COALESCE(SUM(i.line_total), 0) AS revenue
       FROM order_items i JOIN services s ON s.id = i.service_id
       GROUP BY s.name ORDER BY revenue DESC LIMIT 5`
    );

    const durumSayilari = { alindi: 0, yikamada: 0, utude: 0, hazir: 0, teslim_edildi: 0, iptal: 0 };
    durumlar.rows.forEach((s) => (durumSayilari[s.status] = Number(s.count)));

    res.json({
      status_counts: durumSayilari,
      today: { order_count: Number(bugun.rows[0].adet), total_amount: Number(bugun.rows[0].ciro) },
      month: { order_count: Number(ay.rows[0].adet), total_amount: Number(ay.rows[0].ciro) },
      pending_courier_tasks: Number(bekleyenGorev.rows[0].count),
      unpaid_total: Number(borc.rows[0].tutar),
      top_services: enCokHizmet.rows.map((h) => ({
        name: h.name,
        order_count: Number(h.order_count),
        revenue: Number(h.revenue),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Özet hazırlanamadı." });
  }
});

module.exports = router;
```

- [ ] **Adım 2: `server.js`'e bağla**

```js
app.use("/api/reports", require("./routes/reports"));
```

- [ ] **Adım 3: Doğrula**

```bash
STOKEN=$(curl -s -X POST http://localhost:3101/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"kasiyer1","password":"123456"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s http://localhost:3101/api/reports/summary -H "Authorization: Bearer $STOKEN"
curl -s "http://localhost:3101/api/reports/daily?date=$(date +%F)" -H "Authorization: Bearer $STOKEN"
```
Beklenen: `summary` → `status_counts` altı durumu da içerir, `top_services` 5 kayıt · `daily` → `order_count` en az 2 (seed'in son siparişi + Görev 5'te oluşturulan sipariş) ve `collected.nakit` sıfırdan büyük (seed'de teslim edilmiş 2 siparişin tahsilatı + Görev 7'de eklenen 50 ₺).

- [ ] **Adım 4: Commit**

```bash
git add 01-camasirhane-erp/apps/api
git commit -m "Proje 1: gün sonu kasa raporu ve yönetim özeti"
```

---

## Görev 9: Web Yönetim Paneli — İskelet, Giriş ve Düzen

**Files:**
- Create: `01-camasirhane-erp/apps/web-admin/` (Vite React şablonu)
- Create: `.env.example`, `src/api.js`, `src/App.jsx`, `src/Layout.jsx`, `src/styles.css`, `src/pages/Login.jsx`

**Interfaces:**
- Consumes: API `POST /api/auth/login`, `GET /api/auth/me`
- Produces:
  - `src/api.js` → `export default api` (axios örneği, `baseURL = import.meta.env.VITE_API_URL`, istek interceptor'ı `localStorage.getItem("token")` değerini `Authorization` başlığına ekler, 401 yanıtında token'ı silip `/login`'e yönlendirir)
  - `src/api.js` → `export function getUser()` : `JSON.parse(localStorage.getItem("user"))` veya `null`
  - `Layout.jsx` → sol menü + üst bar, `<Outlet />` içerir

**Görsel dil (tüm sayfalarda aynı):** Tek `styles.css`, CSS framework yok. Ana renk `#1e6091` (koyu mavi), arka plan `#f4f6f8`, kart `#ffffff` + `border-radius: 8px` + hafif gölge. Yazı tipi `system-ui`. Durum rozetleri: Teslim Alındı `#6c757d`, Yıkamada `#0d6efd`, Ütüde `#fd7e14`, Hazır `#198754`, Teslim Edildi `#495057`, İptal `#dc3545`.

**Sol menü (Türkçe):** Panel · Siparişler · Yeni Sipariş · Müşteriler · Hizmetler · Raporlar · Çıkış

- [ ] **Adım 1: Vite projesini oluştur**

```bash
cd 01-camasirhane-erp/apps
npm create vite@latest web-admin -- --template react
cd web-admin
npm install
npm install axios react-router-dom
```

- [ ] **Adım 2: `.env.example` ve `.env` yaz, portu sabitle**

`.env.example`:
```
VITE_API_URL=http://localhost:3101/api
```

`vite.config.js` içinde `server: { port: 5101 }` ayarını ekle.

- [ ] **Adım 3: `src/api.js` yaz**

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Oturum düşerse giriş sayfasına at
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function getUser() {
  const kayit = localStorage.getItem("user");
  return kayit ? JSON.parse(kayit) : null;
}

export default api;
```

- [ ] **Adım 4: `src/pages/Login.jsx` yaz**

Ekran içeriği: ortalanmış kart, başlık **"Çamaşırhane Yönetim Paneli"**, alanlar **"Kullanıcı Adı"** ve **"Şifre"**, buton **"Giriş Yap"**. Hata durumunda kırmızı kutuda API'den gelen `message` gösterilir. Başarılı girişte `token` ve `user` `localStorage`'a yazılır, `navigate("/")` çağrılır. Kartın altında küçük gri yazı: `Demo: admin / 123456`.

- [ ] **Adım 5: `src/Layout.jsx` ve `src/App.jsx` yaz**

`Layout.jsx`: solda 220px sabit menü (yukarıdaki 7 madde, `NavLink` ile aktif olan vurgulanır), üstte giriş yapan kullanıcının `full_name` ve rolü. **Çıkış** `localStorage`'ı temizleyip `/login`'e gider.

`App.jsx` rotaları:

| Yol | Bileşen |
|-----|---------|
| `/login` | `Login` |
| `/` | `Dashboard` |
| `/siparisler` | `Orders` |
| `/siparisler/:id` | `OrderDetail` |
| `/yeni-siparis` | `NewOrder` |
| `/musteriler` | `Customers` |
| `/hizmetler` | `Services` |
| `/raporlar` | `Reports` |

`/login` dışındaki tüm rotalar `Layout` içinde ve korumalıdır: `getUser()` `null` ise `<Navigate to="/login" />`.

- [ ] **Adım 6: Doğrula**

Çalıştır: `cd 01-camasirhane-erp/apps/web-admin && npm run dev`
Tarayıcıda `http://localhost:5101` aç.
Beklenen: `/login`'e yönlendirir → `admin / 123456` ile giriş → sol menü ve üstte "Ahmet Yılmaz (admin)" görünür. Yanlış şifrede kırmızı kutuda "Kullanıcı adı veya şifre hatalı." çıkar.

- [ ] **Adım 7: Commit**

```bash
git add 01-camasirhane-erp/apps/web-admin
git commit -m "Proje 1: web paneli iskeleti, giriş ve düzen"
```

---

## Görev 10: Web Paneli — Panel, Siparişler ve Yeni Sipariş

**Files:**
- Create: `src/pages/Dashboard.jsx`, `src/pages/Orders.jsx`, `src/pages/OrderDetail.jsx`, `src/pages/NewOrder.jsx`

**Interfaces:**
- Consumes: `GET /api/reports/summary`, `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`, `POST /api/payments`, `GET /api/customers`, `GET /api/services?active=1`, `POST /api/orders`

- [ ] **Adım 1: `Dashboard.jsx` — "Panel"**

`GET /api/reports/summary` sonucundan:
- 4 özet kartı: **Bugünkü Sipariş** (`today.order_count`), **Bugünkü Ciro** (`today.total_amount` ₺), **Bekleyen Kurye Görevi** (`pending_courier_tasks`), **Tahsil Edilmemiş** (`unpaid_total` ₺)
- **"Aşamalara Göre Siparişler"** başlıklı satır: 5 durum rozeti ve sayıları (`status_counts`)
- **"En Çok Gelir Getiren Hizmetler"** tablosu: Hizmet · Sipariş Adedi · Gelir (₺)

- [ ] **Adım 2: `Orders.jsx` — "Siparişler"**

- Üstte filtre çubuğu: arama kutusu (`Sipariş no veya müşteri ara`), durum `<select>` (`Tümü` + 6 durum), tarih `<input type="date">`. Değişince `GET /api/orders?q=&status=&date=` çağrılır.
- Tablo sütunları: **Sipariş No · Müşteri · Telefon · Adet · Tutar · Ödenen · Durum · Teslim · Tarih**
- `Durum` sütunu renkli rozet; `Teslim` sütunu `magaza` → "Mağazadan", `kurye` → "Kurye".
- Satıra tıklayınca `/siparisler/:id`.
- Sonuç yoksa: **"Kayıt bulunamadı."**

- [ ] **Adım 3: `OrderDetail.jsx` — "Sipariş Detayı"**

`GET /api/orders/:id` ile dört bölüm:
1. **Sipariş Bilgileri** — sipariş no, oluşturan personel, oluşturma tarihi, söz verilen teslim tarihi, teslim tipi, notlar.
2. **Müşteri** — ad soyad, telefon, adres, ilçe.
3. **Kalemler** tablosu — Barkod · Hizmet · Miktar · Birim Fiyat · Tutar. Altında **Toplam / Ödenen / Kalan** satırı.
4. **Durum Geçmişi** — dikey liste: durum etiketi, değiştiren personel, tarih-saat.

İşlemler:
- **"Aşamayı Güncelle"**: `<select>` (6 durum) + **Kaydet** → `PUT /api/orders/:id/status`. Başarıda sayfa yeniden yüklenir; hata mesajı kırmızı kutuda gösterilir (örn. "Teslim edilmiş sipariş güncellenemez.").
- **"Ödeme Al"**: tutar `<input type="number">` + yöntem `<select>` (Nakit / Kart / Havale) + **Tahsil Et** → `POST /api/payments`. Kalan 0 ise buton gizlenir.

- [ ] **Adım 4: `NewOrder.jsx` — "Yeni Sipariş"**

- **Müşteri seçimi**: arama kutusuna yazıldıkça `GET /api/customers?q=` ile açılır liste; seçilen müşteri kart olarak gösterilir. Yanında **"+ Yeni Müşteri"** butonu; küçük form (Ad Soyad, Telefon, Adres, İlçe) → `POST /api/customers` ve otomatik seçilir.
- **Hizmet kalemleri**: `GET /api/services?active=1` ile dolan `<select>`, miktar girişi, **"Ekle"** butonu. Eklenen kalemler tabloda listelenir (Hizmet · Miktar · Birim Fiyat · Tutar · Sil). Toplam tutar canlı hesaplanır.
- **Teslim tipi** radyo: Mağazadan Teslim / Kurye ile Teslim. **Söz Verilen Tarih** `<input type="date">`. **Notlar** `<textarea>`.
- **"Siparişi Oluştur"** → `POST /api/orders`. Başarıda yeşil kutuda **"Sipariş oluşturuldu: SP-2026-000XX"** ve üretilen barkodların listesi gösterilir, ardından `/siparisler/:id`'ye yönlendirilir.
- Müşteri seçilmemişse veya kalem yoksa buton pasif.

- [ ] **Adım 5: Doğrula (tarayıcıda)**

1. Panel açılır, kartlar dolu → ✔
2. Siparişler'de durum filtresi `Hazır` seçilince liste 2 kayda düşer → ✔
3. Yeni Sipariş: Elif Şahin + "Gömlek Yıkama + Ütü" × 3 → oluşturulur, barkodlar gösterilir → ✔
4. Sipariş Detayı'nda aşamayı `Yıkamada` yap → geçmişe yeni satır düşer → ✔
5. Ödeme Al ile 100 ₺ nakit tahsil et → Kalan azalır → ✔
6. Teslim edilmiş bir siparişte aşama değiştirmeyi dene → kırmızı kutuda "Teslim edilmiş sipariş güncellenemez." → ✔

- [ ] **Adım 6: Commit**

```bash
git add 01-camasirhane-erp/apps/web-admin
git commit -m "Proje 1: panel, sipariş listesi, sipariş detayı ve yeni sipariş ekranları"
```

---

## Görev 11: Web Paneli — Müşteriler, Hizmetler ve Raporlar

**Files:**
- Create: `src/pages/Customers.jsx`, `src/pages/Services.jsx`, `src/pages/Reports.jsx`

**Interfaces:**
- Consumes: `GET/POST/PUT /api/customers`, `GET/POST/PUT /api/services`, `GET /api/reports/daily?date=`

- [ ] **Adım 1: `Customers.jsx` — "Müşteriler"**

Arama kutusu + tablo: **Ad Soyad · Telefon · İlçe · Adres · Sipariş Sayısı · İşlem**. **"+ Yeni Müşteri"** butonu formu açar (Ad Soyad*, Telefon*, Adres, İlçe, Notlar). Satırdaki **Düzenle** aynı formu dolu açar → `PUT`. Zorunlu alan boşsa API'den gelen "Ad soyad ve telefon zorunludur." mesajı gösterilir.

- [ ] **Adım 2: `Services.jsx` — "Hizmetler ve Fiyatlar"**

Tablo: **Hizmet Adı · Kategori · Birim · Fiyat (₺) · Durum · İşlem**. Kategori etiketleri: `yikama` → Yıkama, `kuru_temizleme` → Kuru Temizleme, `utu` → Ütü, `leke` → Leke Çıkarma. Birim etiketleri: `adet` → Adet, `kg` → Kg, `m2` → m². **"+ Yeni Hizmet"** ve **Düzenle** formları (Hizmet Adı, Kategori, Birim, Fiyat, Aktif onay kutusu). Sadece `admin` rolünde butonlar görünür; `getUser().role !== "admin"` ise gizlenir.

- [ ] **Adım 3: `Reports.jsx` — "Gün Sonu Raporu"**

Tarih seçici (varsayılan bugün) → `GET /api/reports/daily?date=`. Gösterilen bölümler:
- Üst kartlar: **Sipariş Adedi**, **Toplam Ciro (₺)**, **Teslim Edilen**, **Kasa Toplamı (₺)**
- **Tahsilat Dağılımı**: Nakit / Kart / Havale tutarları
- **Günün Siparişleri** tablosu: Sipariş No · Müşteri · Tutar · Ödenen · Durum
- **"Yazdır"** butonu → `window.print()`. `styles.css` içine `@media print` kuralı: sol menü ve butonlar gizlenir.

- [ ] **Adım 4: Doğrula (tarayıcıda)**

1. Müşteriler'de "Kadıköy" ara → 3 kayıt → ✔
2. Yeni müşteri ekle → listede görünür → ✔
3. Hizmetler'de bir fiyatı 45 → 50 yap → tabloda güncellenir; Yeni Sipariş ekranında yeni fiyat gelir → ✔
4. `kasiyer1` ile giriş yap → Hizmetler'de "+ Yeni Hizmet" butonu görünmez → ✔
5. Raporlar'da bugünü seç → kartlar dolu, Yazdır önizlemesinde menü görünmüyor → ✔

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp/apps/web-admin
git commit -m "Proje 1: müşteri, hizmet ve rapor ekranları"
```

---

## Görev 12: Mobil Uygulama — İskelet, Giriş Ekranı ve Yönlendirme

**Files:**
- Create: `01-camasirhane-erp/apps/mobile/` (Expo şablonu)
- Create: `src/api.js`, `src/screens/HomeScreen.js`, `src/screens/LoginScreen.js`
- Modify: `App.js`

**Interfaces:**
- Consumes: `POST /api/auth/login`
- Produces:
  - `src/api.js` → `export default api` (axios, `baseURL` `src/api.js` içinde sabit: `http://10.0.2.2:3101/api` — Android emülatöründen ana makineye erişim adresi), `export async function saveSession(token, user)`, `export async function getSession()`, `export async function clearSession()` (`@react-native-async-storage/async-storage` kullanır)
  - Navigasyon yığını: `Home` → `Login` → `CourierTasks` → `TaskDetail`; `Home` → `TrackOrder`

**Uygulama iki ayrı kullanıcıya hizmet eder:**
1. **Kurye** — giriş yapar, görev listesini görür ve durum günceller.
2. **Müşteri** — giriş yapmaz, sipariş numarası veya barkod ile siparişini takip eder.

- [ ] **Adım 1: Expo projesini oluştur**

```bash
cd 01-camasirhane-erp/apps
npx create-expo-app@latest mobile --template blank
cd mobile
npx expo install @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage
npm install axios
```

- [ ] **Adım 2: `src/api.js` yaz**

```js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur
const api = axios.create({
  baseURL: "http://10.0.2.2:3101/api",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export async function saveSession(token, user) {
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function getSession() {
  const token = await AsyncStorage.getItem("token");
  const user = await AsyncStorage.getItem("user");
  return token ? { token: token, user: JSON.parse(user) } : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove(["token", "user"]);
}

export default api;
```

- [ ] **Adım 3: `src/screens/HomeScreen.js` yaz**

Tam ekran, ortalanmış: üstte başlık **"Çamaşırhane"**, altında iki büyük buton:
- **"Sipariş Takibi"** (mavi, `#1e6091`) → `TrackOrder` ekranına gider
- **"Kurye Girişi"** (gri çerçeveli) → `Login` ekranına gider

Ekran açılırken `getSession()` çağrılır; oturum varsa doğrudan `CourierTasks`'a yönlendirilir.

- [ ] **Adım 4: `src/screens/LoginScreen.js` yaz**

Başlık **"Kurye Girişi"**, alanlar **"Kullanıcı Adı"** ve **"Şifre"** (`secureTextEntry`), buton **"Giriş Yap"**. Başarıda `saveSession` çağrılır ve `navigation.replace("CourierTasks")`. Hata varsa kırmızı metinde API'den gelen `message` gösterilir. Altında gri yazı: `Demo: kurye1 / 123456`. Rolü `kurye` olmayan kullanıcı girerse: **"Bu uygulama sadece kuryeler içindir."**

- [ ] **Adım 5: `App.js` — navigasyonu kur**

`NavigationContainer` + `createNativeStackNavigator`. Ekranlar ve Türkçe başlıkları:

| Ekran adı | Başlık |
|-----------|--------|
| `Home` | (başlık gizli) |
| `Login` | Kurye Girişi |
| `CourierTasks` | Görevlerim |
| `TaskDetail` | Görev Detayı |
| `TrackOrder` | Sipariş Takibi |

- [ ] **Adım 6: Emülatörde doğrula**

```bash
emulator -avd Pixel_4_API_33 &
cd 01-camasirhane-erp/apps/mobile && npx expo start --android
```
Beklenen: Ana ekranda iki buton görünür; `kurye1 / 123456` ile giriş yapılır ve "Görevlerim" ekranına geçilir (henüz boş olabilir). `admin / 123456` denenince "Bu uygulama sadece kuryeler içindir." çıkar.

- [ ] **Adım 7: Commit**

```bash
git add 01-camasirhane-erp/apps/mobile
git commit -m "Proje 1: mobil uygulama iskeleti ve kurye girişi"
```

---

## Görev 13: Mobil — Kurye Görev Akışı

**Files:**
- Create: `src/screens/CourierTasksScreen.js`, `src/screens/TaskDetailScreen.js`

**Interfaces:**
- Consumes: `GET /api/couriers/tasks`, `PUT /api/couriers/tasks/:id/status`, `POST /api/payments`

- [ ] **Adım 1: `CourierTasksScreen.js` yaz**

- Üstte sekme şeklinde durum filtresi: **Bekleyen · Yolda · Tamamlanan** (`status=bekliyor|yolda|tamamlandi`).
- `FlatList` kartları: **sipariş no** (kalın), **müşteri adı**, **telefon**, **adres**, sağ üstte görev tipi rozeti (**Alma** / **Teslim**), altta **tutar ₺** ve ödeme durumu (`paid_amount >= total_amount` ? "Ödendi" : "Tahsilat: X ₺").
- Aşağı çekerek yenileme (`RefreshControl`).
- Liste boşsa ortada: **"Görev bulunmuyor."**
- Karta dokununca `TaskDetail` ekranına `task` nesnesi ile gidilir.
- Sağ üstte **"Çıkış"** butonu → `clearSession()` + `navigation.replace("Home")`.

- [ ] **Adım 2: `TaskDetailScreen.js` yaz**

Bölümler:
1. **Sipariş** — sipariş no, görev tipi, planlanan tarih-saat.
2. **Müşteri** — ad soyad, telefon (dokununca `Linking.openURL("tel:...")`), adres.
3. **Tutar** — toplam, ödenen, kalan.

Butonlar (görev durumuna göre):
- Durum `bekliyor` → **"Yola Çıktım"** → `PUT .../status {status:"yolda"}`
- Durum `yolda` → **"Teslim Ettim"** → önce kalan borç varsa **"Tahsilat"** kutusu açılır (tutar önceden kalan borçla dolu, yöntem: Nakit / Kart) ve `POST /api/payments` çağrılır; ardından `PUT .../status {status:"tamamlandi"}`. Kalan borç yoksa doğrudan tamamlanır.
- Durum `yolda` → **"Teslim Edilemedi"** (kırmızı) → not girişi zorunlu → `PUT .../status {status:"basarisiz", note:"..."}`
- Durum `tamamlandi` → buton yok, yeşil kutuda **"Bu görev tamamlandı."**

Her işlemden sonra `navigation.goBack()` ve liste yenilenir. Hata olursa `Alert.alert("Hata", message)`.

- [ ] **Adım 3: Emülatörde doğrula**

1. `kurye1` ile giriş → **Bekleyen** sekmesinde seed'den gelen görevler listelenir → ✔
2. Bir göreve gir → **"Yola Çıktım"** → listede **Yolda** sekmesine geçer → ✔
3. Aynı göreve gir → **"Teslim Ettim"** → tahsilat kutusu açılır → tahsil et → görev **Tamamlanan**'a düşer → ✔
4. Web panelinde aynı siparişin durumu **Teslim Edildi** ve geçmişte "Kurye teslim etti" notu görünür → ✔
5. Ekran görüntülerini al (`adb exec-out screencap -p > ekran.png`) → README için sakla

- [ ] **Adım 4: Commit**

```bash
git add 01-camasirhane-erp/apps/mobile
git commit -m "Proje 1: kurye görev listesi ve teslimat akışı"
```

---

## Görev 14: Mobil — Müşteri Sipariş Takibi

**Files:**
- Create: `src/screens/TrackOrderScreen.js`

**Interfaces:**
- Consumes: `GET /api/track/:code` (token gerektirmez)

- [ ] **Adım 1: `TrackOrderScreen.js` yaz**

- Üstte açıklama: **"Sipariş numaranızı veya etiket barkodunuzu girin."**
- `TextInput` (`autoCapitalize="characters"`, örnek metin `SP-2026-00001`) + **"Sorgula"** butonu.
- Sonuç kartı:
  - Sipariş no (büyük, kalın)
  - Mevcut durum renkli rozet (web panelindeki renklerle aynı)
  - **"Söz Verilen Teslim Tarihi"** (GG.AA.YYYY)
  - **"Parça Sayısı"**
  - **"Sipariş Aşamaları"** — dikey zaman çizelgesi: her `history` kaydı için nokta + `status_label` + `changed_at` (GG.AA.YYYY SS:dd). Son kayıt vurgulanır.
- Bulunamazsa kırmızı metinde API'den gelen mesaj: **"Sipariş bulunamadı. Lütfen numarayı kontrol edin."**
- Boş girişte sorgu atılmaz, uyarı: **"Lütfen sipariş numarası girin."**

- [ ] **Adım 2: Emülatörde doğrula**

1. Ana ekran → **Sipariş Takibi** → `SP-2026-00001` gir → durum ve aşama çizelgesi görünür → ✔
2. Barkod `SP-2026-00001-01` gir → aynı sipariş gelir → ✔
3. `YOK-999` gir → "Sipariş bulunamadı. Lütfen numarayı kontrol edin." → ✔
4. Ekran görüntüsü al

- [ ] **Adım 3: Commit**

```bash
git add 01-camasirhane-erp/apps/mobile
git commit -m "Proje 1: müşteri sipariş takip ekranı"
```

---

## Görev 15: WinForms Kasa — API İstemcisi, Giriş ve Ana Ekran

> **ÖN KOŞUL:** `tools/scaffold-winforms.ps1` Windows'ta çalıştırılmış ve
> `01-camasirhane-erp/apps/desktop-winforms/CamasirhaneKasa/` depoya gelmiş olmalı
> (`docs/windows-handoff.md`). Kod Mac'te yazılır, **derleme ve çalıştırma Windows'ta** yapılır.

**Files:**
- Modify: `CamasirhaneKasa/CamasirhaneKasa.csproj` (NuGet paketleri)
- Create: `CamasirhaneKasa/ApiClient.cs`, `CamasirhaneKasa/LoginForm.cs`
- Modify: `CamasirhaneKasa/Form1.cs` → `MainForm.cs`, `CamasirhaneKasa/Program.cs`

**Interfaces:**
- Produces:
  - `static class ApiClient` — alanlar `BaseUrl` (`"http://localhost:3101/api"`), `Token`, `UserId`, `UserName`, `Role`
  - `static Task<JsonElement> GetAsync(string yol)`
  - `static Task<JsonElement> PostAsync(string yol, object govde)`
  - `static Task<JsonElement> PutAsync(string yol, object govde)`
  - Hata durumunda `ApiException` fırlatır; `ApiException.Message` API'nin döndürdüğü Türkçe `message` alanıdır.

- [ ] **Adım 1: NuGet paketlerini ekle (Windows'ta)**

Sürüm numarası elle yazılmaz; NuGet en güncel uyumlu sürümü seçsin:

```powershell
cd 01-camasirhane-erp/apps/desktop-winforms/CamasirhaneKasa
dotnet add package ZXing.Net
dotnet add package ZXing.Windows.Compatibility
```

`.csproj` içine eklenen `PackageReference` satırları commit edilir.

**Doğrulama:** `dotnet build` hatasız geçmeli. `ZXing.Windows.Compatibility` paketi
bulunamazsa alternatifi denenir: `dotnet add package ZXing.Net.Bindings.Windows.Compatibility`
(ikisi de `System.Drawing.Bitmap` üreten `BarcodeWriter` sınıfını sağlar; hangisi
kuruluysa Görev 16'daki `using` satırı ona göre yazılır — sırasıyla
`using ZXing.Windows.Compatibility;` veya `using ZXing.Rendering;`).

`System.Net.Http.Json` ve `System.Text.Json` .NET 9'da yerleşiktir, paket gerekmez.

- [ ] **Adım 2: `ApiClient.cs` yaz**

```csharp
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace CamasirhaneKasa
{
    // API'den dönen Türkçe hata mesajını taşır
    public class ApiException : Exception
    {
        public ApiException(string mesaj) : base(mesaj) { }
    }

    public static class ApiClient
    {
        public static string BaseUrl = "http://localhost:3101/api";
        public static string Token = "";
        public static int UserId;
        public static string UserName = "";
        public static string Role = "";

        private static readonly HttpClient http = new HttpClient();

        private static void TokenEkle()
        {
            http.DefaultRequestHeaders.Remove("Authorization");
            if (!string.IsNullOrEmpty(Token))
                http.DefaultRequestHeaders.Add("Authorization", "Bearer " + Token);
        }

        private static async Task<JsonElement> YanitiOku(HttpResponseMessage yanit)
        {
            string metin = await yanit.Content.ReadAsStringAsync();
            JsonElement govde = JsonDocument.Parse(metin).RootElement;

            if (!yanit.IsSuccessStatusCode)
            {
                string mesaj = "Sunucu hatası oluştu.";
                if (govde.TryGetProperty("message", out JsonElement m))
                    mesaj = m.GetString();
                throw new ApiException(mesaj);
            }
            return govde;
        }

        public static async Task<JsonElement> GetAsync(string yol)
        {
            TokenEkle();
            var yanit = await http.GetAsync(BaseUrl + yol);
            return await YanitiOku(yanit);
        }

        public static async Task<JsonElement> PostAsync(string yol, object govde)
        {
            TokenEkle();
            var yanit = await http.PostAsJsonAsync(BaseUrl + yol, govde);
            return await YanitiOku(yanit);
        }

        public static async Task<JsonElement> PutAsync(string yol, object govde)
        {
            TokenEkle();
            var yanit = await http.PutAsJsonAsync(BaseUrl + yol, govde);
            return await YanitiOku(yanit);
        }
    }
}
```

- [ ] **Adım 3: `LoginForm.cs` yaz**

Form başlığı **"Çamaşırhane Kasa — Giriş"**, 380×260, ortalanmış, `FormBorderStyle.FixedDialog`.
Kontroller: `Label` "Kullanıcı Adı", `TextBox txtKullanici`; `Label` "Şifre", `TextBox txtSifre` (`UseSystemPasswordChar = true`); `Button btnGiris` ("Giriş Yap", `AcceptButton`); `Label lblHata` (kırmızı, başlangıçta boş); altta gri `Label`: "Demo: kasiyer1 / 123456".

`btnGiris` tıklamasında `POST /auth/login` çağrılır; başarıda `ApiClient.Token/UserId/UserName/Role` doldurulur, `DialogResult = DialogResult.OK`. `ApiException` yakalanır ve `lblHata.Text` yapılır. Rolü `kurye` olan kullanıcı için: "Kasa uygulamasına kurye girişi yapılamaz."

- [ ] **Adım 4: `Program.cs`'i güncelle**

Önce `LoginForm` `ShowDialog()` ile açılır; `DialogResult.OK` değilse uygulama kapanır, aksi hâlde `Application.Run(new MainForm())`.

- [ ] **Adım 5: `MainForm.cs` yaz**

Form başlığı **"Çamaşırhane Kasa"**, 1000×650. Üstte `MenuStrip`:

| Menü | Alt menüler |
|------|-------------|
| **Sipariş** | Yeni Sipariş · Sipariş Ara · Çıkış |
| **İşlemler** | Barkod ile Aşama Güncelle |
| **Raporlar** | Gün Sonu Raporu |

Ortada büyük butonlarla aynı işlemler: **Yeni Sipariş**, **Barkod Okut**, **Gün Sonu Raporu**.
Sağ altta `StatusStrip`: giriş yapan kullanıcının adı ve rolü, saat.
Sol tarafta **"Bugünkü Siparişler"** `DataGridView` — `GET /orders?date=<bugün>` ile dolar; sütunlar: Sipariş No · Müşteri · Tutar · Durum. Form açılışında ve her işlem sonrası yenilenir.

- [ ] **Adım 6: Windows'ta derle ve doğrula**

```powershell
cd 01-camasirhane-erp/apps/desktop-winforms
dotnet build CamasirhaneKasa.sln
dotnet run --project CamasirhaneKasa
```
Beklenen: Giriş penceresi açılır → `kasiyer1 / 123456` → ana ekran açılır, bugünkü siparişler tablosu dolar. Yanlış şifrede kırmızı hata yazısı çıkar. API kapalıyken: "Sunucu hatası oluştu." benzeri mesaj gösterilir, uygulama çökmez.

- [ ] **Adım 7: Commit**

```bash
git add 01-camasirhane-erp/apps/desktop-winforms
git commit -m "Proje 1: kasa uygulaması API istemcisi, giriş ve ana ekran"
```

---

## Görev 16: WinForms Kasa — Yeni Sipariş ve Barkod Etiket Basımı

**Files:**
- Create: `CamasirhaneKasa/NewOrderForm.cs`, `CamasirhaneKasa/LabelPrintForm.cs`

**Interfaces:**
- Consumes: `ApiClient`, `GET /customers?q=`, `POST /customers`, `GET /services?active=1`, `POST /orders`
- Produces: `LabelPrintForm(List<(string Barkod, string Musteri, string Hizmet, string SiparisNo, DateTime Tarih)> etiketler)`

- [ ] **Adım 1: `NewOrderForm.cs` yaz**

Başlık **"Yeni Sipariş"**, 900×640. Üç bölüm:

**1. Müşteri** — `TextBox txtMusteriAra` + `Button btnAra` ("Ara") → `GET /customers?q=` sonucu `ComboBox cmbMusteri`'ye doldurulur (`Ad Soyad — Telefon` biçiminde). `Button btnYeniMusteri` ("Yeni Müşteri") küçük bir alt form açar (Ad Soyad, Telefon, Adres, İlçe) → `POST /customers` → yeni müşteri seçili gelir.

**2. Kalemler** — `ComboBox cmbHizmet` (`GET /services?active=1`, `Ad (Birim) — Fiyat ₺`), `NumericUpDown numMiktar` (min 0,5, artış 0,5), `Button btnEkle` ("Ekle"). Eklenen kalemler `DataGridView dgvKalemler`'de: Hizmet · Miktar · Birim Fiyat · Tutar · (Sil butonu sütunu). Altta kalın `Label lblToplam`: **"Toplam: 0,00 ₺"** — her eklemede/silmede güncellenir.

**3. Teslim** — `RadioButton` "Mağazadan Teslim" / "Kurye ile Teslim"; `DateTimePicker dtpSozVerilen` ("Söz Verilen Tarih", varsayılan bugün + 2 gün); `TextBox txtNot` (çok satırlı, "Notlar").

`Button btnKaydet` ("Siparişi Oluştur"): müşteri seçili değilse "Lütfen müşteri seçin.", kalem yoksa "Siparişe en az bir hizmet ekleyin." uyarısı (`MessageBox`). Başarıda `POST /orders` yanıtındaki `order_no` ve `items` alınır, `MessageBox` ile **"Sipariş oluşturuldu: SP-2026-000XX"** gösterilir ve `LabelPrintForm` açılır.

- [ ] **Adım 2: `LabelPrintForm.cs` — barkod etiketi çizimi ve önizleme**

Etiket boyutu: 60 mm × 40 mm (`PrintDocument.DefaultPageSettings.PaperSize = new PaperSize("Etiket", 236, 157)` — yüzde-inç birimi).

Her etikette, yukarıdan aşağıya:
1. Üstte küçük punto **"ÇAMAŞIRHANE"**
2. Müşteri adı (kalın, 10pt)
3. Hizmet adı (8pt)
4. Code128 barkod görüntüsü (ZXing ile üretilir)
5. Barkod metni (8pt, ortalanmış)
6. Sipariş tarihi (7pt, GG.AA.YYYY)

Barkod üretimi:

```csharp
using ZXing;
using ZXing.Windows.Compatibility;

private Bitmap BarkodUret(string metin)
{
    var yazici = new BarcodeWriter
    {
        Format = BarcodeFormat.CODE_128,
        Options = new ZXing.Common.EncodingOptions
        {
            Width = 220,
            Height = 60,
            Margin = 2,
            PureBarcode = true
        }
    };
    return yazici.Write(metin);
}
```

`PrintDocument.PrintPage` olayında sıradaki etiket çizilir; `e.HasMorePages = (sonrakiIndeks < etiketler.Count)`. Formda `PrintPreviewControl` gömülü olarak önizleme gösterilir; **"Yazdır"** butonu `PrintDialog` açar, **"Kapat"** formu kapatır.

> Kapsam notu (spec "Out of scope"): gerçek termal yazıcı bağlanmaz; teslim edilen şey yazdırma önizlemesi ve `PrintDialog`'dur.

- [ ] **Adım 3: Windows'ta doğrula**

1. Ana ekran → **Yeni Sipariş** → "Elif" ara → müşteri seç → "Gömlek Yıkama + Ütü" × 3 ekle → Toplam **135,00 ₺** görünür → ✔
2. **Siparişi Oluştur** → sipariş no mesajı → etiket önizleme penceresi açılır, 1 etiket barkodla birlikte görünür → ✔
3. İki farklı hizmet ekleyip kaydet → önizlemede **2 sayfa** (2 etiket) → ✔
4. Müşteri seçmeden kaydetmeyi dene → "Lütfen müşteri seçin." → ✔
5. Web panelinde yeni siparişin göründüğünü doğrula → ✔
6. Ekran görüntüsü al (Windows: `Win + Shift + S`) → README için sakla

- [ ] **Adım 4: Commit**

```bash
git add 01-camasirhane-erp/apps/desktop-winforms
git commit -m "Proje 1: kasa yeni sipariş ekranı ve barkod etiket basımı"
```

---

## Görev 17: WinForms Kasa — Barkod ile Aşama Güncelleme ve Gün Sonu Raporu

**Files:**
- Create: `CamasirhaneKasa/ScanStageForm.cs`, `CamasirhaneKasa/DailyReportForm.cs`

**Interfaces:**
- Consumes: `GET /orders/barcode/:barcode`, `PUT /orders/barcode/:barcode/status`, `GET /reports/daily?date=`

- [ ] **Adım 1: `ScanStageForm.cs` yaz**

Başlık **"Barkod ile Aşama Güncelle"**, 700×480.

- Üstte büyük `TextBox txtBarkod` (18pt, forma odaklanınca otomatik seçili). Barkod okuyucu klavye gibi davranıp sonuna `Enter` yolladığı için `KeyDown` olayında `Keys.Enter` yakalanır ve sorgu atılır (`GET /orders/barcode/:barcode`).
- Sorgu sonucu kart hâlinde gösterilir: **Sipariş No**, **Müşteri**, **Telefon**, **Parça**, **Mevcut Durum** (renkli).
- `ComboBox cmbYeniDurum` — 5 seçenek: Teslim Alındı / Yıkamada / Ütüde / Hazır / Teslim Edildi. Mevcut durumun bir sonrakine otomatik konumlanır.
- `Button btnGuncelle` ("Aşamayı Güncelle") → `PUT /orders/barcode/:barcode/status`. Başarıda yeşil `Label`: **"Güncellendi: <yeni durum>"**, `txtBarkod` temizlenir ve tekrar odaklanır (arka arkaya okutma için).
- Hata durumunda kırmızı `Label`: API mesajı ("Bu barkoda ait kayıt bulunamadı." / "Teslim edilmiş sipariş güncellenemez.").
- Altta `ListBox lstGecmis` — bu oturumda okutulan barkodların listesi (`SS:dd — barkod — yeni durum`).

- [ ] **Adım 2: `DailyReportForm.cs` yaz**

Başlık **"Gün Sonu Kasa Raporu"**, 900×700.

- Üstte `DateTimePicker dtpTarih` (varsayılan bugün) + `Button btnGetir` ("Getir") → `GET /reports/daily?date=`.
- Özet kutuları: **Sipariş Adedi**, **Toplam Ciro (₺)**, **Teslim Edilen**, **Kasa Toplamı (₺)**.
- **Tahsilat Dağılımı**: Nakit / Kart / Havale satırları.
- `DataGridView dgvSiparisler`: Sipariş No · Müşteri · Tutar · Ödenen · Durum.
- `Button btnYazdir` ("Yazdır") → `PrintDocument` ile A4 rapor çıktısı: başlık "GÜN SONU KASA RAPORU", tarih, özet satırları, sipariş tablosu, en altta imza satırı **"Kasiyer: <ad soyad>"**. `PrintPreviewDialog` ile önizlenir.

- [ ] **Adım 3: Windows'ta doğrula**

1. Ana ekran → **Barkod Okut** → `SP-2026-00002-01` yaz + Enter → sipariş kartı gelir → ✔
2. Yeni durum **Ütüde** → Güncelle → yeşil onay, geçmiş listesine satır düşer → ✔
3. Olmayan barkod yaz → "Bu barkoda ait kayıt bulunamadı." → ✔
4. Teslim edilmiş bir siparişin barkodunu okut ve güncellemeyi dene → "Teslim edilmiş sipariş güncellenemez." → ✔
5. **Gün Sonu Raporu** → bugünü getir → kartlar ve tablo dolu → **Yazdır** önizlemesi açılır → ✔
6. Ekran görüntülerini al

- [ ] **Adım 4: Commit**

```bash
git add 01-camasirhane-erp/apps/desktop-winforms
git commit -m "Proje 1: barkod ile aşama güncelleme ve gün sonu kasa raporu"
```

---

## Görev 18: Türkçe README, Ekran Görüntüleri ve Plan Güncellemesi

**Files:**
- Create: `01-camasirhane-erp/README.md`
- Create: `01-camasirhane-erp/docs/ekranlar/` (ekran görüntüleri)
- Modify: `plan.md`

- [ ] **Adım 1: Ekran görüntülerini topla**

`01-camasirhane-erp/docs/ekranlar/` altına en az 8 görüntü:
`web-panel.png`, `web-siparisler.png`, `web-yeni-siparis.png`, `web-rapor.png`,
`kasa-ana-ekran.png`, `kasa-etiket.png`, `mobil-kurye.png`, `mobil-takip.png`

- [ ] **Adım 2: `README.md` yaz**

Bölümler:
1. **Proje Hakkında** — çamaşırhane iş akışının 3-4 cümlelik özeti.
2. **Sistem Mimarisi** — 4 uygulamayı ve API'nin merkezî rolünü anlatan kısa metin + basit ASCII şema.
3. **Kullanılan Teknolojiler** — tablo (uygulama · teknoloji · klasör).
4. **Kurulum** — sırasıyla: PostgreSQL kurulumu ve veritabanı oluşturma, `db/schema.sql` çalıştırma, API (`npm install`, `.env`, `npm run seed`, `npm run dev`), web paneli (`npm install`, `npm run dev`), mobil (`npx expo start --android`), kasa uygulaması (Windows: `dotnet run`). Her adım kopyalanabilir komut bloğu.
5. **Demo Hesapları** — tablo: `admin / 123456` (Yönetici), `kasiyer1 / 123456` (Kasiyer), `kurye1 / 123456` (Kurye).
6. **Ekran Görüntüleri** — `docs/ekranlar/` görselleri başlıklarıyla.
7. **Özellikler** — madde madde: sipariş alma, aşama takibi, barkod etiket basımı, barkod okutarak aşama güncelleme, kurye görev yönetimi, tahsilat, müşteri sipariş takibi, gün sonu kasa raporu.
8. **API Uçları** — tablo (metot · yol · açıklama).
9. **Veritabanı Şeması** — 8 tablonun kısa açıklaması.

- [ ] **Adım 3: `plan.md`'yi güncelle**

- §1 tablosunda Proje 1 durumunu **✅ Tamamlandı** yap (WinForms Windows'a gitmediyse **🔵 Windows bekliyor**).
- §7 Proje 1 bölümündeki 4 uygulamanın durumunu işaretle.
- §5 Windows devri durumunu güncelle.
- §9 Değişiklik Günlüğü'ne satır ekle.

- [ ] **Adım 4: Tüm sistemi baştan sona doğrula**

Temiz bir kurulum senaryosu:
```bash
PGPASSWORD=laundry123 psql -h localhost -U laundry_user -d laundry_erp -f 01-camasirhane-erp/db/schema.sql
cd 01-camasirhane-erp/apps/api && npm run seed && npm run dev
```
Ardından README'deki adımları **birebir takip ederek** web ve mobil uygulamaları ayağa kaldır.
Beklenen: README'de eksik/yanlış adım yok, üç uygulama da çalışıyor.

- [ ] **Adım 5: Commit**

```bash
git add 01-camasirhane-erp plan.md
git commit -m "Proje 1: Türkçe README, ekran görüntüleri ve plan güncellemesi"
```

---

## Görev Özeti

| # | Görev | Uygulama | Bağımlılık |
|---|-------|----------|------------|
| 0 | Ortam kurulumu | — | — |
| 1 | Veritabanı şeması | db | 0 |
| 2 | API iskeleti + giriş | api | 1 |
| 3 | Demo verisi | api | 2 |
| 4 | Müşteri + hizmet uçları | api | 3 |
| 5 | Sipariş oluşturma/listeleme | api | 4 |
| 6 | Aşama + barkod + takip | api | 5 |
| 7 | Ödeme + kurye görevleri | api | 6 |
| 8 | Raporlar | api | 7 |
| 9 | Web iskeleti + giriş | web-admin | 8 |
| 10 | Panel, siparişler, yeni sipariş | web-admin | 9 |
| 11 | Müşteri, hizmet, rapor ekranları | web-admin | 10 |
| 12 | Mobil iskelet + kurye girişi | mobile | 8 |
| 13 | Kurye görev akışı | mobile | 12 |
| 14 | Müşteri takip ekranı | mobile | 12 |
| 15 | Kasa API istemcisi + giriş | desktop-winforms | 8 + **Windows iskeleti** |
| 16 | Yeni sipariş + etiket basımı | desktop-winforms | 15 |
| 17 | Barkod okutma + gün sonu raporu | desktop-winforms | 15 |
| 18 | README + ekran görüntüleri | tümü | 11, 14, 17 |

Görev 9-11 (web), 12-14 (mobil) ve 15-17 (kasa) birbirinden bağımsızdır; hepsi yalnızca Görev 8'in bitmesini bekler.
