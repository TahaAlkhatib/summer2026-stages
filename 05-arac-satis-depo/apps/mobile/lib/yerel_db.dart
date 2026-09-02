import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

// Cihaz üzerindeki yerel veritabanı.
//
// Uygulama İNTERNET OLMADAN çalışacak şekilde tasarlandı:
//  - Ürün, müşteri ve araç stoğu sunucudan indirilip burada saklanır
//  - Sahada kesilen faturalar önce buraya yazılır (senkron_durumu = 'bekliyor')
//  - İnternet gelince bekleyen kayıtlar sunucuya gönderilir ve 'gonderildi' olur
class YerelDb {
  static Database? _db;

  static Future<Database> ac() async {
    if (_db != null) return _db!;

    final yol = join(await getDatabasesPath(), 'arac_satis.db');
    _db = await openDatabase(
      yol,
      version: 1,
      onCreate: (db, surum) async {
        // Sunucudan indirilen katalog
        await db.execute('''
          CREATE TABLE urunler (
            id INTEGER PRIMARY KEY,
            kod TEXT, ad TEXT, birim TEXT,
            fiyat REAL, kdv_orani REAL
          )
        ''');

        await db.execute('''
          CREATE TABLE musteriler (
            id INTEGER PRIMARY KEY,
            ad TEXT, yetkili TEXT, telefon TEXT,
            adres TEXT, ilce TEXT, vergi_no TEXT, vade_limiti REAL
          )
        ''');

        await db.execute('''
          CREATE TABLE arac_stogu (
            urun_id INTEGER PRIMARY KEY,
            kod TEXT, ad TEXT, miktar INTEGER
          )
        ''');

        // Sahada kesilen faturalar (çevrimdışı)
        await db.execute('''
          CREATE TABLE faturalar (
            offline_id TEXT PRIMARY KEY,
            musteri_id INTEGER, musteri_adi TEXT,
            odeme_tipi TEXT,
            ara_toplam REAL, kdv_toplam REAL, genel_toplam REAL,
            kesim_zamani TEXT,
            enlem REAL, boylam REAL,
            notlar TEXT,
            senkron_durumu TEXT DEFAULT 'bekliyor',
            sunucu_fatura_no TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE fatura_kalemleri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fatura_offline_id TEXT,
            urun_id INTEGER, urun_adi TEXT,
            miktar INTEGER, birim_fiyat REAL, kdv_orani REAL, satir_toplam REAL
          )
        ''');

        // Sahada alınan tahsilatlar
        await db.execute('''
          CREATE TABLE tahsilatlar (
            offline_id TEXT PRIMARY KEY,
            fatura_offline_id TEXT,
            tutar REAL, yontem TEXT, tahsil_zamani TEXT,
            senkron_durumu TEXT DEFAULT 'bekliyor'
          )
        ''');

        // GPS konum kayıtları
        await db.execute('''
          CREATE TABLE konumlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enlem REAL, boylam REAL, hiz REAL, kayit_zamani TEXT,
            senkron_durumu TEXT DEFAULT 'bekliyor'
          )
        ''');

        // Sunucudan gelen açık (borçlu) faturalar
        await db.execute('''
          CREATE TABLE acik_faturalar (
            offline_id TEXT PRIMARY KEY,
            fatura_no TEXT, musteri_id INTEGER, musteri_adi TEXT,
            genel_toplam REAL, odenen REAL, kalan REAL
          )
        ''');
      },
    );
    return _db!;
  }

  // ---- Katalog (sunucudan indirilen veri) ----

