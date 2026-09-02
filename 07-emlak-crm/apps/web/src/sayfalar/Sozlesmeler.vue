<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import {
  para, tarih, bugun, SOZLESME_TIPLERI, SOZLESME_DURUMLARI,
} from '../bicim'

const liste = ref([])
const portfoyler = ref([])
const musteriler = ref([])
const danismanlar = ref([])
const filtre = ref({ type: '', status: '' })
const hata = ref('')
const bilgi = ref('')
const yukleniyor = ref(true)

const pencereAcik = ref(false)
const kaydediliyor = ref(false)
const yeni = ref(bosSozlesme())

function bosSozlesme() {
  return {
    type: 'kira', property_id: '', customer_id: '', agent_id: '',
    start_date: bugun(), amount: null, deposit: null,
    duration_months: 12, payment_day: 5, commission_rate: 100, notes: '',
  }
}

async function yukle() {
  yukleniyor.value = true
  try {
    const p = new URLSearchParams()
    for (const [a, d] of Object.entries(filtre.value)) if (d) p.append(a, d)
    liste.value = await api.get('/contracts?' + p.toString())
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

// Portföy seçilince fiyatı sözleşme tutarına önerelim
function portfoySecildi() {
  const p = portfoyler.value.find((x) => x.id === yeni.value.property_id)
  if (!p) return
  yeni.value.amount = Number(p.price)
  yeni.value.type = p.listing_type === 'kiralik' ? 'kira' : 'satis'
  if (yeni.value.type === 'kira') {
    yeni.value.deposit = Number(p.price) * 2
    yeni.value.commission_rate = 100
  } else {
    yeni.value.deposit = 0
    yeni.value.commission_rate = 2
  }
}

async function kaydet() {
  kaydediliyor.value = true
  hata.value = ''
  try {
    const veri = { ...yeni.value }
    if (veri.type === 'satis') {
      veri.duration_months = null
      veri.payment_day = null
    }
    const s = await api.post('/contracts', veri)
    bilgi.value = s.code + ' numaralı sözleşme oluşturuldu.'
      + (s.type === 'kira' ? ` ${s.installments.length} aylık taksit takvimi hazırlandı.` : '')
    pencereAcik.value = false
    yeni.value = bosSozlesme()
    await yukle()
  } catch (e) { hata.value = e.message }
  kaydediliyor.value = false
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Sözleşmeler</h2>
      <p>{{ liste.length }} kayıt</p>
    </div>
    <button class="dugme" @click="pencereAcik = true">+ Yeni Sözleşme</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="filtreler">
    <div class="alan">
      <label>Tip</label>
      <select v-model="filtre.type">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in SOZLESME_TIPLERI" :key="k" :value="k">{{ v }}</option>
      </select>
    </div>
    <div class="alan">
      <label>Durum</label>
      <select v-model="filtre.status">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in SOZLESME_DURUMLARI" :key="k" :value="k">{{ v.etiket }}</option>
      </select>
    </div>
    <button class="dugme" @click="yukle">Listele</button>
  </div>

  <div class="tablo-kutu">
    <table>
      <thead>
        <tr>
          <th>Kod</th>
          <th>Tip</th>
          <th>Portföy</th>
          <th>Müşteri</th>
          <th>Başlangıç</th>
          <th class="sag">Tutar</th>
          <th class="sag">Komisyon</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="yukleniyor"><td colspan="8" class="bos">Yükleniyor...</td></tr>
        <tr v-else-if="liste.length === 0"><td colspan="8" class="bos">Kayıt yok.</td></tr>
        <tr v-for="s in liste" :key="s.id">
          <td><router-link :to="'/sozlesmeler/' + s.id"><b>{{ s.code }}</b></router-link></td>
          <td>
            <span class="rozet" :class="s.type === 'kira' ? 'rozet-mavi' : 'rozet-yesil'">
              {{ SOZLESME_TIPLERI[s.type] }}
            </span>
          </td>
          <td>
            {{ s.property.title }}
            <div class="kucuk soluk">{{ s.property.code }} · {{ s.property.district }}</div>
          </td>
          <td>{{ s.customer.full_name }}</td>
          <td>
            {{ tarih(s.start_date) }}
            <div class="kucuk soluk" v-if="s.end_date">bitiş {{ tarih(s.end_date) }}</div>
          </td>
          <td class="sag">
            <b>{{ para(s.amount) }}</b>
            <div class="kucuk soluk" v-if="s.type === 'kira'">aylık</div>
          </td>
          <td class="sag">{{ para(s.commission_amount) }}</td>
          <td>
            <span class="rozet" :class="SOZLESME_DURUMLARI[s.status].sinif">
              {{ SOZLESME_DURUMLARI[s.status].etiket }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="pencereAcik" class="perde" @click.self="pencereAcik = false">
    <form class="pencere" style="max-width: 620px" @submit.prevent="kaydet">
      <div class="pencere-ust">
        <h3>Yeni Sözleşme</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="pencereAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
        <div class="alan">
          <label>Portföy</label>
          <select v-model="yeni.property_id" @change="portfoySecildi">
            <option value="">Seçin</option>
            <option v-for="p in portfoyler" :key="p.id" :value="p.id">
              {{ p.code }} — {{ p.title }} ({{ para(p.price) }})
            </option>
          </select>
        </div>

        <div class="izgara izgara-2">
          <div class="alan">
            <label>Müşteri</label>
            <select v-model="yeni.customer_id">
              <option value="">Seçin</option>
              <option v-for="m in musteriler" :key="m.id" :value="m.id">{{ m.full_name }}</option>
            </select>
          </div>
          <div class="alan">
            <label>Danışman</label>
            <select v-model="yeni.agent_id">
              <option value="">Seçin</option>
              <option v-for="d in danismanlar" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
        </div>

        <div class="izgara izgara-3">
          <div class="alan">
            <label>Sözleşme Tipi</label>
            <select v-model="yeni.type">
              <option v-for="(v, k) in SOZLESME_TIPLERI" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div class="alan"><label>Başlangıç</label><input type="date" v-model="yeni.start_date" /></div>
          <div class="alan">
            <label>{{ yeni.type === 'kira' ? 'Aylık Kira (₺)' : 'Satış Bedeli (₺)' }}</label>
            <input type="number" v-model.number="yeni.amount" min="1" />
          </div>
        </div>

        <div class="izgara izgara-3" v-if="yeni.type === 'kira'">
          <div class="alan"><label>Süre (ay)</label><input type="number" v-model.number="yeni.duration_months" min="1" max="120" /></div>
          <div class="alan"><label>Ödeme Günü</label><input type="number" v-model.number="yeni.payment_day" min="1" max="28" /></div>
          <div class="alan"><label>Depozito (₺)</label><input type="number" v-model.number="yeni.deposit" min="0" /></div>
        </div>

        <div class="alan">
          <label>Komisyon Oranı (%)</label>
          <input type="number" v-model.number="yeni.commission_rate" min="0" max="100" step="0.5" />
          <p class="kucuk soluk" style="margin: 4px 0 0">
            Kirada bir aylık kira üzerinden (%100), satışta bedel üzerinden hesaplanır.
          </p>
        </div>

        <div class="alan"><label>Not</label><textarea v-model="yeni.notes" rows="2"></textarea></div>

        <div class="uyari uyari-bilgi" v-if="yeni.type === 'kira'">
          Kira sözleşmesi kaydedilince <b>{{ yeni.duration_months || 0 }} aylık taksit takvimi</b>
          otomatik oluşturulur.
        </div>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="pencereAcik = false">Vazgeç</button>
        <button class="dugme" :disabled="kaydediliyor">{{ kaydediliyor ? 'Kaydediliyor...' : 'Sözleşmeyi Oluştur' }}</button>
      </div>
    </form>
  </div>
</template>
