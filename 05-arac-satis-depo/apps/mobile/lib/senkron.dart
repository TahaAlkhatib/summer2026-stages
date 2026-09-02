import 'package:connectivity_plus/connectivity_plus.dart';
import 'api.dart';
import 'yerel_db.dart';

// Çevrimdışı kayıtları sunucuya aktaran senkronizasyon katmanı.
//
// Temel kural: her kayıt cihazda üretilen benzersiz bir "offline_id" ile
// gönderilir. Sunucu aynı kimliği ikinci kez görürse yeni kayıt açmaz.
// Bu yüzden bağlantı kopup tekrar denense bile mükerrer fatura oluşmaz.
class Senkron {
  static Future<bool> internetVarMi() async {
    final sonuc = await Connectivity().checkConnectivity();
    return !sonuc.contains(ConnectivityResult.none);
  }

  // Sunucudan katalog indir (ürün, müşteri, araç stoğu, açık faturalar)
  static Future<void> katalogIndir() async {
    final veri = await Api.get('/sync/pull');
    await YerelDb.katalogKaydet(veri as Map<String, dynamic>);
  }

  // Bekleyen kayıtları sunucuya gönder
  static Future<Map<String, dynamic>> gonder() async {
    final faturalar = await YerelDb.bekleyenFaturalar();
    final tahsilatlar = await YerelDb.bekleyenTahsilatlar();
    final konumlar = await YerelDb.bekleyenKonumlar();

    if (faturalar.isEmpty && tahsilatlar.isEmpty && konumlar.isEmpty) {
      return {'gonderilen_fatura': 0, 'gonderilen_tahsilat': 0, 'gonderilen_konum': 0};
    }

    // Faturaları kalemleriyle birlikte hazırla
    final faturaGovdeleri = <Map<String, dynamic>>[];
    for (final f in faturalar) {
      final kalemler = await YerelDb.faturaKalemleri(f['offline_id'] as String);
      faturaGovdeleri.add({
        'offlineId': f['offline_id'],
        'customerId': f['musteri_id'],
        'paymentType': f['odeme_tipi'],
        'paidAmount': f['odeme_tipi'] == 'nakit' ? f['genel_toplam'] : 0,
        'issuedAt': f['kesim_zamani'],
        'latitude': f['enlem'],
        'longitude': f['boylam'],
        'notes': f['notlar'],
        'items': kalemler.map((k) => {
          'productId': k['urun_id'],
          'productName': k['urun_adi'],
          'quantity': k['miktar'],
          'unitPrice': k['birim_fiyat'],
          'vatRate': k['kdv_orani'],
        }).toList(),
      });
    }

    final tahsilatGovdeleri = tahsilatlar.map((t) => {
      'offlineId': t['offline_id'],
      'invoiceOfflineId': t['fatura_offline_id'],
      'amount': t['tutar'],
      'method': t['yontem'],
      'collectedAt': t['tahsil_zamani'],
    }).toList();

    final konumGovdeleri = konumlar.map((k) => {
      'latitude': k['enlem'],
      'longitude': k['boylam'],
      'speedKmh': k['hiz'],
      'recordedAt': k['kayit_zamani'],
    }).toList();

    final cevap = await Api.post('/sync/push', {
      'invoices': faturaGovdeleri,
      'collections': tahsilatGovdeleri,
      'locations': konumGovdeleri,
    });

    int gonderilenFatura = 0;
    int gonderilenTahsilat = 0;
    final hatalar = <String>[];

    // 'kaydedildi' ve 'zaten_var' aynı şekilde ele alınır:
    // ikisi de sunucunun kaydı aldığı anlamına gelir
    for (final s in (cevap['invoices'] as List<dynamic>)) {
      final durum = s['status'];
      if (durum == 'kaydedildi' || durum == 'zaten_var') {
        await YerelDb.faturaGonderildi(s['offlineId'], s['invoiceNo']);
        gonderilenFatura++;
      } else {
        hatalar.add('Fatura: ${s['message']}');
      }
    }

    for (final s in (cevap['collections'] as List<dynamic>)) {
      final durum = s['status'];
      if (durum == 'kaydedildi' || durum == 'zaten_var') {
        await YerelDb.tahsilatGonderildi(s['offlineId']);
        gonderilenTahsilat++;
      } else {
        hatalar.add('Tahsilat: ${s['message']}');
      }
    }

    await YerelDb.konumlarGonderildi(
        konumlar.map((k) => k['id'] as int).toList());

    return {
      'gonderilen_fatura': gonderilenFatura,
      'gonderilen_tahsilat': gonderilenTahsilat,
      'gonderilen_konum': konumlar.length,
      'hatalar': hatalar,
    };
  }

  // Tam senkronizasyon: önce gönder, sonra güncel katalogu indir
  static Future<Map<String, dynamic>> tamSenkron() async {
    if (!await internetVarMi()) {
      throw ApiHatasi('İnternet bağlantısı yok. Kayıtlar cihazda bekletiliyor.');
    }
    final sonuc = await gonder();
    await katalogIndir();
    return sonuc;
  }
}
