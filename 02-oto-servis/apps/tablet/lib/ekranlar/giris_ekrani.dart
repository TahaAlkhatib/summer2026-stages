import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import 'is_listesi_ekrani.dart';

class GirisEkrani extends StatefulWidget {
  const GirisEkrani({super.key});

  @override
  State<GirisEkrani> createState() => _GirisEkraniDurumu();
}

class _GirisEkraniDurumu extends State<GirisEkrani> {
  final _kullaniciAlani = TextEditingController();
  final _sifreAlani = TextEditingController();
  String _hata = '';
  bool _bekliyor = false;

  Future<void> _girisYap() async {
    setState(() {
      _hata = '';
      _bekliyor = true;
    });

    try {
      final cevap = await Api.post('/auth/login', {
        'username': _kullaniciAlani.text.trim(),
        'password': _sifreAlani.text,
      });

      // Bu uygulama teknisyenler için
      final rol = cevap['user']['role'];
      if (rol != 'teknisyen' && rol != 'admin') {
        setState(() {
          _hata = 'Bu uygulama sadece teknisyenler içindir.';
          _bekliyor = false;
        });
        return;
      }

      await Api.oturumuKaydet(cevap['token'], cevap['user']);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const IsListesiEkrani()),
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
          child: Container(
            width: 460,
            padding: const EdgeInsets.all(36),
            margin: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('OTO SERVİS',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: anaRenk)),
                const SizedBox(height: 6),
                const Text('Teknisyen Tablet Uygulaması',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF7B8794))),
                const SizedBox(height: 30),

                if (_hata.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 18),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFE3E3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_hata, style: const TextStyle(color: Color(0xFFA61B1B))),
                  ),

                TextField(
                  controller: _kullaniciAlani,
                  decoration: const InputDecoration(labelText: 'Kullanıcı Adı'),
                  autocorrect: false,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _sifreAlani,
                  decoration: const InputDecoration(labelText: 'Şifre'),
                  obscureText: true,
                  onSubmitted: (_) => _girisYap(),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _bekliyor ? null : _girisYap,
                  child: Text(_bekliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'),
                ),
                const SizedBox(height: 18),
                const Text('Demo: teknisyen1 / 123456',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF7B8794), fontSize: 13)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
