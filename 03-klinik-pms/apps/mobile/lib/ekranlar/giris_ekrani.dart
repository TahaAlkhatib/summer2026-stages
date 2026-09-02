import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import 'ana_ekran.dart';

// Hastalar personel değildir; TC kimlik numarası ve telefonlarıyla giriş yaparlar
class GirisEkrani extends StatefulWidget {
  const GirisEkrani({super.key});

  @override
  State<GirisEkrani> createState() => _GirisEkraniDurumu();
}

class _GirisEkraniDurumu extends State<GirisEkrani> {
  final _tcAlani = TextEditingController();
  final _telefonAlani = TextEditingController();
  String _hata = '';
  bool _bekliyor = false;

  Future<void> _girisYap() async {
    setState(() {
      _hata = '';
      _bekliyor = true;
    });

    try {
      final cevap = await Api.post('/patient-portal/login', {
        'nationalId': _tcAlani.text.trim(),
        'phone': _telefonAlani.text.trim(),
      });
      await Api.oturumuKaydet(cevap['token'], cevap['patient']);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AnaEkran()),
      );
    } catch (e) {
      setState(() {
        _hata = e.toString();
        _bekliyor = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: anaRenk,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(30),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.local_hospital, size: 54, color: anaRenk),
                const SizedBox(height: 12),
                const Text('Klinik Hasta',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 4),
                const Text('Randevu, reçete ve ödeme takibi',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF6B7F7F))),
                const SizedBox(height: 28),

                if (_hata.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_hata, style: const TextStyle(color: Color(0xFF991B1B))),
                  ),

                TextField(
                  controller: _tcAlani,
                  decoration: const InputDecoration(
                    labelText: 'TC Kimlik Numarası',
                    counterText: '',
                  ),
                  keyboardType: TextInputType.number,
                  maxLength: 11,
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _telefonAlani,
                  decoration: const InputDecoration(
                    labelText: 'Telefon (son 4 hane)',
                    hintText: 'Örn: 1121',
                  ),
                  keyboardType: TextInputType.phone,
                  onSubmitted: (_) => _girisYap(),
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: _bekliyor ? null : _girisYap,
                  child: Text(_bekliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'),
                ),
                const SizedBox(height: 16),
                const Text('Demo: 10000000342 / 1323',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF6B7F7F), fontSize: 13)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
