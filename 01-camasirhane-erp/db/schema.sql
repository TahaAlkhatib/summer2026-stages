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
