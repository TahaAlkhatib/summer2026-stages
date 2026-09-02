import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';

class Recetelerim extends StatefulWidget {
  const Recetelerim({super.key});

  @override
  State<Recetelerim> createState() => _RecetelerimDurumu();
}

class _RecetelerimDurumu extends State<Recetelerim> {
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
      final liste = await Api.get('/patient-portal/records');
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

    if (_liste.isEmpty) {
      return RefreshIndicator(
        onRefresh: _yukle,
        child: ListView(children: const [
          SizedBox(height: 60),
          Center(child: Text('Muayene kaydınız bulunmuyor.',
              style: TextStyle(color: Color(0xFF6B7F7F)))),
        ]),
      );
    }

    return RefreshIndicator(
      onRefresh: _yukle,
      child: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: _liste.length,
        itemBuilder: (context, i) {
          final k = _liste[i];
          final receteler = (k['prescriptions'] as List<dynamic>?) ?? [];

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tarihSaatFormat(k['created_at']),
                      style: const TextStyle(color: Color(0xFF6B7F7F), fontSize: 13)),
                  const SizedBox(height: 6),
                  Text('${k['doctor_name'] ?? ''} — ${k['branch'] ?? ''}',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  const Divider(height: 20),

                  _satir('Şikayet', k['complaint']),
                  if ((k['diagnosis'] ?? '').toString().isNotEmpty)
                    _satir('Tanı', k['diagnosis']),
                  if ((k['treatment_note'] ?? '').toString().isNotEmpty)
                    _satir('Tedavi Notu', k['treatment_note']),

                  if (receteler.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Text('Reçete',
                        style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                    const SizedBox(height: 8),
                    ...receteler.map((r) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0F4F4),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.medication, size: 18, color: anaRenk),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(r['medicine_name'] ?? '',
                                        style: const TextStyle(fontWeight: FontWeight.w600)),
                                  ),
                                  Text('${r['days']} gün',
                                      style: const TextStyle(
                                          color: Color(0xFF6B7F7F), fontSize: 13)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Padding(
                                padding: const EdgeInsets.only(left: 26),
                                child: Text(r['dosage'] ?? '',
                                    style: const TextStyle(
                                        color: Color(0xFF4A6060), fontSize: 13)),
                              ),
                            ],
                          ),
                        )),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _satir(String etiket, dynamic deger) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(color: Color(0xFF1A2B2B), fontSize: 14),
          children: [
            TextSpan(text: '$etiket: ', style: const TextStyle(fontWeight: FontWeight.w600)),
            TextSpan(text: '${deger ?? '-'}'),
          ],
        ),
      ),
    );
  }
}
