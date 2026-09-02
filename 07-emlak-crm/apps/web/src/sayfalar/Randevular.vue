<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import {
  tarih, saat, bugun, RANDEVU_DURUMLARI, ILGI_SEVIYELERI,
} from '../bicim'

const liste = ref([])
const portfoyler = ref([])
const musteriler = ref([])
const danismanlar = ref([])
const filtre = ref({ status: 'planlandi', agent_id: '', from: '', to: '' })
const hata = ref('')
const bilgi = ref('')
const yukleniyor = ref(true)

const pencereAcik = ref(false)
const kaydediliyor = ref(false)
const yeni = ref({ property_id: '', customer_id: '', agent_id: '', tarih: bugun(), saat: '14:00' })

const sonucAcik = ref(false)
const seciliRandevu = ref(null)
const sonuc = ref({ interest_level: 'orta', result_note: '' })

async function yukle() {
  yukleniyor.value = true
  try {
    const p = new URLSearchParams()
    for (const [a, d] of Object.entries(filtre.value)) if (d) p.append(a, d)
    liste.value = await api.get('/appointments?' + p.toString())
    hata.value = ''
  } catch (e) { hata.value = e.message }
  yukleniyor.value = false
}

onMounted(async () => {
  await yukle()
  try {
    portfoyler.value = await api.get('/properties?status=aktif')
    musteriler.value = await api.get('/customers')
    danismanlar.value = await api.get('/agents')
  } catch (e) { /* boş kalır */ }
})

async function kaydet() {
  kaydediliyor.value = true
  hata.value = ''
  try {
    await api.post('/appointments', {
      property_id: yeni.value.property_id,
      customer_id: yeni.value.customer_id,
      agent_id: yeni.value.agent_id,
      scheduled_at: yeni.value.tarih + ' ' + yeni.value.saat + ':00',
    })
    bilgi.value = 'Randevu oluşturuldu.'
    pencereAcik.value = false
    yeni.value = { property_id: '', customer_id: '', agent_id: '', tarih: bugun(), saat: '14:00' }
    await yukle()
  } catch (e) { hata.value = e.message }
  kaydediliyor.value = false
}

function sonucAc(randevu) {
  seciliRandevu.value = randevu
  sonuc.value = { interest_level: 'orta', result_note: '' }
  sonucAcik.value = true
}

async function sonucKaydet() {
  hata.value = ''
  try {
    await api.put('/appointments/' + seciliRandevu.value.id + '/complete', sonuc.value)
    bilgi.value = 'Randevu sonucu kaydedildi.'
    sonucAcik.value = false
    await yukle()
  } catch (e) { hata.value = e.message }
}

async function iptalEt(randevu) {
  if (!confirm('Randevu iptal edilsin mi?')) return
  try {
    await api.put('/appointments/' + randevu.id + '/cancel', {})
    bilgi.value = 'Randevu iptal edildi.'
    await yukle()
  } catch (e) { hata.value = e.message }
}

