import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur.
// Gerçek bir telefonda bilgisayarın yerel IP adresini yazın.
const String temelAdres = 'http://10.0.2.2:8107/api';

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
    _token = null;
    _kullanici = null;
  }

  static Map<String, String> _basliklar() {
    // Laravel'e "Accept: application/json" göndermezsek hataları HTML olarak döner
    final b = {'Content-Type': 'application/json', 'Accept': 'application/json'};
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
      // Laravel doğrulama hatalarında ilk alanın mesajını gösteriyoruz
      if (govde is Map && govde['errors'] is Map) {
        final ilk = (govde['errors'] as Map).values.first;
        if (ilk is List && ilk.isNotEmpty) throw ApiHatasi(ilk.first.toString());
      }
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
      throw ApiHatasi('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } on TimeoutException {
      throw ApiHatasi('Sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  }

  static Future<dynamic> post(String yol, Map<String, dynamic> govde) async {
    try {
      final cevap = await http
          .post(Uri.parse('$temelAdres$yol'),
              headers: _basliklar(), body: jsonEncode(govde))
          .timeout(const Duration(seconds: 30));
      return _oku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } on TimeoutException {
      throw ApiHatasi('Sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  }

  static Future<dynamic> put(String yol, Map<String, dynamic> govde) async {
    try {
      final cevap = await http
          .put(Uri.parse('$temelAdres$yol'),
              headers: _basliklar(), body: jsonEncode(govde))
          .timeout(const Duration(seconds: 30));
      return _oku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } on TimeoutException {
      throw ApiHatasi('Sunucu yanıt vermedi. Lütfen tekrar deneyin.');
    }
  }
}
