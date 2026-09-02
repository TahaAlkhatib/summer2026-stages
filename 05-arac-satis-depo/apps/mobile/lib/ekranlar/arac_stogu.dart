import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import '../senkron.dart';
import '../yerel_db.dart';

// Araçtaki mevcut stok. Satış yapıldıkça yerelde düşer,
// depodan yükleme yapıldıktan sonra senkronizasyonla güncellenir.
class AracStogu extends StatefulWidget {
  const AracStogu({super.key});

  @override
  State<AracStogu> createState() => _AracStoguDurumu();
}

class _AracStoguDurumu extends State<AracStogu> {
  List<Map<String, dynamic>> _stok = [];
  bool _yukleniyor = true;
  bool _indiriliyor = false;

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  Future<void> _yukle() async {
    final liste = await YerelDb.urunler();
    if (!mounted) return;
    setState(() {
      _stok = liste;
      _yukleniyor = false;
    });
  }

  // Depo yükleme sonrası stoğu sunucudan tazelemek için
  Future<void> _sunucudanTazele() async {
    setState(() => _indiriliyor = true);
    try {
      await Senkron.katalogIndir();
      await _yukle();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Stok listesi sunucudan güncellendi.'),
          backgroundColor: Color(0xFF15803D),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: const Color(0xFFB91C1C)),
      );
    } finally {
      if (mounted) setState(() => _indiriliyor = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) {
      return const Center(child: CircularProgressIndicator());
    }

    int toplamAdet = 0;
    double toplamDeger = 0;
    for (final u in _stok) {
      final adet = u['stok'] as int;
      toplamAdet += adet;
      toplamDeger += adet * (u['fiyat'] as num).toDouble();
    }

    return Column(
      children: [
        Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Toplam $toplamAdet adet',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, color: anaRenk)),
                    Text('Stok değeri: ${paraFormat(toplamDeger)}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF6B7A8C))),
                  ],
                ),
              ),
              OutlinedButton.icon(
                onPressed: _indiriliyor ? null : _sunucudanTazele,
                icon: const Icon(Icons.download, size: 18),
                label: Text(_indiriliyor ? 'İndiriliyor' : 'Tazele'),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _yukle,
            child: ListView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: _stok.length,
              itemBuilder: (context, i) {
                final u = _stok[i];
                final adet = u['stok'] as int;
                // Az kalan ürünler için uyarı rengi — sahada işe yarıyor
                final Color renk = adet == 0
                    ? const Color(0xFFB91C1C)
                    : adet < 10
                        ? const Color(0xFFB45309)
                        : const Color(0xFF15803D);

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: Container(
                      width: 46,
                      height: 46,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: renk.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('$adet',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16, color: renk)),
                    ),
                    title: Text(u['ad'] ?? '-',
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text('${u['kod']} · ${u['birim']} · '
                        '${paraFormat(u['fiyat'])} (KDV %${(u['kdv_orani'] as num).toStringAsFixed(0)})',
                        style: const TextStyle(fontSize: 12)),
                    trailing: adet == 0
                        ? const Text('Tükendi',
                            style: TextStyle(
                                color: Color(0xFFB91C1C),
                                fontWeight: FontWeight.bold,
                                fontSize: 12))
                        : null,
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
