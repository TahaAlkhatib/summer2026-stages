import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import 'giris_ekrani.dart';
import 'randevularim.dart';
import 'recetelerim.dart';
import 'odemelerim.dart';

class AnaEkran extends StatefulWidget {
  const AnaEkran({super.key});

  @override
  State<AnaEkran> createState() => _AnaEkranDurumu();
}

class _AnaEkranDurumu extends State<AnaEkran> {
  int _sekme = 0;

  final List<Widget> _sayfalar = const [
    Randevularim(),
    Recetelerim(),
    Odemelerim(),
  ];

  final List<String> _basliklar = ['Randevularım', 'Reçetelerim', 'Ödemelerim'];

  Future<void> _cikisYap() async {
    await Api.oturumuKapat();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const GirisEkrani()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasta = Api.kullanici;

    return Scaffold(
      appBar: AppBar(
        title: Text(_basliklar[_sekme]),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Çıkış Yap',
            onPressed: _cikisYap,
          ),
        ],
      ),
      body: Column(
        children: [
          // Hasta bilgi şeridi
          if (hasta != null)
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(hasta['full_name'] ?? '',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('TC: ${hasta['national_id'] ?? '-'}   ·   '
                      'Kan grubu: ${hasta['blood_type'] ?? '-'}',
                      style: const TextStyle(color: Color(0xFF6B7F7F), fontSize: 13)),
                  if ((hasta['allergies'] ?? '').toString().isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEE2E2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning_amber, size: 16, color: Color(0xFF991B1B)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text('Alerji: ${hasta['allergies']}',
                                style: const TextStyle(color: Color(0xFF991B1B), fontSize: 13)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          Expanded(child: _sayfalar[_sekme]),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _sekme,
        onTap: (i) => setState(() => _sekme = i),
        selectedItemColor: anaRenk,
        unselectedItemColor: const Color(0xFF9DB3B3),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.event), label: 'Randevular'),
          BottomNavigationBarItem(icon: Icon(Icons.medication), label: 'Reçeteler'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Ödemeler'),
        ],
      ),
    );
  }
}
