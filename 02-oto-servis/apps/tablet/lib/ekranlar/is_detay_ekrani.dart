import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../api.dart';
import '../main.dart';

class IsDetayEkrani extends StatefulWidget {
  final int isEmriId;
  const IsDetayEkrani({super.key, required this.isEmriId});

  @override
  State<IsDetayEkrani> createState() => _IsDetayEkraniDurumu();
}

class _IsDetayEkraniDurumu extends State<IsDetayEkrani> {
  Map<String, dynamic>? _isEmri;
  List<dynamic> _parcalar = [];
  String _hata = '';
  bool _yukleniyor = true;

  @override
  void initState() {
    super.initState();
    _yukle();
  }

  Future<void> _yukle() async {
    setState(() {
      _yukleniyor = true;
      _hata = '';
    });
    try {
      final detay = await Api.get('/jobcards/${widget.isEmriId}');
      final parcalar = await Api.get('/parts');
      setState(() {
        _isEmri = detay as Map<String, dynamic>;
        _parcalar = parcalar as List<dynamic>;
        _yukleniyor = false;
      });
    } catch (e) {
      setState(() {
        _hata = e.toString();
        _yukleniyor = false;
      });
    }
  }

  void _uyari(String mesaj) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(mesaj)));
  }

  // ---- Arıza tespiti ekleme ----
  Future<void> _tespitEkle() async {
    final baslikAlani = TextEditingController();
    final aciklamaAlani = TextEditingController();
    String onem = 'orta';

    final sonuc = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Arıza Tespiti Ekle'),
          content: SizedBox(
            width: 520,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: baslikAlani,
                  decoration: const InputDecoration(labelText: 'Tespit Başlığı *'),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: aciklamaAlani,
                  decoration: const InputDecoration(labelText: 'Açıklama'),
                  maxLines: 3,
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: onem,
                  decoration: const InputDecoration(labelText: 'Önem Derecesi'),
                  items: onemEtiketleri.entries
                      .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                      .toList(),
                  onChanged: (d) => yenile(() => onem = d ?? 'orta'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Vazgeç')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Kaydet')),
          ],
        ),
      ),
    );

    if (sonuc != true) return;

    if (baslikAlani.text.trim().isEmpty) {
      _uyari('Tespit başlığı zorunludur.');
      return;
    }

    try {
      await Api.post('/jobcards/${widget.isEmriId}/inspection', {
        'title': baslikAlani.text.trim(),
        'description': aciklamaAlani.text.trim(),
        'severity': onem,
      });
      _uyari('Arıza tespiti kaydedildi.');
      _yukle();
    } catch (e) {
      _uyari(e.toString());
    }
  }

  // ---- Fotoğraf ekleme ----
  Future<void> _fotoEkle(int tespitId) async {
    final secici = ImagePicker();

    final kaynak = await showDialog<ImageSource>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Fotoğraf Kaynağı'),
        content: const Text('Fotoğrafı nereden eklemek istiyorsunuz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, ImageSource.camera),
            child: const Text('Kamera'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, ImageSource.gallery),
            child: const Text('Galeri'),
          ),
        ],
      ),
    );
    if (kaynak == null) return;

    try {
      final secilen = await secici.pickImage(source: kaynak, imageQuality: 70);
      if (secilen == null) return;

      await Api.fotoYukle(tespitId, File(secilen.path));
      _uyari('Fotoğraf yüklendi.');
      _yukle();
    } catch (e) {
      _uyari(e.toString());
    }
  }

  // ---- Parça çekme ----
  Future<void> _parcaCek() async {
    int? secilenParcaId;
    final adetAlani = TextEditingController(text: '1');

    final sonuc = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Depodan Parça Çek'),
          content: SizedBox(
            width: 560,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<int>(
                  value: secilenParcaId,
                  isExpanded: true,
                  decoration: const InputDecoration(labelText: 'Parça'),
                  items: _parcalar
                      .map((p) => DropdownMenuItem<int>(
                            value: p['id'] as int,
                            child: Text(
                              '${p['code']} — ${p['name']} (${p['stock_quantity']} adet)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ))
                      .toList(),
                  onChanged: (d) => yenile(() => secilenParcaId = d),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: adetAlani,
                  decoration: const InputDecoration(labelText: 'Adet'),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Vazgeç')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Çek')),
          ],
        ),
      ),
    );

    if (sonuc != true) return;
    if (secilenParcaId == null) {
      _uyari('Lütfen parça seçin.');
      return;
    }

    try {
      await Api.post('/jobcards/${widget.isEmriId}/parts', {
        'partId': secilenParcaId,
        'quantity': int.tryParse(adetAlani.text) ?? 1,
      });
      _uyari('Parça çekildi ve stoktan düşüldü.');
      _yukle();
    } catch (e) {
      _uyari(e.toString());
    }
  }

  // ---- Durum güncelleme ----
  Future<void> _durumGuncelle() async {
    String yeniDurum = _isEmri!['status'];

    final sonuc = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, yenile) => AlertDialog(
          title: const Text('Durumu Güncelle'),
          content: SizedBox(
            width: 420,
            child: DropdownButtonFormField<String>(
              value: yeniDurum,
              decoration: const InputDecoration(labelText: 'Yeni Durum'),
              items: durumEtiketleri.entries
                  .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                  .toList(),
              onChanged: (d) => yenile(() => yeniDurum = d ?? yeniDurum),
            ),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Vazgeç')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Kaydet')),
          ],
        ),
      ),
    );

    if (sonuc != true) return;

    try {
      await Api.put('/jobcards/${widget.isEmriId}/status', {'status': yeniDurum});
      _uyari('Durum güncellendi.');
      _yukle();
    } catch (e) {
      _uyari(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_yukleniyor) {
      return Scaffold(
        appBar: AppBar(title: const Text('İş Emri')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_isEmri == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('İş Emri')),
        body: Center(child: Text(_hata.isEmpty ? 'Kayıt bulunamadı.' : _hata)),
      );
    }

    final e = _isEmri!;
    final arac = e['vehicle'] as Map<String, dynamic>;
    final musteri = e['customer'] as Map<String, dynamic>;
    final tespitler = e['inspection_items'] as List<dynamic>;
    final kullanilanParcalar = e['job_parts'] as List<dynamic>;

    return Scaffold(
      appBar: AppBar(
        title: Text(e['job_no'] ?? 'İş Emri'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Yenile',
            onPressed: _yukle,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Araç kartı
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1F2933),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(arac['plate'] ?? '',
                            style: const TextStyle(
                                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                      ),
                      DurumRozeti(durum: e['status'] ?? ''),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text('${arac['brand'] ?? ''} ${arac['model'] ?? ''} (${arac['year'] ?? ''})',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text('Renk: ${arac['color'] ?? '-'}   ·   '
                      'Kilometre: ${e['mileage'] ?? '-'} km',
                      style: const TextStyle(color: Color(0xFF7B8794))),
                  const Divider(height: 24),
                  Text('Müşteri: ${musteri['full_name'] ?? '-'}'),
                  Text('Telefon: ${musteri['phone'] ?? '-'}',
                      style: const TextStyle(color: Color(0xFF7B8794))),
                  Text('Teknisyen: ${e['technician_name'] ?? 'Atanmadı'}',
                      style: const TextStyle(color: Color(0xFF7B8794))),
                ],
              ),
            ),
          ),

          // Şikayet
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Müşteri Şikayeti',
                      style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                  const SizedBox(height: 8),
                  Text(e['complaint_text'] ?? '-'),
                ],
              ),
            ),
          ),

          // Arıza tespitleri
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Arıza Tespitleri',
                          style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                      ElevatedButton.icon(
                        onPressed: _tespitEkle,
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Tespit Ekle'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (tespitler.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 14),
                      child: Text('Henüz arıza tespiti girilmedi.',
                          style: TextStyle(color: Color(0xFF7B8794))),
                    )
                  else
                    ...tespitler.map((t) => Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF5F7FA),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(t['title'] ?? '',
                                        style: const TextStyle(fontWeight: FontWeight.w600)),
                                  ),
                                  OnemRozeti(onem: t['severity'] ?? 'orta'),
                                ],
                              ),
                              if ((t['description'] ?? '').toString().isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Text(t['description'],
                                    style: const TextStyle(color: Color(0xFF52606D))),
                              ],
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  Text(tarihSaatFormat(t['created_at']),
                                      style: const TextStyle(
                                          fontSize: 12, color: Color(0xFF7B8794))),
                                  const Spacer(),
                                  if ((t['photo_path'] ?? '').toString().isNotEmpty)
                                    const Padding(
                                      padding: EdgeInsets.only(right: 10),
                                      child: Row(children: [
                                        Icon(Icons.check_circle,
                                            size: 16, color: Color(0xFF199473)),
                                        SizedBox(width: 4),
                                        Text('Fotoğraf var',
                                            style: TextStyle(
                                                fontSize: 12, color: Color(0xFF199473))),
                                      ]),
                                    ),
                                  TextButton.icon(
                                    onPressed: () => _fotoEkle(t['id']),
                                    icon: const Icon(Icons.camera_alt, size: 18),
                                    label: const Text('Fotoğraf'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )),
                ],
              ),
            ),
          ),

          // Kullanılan parçalar
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Kullanılan Parçalar',
                          style: TextStyle(fontWeight: FontWeight.bold, color: anaRenk)),
                      ElevatedButton.icon(
                        onPressed: _parcaCek,
                        icon: const Icon(Icons.inventory_2, size: 18),
                        label: const Text('Parça Çek'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (kullanilanParcalar.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 14),
                      child: Text('Henüz parça çekilmedi.',
                          style: TextStyle(color: Color(0xFF7B8794))),
                    )
                  else
                    ...kullanilanParcalar.map((p) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                          title: Text('${p['name']}'),
                          subtitle: Text('${p['code']} · ${p['quantity']} adet'),
                          trailing: Text(paraFormat(p['line_total']),
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                        )),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Parça Toplamı'),
                      Text(paraFormat(e['parts_total']),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('İşçilik Toplamı'),
                      Text(paraFormat(e['labor_total']),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: _durumGuncelle,
            icon: const Icon(Icons.sync),
            label: const Text('İş Emri Durumunu Güncelle'),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}
