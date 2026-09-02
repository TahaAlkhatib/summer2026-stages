import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';

const Map<String, String> yontemEtiketleri = {
  'nakit': 'Nakit', 'kart': 'Kart', 'havale': 'Havale',
};

class Odemelerim extends StatefulWidget {
  const Odemelerim({super.key});

  @override
  State<Odemelerim> createState() => _OdemelerimDurumu();
}

class _OdemelerimDurumu extends State<Odemelerim> {
  List<dynamic> _liste = [];
  bool _yukleniyor = true;
  String _hata = '';

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  Future<void> _yukle() async {
    setState(() { _yukleniyor = true; _hata = ''; });
    try {
      final liste = await Api.get('/patient-portal/invoices');
      setState(() { _liste = liste as List<dynamic>; _yukleniyor = false; });
    } catch (e) {
      setState(() { _hata = e.toString(); _yukleniyor = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) return const Center(child: CircularProgressIndicator());
    if (_hata.isNotEmpty) {
      return Center(child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(_hata, textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF991B1B))),
      ));
    }

    // Toplam kalan borç
    double toplamKalan = 0;
    for (final f in _liste) {
      toplamKalan += (f['remaining'] as num).toDouble();
    }

    return RefreshIndicator(
      onRefresh: _yukle,
      child: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          Card(
            color: toplamKalan > 0 ? const Color(0xFFFEE2E2) : const Color(0xFFD1FAE5),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  Text(toplamKalan > 0 ? 'Toplam Kalan Borç' : 'Borcunuz Bulunmuyor',
                      style: TextStyle(
                          color: toplamKalan > 0
                              ? const Color(0xFF991B1B) : const Color(0xFF065F46))),
                  const SizedBox(height: 6),
                  Text(paraFormat(toplamKalan),
                      style: TextStyle(
                          fontSize: 26, fontWeight: FontWeight.bold,
                          color: toplamKalan > 0
                              ? const Color(0xFF991B1B) : const Color(0xFF065F46))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),

          ..._liste.map((f) {
            final odemeler = (f['payments'] as List<dynamic>?) ?? [];
            final seansYuzdesi = f['session_count'] > 0
                ? f['paid_session_count'] / f['session_count'] : 0.0;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(f['invoice_no'] ?? '',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: f['is_paid']
                                ? const Color(0xFF15803D) : const Color(0xFFF0B429),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(f['is_paid'] ? 'Ödendi' : 'Ödeme Bekliyor',
                              style: const TextStyle(color: Colors.white, fontSize: 12)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(f['description'] ?? '', style: const TextStyle(fontSize: 15)),
                    Text(tarihFormat(f['issue_date']),
                        style: const TextStyle(color: Color(0xFF6B7F7F), fontSize: 13)),
                    const SizedBox(height: 12),

                    // Seans ilerlemesi
                    if (f['session_count'] > 1) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Seans', style: TextStyle(fontSize: 13)),
                          Text('${f['paid_session_count']} / ${f['session_count']}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: seansYuzdesi.toDouble(),
                          minHeight: 8,
                          backgroundColor: const Color(0xFFE5E7EB),
                          valueColor: const AlwaysStoppedAnimation<Color>(anaRenk),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    _tutarSatiri('Toplam', f['total_amount'], false),
                    _tutarSatiri('Ödenen', f['paid_amount'], false),
                    _tutarSatiri('Kalan', f['remaining'], true),

                    if (odemeler.isNotEmpty) ...[
                      const Divider(height: 22),
                      const Text('Ödeme Geçmişi',
                          style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                      const SizedBox(height: 8),
                      ...odemeler.map((o) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${o['session_no']}. seans · '
                                    '${yontemEtiketleri[o['method']] ?? o['method']}',
                                    style: const TextStyle(
                                        fontSize: 13, color: Color(0xFF4A6060))),
                                Text(paraFormat(o['amount']),
                                    style: const TextStyle(fontSize: 13)),
                              ],
                            ),
                          )),
                    ],
                  ],
                ),
              ),
            );
          }),

          if (_liste.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 40),
              child: Center(child: Text('Fatura kaydınız bulunmuyor.',
                  style: TextStyle(color: Color(0xFF6B7F7F)))),
            ),
        ],
      ),
    );
  }

  Widget _tutarSatiri(String etiket, dynamic tutar, bool vurgula) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(etiket, style: TextStyle(
              fontWeight: vurgula ? FontWeight.bold : FontWeight.normal)),
          Text(paraFormat(tutar), style: TextStyle(
              fontWeight: vurgula ? FontWeight.bold : FontWeight.normal,
              color: vurgula && (tutar as num) > 0
                  ? const Color(0xFFB91C1C) : const Color(0xFF1A2B2B))),
        ],
      ),
    );
  }
}
