import 'package:flutter/material.dart';
import '../api.dart';
import '../bicim.dart';

class RandevuDetay extends StatefulWidget {
  final Map<String, dynamic> randevu;
  const RandevuDetay({super.key, required this.randevu});

  @override
  State<RandevuDetay> createState() => _RandevuDetayDurumu();
}

class _RandevuDetayDurumu extends State<RandevuDetay> {
  late String _durum;
  String _ilgi = 'orta';
  final _notAlani = TextEditingController();
  bool _islemde = false;
  String _hata = '';

  @override
  void initState() {
    super.initState();
    _durum = widget.randevu['status'];
    _notAlani.text = widget.randevu['result_note'] ?? '';
  }

  Future<void> _sonucKaydet() async {
    setState(() { _islemde = true; _hata = ''; });
    try {
      await Api.put('/appointments/${widget.randevu['id']}/complete', {
        'interest_level': _ilgi,
        'result_note': _notAlani.text,
      });
      if (!mounted) return;
      setState(() => _durum = 'gerceklesti');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Randevu sonucu kaydedildi.'),
          backgroundColor: Color(0xFF15803D),
        ),
      );
    } catch (e) {
      if (mounted) setState(() => _hata = e.toString());
    }
    if (mounted) setState(() => _islemde = false);
  }

  Future<void> _iptalEt() async {
    final onay = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Randevu İptali'),
        content: const Text('Randevu iptal edilsin mi?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('İptal Et'),
          ),
        ],
      ),
    );
    if (onay != true) return;

    setState(() { _islemde = true; _hata = ''; });
    try {
      await Api.put('/appointments/${widget.randevu['id']}/cancel',
          {'result_note': _notAlani.text});
      if (!mounted) return;
      setState(() => _durum = 'iptal');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Randevu iptal edildi.')),
      );
    } catch (e) {
      if (mounted) setState(() => _hata = e.toString());
    }
    if (mounted) setState(() => _islemde = false);
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.randevu;
    final musteri = r['customer'];
    final portfoy = r['property'];

    return Scaffold(
      appBar: AppBar(title: const Text('Randevu Detayı')),
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          if (_hata.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(_hata, style: const TextStyle(color: Color(0xFF991B1B))),
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
                      Text('${tarih(r['scheduled_at'])}  ${saat(r['scheduled_at'])}',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: durumZemini(_durum),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(randevuDurumlari[_durum] ?? _durum,
                            style: TextStyle(
                                color: durumRengi(_durum),
                                fontSize: 12,
                                fontWeight: FontWeight.w600)),
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
                  const Text('Müşteri',
                      style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                  const SizedBox(height: 8),
                  Text(musteri['full_name'],
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  Text(musteri['phone'] ?? '', style: const TextStyle(color: solukRenk)),
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
                  const Text('Portföy',
                      style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                  const SizedBox(height: 8),
                  Text(portfoy['title'],
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('${portfoy['code']} · ${islemTipleri[portfoy['listing_type']]} · '
                      '${gayrimenkulTipleri[portfoy['property_type']]}',
                      style: const TextStyle(color: solukRenk, fontSize: 13)),
                  Text('${portfoy['district']}'
                      '${portfoy['neighborhood'] != null ? ' / ${portfoy['neighborhood']}' : ''}',
                      style: const TextStyle(color: solukRenk, fontSize: 13)),
                  const SizedBox(height: 8),
                  Text(para(portfoy['price']),
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold, color: anaAcik)),
                  if (portfoy['room_count'] != null || portfoy['gross_area'] != null)
                    Text(
                      [
                        if (portfoy['room_count'] != null) portfoy['room_count'],
                        if (portfoy['gross_area'] != null) '${portfoy['gross_area']} m²',
                      ].join(' · '),
                      style: const TextStyle(color: solukRenk, fontSize: 13),
                    ),
                ],
              ),
            ),
          ),

          if (_durum == 'planlandi') ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Görüşme Sonucu',
                        style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                    const SizedBox(height: 12),
                    const Text('Müşterinin ilgi seviyesi',
                        style: TextStyle(color: solukRenk, fontSize: 13)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      children: ilgiSeviyeleri.entries.map((girdi) {
                        final secili = _ilgi == girdi.key;
                        return ChoiceChip(
                          label: Text(girdi.value),
                          selected: secili,
                          selectedColor: anaRenk,
                          labelStyle: TextStyle(
                              color: secili ? Colors.white : const Color(0xFF334155)),
                          onSelected: (_) => setState(() => _ilgi = girdi.key),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _notAlani,
                      decoration: const InputDecoration(
                        labelText: 'Sonuç notu',
                        hintText: 'Örn: Müşteri beğendi, fiyat pazarlığı istiyor.',
                      ),
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 4),
            ElevatedButton.icon(
              onPressed: _islemde ? null : _sonucKaydet,
              icon: const Icon(Icons.check_circle),
              label: const Text('Görüşmeyi Tamamla'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _islemde ? null : _iptalEt,
              icon: const Icon(Icons.cancel_outlined, color: Color(0xFFB91C1C)),
              label: const Text('Randevuyu İptal Et',
                  style: TextStyle(color: Color(0xFFB91C1C))),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: Color(0xFFF0C4C4)),
              ),
            ),
          ] else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Görüşme Sonucu',
                        style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                    const SizedBox(height: 8),
                    if (r['interest_level'] != null || _durum == 'gerceklesti')
                      Text(ilgiSeviyeleri[r['interest_level'] ?? _ilgi] ?? '',
                          style: TextStyle(
                              color: ilgiRengi(r['interest_level'] ?? _ilgi),
                              fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text(_notAlani.text.isEmpty ? 'Not girilmedi.' : _notAlani.text),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
