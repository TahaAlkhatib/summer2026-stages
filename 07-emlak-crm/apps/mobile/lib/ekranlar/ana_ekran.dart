import 'package:flutter/material.dart';
import '../api.dart';
import '../bicim.dart';
import 'giris_ekrani.dart';
import 'randevularim.dart';
import 'portfoy_arama.dart';

class AnaEkran extends StatefulWidget {
  const AnaEkran({super.key});

  @override
  State<AnaEkran> createState() => _AnaEkranDurumu();
}

class _AnaEkranDurumu extends State<AnaEkran> {
  int _sekme = 0;
  // Randevu listesinin kendini yenilemesi için sayaç
  int _tazeleme = 0;

  final _basliklar = ['Randevularım', 'Portföy'];

  Future<void> _cikisYap() async {
    final onay = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Çıkış'),
        content: const Text('Çıkmak istediğinize emin misiniz?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Çıkış Yap'),
          ),
        ],
      ),
    );

    if (onay != true) return;

    await Api.oturumuKapat();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const GirisEkrani()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final kullanici = Api.kullanici;

    final sayfalar = [
      Randevularim(
        key: ValueKey('randevu-$_tazeleme'),
        onGuncellendi: () => setState(() => _tazeleme++),
      ),
      const PortfoyArama(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_basliklar[_sekme], style: const TextStyle(fontSize: 19)),
            if (kullanici != null)
              Text(kullanici['name'] ?? '',
                  style: const TextStyle(fontSize: 12, color: Color(0xFFB7CCBB))),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.logout), tooltip: 'Çıkış Yap', onPressed: _cikisYap),
        ],
      ),
      body: sayfalar[_sekme],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _sekme,
        onTap: (i) => setState(() => _sekme = i),
        selectedItemColor: anaRenk,
        unselectedItemColor: const Color(0xFF9CA3AF),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.event_note), label: 'Randevular'),
          BottomNavigationBarItem(icon: Icon(Icons.home_work), label: 'Portföy'),
        ],
      ),
    );
  }
}
