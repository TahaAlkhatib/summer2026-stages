import 'package:flutter/material.dart';

// Uygulama renkleri — web paneliyle aynı palet
const Color anaRenk = Color(0xFF14532D);
const Color anaAcik = Color(0xFF16803C);
const Color altin = Color(0xFFB58A2B);
const Color zeminRenk = Color(0xFFF4F6F4);
const Color solukRenk = Color(0xFF6B7280);

String para(dynamic tutar) {
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

// "2026-09-05" -> "05.09.2026"
String tarih(String? metin) {
  if (metin == null || metin.length < 10) return '-';
  final p = metin.substring(0, 10).split('-');
  if (p.length != 3) return '-';
  return '${p[2]}.${p[1]}.${p[0]}';
}

// "2026-09-05 14:30" -> "14:30"
String saat(String? metin) {
  if (metin == null || metin.length < 16) return '';
  return metin.replaceAll('T', ' ').substring(11, 16);
}

// Yerel gün metni — DateTime.toIso8601String() UTC kaymasına yol açmaz ama
// biz yine de gün/ay/yılı elle birleştiriyoruz ki saat kısmı karışmasın.
String gunMetni(DateTime d) {
  final ay = d.month.toString().padLeft(2, '0');
  final gun = d.day.toString().padLeft(2, '0');
  return '${d.year}-$ay-$gun';
}

const Map<String, String> islemTipleri = {'satilik': 'Satılık', 'kiralik': 'Kiralık'};

const Map<String, String> gayrimenkulTipleri = {
  'daire': 'Daire', 'villa': 'Villa', 'isyeri': 'İşyeri', 'arsa': 'Arsa',
};

const Map<String, String> randevuDurumlari = {
  'planlandi': 'Planlandı', 'gerceklesti': 'Gerçekleşti', 'iptal': 'İptal',
};

const Map<String, String> ilgiSeviyeleri = {
  'dusuk': 'Düşük ilgi', 'orta': 'Orta ilgi', 'yuksek': 'Yüksek ilgi',
};

Color durumRengi(String durum) {
  if (durum == 'gerceklesti') return const Color(0xFF15803D);
  if (durum == 'iptal') return const Color(0xFFB91C1C);
  return const Color(0xFF1D4ED8);
}

Color durumZemini(String durum) {
  if (durum == 'gerceklesti') return const Color(0xFFDCFCE7);
  if (durum == 'iptal') return const Color(0xFFFEE2E2);
  return const Color(0xFFDBEAFE);
}

Color ilgiRengi(String? seviye) {
  if (seviye == 'yuksek') return const Color(0xFF15803D);
  if (seviye == 'orta') return const Color(0xFFB45309);
  return const Color(0xFF6B7280);
}