// Randevuları güne göre grupluyoruz — ajanda görünümü daha okunaklı
function gunlereBol(kayitlar) {
  const gruplar = {}
  for (const r of kayitlar) {
    const gun = (r.scheduled_at || '').slice(0, 10)
    if (!gruplar[gun]) gruplar[gun] = []
    gruplar[gun].push(r)
  }
  return Object.entries(gruplar).sort((a, b) => a[0].localeCompare(b[0]))
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Randevular</h2>
      <p>{{ liste.length }} kayıt</p>
    </div>
    <button class="dugme" @click="pencereAcik = true">+ Yeni Randevu</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="filtreler">
    <div class="alan">
      <label>Durum</label>
      <select v-model="filtre.status">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in RANDEVU_DURUMLARI" :key="k" :value="k">{{ v.etiket }}</option>
      </select>
    </div>
    <div class="alan">
      <label>Danışman</label>
      <select v-model="filtre.agent_id">
        <option value="">Hepsi</option>
        <option v-for="d in danismanlar" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>
    <div class="alan"><label>Başlangıç</label><input type="date" v-model="filtre.from" /></div>
    <div class="alan"><label>Bitiş</label><input type="date" v-model="filtre.to" /></div>
    <button class="dugme" @click="yukle">Listele</button>
  </div>

  <div v-if="yukleniyor" class="bos">Yükleniyor...</div>
  <div v-else-if="liste.length === 0" class="kart bos">Bu filtrede randevu yok.</div>

  <div v-else v-for="[gun, kayitlar] in gunlereBol(liste)" :key="gun" class="kart">
    <h3>
      {{ tarih(gun) }}
      <span class="soluk kucuk" style="font-weight: normal">— {{ kayitlar.length }} randevu</span>
      <span v-if="gun === bugun()" class="rozet rozet-sari" style="margin-left: 8px">Bugün</span>
    </h3>

    <table>
      <tbody>
        <tr v-for="r in kayitlar" :key="r.id">
          <td style="width: 60px"><b>{{ saat(r.scheduled_at) }}</b></td>
          <td>
            <b>{{ r.customer.full_name }}</b>
            <div class="kucuk soluk">{{ r.customer.phone }}</div>
          </td>
          <td>
            {{ r.property.title }}
            <div class="kucuk soluk">{{ r.property.code }} · {{ r.property.district }}</div>
          </td>
          <td class="kucuk">{{ r.agent.name }}</td>
          <td>
            <span class="rozet" :class="RANDEVU_DURUMLARI[r.status].sinif">
              {{ RANDEVU_DURUMLARI[r.status].etiket }}
            </span>
            <div v-if="r.interest_level" style="margin-top: 4px">
              <span class="rozet" :class="ILGI_SEVIYELERI[r.interest_level].sinif">
                {{ ILGI_SEVIYELERI[r.interest_level].etiket }}
              </span>
            </div>
            <div class="kucuk soluk" v-if="r.result_note" style="margin-top: 4px">"{{ r.result_note }}"</div>
          </td>
          <td class="sag" style="white-space: nowrap">
            <template v-if="r.status === 'planlandi'">
              <button class="dugme dugme-kucuk" @click="sonucAc(r)">Sonuç Gir</button>
              <button class="dugme-tehlike dugme-kucuk" style="margin-left: 6px" @click="iptalEt(r)">İptal</button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Yeni randevu -->
  <div v-if="pencereAcik" class="perde" @click.self="pencereAcik = false">
    <form class="pencere" style="max-width: 560px" @submit.prevent="kaydet">
      <div class="pencere-ust">
        <h3>Yeni Randevu</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="pencereAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
        <div class="alan">
          <label>Portföy</label>
          <select v-model="yeni.property_id">
            <option value="">Seçin</option>
            <option v-for="p in portfoyler" :key="p.id" :value="p.id">
              {{ p.code }} — {{ p.title }}
            </option>
          </select>
        </div>
        <div class="alan">
          <label>Müşteri</label>
          <select v-model="yeni.customer_id">
            <option value="">Seçin</option>
            <option v-for="m in musteriler" :key="m.id" :value="m.id">
              {{ m.full_name }} — {{ m.phone }}
            </option>
          </select>
        </div>
        <div class="izgara izgara-3">
          <div class="alan">
            <label>Danışman</label>
            <select v-model="yeni.agent_id">
              <option value="">Seçin</option>
              <option v-for="d in danismanlar" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="alan"><label>Tarih</label><input type="date" v-model="yeni.tarih" /></div>
          <div class="alan"><label>Saat</label><input type="time" v-model="yeni.saat" /></div>
        </div>
        <p class="kucuk soluk">Aynı danışmanın bir saat içinde başka randevusu varsa sistem uyarır.</p>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="pencereAcik = false">Vazgeç</button>
        <button class="dugme" :disabled="kaydediliyor">{{ kaydediliyor ? 'Kaydediliyor...' : 'Randevuyu Oluştur' }}</button>
      </div>
    </form>
  </div>

  <!-- Randevu sonucu -->
  <div v-if="sonucAcik" class="perde" @click.self="sonucAcik = false">
    <form class="pencere" style="max-width: 480px" @submit.prevent="sonucKaydet">
      <div class="pencere-ust">
        <h3>Randevu Sonucu</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="sonucAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
        <p style="margin-top: 0">
          <b>{{ seciliRandevu?.customer?.full_name }}</b> —
          {{ seciliRandevu?.property?.title }}
        </p>
        <div class="alan">
          <label>İlgi Seviyesi</label>
          <select v-model="sonuc.interest_level">
            <option v-for="(v, k) in ILGI_SEVIYELERI" :key="k" :value="k">{{ v.etiket }}</option>
          </select>
        </div>
        <div class="alan">
          <label>Sonuç Notu</label>
          <textarea v-model="sonuc.result_note" rows="3"
            placeholder="Örn: Müşteri beğendi, fiyat pazarlığı yapmak istiyor."></textarea>
        </div>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="sonucAcik = false">Vazgeç</button>
        <button class="dugme">Kaydet</button>
      </div>
    </form>
  </div>
</template>
