import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import '../senkron.dart';
import 'ana_ekran.dart';

class GirisEkrani extends StatefulWidget {
  const GirisEkrani({super.key});

  @override
  State<GirisEkrani> createState() => _GirisEkraniDurumu();
}

class _GirisEkraniDurumu extends State<GirisEkrani> {
  final _kullaniciAlani = TextEditingController();
  final _sifreAlani = TextEditingController();
  String _hata = '';
  String _bilgi = '';
  bool _bekliyor = false;

  Future<void> _girisYap() async {
    setState(() { _hata = ''; _bilgi = ''; _bekliyor = true; });

    try {
      final cevap = await Api.post('/auth/login', {
        'username': _kullaniciAlani.text.trim(),
        'password': _sifreAlani.text,
      });

      final kullanici = cevap['user'];
      if (kullanici['van_id'] == 0) {
        setState(() {
          _hata = 'Bu kullanıcıya tanımlı bir araç yok.';
          _bekliyor = false;
        });
        return;
      }

      await Api.oturumuKaydet(cevap['token'], kullanici);

      // Girişten sonra katalogu indir — saha çalışması için şart
      setState(() => _bilgi = 'Ürün ve müşteri listesi indiriliyor...');
      await Senkron.katalogIndir();

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AnaEkran()),
      );
    } catch (e) {
      setState(() { _hata = e.toString(); _bekliyor = false; _bilgi = ''; });
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
                const Icon(Icons.local_shipping, size: 54, color: vurguRenk),
                const SizedBox(height: 12),
                const Text('Araç Üstü Satış',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 23, fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 4),
                const Text('Saha satış ve tahsilat',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF6B7A8C))),
                const SizedBox(height: 26),

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

                if (_bilgi.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_bilgi, style: const TextStyle(color: Color(0xFF1E40AF))),
                  ),

                TextField(
                  controller: _kullaniciAlani,
                  decoration: const InputDecoration(labelText: 'Kullanıcı Adı'),
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
                const Text('Demo: saha1 / 123456',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF6B7A8C), fontSize: 13)),
                const SizedBox(height: 8),
                const Text(
                  'İlk girişte ürün ve müşteri listesi indirilir, '
                  'sonrasında uygulama internetsiz çalışır.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
