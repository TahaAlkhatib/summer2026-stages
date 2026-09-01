import 'package:flutter/material.dart';
import 'api.dart';
import 'ekranlar/giris_ekrani.dart';
import 'ekranlar/is_listesi_ekrani.dart';

const Color anaRenk = Color(0xFF8B1E1E);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Api.oturumuYukle();
  runApp(const OtoServisTabletUygulamasi());
}

class OtoServisTabletUygulamasi extends StatelessWidget {
  const OtoServisTabletUygulamasi({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Oto Servis Tablet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: anaRenk),
        scaffoldBackgroundColor: const Color(0xFFEEF1F5),
        appBarTheme: const AppBarTheme(
          backgroundColor: anaRenk,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: anaRenk,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 22),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      home: Api.girisYapildi ? const IsListesiEkrani() : const GirisEkrani(),
    );
  }
}

// Durum rozeti — listelerde ve detayda kullanılır
class DurumRozeti extends StatelessWidget {
  final String durum;
  const DurumRozeti({super.key, required this.durum});

  static const Map<String, Color> _renkler = {
    'acildi': Color(0xFF7B8794),
    'incelemede': Color(0xFF2680C2),
    'onay_bekliyor': Color(0xFFF0B429),
    'tamirde': Color(0xFFE67700),
    'tamamlandi': Color(0xFF199473),
    'teslim_edildi': Color(0xFF3E4C59),
    'iptal': Color(0xFFCF1124),
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: _renkler[durum] ?? Colors.grey,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(
        durumEtiketleri[durum] ?? durum,
        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class OnemRozeti extends StatelessWidget {
  final String onem;
  const OnemRozeti({super.key, required this.onem});

  static const Map<String, Color> _renkler = {
    'dusuk': Color(0xFF7B8794),
    'orta': Color(0xFFF0B429),
    'yuksek': Color(0xFFCF1124),
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: _renkler[onem] ?? Colors.grey,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        onemEtiketleri[onem] ?? onem,
        style: const TextStyle(color: Colors.white, fontSize: 12),
      ),
    );
  }
}