  static Future<void> katalogKaydet(Map<String, dynamic> veri) async {
    final db = await ac();
    await db.transaction((islem) async {
      await islem.delete('urunler');
      for (final u in veri['products']) {
        await islem.insert('urunler', {
          'id': u['id'], 'kod': u['code'], 'ad': u['name'], 'birim': u['unit'],
          'fiyat': (u['price'] as num).toDouble(),
          'kdv_orani': (u['vat_rate'] as num).toDouble(),
        });
      }

      await islem.delete('musteriler');
      for (final m in veri['customers']) {
        await islem.insert('musteriler', {
          'id': m['id'], 'ad': m['name'], 'yetkili': m['contact_name'],
          'telefon': m['phone'], 'adres': m['address'], 'ilce': m['district'],
          'vergi_no': m['tax_number'],
          'vade_limiti': (m['credit_limit'] as num).toDouble(),
        });
      }

      await islem.delete('arac_stogu');
      for (final s in veri['van_stock']) {
        await islem.insert('arac_stogu', {
          'urun_id': s['product_id'], 'kod': s['code'],
          'ad': s['name'], 'miktar': s['quantity'],
        });
      }

      await islem.delete('acik_faturalar');
      for (final f in veri['open_invoices']) {
        await islem.insert('acik_faturalar', {
          'offline_id': f['offline_id'], 'fatura_no': f['invoice_no'],
          'musteri_id': f['customer_id'], 'musteri_adi': f['customer_name'],
          'genel_toplam': (f['grand_total'] as num).toDouble(),
          'odenen': (f['paid_amount'] as num).toDouble(),
          'kalan': (f['remaining'] as num).toDouble(),
        });
      }
    });
  }

  static Future<List<Map<String, dynamic>>> urunler() async {
    final db = await ac();
    return db.rawQuery('''
      SELECT u.*, IFNULL(s.miktar, 0) AS stok
      FROM urunler u LEFT JOIN arac_stogu s ON s.urun_id = u.id
      ORDER BY u.ad
    ''');
  }

  static Future<List<Map<String, dynamic>>> musteriler(String arama) async {
    final db = await ac();
    if (arama.isEmpty) {
      return db.query('musteriler', orderBy: 'ad');
    }
    return db.query('musteriler',
        where: 'ad LIKE ? OR telefon LIKE ? OR ilce LIKE ?',
        whereArgs: ['%$arama%', '%$arama%', '%$arama%'],
        orderBy: 'ad');
  }

  static Future<List<Map<String, dynamic>>> aracStogu() async {
    final db = await ac();
    return db.query('arac_stogu', where: 'miktar > 0', orderBy: 'ad');
  }

  static Future<List<Map<String, dynamic>>> acikFaturalar() async {
    final db = await ac();
    return db.query('acik_faturalar', where: 'kalan > 0', orderBy: 'musteri_adi');
  }

  // ---- Fatura kaydetme (çevrimdışı) ----

  static Future<void> faturaKaydet(
      Map<String, dynamic> fatura, List<Map<String, dynamic>> kalemler) async {
    final db = await ac();
    await db.transaction((islem) async {
      await islem.insert('faturalar', fatura);

      for (final k in kalemler) {
        await islem.insert('fatura_kalemleri', {
          'fatura_offline_id': fatura['offline_id'],
          'urun_id': k['urun_id'], 'urun_adi': k['urun_adi'],
          'miktar': k['miktar'], 'birim_fiyat': k['birim_fiyat'],
          'kdv_orani': k['kdv_orani'], 'satir_toplam': k['satir_toplam'],
        });

        // Araç stoğunu yerelde de düş — saha personeli anlık stoğu görsün
        await islem.rawUpdate(
          'UPDATE arac_stogu SET miktar = miktar - ? WHERE urun_id = ?',
          [k['miktar'], k['urun_id']],
        );
      }
    });
  }

  static Future<List<Map<String, dynamic>>> faturalar({String? durum}) async {
    final db = await ac();
    if (durum != null) {
      return db.query('faturalar',
          where: 'senkron_durumu = ?', whereArgs: [durum],
          orderBy: 'kesim_zamani DESC');
    }
    return db.query('faturalar', orderBy: 'kesim_zamani DESC');
  }

