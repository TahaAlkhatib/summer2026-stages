import { useEffect, useState } from 'react'
import { api } from './api'
import { para, tarihSaat } from './bicim'
import { barkodSvg } from './barkod'

export default function Irsaliyeler() {
  const [liste, setListe] = useState([])
  const [detay, setDetay] = useState(null)
  const [hata, setHata] = useState('')

  useEffect(() => {
    api.get('/manifests').then(setListe).catch((e) => setHata(e.message))
  }, [])

  async function ac(irsaliye) {
    try {
      setDetay(await api.get('/manifests/' + irsaliye.id))
      setHata('')
    } catch (e) { setHata(e.message) }
  }

  if (detay) {
    return <IrsaliyeBasim veri={detay} onGeri={() => setDetay(null)} />
  }

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>İrsaliyeler</h2>
          <p>{liste.length} kayıt</p>
        </div>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}

      <div className="tablo-kutu">
        <table>
          <thead>
            <tr>
              <th>Kod</th><th>Tip</th><th>Çıkış</th><th>Hedef</th>
              <th className="sag">Kalem</th><th>Oluşturan</th><th>Tarih</th><th className="sag"></th>
            </tr>
          </thead>
          <tbody>
            {liste.length === 0 && <tr><td colSpan="8" className="bos">Henüz irsaliye yok.</td></tr>}
            {liste.map((i) => (
              <tr key={i.id}>
                <td><b>{i.code}</b></td>
                <td>
                  <span className={'rozet ' + (i.type === 'kurye_dagitim' ? 'rozet-turuncu' : 'rozet-mavi')}>
                    {i.type === 'kurye_dagitim' ? 'Kurye Dağıtım' : 'Şube Sevk'}
                  </span>
                </td>
                <td>{i.origin_branch_name}</td>
                <td>{i.courier_name || i.dest_branch_name || '-'}</td>
                <td className="sag">{i.item_count}</td>
                <td className="kucuk">{i.created_by_name}</td>
                <td className="kucuk">{tarihSaat(i.created_at)}</td>
                <td className="sag">
                  <button className="dugme dugme-kucuk" onClick={() => ac(i)}>Aç / Yazdır</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// İrsaliye basım görünümü — yazdırıldığında sadece bu kısım çıkar
function IrsaliyeBasim({ veri, onGeri }) {
  const i = veri.manifest
  let kapidaToplam = 0
  let desiToplam = 0
  for (const k of veri.items) {
    kapidaToplam += Number(k.cod_amount)
    desiToplam += Number(k.desi)
  }

  return (
    <>
      <div className="sayfa-basligi yazdirma-gizle">
        <div>
          <h2>{i.code}</h2>
          <p>{i.type === 'kurye_dagitim' ? 'Kurye dağıtım irsaliyesi' : 'Şubeler arası sevk irsaliyesi'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dugme-ikincil" onClick={onGeri}>← Listeye Dön</button>
          <button className="dugme-turuncu" onClick={() => window.print()}>Yazdır</button>
        </div>
      </div>

      <div className="kart">
        <div style={{ display: 'flex', justifyContent: 'space-between',
          borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>HIZLI KARGO</h2>
            <div className="kucuk">
              {i.type === 'kurye_dagitim' ? 'DAĞITIM İRSALİYESİ' : 'SEVK İRSALİYESİ'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div dangerouslySetInnerHTML={{ __html: barkodSvg(i.code) }} />
            <div style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{i.code}</div>
          </div>
        </div>

        <div className="izgara izgara-4" style={{ marginBottom: 14 }}>
          <div><label>Çıkış Şubesi</label><b>{i.origin_branch_name}</b></div>
          <div>
            <label>{i.type === 'kurye_dagitim' ? 'Kurye' : 'Varış Şubesi'}</label>
            <b>{i.courier_name ? `${i.courier_name} (${i.plate || '-'})` : i.dest_branch_name}</b>
          </div>
          <div><label>Düzenleyen</label><b>{i.created_by_name}</b></div>
          <div><label>Tarih</label><b>{tarihSaat(i.created_at)}</b></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th>
              <th>Barkod</th><th>Alıcı</th><th>Adres</th><th>İlçe</th>
              <th className="sag">Desi</th><th className="sag">Kapıda Ödeme</th>
              <th style={{ width: 90 }}>Teslim İmza</th>
            </tr>
          </thead>
          <tbody>
            {veri.items.map((k, sira) => (
              <tr key={k.id}>
                <td>{sira + 1}</td>
                <td style={{ fontFamily: 'monospace' }}>{k.barcode}</td>
                <td>{k.receiver_name}<div className="kucuk soluk">{k.receiver_phone}</div></td>
                <td className="kucuk">{k.receiver_address}</td>
                <td>{k.receiver_district}</td>
                <td className="sag">{k.desi}</td>
                <td className="sag">{Number(k.cod_amount) > 0 ? para(k.cod_amount) : '-'}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
              <td colSpan="5" style={{ padding: '9px 10px' }}>
                Toplam {veri.items.length} gönderi
              </td>
              <td className="sag" style={{ padding: '9px 10px' }}>{desiToplam.toFixed(1)}</td>
              <td className="sag" style={{ padding: '9px 10px' }}>{para(kapidaToplam)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: 5 }}>Teslim Eden (İmza)</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: 5 }}>Teslim Alan (İmza)</div>
          </div>
        </div>
      </div>
    </>
  )
}
