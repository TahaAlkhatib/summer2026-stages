import 'package:flutter/material.dart';
import '../api.dart';
import '../bicim.dart';
import 'randevu_detay.dart';

// Danışmanın kendi randevuları. Varsayılan olarak bugün gösterilir,
// tarihi değiştirerek önceki/sonraki günlere bakılabilir.
class Randevularim extends StatefulWidget {
  final VoidCallback onGuncellendi;
  const Randevularim({super.key, required this.onGuncellendi});

  @override
  State<Randevularim> createState() => _RandevularimDurumu();
}

class _RandevularimDurumu extends State<Randevularim> {
  DateTime _gun = DateTime.now();
  List<dynamic> _randevular = [];
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
      final liste = await Api.get('/appointments?mine=1&date=${gunMetni(_gun)}');
      if (!mounted) return;
      setState(() => _randevular = liste as List<dynamic>);
    } catch (e) {
      if (!mounted) return;
      setState(() => _hata = e.toString());
    }
    if (mounted) setState(() => _yukleniyor = false);
  }

  void _gunDegistir(int fark) {
    setState(() => _gun = _gun.add(Duration(days: fark)));
    _yukle();
  }

  @override
  Widget build(BuildContext context) {
    final bugunMu = gunMetni(_gun) == gunMetni(DateTime.now());
    final planlanan = _randevular.where((r) => r['status'] == 'planlandi').length;

    return Column(
      children: [
        // Gün seçici
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () => _gunDegistir(-1),
              ),
              Expanded(
                child: Column(
                  children: [
                    Text(tarih(gunMetni(_gun)),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(
                      bugunMu ? 'Bugün' : '',
                      style: const TextStyle(color: altin, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () => _gunDegistir(1),
              ),
              if (!bugunMu)
                TextButton(
                  onPressed: () { setState(() => _gun = DateTime.now()); _yukle(); },
                  child: const Text('Bugün'),
                ),
            ],
          ),
        ),

        if (planlanan > 0)
          Container(
            width: double.infinity,
            color: const Color(0xFFFEF3C7),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
            child: Text('$planlanan randevunuz bekliyor',
                style: const TextStyle(color: Color(0xFF92400E), fontWeight: FontWeight.w600)),
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
              : _randevular.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(30),
                        child: Text('Bu gün için randevunuz yok.',
                            style: TextStyle(color: Color(0xFF9CA3AF))),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _yukle,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _randevular.length,
                        itemBuilder: (context, i) {
                          final r = _randevular[i];
                          final durum = r['status'] as String;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () async {
                                await Navigator.of(context).push(MaterialPageRoute(
                                  builder: (_) => RandevuDetay(randevu: r),
                                ));
                                widget.onGuncellendi();
                                _yukle();
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 5),
                                          decoration: BoxDecoration(
                                            color: anaRenk,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(saat(r['scheduled_at']),
                                              style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold)),
                                        ),
                                        const Spacer(),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: durumZemini(durum),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            randevuDurumlari[durum] ?? durum,
                                            style: TextStyle(
                                              color: durumRengi(durum),
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Text(r['customer']['full_name'],
                                        style: const TextStyle(
                                            fontSize: 16, fontWeight: FontWeight.bold)),
                                    Text(r['customer']['phone'] ?? '',
                                        style: const TextStyle(color: solukRenk, fontSize: 13)),
                                    const SizedBox(height: 8),
                                    Text(r['property']['title'],
                                        style: const TextStyle(fontSize: 14)),
                                    Text(
                                      '${r['property']['code']} · ${r['property']['district']} · '
                                      '${para(r['property']['price'])}',
                                      style: const TextStyle(color: solukRenk, fontSize: 12),
                                    ),
                                    if (r['interest_level'] != null) ...[
                                      const SizedBox(height: 8),
                                      Text(
                                        ilgiSeviyeleri[r['interest_level']] ?? '',
                                        style: TextStyle(
                                          color: ilgiRengi(r['interest_level']),
                                          fontWeight: FontWeight.w600,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
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
