import 'dart:async';
import 'package:flutter/material.dart';
import '../api.dart';
import '../bicim.dart';

// Sahada müşteriye alternatif göstermek için hızlı portföy arama
class PortfoyArama extends StatefulWidget {
  const PortfoyArama({super.key});

  @override
  State<PortfoyArama> createState() => _PortfoyAramaDurumu();
}

class _PortfoyAramaDurumu extends State<PortfoyArama> {
  final _aramaAlani = TextEditingController();
  String _islemTipi = '';
  List<dynamic> _liste = [];
  bool _yukleniyor = true;
  String _hata = '';
  Timer? _gecikme;

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  @override
  void dispose() {
    _gecikme?.cancel();
    super.dispose();
  }

  Future<void> _yukle() async {
    setState(() { _yukleniyor = true; _hata = ''; });
    try {
      var yol = '/properties?status=aktif';
      if (_aramaAlani.text.trim().isNotEmpty) {
        yol += '&q=${Uri.encodeComponent(_aramaAlani.text.trim())}';
      }
      if (_islemTipi.isNotEmpty) yol += '&listing_type=$_islemTipi';

      final liste = await Api.get(yol);
      if (!mounted) return;
      setState(() => _liste = liste as List<dynamic>);
    } catch (e) {
      if (!mounted) return;
      setState(() => _hata = e.toString());
    }
    if (mounted) setState(() => _yukleniyor = false);
  }

  // Her tuşta istek atmamak için yarım saniye bekliyoruz
  void _aramaDegisti(String _) {
    _gecikme?.cancel();
    _gecikme = Timer(const Duration(milliseconds: 500), _yukle);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              TextField(
                controller: _aramaAlani,
                onChanged: _aramaDegisti,
                decoration: const InputDecoration(
                  labelText: 'Ara',
                  hintText: 'İlan başlığı, kod veya ilçe',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _filtreCipi('', 'Hepsi'),
                    _filtreCipi('kiralik', 'Kiralık'),
                    _filtreCipi('satilik', 'Satılık'),
                  ],
                ),
              ),
            ],
          ),
        ),

        if (_hata.isNotEmpty)
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(_hata, style: const TextStyle(color: Color(0xFF991B1B))),
          ),

        Expanded(
          child: _yukleniyor
              ? const Center(child: CircularProgressIndicator())
              : _liste.isEmpty
                  ? const Center(child: Text('Portföy bulunamadı.',
                      style: TextStyle(color: Color(0xFF9CA3AF))))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _liste.length,
                      itemBuilder: (context, i) {
                        final p = _liste[i];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: p['listing_type'] == 'kiralik'
                                            ? const Color(0xFFDBEAFE)
                                            : const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        islemTipleri[p['listing_type']] ?? '',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: p['listing_type'] == 'kiralik'
                                              ? const Color(0xFF1D4ED8)
                                              : const Color(0xFF15803D),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(p['code'],
                                        style: const TextStyle(
                                            color: solukRenk, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(p['title'],
                                    style: const TextStyle(
                                        fontSize: 15, fontWeight: FontWeight.w600)),
                                Text(
                                  '${p['district']}'
                                  '${p['neighborhood'] != null ? ' / ${p['neighborhood']}' : ''}',
                                  style: const TextStyle(color: solukRenk, fontSize: 13),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Text(para(p['price']),
                                        style: const TextStyle(
                                            fontSize: 17,
                                            fontWeight: FontWeight.bold,
                                            color: anaAcik)),
                                    const Spacer(),
                                    Text(
                                      [
                                        if (p['room_count'] != null) p['room_count'],
                                        if (p['gross_area'] != null) '${p['gross_area']} m²',
                                      ].join(' · '),
                                      style: const TextStyle(color: solukRenk, fontSize: 13),
                                    ),
                                  ],
                                ),
                                if (p['agent'] != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text('Sorumlu: ${p['agent']['name']}',
                                        style: const TextStyle(
                                            color: solukRenk, fontSize: 12)),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _filtreCipi(String deger, String etiket) {
    final secili = _islemTipi == deger;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(etiket),
        selected: secili,
        selectedColor: anaRenk,
        labelStyle: TextStyle(color: secili ? Colors.white : const Color(0xFF334155)),
        onSelected: (_) {
          setState(() => _islemTipi = deger);
          _yukle();
        },
      ),
    );
  }
}
