import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../api.dart';
import '../main.dart';
import '../yerel_db.dart';

// Sahada fatura kesme ekranı — internet olmadan çalışır.
// Fatura önce cihaza yazılır, sonra senkronizasyonda sunucuya gönderilir.
class YeniSatis extends StatefulWidget {
  final VoidCallback onKaydedildi;
  const YeniSatis({super.key, required this.onKaydedildi});

  @override
  State<YeniSatis> createState() => _YeniSatisDurumu();
}

class _YeniSatisDurumu extends State<YeniSatis> {
  Map<String, dynamic>? _musteri;
  final List<Map<String, dynamic>> _kalemler = [];
  String _odemeTipi = 'nakit';
  final _notAlani = TextEditingController();
  bool _kaydediliyor = false;

  double get _araToplam {
    double t = 0;
    for (final k in _kalemler) {
      t += (k['birim_fiyat'] as double) * (k['miktar'] as int);
    }
    return t;
  }

  double get _kdvToplam {
    double t = 0;
    for (final k in _kalemler) {
      final net = (k['birim_fiyat'] as double) * (k['miktar'] as int);
      t += net * (k['kdv_orani'] as double) / 100;
    }
    return t;
  }

  double get _genelToplam => _araToplam + _kdvToplam;

  Future<void> _musteriSec() async {
    final aramaAlani = TextEditingController();
    List<Map<String, dynamic>> liste = await YerelDb.musteriler('');
    if (!mounted) return;

    final secilen = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Müşteri Seç'),
          content: SizedBox(
            width: double.maxFinite,
            height: 420,
            child: Column(
              children: [
                TextField(
                  controller: aramaAlani,
                  decoration: const InputDecoration(labelText: 'Ara (ad, telefon, ilçe)'),
                  onChanged: (metin) async {
                    final yeni = await YerelDb.musteriler(metin);
                    yenile(() => liste = yeni);
                  },
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView.builder(
                    itemCount: liste.length,
                    itemBuilder: (context, i) => ListTile(
                      dense: true,
                      title: Text(liste[i]['ad']),
                      subtitle: Text('${liste[i]['ilce']} · ${liste[i]['telefon']}'),
                      onTap: () => Navigator.pop(context, liste[i]),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Vazgeç')),
          ],
        ),
      ),
    );

    if (secilen != null) {
      setState(() => _musteri = secilen);
    }
  }

  Future<void> _urunEkle() async {
    final urunler = await YerelDb.urunler();
    final miktarAlani = TextEditingController(text: '1');
    Map<String, dynamic>? secilenUrun;
    if (!mounted) return;

    final sonuc = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Ürün Ekle'),
          content: SizedBox(
            width: double.maxFinite,
            height: 420,
            child: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: urunler.length,
                    itemBuilder: (context, i) {
                      final u = urunler[i];
                      final stok = u['stok'] as int;
                      final seciliMi = secilenUrun != null && secilenUrun!['id'] == u['id'];
                      return ListTile(
                        dense: true,
                        selected: seciliMi,
                        selectedTileColor: const Color(0xFFDBEAFE),
                        enabled: stok > 0,
                        title: Text(u['ad']),
                        subtitle: Text('${paraFormat(u['fiyat'])} · araçta $stok ${u['birim']}'),
                        onTap: stok > 0 ? () => yenile(() => secilenUrun = u) : null,
                      );
                    },
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: miktarAlani,
                  decoration: const InputDecoration(labelText: 'Miktar'),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
            ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Ekle')),
          ],
        ),
      ),
    );

    if (sonuc != true || secilenUrun == null) return;

    final miktar = int.tryParse(miktarAlani.text) ?? 0;
    if (miktar <= 0) {
      _uyari('Miktar sıfırdan büyük olmalıdır.');
      return;
    }
    if (miktar > (secilenUrun!['stok'] as int)) {
      _uyari('Araçta yeterli stok yok. Mevcut: ${secilenUrun!['stok']}');
      return;
    }

    final fiyat = (secilenUrun!['fiyat'] as num).toDouble();
    final kdv = (secilenUrun!['kdv_orani'] as num).toDouble();

