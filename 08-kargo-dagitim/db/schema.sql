-- Kargo & Son Kilometre Dağıtım — veritabanı şeması
-- Çalıştırma:  psql -U courier_user -d courier_db -f db/schema.sql

DROP TABLE IF EXISTS cod_collections CASCADE;
DROP TABLE IF EXISTS manifest_items CASCADE;
DROP TABLE IF EXISTS manifests CASCADE;
DROP TABLE IF EXISTS shipment_events CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- Şubeler
CREATE TABLE branches (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(10) NOT NULL UNIQUE,   -- IST-KAD
  name        VARCHAR(80) NOT NULL,
  city        VARCHAR(50) NOT NULL DEFAULT 'İstanbul',
  districts   TEXT NOT NULL,                 -- virgülle ayrılmış hizmet ilçeleri
  address     VARCHAR(200),
  phone       VARCHAR(30),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tacirler (gönderici firmalar)
CREATE TABLE merchants (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(10) NOT NULL UNIQUE, -- TCR-001
  company_name   VARCHAR(120) NOT NULL,
  contact_name   VARCHAR(80),
  phone          VARCHAR(30),
  email          VARCHAR(120),
  address        VARCHAR(200),
  district       VARCHAR(50),
  -- Anlaşmalı taşıma ücreti ve kapıda ödeme komisyon oranı
  base_price     NUMERIC(10,2) NOT NULL DEFAULT 90,
  price_per_desi NUMERIC(10,2) NOT NULL DEFAULT 12,
  cod_commission NUMERIC(5,2)  NOT NULL DEFAULT 2,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Personel ve tacir kullanıcıları
-- role: admin | operasyon | kurye | tacir
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(80) NOT NULL,
  username      VARCHAR(40) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL,
  phone         VARCHAR(30),
  branch_id     INTEGER REFERENCES branches(id),
  merchant_id   INTEGER REFERENCES merchants(id),  -- sadece tacir kullanıcılarında dolu
  plate         VARCHAR(20),                        -- kurye aracı
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Gönderiler
-- status: olusturuldu | subede | dagitimda | teslim_edildi | teslim_edilemedi | iade
CREATE TABLE shipments (
  id                SERIAL PRIMARY KEY,
  barcode           VARCHAR(20) NOT NULL UNIQUE,   -- KRG26000001
  merchant_id       INTEGER NOT NULL REFERENCES merchants(id),
  origin_branch_id  INTEGER NOT NULL REFERENCES branches(id),
  dest_branch_id    INTEGER REFERENCES branches(id),

  receiver_name     VARCHAR(80) NOT NULL,
  receiver_phone    VARCHAR(30) NOT NULL,
  receiver_address  VARCHAR(250) NOT NULL,
  receiver_district VARCHAR(50) NOT NULL,
  receiver_city     VARCHAR(50) NOT NULL DEFAULT 'İstanbul',

  desi              NUMERIC(6,2) NOT NULL DEFAULT 1,
  weight_kg         NUMERIC(6,2),
  content           VARCHAR(120),
  -- gonderici_odemeli | alici_odemeli
  payment_type      VARCHAR(20) NOT NULL DEFAULT 'gonderici_odemeli',
  shipping_fee      NUMERIC(10,2) NOT NULL DEFAULT 0,
  cod_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,  -- kapıda tahsil edilecek

  status            VARCHAR(20) NOT NULL DEFAULT 'olusturuldu',
  courier_id        INTEGER REFERENCES users(id),

  -- Teslimat doğrulaması
  otp_code          VARCHAR(6),
  otp_sent_at       TIMESTAMP,
  delivered_at      TIMESTAMP,
  delivered_to      VARCHAR(80),
  signature         TEXT,                  -- imza görüntüsü (base64 PNG)
  delivery_note     VARCHAR(250),
  attempt_count     INTEGER NOT NULL DEFAULT 0,

  created_by        INTEGER REFERENCES users(id),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_merchant ON shipments(merchant_id);
CREATE INDEX idx_shipments_courier ON shipments(courier_id);
CREATE INDEX idx_shipments_dest ON shipments(dest_branch_id);

-- Gönderi hareket geçmişi
CREATE TABLE shipment_events (
  id          SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL,
  description VARCHAR(250),
  branch_id   INTEGER REFERENCES branches(id),
  user_id     INTEGER REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_shipment ON shipment_events(shipment_id);

-- Sevk irsaliyeleri (şubeler arası veya kuryeye çıkış)
-- type: sube_sevk | kurye_dagitim
CREATE TABLE manifests (
  id               SERIAL PRIMARY KEY,
  code             VARCHAR(20) NOT NULL UNIQUE,   -- IRS-2026-00001
  type             VARCHAR(20) NOT NULL,
  origin_branch_id INTEGER NOT NULL REFERENCES branches(id),
  dest_branch_id   INTEGER REFERENCES branches(id),
  courier_id       INTEGER REFERENCES users(id),
  item_count       INTEGER NOT NULL DEFAULT 0,
  notes            VARCHAR(250),
  created_by       INTEGER REFERENCES users(id),
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE manifest_items (
  id          SERIAL PRIMARY KEY,
  manifest_id INTEGER NOT NULL REFERENCES manifests(id) ON DELETE CASCADE,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id),
  UNIQUE (manifest_id, shipment_id)
);

-- Kapıda ödeme tahsilatları
CREATE TABLE cod_collections (
  id           SERIAL PRIMARY KEY,
  shipment_id  INTEGER NOT NULL REFERENCES shipments(id),
  amount       NUMERIC(10,2) NOT NULL,
  method       VARCHAR(20) NOT NULL DEFAULT 'nakit',  -- nakit | kredi_karti
  courier_id   INTEGER REFERENCES users(id),
  -- Tacire ödeme yapıldı mı?
  settled      BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at   TIMESTAMP,
  collected_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cod_shipment ON cod_collections(shipment_id);
