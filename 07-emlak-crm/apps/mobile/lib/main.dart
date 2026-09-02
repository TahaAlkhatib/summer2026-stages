import 'package:flutter/material.dart';
import 'api.dart';
import 'bicim.dart';
import 'ekranlar/giris_ekrani.dart';
import 'ekranlar/ana_ekran.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Api.oturumuYukle();
  runApp(const EmlakDanismanUygulamasi());
}

class EmlakDanismanUygulamasi extends StatelessWidget {
  const EmlakDanismanUygulamasi({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Emlak Danışman',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: anaRenk),
        scaffoldBackgroundColor: zeminRenk,
        appBarTheme: const AppBarTheme(
          backgroundColor: anaRenk,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: anaAcik,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        ),
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 1,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      home: Api.girisYapildi ? const AnaEkran() : const GirisEkrani(),
    );
  }
}
