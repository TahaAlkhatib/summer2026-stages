import 'package:flutter/material.dart';
import '../api.dart';
import '../main.dart';
import 'giris_ekrani.dart';
import 'is_detay_ekrani.dart';

class IsListesiEkrani extends StatefulWidget {
  const IsListesiEkrani({super.key});

  @override
  State<IsListesiEkrani> createState() => _IsListesiEkraniDurumu();
}

class _IsListesiEkraniDurumu extends State<IsListesiEkrani> {
  List<dynamic> _isler = [];
  String _hata = '';
  bool _yukleniyor = true;
  String _durumFiltresi = '';

  // Tabletten seçilebilen durum sekmeleri
  final List<Map<String, String>> _sekmeler = [
    {'kod': '', 'ad': 'Tümü'},
    {'kod': 'acildi', 'ad': 'Açıldı'},
    {'kod': 'incelemede', 'ad': 'İncelemede'},
    {'kod': 'tamirde', 'ad': 'Tamirde'},
  ];

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
      final yol = _durumFiltresi.isEmpty
          ? '/jobcards'
          : '/jobcards?status=$_durumFiltresi';
      final liste = await Api.get(yol);
      setState(() {
        _isler = liste as List<dynamic>;
        _yukleniyor = false;
      });
    } catch (e) {
      setState(() {
        _hata = e.toString();
        _yukleniyor = false;
      });
    }
  }

  Future<void> _cikisYap() async {
    await Api.oturumuKapat();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const GirisEkrani()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final kullanici = Api.kullanici;

    return Scaffold(
      appBar: AppBar(
        title: const Text('İş Emirleri'),
        actions: [
          if (kullanici != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Center(child: Text(kullanici['full_name'] ?? '')),
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Çıkış Yap',
            onPressed: _cikisYap,
          ),
        ],
      ),
      body: Column(
        children: [
          // Durum sekmeleri
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: _sekmeler.map((s) {
                final secili = _durumFiltresi == s['kod'];
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: ChoiceChip(
                    label: Text(s['ad']!),
                    selected: secili,
                    selectedColor: anaRenk,
                    labelStyle: TextStyle(
                      color: secili ? Colors.white : const Color(0xFF3E4C59),
                      fontWeight: secili ? FontWeight.bold : FontWeight.normal,
                    ),
                    onSelected: (_) {
                      setState(() => _durumFiltresi = s['kod']!);
                      _yukle();
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          if (_hata.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              color: const Color(0xFFFFE3E3),
              child: Text(_hata, style: const TextStyle(color: Color(0xFFA61B1B))),
            ),

          Expanded(
            child: _yukleniyor
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _yukle,
                    child: _isler.isEmpty
                        ? ListView(children: const [
                            SizedBox(height: 60),
                            Center(child: Text('İş emri bulunmuyor.',
                                style: TextStyle(color: Color(0xFF7B8794)))),
                          ])
                        : ListView.builder(
                            padding: const EdgeInsets.all(14),
                            itemCount: _isler.length,
                            itemBuilder: (context, i) => _isKarti(_isler[i]),
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _isKarti(dynamic isEmri) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () async {
          await Navigator.of(context).push(MaterialPageRoute(
            builder: (_) => IsDetayEkrani(isEmriId: isEmri['id']),
          ));
          _yukle();
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isEmri['job_no'] ?? '',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                  DurumRozeti(durum: isEmri['status'] ?? ''),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F2933),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(isEmri['plate'] ?? '',
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                  const SizedBox(width: 12),
                  Text('${isEmri['brand'] ?? ''} ${isEmri['model'] ?? ''}',
                      style: const TextStyle(fontSize: 15)),
                ],
              ),
              const SizedBox(height: 8),
              Text(isEmri['customer_name'] ?? '',
                  style: const TextStyle(color: Color(0xFF52606D))),
              const SizedBox(height: 8),
              Text(isEmri['complaint_text'] ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Color(0xFF7B8794), fontSize: 13)),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Açılış: ${tarihFormat(isEmri['opened_at'])}',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF7B8794))),
                  Text(paraFormat(isEmri['grand_total']),
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
