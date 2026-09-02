import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'yerel_db.dart';

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur.
// Gerçek bir cihazda bilgisayarın yerel IP adresini yazın.
const String temelAdres = 'http://10.0.2.2:5105/api';

class ApiHatasi implements Exception {
  final String mesaj;
  ApiHatasi(this.mesaj);
  @override
  String toString() => mesaj;
}

class Api {
  static String? _token;
  static Map<String, dynamic>? _kullanici;

  static Map<String, dynamic>? get kullanici => _kullanici;
  static bool get girisYapildi => _token != null;

  static Future<void> oturumuYukle() async {
    final kayit = await SharedPreferences.getInstance();
    _token = kayit.getString('token');
    final metin = kayit.getString('kullanici');
    if (metin != null) _kullanici = jsonDecode(metin);
  }

  static Future<void> oturumuKaydet(String token, Map<String, dynamic> kullanici) async {
    final kayit = await SharedPreferences.getInstance();
    await kayit.setString('token', token);
    await kayit.setString('kullanici', jsonEncode(kullanici));
    _token = token;
    _kullanici = kullanici;
  }

  static Future<void> oturumuKapat() async {
    final kayit = await SharedPreferences.getInstance();
    await kayit.remove('token');
    await kayit.remove('kullanici');
    await YerelDb.temizle();
    _token = null;
    _kullanici = null;
  }

  static Map<String, String> _basliklar() {
    final b = {'Content-Type': 'application/json'};
    if (_token != null) b['Authorization'] = 'Bearer $_token';
    return b;
  }

  static dynamic _oku(http.Response cevap) {
    dynamic govde;
    try {
      govde = cevap.body.isEmpty ? null : jsonDecode(cevap.body);
    } catch (_) {
      throw ApiHatasi('Sunucudan beklenmeyen bir cevap geldi.');
    }
    if (cevap.statusCode >= 400) {
      final mesaj = (govde is Map && govde['message'] != null)
          ? govde['message'].toString()
          : 'Bir hata oluştu (${cevap.statusCode}).';
      throw ApiHatasi(mesaj);
    }
    return govde;
  }

  static Future<dynamic> get(String yol) async {
    try {
      final cevap = await http
          .get(Uri.parse('$temelAdres$yol'), headers: _basliklar())
          .timeout(const Duration(seconds: 25));
      return _oku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. İnternet bağlantısı yok.');
    } on TimeoutException {
      throw ApiHatasi('Sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  }

  static Future<dynamic> post(String yol, Map<String, dynamic> govde) async {
    try {
      final cevap = await http
          .post(Uri.parse('$temelAdres$yol'),
              headers: _basliklar(), body: jsonEncode(govde))
          .timeout(const Duration(seconds: 40));
      return _oku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. İnternet bağlantısı yok.');
    } on TimeoutException {
      throw ApiHatasi('Sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  }
}

// ---- Biçimlendirme ----

String paraFormat(dynamic tutar) {
  final sayi = (tutar is num) ? tutar.toDouble() : double.tryParse('$tutar') ?? 0;
  final tam = sayi.floor();
  final kurus = ((sayi - tam) * 100).round().toString().padLeft(2, '0');
  final basamaklar = tam.toString().split('').reversed.toList();
  final parcalar = <String>[];
  for (var i = 0; i < basamaklar.length; i += 3) {
    final son = (i + 3 < basamaklar.length) ? i + 3 : basamaklar.length;
    parcalar.add(basamaklar.sublist(i, son).reversed.join());
  }
  return '${parcalar.reversed.join('.')},$kurus ₺';
}

String tarihSaatFormat(String? iso) {
  if (iso == null) return '-';
  final d = DateTime.tryParse(iso);
  if (d == null) return '-';
  return '${d.day.toString().padLeft(2, '0')}.'
      '${d.month.toString().padLeft(2, '0')}.${d.year} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}
