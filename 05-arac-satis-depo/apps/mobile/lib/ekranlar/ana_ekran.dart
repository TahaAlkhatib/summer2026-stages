import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../api.dart';
import '../main.dart';
import '../senkron.dart';
import '../yerel_db.dart';
import 'giris_ekrani.dart';
import 'yeni_satis.dart';
import 'faturalarim.dart';
import 'arac_stogu.dart';
import 'tahsilat_ekrani.dart';

class AnaEkran extends StatefulWidget {
  const AnaEkran({super.key});

  @override
  State<AnaEkran> createState() => _AnaEkranDurumu();
}

class _AnaEkranDurumu extends State<AnaEkran> {
  int _sekme = 0;
  Map<String, int> _bekleyen = {'fatura': 0, 'tahsilat': 0, 'konum': 0};
  bool _internetVar = false;
  bool _senkronEdiliyor = false;
  Timer? _konumZamanlayici;

  // Senkronizasyon veya yeni kayittan sonra alt sayfalarin kendini
  // yeniden yuklemesi icin sayac. Key degisince Flutter widget'i bastan kurar.
  int _tazeleme = 0;

  final List<String> _basliklar = ['Yeni Satış', 'Faturalarım', 'Tahsilat', 'Araç Stoğu'];

  @override
  void initState() {
    super.initState();
    _durumuTazele();
    // Saha aracının konumu düzenli aralıklarla kaydedilir
    _konumZamanlayici = Timer.periodic(const Duration(minutes: 2), (_) => _konumKaydet());
    _konumKaydet();
  }

  @override
  void dispose() {
    _konumZamanlayici?.cancel();
    super.dispose();
  }

  Future<void> _durumuTazele() async {
    final bekleyen = await YerelDb.bekleyenSayilari();
    final internet = await Senkron.internetVarMi();
    if (!mounted) return;
    setState(() {
      _bekleyen = bekleyen;
      _internetVar = internet;
      _tazeleme++;
    });
  }

  // GPS konumunu al ve yerel veritabanına yaz (çevrimdışıyken de birikir)
  Future<void> _konumKaydet() async {
    try {
      LocationPermission izin = await Geolocator.checkPermission();
      if (izin == LocationPermission.denied) {
        izin = await Geolocator.requestPermission();
      }
      if (izin == LocationPermission.denied ||
          izin == LocationPermission.deniedForever) {
        return;
      }

      final konum = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      ).timeout(const Duration(seconds: 15));

      await YerelDb.konumKaydet(konum.latitude, konum.longitude, konum.speed);
      _durumuTazele();
    } catch (_) {
      // Konum alınamadıysa sessizce geç — satış akışı engellenmemeli
    }
  }

  Future<void> _senkronEt() async {
    setState(() => _senkronEdiliyor = true);
    try {
      final sonuc = await Senkron.tamSenkron();
      if (!mounted) return;

      final hatalar = (sonuc['hatalar'] as List<dynamic>?) ?? [];
      final mesaj = 'Gönderildi: ${sonuc['gonderilen_fatura']} fatura, '
          '${sonuc['gonderilen_tahsilat']} tahsilat, '
          '${sonuc['gonderilen_konum']} konum'
          '${hatalar.isEmpty ? '' : ' · ${hatalar.length} hata'}';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(mesaj),
          backgroundColor: hatalar.isEmpty ? const Color(0xFF15803D) : const Color(0xFFB45309),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: const Color(0xFFB91C1C)),
      );
    } finally {
      if (mounted) setState(() => _senkronEdiliyor = false);
      _durumuTazele();
    }
  }

  Future<void> _cikisYap() async {
    final onay = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Çıkış'),
        content: Text(
          _bekleyen['fatura']! + _bekleyen['tahsilat']! > 0
              ? 'Gönderilmemiş kayıtlarınız var! Çıkarsanız cihazdaki tüm veriler silinir. '
                'Önce senkronize etmeniz önerilir.'
              : 'Çıkmak istediğinize emin misiniz? Cihazdaki veriler silinecek.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Çıkış Yap'),
          ),
        ],
      ),
    );

    if (onay != true) return;

    await Api.oturumuKapat();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const GirisEkrani()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final kullanici = Api.kullanici;
    final bekleyenToplam = _bekleyen['fatura']! + _bekleyen['tahsilat']!;

    final sayfalar = [
      YeniSatis(onKaydedildi: _durumuTazele),
      Faturalarim(key: ValueKey('faturalar-$_tazeleme')),
      TahsilatEkrani(
        key: ValueKey('tahsilat-$_tazeleme'),
        onKaydedildi: _durumuTazele,
      ),
      AracStogu(key: ValueKey('stok-$_tazeleme')),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_basliklar[_sekme]),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Çıkış Yap',
            onPressed: _cikisYap,
          ),
        ],
      ),
      body: Column(
        children: [
          // Senkronizasyon durum şeridi — sahada en kritik bilgi
          Container(
            width: double.infinity,
            color: bekleyenToplam > 0 ? const Color(0xFFFEF3C7) : const Color(0xFFDCFCE7),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                Icon(
                  _internetVar ? Icons.cloud_done : Icons.cloud_off,
                  size: 20,
                  color: _internetVar ? const Color(0xFF15803D) : const Color(0xFF92400E),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _internetVar ? 'Çevrimiçi' : 'Çevrimdışı',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _internetVar
                              ? const Color(0xFF15803D) : const Color(0xFF92400E),
                        ),
                      ),
                      Text(
                        bekleyenToplam > 0
                            ? '$bekleyenToplam kayıt gönderilmeyi bekliyor'
                            : 'Tüm kayıtlar gönderildi',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF57534E)),
                      ),
                    ],
                  ),
                ),
                if (kullanici != null)
                  Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: Text(
                      kullanici['van_plate'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ElevatedButton.icon(
                  onPressed: _senkronEdiliyor ? null : _senkronEt,
                  icon: _senkronEdiliyor
                      ? const SizedBox(
                          width: 14, height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.sync, size: 18),
                  label: Text(_senkronEdiliyor ? 'Gönderiliyor' : 'Senkronize Et'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: vurguRenk,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
          ),
          Expanded(child: sayfalar[_sekme]),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _sekme,
        onTap: (i) {
          setState(() => _sekme = i);
          _durumuTazele();
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: anaRenk,
        unselectedItemColor: const Color(0xFF94A3B8),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.point_of_sale), label: 'Yeni Satış'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Faturalar'),
          BottomNavigationBarItem(icon: Icon(Icons.payments), label: 'Tahsilat'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2), label: 'Stok'),
        ],
      ),
    );
  }
}
