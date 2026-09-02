import 'package:flutter/material.dart';
import '../api.dart';
import '../bicim.dart';
import 'ana_ekran.dart';

class GirisEkrani extends StatefulWidget {
  const GirisEkrani({super.key});

  @override
  State<GirisEkrani> createState() => _GirisEkraniDurumu();
}

class _GirisEkraniDurumu extends State<GirisEkrani> {
  final _epostaAlani = TextEditingController();
  final _sifreAlani = TextEditingController();
  String _hata = '';
  bool _bekliyor = false;

  Future<void> _girisYap() async {
    setState(() { _hata = ''; _bekliyor = true; });

    try {
      final cevap = await Api.post('/auth/login', {
        'email': _epostaAlani.text.trim(),
        'password': _sifreAlani.text,
      });

      await Api.oturumuKaydet(cevap['token'], cevap['user']);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AnaEkran()),
      );
    } catch (e) {
      setState(() { _hata = e.toString(); _bekliyor = false; });
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
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.apartment, size: 52, color: altin),
                const SizedBox(height: 12),
                const Text('Emlak Danışman',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 23, fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 4),
                const Text('Saha randevuları ve portföy',
                    textAlign: TextAlign.center, style: TextStyle(color: solukRenk)),
                const SizedBox(height: 26),

                if (_hata.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(_hata, style: const TextStyle(color: Color(0xFF991B1B))),
                  ),

                TextField(
                  controller: _epostaAlani,
                  decoration: const InputDecoration(labelText: 'E-posta'),
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _sifreAlani,
                  decoration: const InputDecoration(labelText: 'Şifre'),
                  obscureText: true,
                  onSubmitted: (_) => _girisYap(),
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: _bekliyor ? null : _girisYap,
                  child: Text(_bekliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'),
                ),
                const SizedBox(height: 16),
                const Text('Demo: elif@emlak.com / 123456',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: solukRenk, fontSize: 13)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