  static Future<List<Map<String, dynamic>>> faturaKalemleri(String offlineId) async {
    final db = await ac();
    return db.query('fatura_kalemleri',
        where: 'fatura_offline_id = ?', whereArgs: [offlineId]);
  }

  static Future<void> tahsilatKaydet(Map<String, dynamic> tahsilat) async {
    final db = await ac();
    await db.insert('tahsilatlar', tahsilat);
    // Yerel açık fatura bakiyesini güncelle
    await db.rawUpdate(
      'UPDATE acik_faturalar SET odenen = odenen + ?, kalan = kalan - ? WHERE offline_id = ?',
      [tahsilat['tutar'], tahsilat['tutar'], tahsilat['fatura_offline_id']],
    );
  }

  static Future<void> konumKaydet(double enlem, double boylam, double? hiz) async {
    final db = await ac();
    await db.insert('konumlar', {
      'enlem': enlem, 'boylam': boylam, 'hiz': hiz,
      'kayit_zamani': DateTime.now().toIso8601String(),
      'senkron_durumu': 'bekliyor',
    });
  }

  // ---- Senkronizasyon ----

  static Future<Map<String, int>> bekleyenSayilari() async {
    final db = await ac();
    final f = Sqflite.firstIntValue(await db.rawQuery(
        "SELECT COUNT(*) FROM faturalar WHERE senkron_durumu = 'bekliyor'")) ?? 0;
    final t = Sqflite.firstIntValue(await db.rawQuery(
        "SELECT COUNT(*) FROM tahsilatlar WHERE senkron_durumu = 'bekliyor'")) ?? 0;
    final k = Sqflite.firstIntValue(await db.rawQuery(
        "SELECT COUNT(*) FROM konumlar WHERE senkron_durumu = 'bekliyor'")) ?? 0;
    return {'fatura': f, 'tahsilat': t, 'konum': k};
  }

  static Future<List<Map<String, dynamic>>> bekleyenFaturalar() async {
    final db = await ac();
    return db.query('faturalar',
        where: "senkron_durumu = 'bekliyor'", orderBy: 'kesim_zamani');
  }

  static Future<List<Map<String, dynamic>>> bekleyenTahsilatlar() async {
    final db = await ac();
    return db.query('tahsilatlar', where: "senkron_durumu = 'bekliyor'");
  }

  static Future<List<Map<String, dynamic>>> bekleyenKonumlar() async {
    final db = await ac();
    return db.query('konumlar', where: "senkron_durumu = 'bekliyor'", limit: 200);
  }

  // Sunucu kaydı kabul ettiğinde (veya zaten varsa) 'gonderildi' işaretle
  static Future<void> faturaGonderildi(String offlineId, String? sunucuFaturaNo) async {
    final db = await ac();
    await db.update('faturalar',
        {'senkron_durumu': 'gonderildi', 'sunucu_fatura_no': sunucuFaturaNo},
        where: 'offline_id = ?', whereArgs: [offlineId]);
  }

  static Future<void> tahsilatGonderildi(String offlineId) async {
    final db = await ac();
    await db.update('tahsilatlar', {'senkron_durumu': 'gonderildi'},
        where: 'offline_id = ?', whereArgs: [offlineId]);
  }

  static Future<void> konumlarGonderildi(List<int> idler) async {
    if (idler.isEmpty) return;
    final db = await ac();
    final yerTutucu = List.filled(idler.length, '?').join(',');
    await db.rawUpdate(
      "UPDATE konumlar SET senkron_durumu = 'gonderildi' WHERE id IN ($yerTutucu)",
      idler,
    );
  }

  static Future<void> temizle() async {
    final db = await ac();
    for (final t in ['urunler', 'musteriler', 'arac_stogu', 'faturalar',
                     'fatura_kalemleri', 'tahsilatlar', 'konumlar', 'acik_faturalar']) {
      await db.delete(t);
    }
  }
}
