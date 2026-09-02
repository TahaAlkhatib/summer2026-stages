import 'package:flutter/material.dart';
import 'api.dart';
import 'ekranlar/giris_ekrani.dart';
import 'ekranlar/ana_ekran.dart';

const Color anaRenk = Color(0xFF0F766E);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Api.oturumuYukle();
  runApp(const KlinikHastaUygulamasi());
}

class KlinikHastaUygulamasi extends StatelessWidget {
  const KlinikHastaUygulamasi({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Klinik Hasta',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: anaRenk),
        scaffoldBackgroundColor: const Color(0xFFF0F4F4),
        appBarTheme: const AppBarTheme(
          backgroundColor: anaRenk,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: anaRenk,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
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
      home: Api.girisYapildi ? const AnaEkran() : const GirisEkrani(),
    );
  }
}

class DurumRozeti extends StatelessWidget {
  final String durum;
  const DurumRozeti({super.key, required this.durum});

  static const Map<String, Color> _renkler = {
    'planlandi': Color(0xFF2563EB),
    'geldi': Color(0xFF0891B2),
    'tamamlandi': Color(0xFF15803D),
    'iptal': Color(0xFFB91C1C),
    'gelmedi': Color(0xFF78716C),
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
        randevuDurumlari[durum] ?? durum,
        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