    setState(() {
      _kalemler.add({
        'urun_id': secilenUrun!['id'],
        'urun_adi': secilenUrun!['ad'],
        'miktar': miktar,
        'birim_fiyat': fiyat,
        'kdv_orani': kdv,
        'satir_toplam': fiyat * miktar * (1 + kdv / 100),
      });
    });
  }

  void _uyari(String mesaj) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(mesaj)));
  }

  Future<void> _faturayiKaydet() async {
    if (_musteri == null) {
      _uyari('Lütfen müşteri seçin.');
      return;
    }
    if (_kalemler.isEmpty) {
      _uyari('Faturaya en az bir ürün ekleyin.');
      return;
    }

    setState(() => _kaydediliyor = true);

    try {
      // Konumu almaya çalış — alınamazsa fatura yine kesilir
      double? enlem;
      double? boylam;
      try {
        final konum = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
        ).timeout(const Duration(seconds: 8));
        enlem = konum.latitude;
        boylam = konum.longitude;
      } catch (_) {}

      // Cihazda benzersiz kimlik üret — sunucu mükerrer kaydı bununla engeller
      final aracId = Api.kullanici?['van_id'] ?? 0;
      final offlineId = 'van$aracId-${DateTime.now().millisecondsSinceEpoch}';

      await YerelDb.faturaKaydet({
        'offline_id': offlineId,
        'musteri_id': _musteri!['id'],
        'musteri_adi': _musteri!['ad'],
        'odeme_tipi': _odemeTipi,
        'ara_toplam': _araToplam,
        'kdv_toplam': _kdvToplam,
        'genel_toplam': _genelToplam,
        'kesim_zamani': DateTime.now().toIso8601String(),
        'enlem': enlem,
        'boylam': boylam,
        'notlar': _notAlani.text,
        'senkron_durumu': 'bekliyor',
      }, _kalemler);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Fatura cihaza kaydedildi (${paraFormat(_genelToplam)}). '
              'Senkronizasyonda sunucuya gönderilecek.'),
          backgroundColor: const Color(0xFF15803D),
        ),
      );

      setState(() {
        _musteri = null;
        _kalemler.clear();
        _notAlani.clear();
        _odemeTipi = 'nakit';
      });
      widget.onKaydedildi();
    } catch (e) {
      _uyari('Fatura kaydedilemedi: $e');
    } finally {
      if (mounted) setState(() => _kaydediliyor = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('1. Müşteri',
                    style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 10),
                if (_musteri == null)
                  ElevatedButton.icon(
                    onPressed: _musteriSec,
                    icon: const Icon(Icons.person_search),
                    label: const Text('Müşteri Seç'),
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_musteri!['ad'],
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      Text('${_musteri!['ilce']} · ${_musteri!['telefon']}',
                          style: const TextStyle(color: Color(0xFF6B7A8C))),
                      const SizedBox(height: 8),
                      OutlinedButton(
                        onPressed: _musteriSec,
                        child: const Text('Değiştir'),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),

        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('2. Ürünler',
                        style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                    ElevatedButton.icon(
                      onPressed: _urunEkle,
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Ürün Ekle'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_kalemler.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Text('Henüz ürün eklenmedi.',
                        style: TextStyle(color: Color(0xFF94A3B8))),
                  )
                else
                  ..._kalemler.asMap().entries.map((girdi) {
                    final i = girdi.key;
                    final k = girdi.value;
                    return ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text(k['urun_adi']),
                      subtitle: Text('${k['miktar']} × ${paraFormat(k['birim_fiyat'])} '
                          '(KDV %${k['kdv_orani'].toStringAsFixed(0)})'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(paraFormat(k['satir_toplam']),
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Color(0xFFB91C1C)),
                            onPressed: () => setState(() => _kalemler.removeAt(i)),
                          ),
                        ],
                      ),
                    );
                  }),
                if (_kalemler.isNotEmpty) ...[
                  const Divider(),
                  _toplamSatiri('Ara Toplam', _araToplam),
                  _toplamSatiri('KDV', _kdvToplam),
                  _toplamSatiri('Genel Toplam', _genelToplam, kalin: true),
                ],
              ],
            ),
          ),
        ),

        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('3. Ödeme',
                    style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Nakit'),
                        value: 'nakit',
                        groupValue: _odemeTipi,
                        onChanged: (d) => setState(() => _odemeTipi = d!),
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Vadeli'),
                        value: 'vadeli',
                        groupValue: _odemeTipi,
                        onChanged: (d) => setState(() => _odemeTipi = d!),
                      ),
                    ),
                  ],
                ),
                TextField(
                  controller: _notAlani,
                  decoration: const InputDecoration(labelText: 'Not (isteğe bağlı)'),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _kaydediliyor ? null : _faturayiKaydet,
                  icon: const Icon(Icons.save),
                  label: Text(_kaydediliyor ? 'Kaydediliyor...' : 'Faturayı Kes'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: vurguRenk,
                    minimumSize: const Size(double.infinity, 50),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Fatura önce cihaza kaydedilir; internet geldiğinde otomatik gönderilir.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _toplamSatiri(String etiket, double tutar, {bool kalin = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(etiket, style: TextStyle(fontWeight: kalin ? FontWeight.bold : FontWeight.normal)),
          Text(paraFormat(tutar),
              style: TextStyle(
                fontWeight: kalin ? FontWeight.bold : FontWeight.normal,
                fontSize: kalin ? 16 : 14,
                color: kalin ? anaRenk : null,
              )),
        ],
      ),
    );
  }
}
