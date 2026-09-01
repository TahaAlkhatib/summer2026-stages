import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur.
// Gerçek bir tablette bilgisayarın yerel IP adresini yazın.
const String temelAdres = 'http://10.0.2.2:5102/api';

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

  static Future<void> oturumuYukle() async {
    final kayit = await SharedPreferences.getInstance();
    _token = kayit.getString('token');
    final kullaniciMetni = kayit.getString('kullanici');
    if (kullaniciMetni != null) {
      _kullanici = jsonDecode(kullaniciMetni);
    }
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

  static bool get girisYapildi => _token != null;

  static Map<String, String> _basliklar() {
    final b = {'Content-Type': 'application/json'};
    if (_token != null) {
      b['Authorization'] = 'Bearer $_token';
    }
    return b;
  }

  static dynamic _cevabiOku(http.Response cevap) {
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
          .timeout(const Duration(seconds: 20));
      return _cevabiOku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. API çalışıyor mu?');
    }
  }

  static Future<dynamic> post(String yol, Map<String, dynamic> govde) async {
    try {
      final cevap = await http
          .post(Uri.parse('$temelAdres$yol'),
              headers: _basliklar(), body: jsonEncode(govde))
          .timeout(const Duration(seconds: 20));
      return _cevabiOku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. API çalışıyor mu?');
    }
  }

  static Future<dynamic> put(String yol, [Map<String, dynamic>? govde]) async {
    try {
      final cevap = await http
          .put(Uri.parse('$temelAdres$yol'),
              headers: _basliklar(), body: jsonEncode(govde ?? {}))
          .timeout(const Duration(seconds: 20));
      return _cevabiOku(cevap);
    } on SocketException {
      throw ApiHatasi('Sunucuya bağlanılamadı. API çalışıyor mu?');
    }
  }

  // Arıza fotoğrafı yükleme (multipart)
  static Future<String> fotoYukle(int tespitId, File dosya) async {
    final istek = http.MultipartRequest(
      'POST',
      Uri.parse('$temelAdres/jobcards/inspection/$tespitId/photo'),
    );
    if (_token != null) {
      istek.headers['Authorization'] = 'Bearer $_token';
    }
    istek.files.add(await http.MultipartFile.fromPath('dosya', dosya.path));

    final akis = await istek.send();
    final cevap = await http.Response.fromStream(akis);
    final govde = _cevabiOku(cevap);
    return govde['photo_path'].toString();
  }
}

// ---- Biçimlendirme ----

String paraFormat(dynamic tutar) {
  final sayi = (tutar is num) ? tutar.toDouble() : double.tryParse('$tutar') ?? 0;
  final tamKisim = sayi.floor();
  final kurus = ((sayi - tamKisim) * 100).round().toString().padLeft(2, '0');

  // Binlik ayracı olarak nokta koy
  final basamaklar = tamKisim.toString().split('').reversed.toList();
  final parcalar = <String>[];
  for (var i = 0; i < basamaklar.length; i += 3) {
    final son = (i + 3 < basamaklar.length) ? i + 3 : basamaklar.length;
    parcalar.add(basamaklar.sublist(i, son).reversed.join());
  }
  return '${parcalar.reversed.join('.')},$kurus ₺';
}

// 18700 -> "18.700"
String sayiFormat(dynamic deger) {
  final sayi = (deger is num) ? deger.toInt() : int.tryParse('$deger') ?? 0;
  final basamaklar = sayi.toString().split('').reversed.toList();
  final parcalar = <String>[];
  for (var i = 0; i < basamaklar.length; i += 3) {
    final son = (i + 3 < basamaklar.length) ? i + 3 : basamaklar.length;
    parcalar.add(basamaklar.sublist(i, son).reversed.join());
  }
  return parcalar.reversed.join('.');
}

String tarihFormat(String? iso) {
  if (iso == null) return '-';
  final d = DateTime.tryParse(iso);
  if (d == null) return '-';
  return '${d.day.toString().padLeft(2, '0')}.'
      '${d.month.toString().padLeft(2, '0')}.${d.year}';
}

String tarihSaatFormat(String? iso) {
  if (iso == null) return '-';
  final d = DateTime.tryParse(iso);
  if (d == null) return '-';
  return '${tarihFormat(iso)} '
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
}

const Map<String, String> durumEtiketleri = {
  'acildi': 'Açıldı',
  'incelemede': 'İncelemede',
  'onay_bekliyor': 'Onay Bekliyor',
  'tamirde': 'Tamirde',
  'tamamlandi': 'Tamamlandı',
  'teslim_edildi': 'Teslim Edildi',
  'iptal': 'İptal',
};

const Map<String, String> onemEtiketleri = {
  'dusuk': 'Düşük',
  'orta': 'Orta',
  'yuksek': 'Yüksek',
};
