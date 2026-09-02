import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import '../yerel_db.dart';

// Cihazda duran faturaların listesi.
// Her satırda senkron durumu görünür: bekliyor / gonderildi
class Faturalarim extends StatefulWidget {
  const Faturalarim({super.key});

  @override
  State<Faturalarim> createState() => _FaturalarimDurumu();
}

class _FaturalarimDurumu extends State<Faturalarim> {
  List<Map<String, dynamic>> _faturalar = [];
  String _filtre = 'hepsi';
  bool _yukleniyor = true;

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  Future<void> _yukle() async {
    final liste = await YerelDb.faturalar(
        durum: _filtre == 'hepsi' ? null : _filtre);
    if (!mounted) return;
    setState(() {
      _faturalar = liste;
      _yukleniyor = false;
    });
  }

  Future<void> _detayGoster(Map<String, dynamic> fatura) async {
    final kalemler = await YerelDb.faturaKalemleri(fatura['offline_id'] as String);
    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        builder: (context, kaydirma) => ListView(
          controller: kaydirma,
          padding: const EdgeInsets.all(18),
          children: [
            Text(fatura['sunucu_fatura_no'] ?? 'Fatura No: (henüz gönderilmedi)',
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.bold, color: anaRenk)),
            const SizedBox(height: 4),
            Text(fatura['musteri_adi'] ?? '-', style: const TextStyle(fontSize: 15)),
            Text(tarihSaatFormat(fatura['kesim_zamani'] as String?),
                style: const TextStyle(color: Color(0xFF6B7A8C))),
            const SizedBox(height: 10),
            _durumEtiketi(fatura['senkron_durumu'] as String),
            const Divider(height: 26),

            const Text('Kalemler', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            ...kalemler.map((k) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(k['urun_adi'] ?? '-'),
                            Text(
                              '${k['miktar']} × ${paraFormat(k['birim_fiyat'])} '
                              '(KDV %${(k['kdv_orani'] as num).toStringAsFixed(0)})',
                              style: const TextStyle(
                                  fontSize: 12, color: Color(0xFF6B7A8C)),
                            ),
                          ],
                        ),
                      ),
                      Text(paraFormat(k['satir_toplam']),
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                )),

            const Divider(height: 26),
            _satir('Ara Toplam', paraFormat(fatura['ara_toplam'])),
            _satir('KDV', paraFormat(fatura['kdv_toplam'])),
            _satir('Genel Toplam', paraFormat(fatura['genel_toplam']), kalin: true),
            _satir('Ödeme', fatura['odeme_tipi'] == 'nakit' ? 'Nakit' : 'Vadeli'),
            if ((fatura['notlar'] as String?)?.isNotEmpty == true)
              _satir('Not', fatura['notlar']),
            if (fatura['enlem'] != null)
              _satir('Konum',
                  '${(fatura['enlem'] as num).toStringAsFixed(5)}, '
                  '${(fatura['boylam'] as num).toStringAsFixed(5)}'),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _satir(String etiket, String deger, {bool kalin = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(etiket, style: const TextStyle(color: Color(0xFF6B7A8C))),
          Flexible(
            child: Text(deger,
                textAlign: TextAlign.right,
                style: TextStyle(
                    fontWeight: kalin ? FontWeight.bold : FontWeight.w500,
                    fontSize: kalin ? 16 : 14,
                    color: kalin ? anaRenk : null)),
          ),
        ],
      ),
    );
  }

  Widget _durumEtiketi(String durum) {
    final bekliyor = durum == 'bekliyor';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bekliyor ? const Color(0xFFFEF3C7) : const Color(0xFFDCFCE7),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(bekliyor ? Icons.schedule : Icons.check_circle,
              size: 15,
              color: bekliyor ? const Color(0xFF92400E) : const Color(0xFF15803D)),
          const SizedBox(width: 5),
          Text(
            bekliyor ? 'Gönderilmeyi bekliyor' : 'Sunucuya gönderildi',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: bekliyor ? const Color(0xFF92400E) : const Color(0xFF15803D),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) {
      return const Center(child: CircularProgressIndicator());
    }

    double toplam = 0;
    for (final f in _faturalar) {
      toplam += (f['genel_toplam'] as num).toDouble();
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filtreDugmesi('hepsi', 'Hepsi'),
                _filtreDugmesi('bekliyor', 'Bekleyen'),
                _filtreDugmesi('gonderildi', 'Gönderilen'),
              ],
            ),
          ),
        ),
        Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Text('${_faturalar.length} fatura · Toplam ${paraFormat(toplam)}',
              style: const TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
        ),
        Expanded(
          child: _faturalar.isEmpty
              ? const Center(
                  child: Text('Bu filtrede fatura yok.',
                      style: TextStyle(color: Color(0xFF94A3B8))))
              : RefreshIndicator(
                  onRefresh: _yukle,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(10),
                    itemCount: _faturalar.length,
                    itemBuilder: (context, i) {
                      final f = _faturalar[i];
                      final bekliyor = f['senkron_durumu'] == 'bekliyor';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: Icon(
                            bekliyor ? Icons.cloud_upload_outlined : Icons.cloud_done_outlined,
                            color: bekliyor
                                ? const Color(0xFF92400E) : const Color(0xFF15803D),
                          ),
                          title: Text(f['musteri_adi'] ?? '-',
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text(
                            '${tarihSaatFormat(f['kesim_zamani'] as String?)} · '
                            '${f['odeme_tipi'] == 'nakit' ? 'Nakit' : 'Vadeli'}'
                            '${f['sunucu_fatura_no'] != null ? ' · ${f['sunucu_fatura_no']}' : ''}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          trailing: Text(paraFormat(f['genel_toplam']),
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, color: anaRenk)),
                          onTap: () => _detayGoster(f),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _filtreDugmesi(String deger, String etiket) {
    final secili = _filtre == deger;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(etiket),
        selected: secili,
        selectedColor: anaRenk,
        labelStyle: TextStyle(color: secili ? Colors.white : const Color(0xFF334155)),
        onSelected: (_) {
          setState(() => _filtre = deger);
          _yukle();
        },
      ),
    );
  }
}
