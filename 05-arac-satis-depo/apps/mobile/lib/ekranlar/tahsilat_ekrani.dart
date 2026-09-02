import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import '../yerel_db.dart';

// Vadeli (borçlu) faturaların tahsilatı.
// Açık fatura listesi son senkronizasyonda sunucudan indirilir; tahsilat
// çevrimdışı alınıp bekletilir.
class TahsilatEkrani extends StatefulWidget {
  final VoidCallback onKaydedildi;
  const TahsilatEkrani({super.key, required this.onKaydedildi});

  @override
  State<TahsilatEkrani> createState() => _TahsilatEkraniDurumu();
}

class _TahsilatEkraniDurumu extends State<TahsilatEkrani> {
  List<Map<String, dynamic>> _acikFaturalar = [];
  bool _yukleniyor = true;

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  Future<void> _yukle() async {
    final liste = await YerelDb.acikFaturalar();
    if (!mounted) return;
    setState(() {
      _acikFaturalar = liste;
      _yukleniyor = false;
    });
  }

  Future<void> _tahsilatAl(Map<String, dynamic> fatura) async {
    final kalan = (fatura['kalan'] as num).toDouble();
    final tutarAlani = TextEditingController(text: kalan.toStringAsFixed(2));
    String yontem = 'nakit';

    final onay = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Tahsilat Al'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(fatura['musteri_adi'] ?? '-',
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              Text('${fatura['fatura_no']} · Kalan: ${paraFormat(kalan)}',
                  style: const TextStyle(color: Color(0xFF6B7A8C), fontSize: 13)),
              const SizedBox(height: 16),
              TextField(
                controller: tutarAlani,
                decoration: const InputDecoration(labelText: 'Tahsil Edilen Tutar (₺)'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
              ),
              const SizedBox(height: 18),
              DropdownButtonFormField<String>(
                value: yontem,
                decoration: const InputDecoration(labelText: 'Ödeme Yöntemi'),
                items: const [
                  DropdownMenuItem(value: 'nakit', child: Text('Nakit')),
                  DropdownMenuItem(value: 'kredi_karti', child: Text('Kredi Kartı')),
                  DropdownMenuItem(value: 'havale', child: Text('Havale / EFT')),
                ],
                onChanged: (d) => yenile(() => yontem = d!),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Vazgeç')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Kaydet')),
          ],
        ),
      ),
    );

    if (onay != true) return;

    final tutar = double.tryParse(tutarAlani.text.replaceAll(',', '.')) ?? 0;
    if (tutar <= 0) {
      _uyari('Tutar sıfırdan büyük olmalıdır.');
      return;
    }
    if (tutar > kalan + 0.01) {
      _uyari('Tahsilat kalan borçtan fazla olamaz. Kalan: ${paraFormat(kalan)}');
      return;
    }

    final aracId = Api.kullanici?['van_id'] ?? 0;
    await YerelDb.tahsilatKaydet({
      'offline_id': 'tah$aracId-${DateTime.now().millisecondsSinceEpoch}',
      'fatura_offline_id': fatura['offline_id'],
      'tutar': tutar,
      'yontem': yontem,
      'tahsil_zamani': DateTime.now().toIso8601String(),
      'senkron_durumu': 'bekliyor',
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${paraFormat(tutar)} tahsilat kaydedildi.'),
        backgroundColor: const Color(0xFF15803D),
      ),
    );
    widget.onKaydedildi();
    _yukle();
  }

  void _uyari(String mesaj) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(mesaj)));
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_acikFaturalar.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(30),
          child: Text(
            'Açık (borçlu) fatura yok.\n\n'
            'Sahada kestiğiniz vadeli faturalar, senkronizasyondan sonra '
            'bu listede görünür.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF94A3B8)),
          ),
        ),
      );
    }

    double toplamBorc = 0;
    for (final f in _acikFaturalar) {
      toplamBorc += (f['kalan'] as num).toDouble();
    }

    return Column(
      children: [
        Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${_acikFaturalar.length} açık fatura',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
              Text('Toplam alacak: ${paraFormat(toplamBorc)}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _yukle,
            child: ListView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: _acikFaturalar.length,
              itemBuilder: (context, i) {
                final f = _acikFaturalar[i];
                final odenen = (f['odenen'] as num).toDouble();
                final toplam = (f['genel_toplam'] as num).toDouble();
                final oran = toplam > 0 ? (odenen / toplam).clamp(0.0, 1.0) : 0.0;

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(f['musteri_adi'] ?? '-',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold, fontSize: 15)),
                                  Text(f['fatura_no'] ?? '-',
                                      style: const TextStyle(
                                          fontSize: 12, color: Color(0xFF6B7A8C))),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(paraFormat(f['kalan']),
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Color(0xFFB45309))),
                                const Text('kalan',
                                    style: TextStyle(
                                        fontSize: 11, color: Color(0xFF94A3B8))),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: oran.toDouble(),
                            minHeight: 6,
                            backgroundColor: const Color(0xFFE2E8F0),
                            color: const Color(0xFF15803D),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Fatura ${paraFormat(toplam)} · Ödenen ${paraFormat(odenen)}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF6B7A8C)),
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _tahsilatAl(f),
                            icon: const Icon(Icons.payments, size: 18),
                            label: const Text('Tahsilat Al'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: vurguRenk,
                              padding: const EdgeInsets.symmetric(vertical: 11),
                            ),
                          ),
                        ),
                      ],
                    ),
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
