// Basit Code 39 barkod çizici.
//
// Hazır kütüphane kullanmak yerine kendimiz çizdik: Code 39 her karakteri
// 9 çubuğa (5 siyah + 4 beyaz) çevirir, bunların 3 tanesi geniştir.
// Barkod okuyucular bu formatı doğrudan okuyabiliyor.

const DESENLER = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn',
}

const DAR = 2
const GENIS = 5
const YUKSEKLIK = 46

// Barkodu SVG olarak üretir
export function barkodSvg(metin) {
  const veri = '*' + String(metin).toUpperCase() + '*'
  const cubuklar = []
  let x = 0

  for (const karakter of veri) {
    const desen = DESENLER[karakter]
    if (!desen) continue

    for (let i = 0; i < desen.length; i++) {
      const genislik = desen[i] === 'w' ? GENIS : DAR
      // Çift indisler siyah çubuk, tekler boşluk
      if (i % 2 === 0) {
        cubuklar.push(`<rect x="${x}" y="0" width="${genislik}" height="${YUKSEKLIK}" fill="#000"/>`)
      }
      x += genislik
    }
    x += DAR // karakterler arası boşluk
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${YUKSEKLIK}" viewBox="0 0 ${x} ${YUKSEKLIK}">${cubuklar.join('')}</svg>`
}
