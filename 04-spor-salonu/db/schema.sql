-- Spor Salonu & Turnike Otomasyonu veritabanı şeması (MySQL)
-- Kullanım: mysql -h 127.0.0.1 -u gym_user -p gym_db < db/schema.sql

DROP TABLE IF EXISTS sale_items, sales, products, class_bookings, classes,
                     checkins, gates, payments, memberships, packages, members, users;

-- Personel: admin (yönetici), kasiyer, antrenor
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    phone         VARCHAR(25),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Üyeler. Her üyenin turnikede okutacağı bir QR kodu ve RFID kartı olur.
CREATE TABLE members (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(25)  NOT NULL,
    email         VARCHAR(100),
    birth_date    DATE,
    gender        VARCHAR(10),
    qr_code       VARCHAR(40)  NOT NULL UNIQUE,
    rfid_card     VARCHAR(30)  UNIQUE,
    notes         TEXT,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Üyelik paketleri (aylık, 3 aylık, 10 seans ...)
CREATE TABLE packages (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    duration_days  INT NOT NULL,
    session_count  INT NULL,          -- NULL ise sınırsız giriş
    price          DECIMAL(10,2) NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Üyenin satın aldığı üyelik
CREATE TABLE memberships (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    member_id           INT NOT NULL,
    package_id          INT NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    remaining_sessions  INT NULL,      -- NULL ise sınırsız
    status              VARCHAR(15) NOT NULL DEFAULT 'aktif',
    total_price         DECIMAL(10,2) NOT NULL,
    paid_amount         DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_by          INT,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Üyelik ödemeleri
CREATE TABLE payments (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    membership_id  INT NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    method         VARCHAR(10) NOT NULL,
    received_by    INT,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Turnike / kapı cihazları
CREATE TABLE gates (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    location   VARCHAR(100),
    direction  VARCHAR(10) NOT NULL DEFAULT 'giris',
    is_online  BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Turnike giriş kayıtları. Reddedilen girişler de sebebiyle kaydedilir.
CREATE TABLE checkins (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    member_id      INT NULL,
    membership_id  INT NULL,
    gate_id        INT NULL,
    method         VARCHAR(10) NOT NULL,      -- qr / rfid / manuel
    result         VARCHAR(10) NOT NULL,      -- izin / red
    reject_reason  VARCHAR(150),
    scanned_code   VARCHAR(40),
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (gate_id) REFERENCES gates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Grup dersleri
CREATE TABLE classes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    trainer_id  INT,
    weekday     INT NOT NULL,          -- 1=Pazartesi ... 7=Pazar
    start_time  VARCHAR(5) NOT NULL,   -- "18:00"
    capacity    INT NOT NULL DEFAULT 20,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (trainer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE class_bookings (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    class_id     INT NOT NULL,
    member_id    INT NOT NULL,
    booking_date DATE NOT NULL,
    status       VARCHAR(15) NOT NULL DEFAULT 'rezerve',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ders_uye_tarih (class_id, member_id, booking_date),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kasa / büfe ürünleri
CREATE TABLE products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    stock_quantity  INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sales (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    sale_no      VARCHAR(20) NOT NULL UNIQUE,
    member_id    INT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    method       VARCHAR(10) NOT NULL,
    sold_by      INT,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sale_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    sale_id     INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    line_total  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_members_qr        ON members(qr_code);
CREATE INDEX idx_memberships_uye   ON memberships(member_id, status);
CREATE INDEX idx_checkins_tarih    ON checkins(created_at);
CREATE INDEX idx_checkins_uye      ON checkins(member_id);
