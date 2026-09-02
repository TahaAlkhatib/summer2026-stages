import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';

class Randevularim extends StatefulWidget {
  const Randevularim({super.key});

  @override
  State<Randevularim> createState() => _RandevularimDurumu();
}

class _RandevularimDurumu extends State<Randevularim> {
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
      final liste = await Api.get('/patient-portal/appointments');
      setState(() { _liste = liste as List<dynamic>; _yukleniyor = false; });
    } catch (e) {
      setState(() { _hata = e.toString(); _yukleniyor = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_hata.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_hata, textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF991B1B))),
        ),
      );
    }

    // Gelecek ve geçmiş randevuları ayır
    final simdi = DateTime.now();
    final gelecek = _liste.where((r) {
      final t = DateTime.tryParse(r['starts_at'] ?? '');
      return t != null && t.isAfter(simdi) && r['status'] != 'iptal';
    }).toList();
    final gecmis = _liste.where((r) => !gelecek.contains(r)).toList();

    return RefreshIndicator(
      onRefresh: _yukle,
      child: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          if (gelecek.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.only(bottom: 8, left: 4),
              child: Text('Yaklaşan Randevular',
                  style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk, fontSize: 15)),
            ),
            ...gelecek.map(_randevuKarti),
            const SizedBox(height: 16),
          ],
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(gecmis.isEmpty ? '' : 'Geçmiş Randevular',
                style: const TextStyle(fontWeight: FontWeight.bold, color: anaRenk, fontSize: 15)),
          ),
          ...gecmis.map(_randevuKarti),
          if (_liste.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 50),
              child: Center(child: Text('Randevu kaydınız bulunmuyor.',
                  style: TextStyle(color: Color(0xFF6B7F7F)))),
            ),
        ],
      ),
    );
  }

  Widget _randevuKarti(dynamic r) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(tarihFormat(r['starts_at']),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                DurumRozeti(durum: r['status'] ?? ''),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.schedule, size: 16, color: Color(0xFF6B7F7F)),
                const SizedBox(width: 6),
                Text(saatFormat(r['starts_at']),
                    style: const TextStyle(fontSize: 15, color: Color(0xFF4A6060))),
              ],
            ),
            const SizedBox(height: 8),
            Text(r['doctor_name'] ?? '',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            Text(r['branch'] ?? '',
                style: const TextStyle(color: Color(0xFF6B7F7F), fontSize: 13)),
            if ((r['note'] ?? '').toString().isNotEmpty) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('Not: ${r['note']}',
                    style: const TextStyle(color: Color(0xFF92400E), fontSize: 13)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
