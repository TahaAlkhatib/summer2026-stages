import 'package:flutter/material.dart';
import 'api.dart';
import 'ekranlar/giris_ekrani.dart';
import 'ekranlar/ana_ekran.dart';

const Color anaRenk = Color(0xFF1D4E89);
const Color vurguRenk = Color(0xFFF77F00);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Api.oturumuYukle();
  runApp(const AracSatisUygulamasi());
}

class AracSatisUygulamasi extends StatelessWidget {
  const AracSatisUygulamasi({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Araç Üstü Satış',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: anaRenk),
        scaffoldBackgroundColor: const Color(0xFFF2F5F8),
        appBarTheme: const AppBarTheme(
          backgroundColor: anaRenk,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: anaRenk,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 15),
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
