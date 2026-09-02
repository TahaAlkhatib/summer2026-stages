<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { para, ISLEM_TIPLERI, GAYRIMENKUL_TIPLERI } from '../bicim'

const liste = ref([])
const musteriler = ref([])
const ilceler = ref([])
const hata = ref('')
const bilgi = ref('')
const yukleniyor = ref(true)

const pencereAcik = ref(false)
const kaydediliyor = ref(false)
const yeni = ref(bosTalep())

// Eşleştirme sonucu penceresi
const eslesmeAcik = ref(false)
const eslesmeVerisi = ref(null)

function bosTalep() {
  return {
    customer_id: '', listing_type: 'kiralik', property_type: '', district: '',
    min_price: null, max_price: null, min_area: null, min_room_count: '',
    needs_parking: false, notes: '',
  }
}

async function yukle() {
  yukleniyor.value = true
  try {
    liste.value = await api.get('/demands?status=aktif')
    hata.value = ''
  } catch (e) { hata.value = e.message }
  yukleniyor.value = false
}

onMounted(async () => {
  await yukle()
  try {
    musteriler.value = await api.get('/customers')
    ilceler.value = await api.get('/properties/districts')
  } catch (e) { /* boş kalır */ }
})

async function kaydet() {
  kaydediliyor.value = true
  hata.value = ''
  try {
    const veri = { ...yeni.value }
    for (const alan of ['min_price', 'max_price', 'min_area']) {
      if (veri[alan] === '') veri[alan] = null
    }
    await api.post('/demands', veri)
    bilgi.value = 'Talep kaydedildi. Eşleşen portföyleri hemen görebilirsiniz.'
    pencereAcik.value = false
    yeni.value = bosTalep()
    await yukle()
  } catch (e) { hata.value = e.message }
  kaydediliyor.value = false
}

async function eslestir(talep) {
  hata.value = ''
  try {
    eslesmeVerisi.value = await api.get('/demands/' + talep.id + '/matches')
    eslesmeAcik.value = true
  } catch (e) { hata.value = e.message }
}

async function kapat(talep) {
  if (!confirm('Talep kapatılsın mı?')) return
  try {
    await api.put('/demands/' + talep.id + '/close')
    bilgi.value = 'Talep kapatıldı.'
    await yukle()
  } catch (e) { hata.value = e.message }
}

function kriterMetni(t) {
  const parcalar = []
  parcalar.push(ISLEM_TIPLERI[t.listing_type])
  if (t.property_type) parcalar.push(GAYRIMENKUL_TIPLERI[t.property_type])
  if (t.district) parcalar.push(t.district)
  if (t.min_room_count) parcalar.push(t.min_room_count + ' ve üzeri')
  if (t.min_area) parcalar.push(t.min_area + ' m² +')
  if (t.needs_parking) parcalar.push('otoparklı')
  return parcalar.join(' · ')
}

function butceMetni(t) {
  if (t.min_price && t.max_price) return para(t.min_price) + ' - ' + para(t.max_price)
  if (t.max_price) return 'En fazla ' + para(t.max_price)
  if (t.min_price) return 'En az ' + para(t.min_price)
  return 'Belirtilmemiş'
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Talepler</h2>
      <p>Müşteri kriterleri portföyle otomatik eşleştirilir</p>
    </div>
    <button class="dugme" @click="pencereAcik = true">+ Yeni Talep</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="tablo-kutu">
    <table>
      <thead>
        <tr>
          <th>Müşteri</th>
          <th>Kriterler</th>
          <th>Bütçe</th>
          <th class="sag">Eşleşme</th>
          <th class="sag">İşlem</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="yukleniyor"><td colspan="5" class="bos">Yükleniyor...</td></tr>
        <tr v-else-if="liste.length === 0"><td colspan="5" class="bos">Aktif talep yok.</td></tr>
        <tr v-for="t in liste" :key="t.id">
          <td>
            <b>{{ t.customer.full_name }}</b>
            <div class="kucuk soluk">{{ t.customer.phone }}</div>
          </td>
          <td class="kucuk">{{ kriterMetni(t) }}</td>
          <td class="kucuk">{{ butceMetni(t) }}</td>
          <td class="sag">
            <span class="rozet" :class="t.match_count > 0 ? 'rozet-yesil' : 'rozet-gri'">
              {{ t.match_count }} portföy
            </span>
          </td>
          <td class="sag" style="white-space: nowrap">
            <button class="dugme dugme-kucuk" @click="eslestir(t)">Eşleşenleri Gör</button>
            <button class="dugme-ikincil dugme-kucuk" style="margin-left: 6px" @click="kapat(t)">Kapat</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Yeni talep -->
  <div v-if="pencereAcik" class="perde" @click.self="pencereAcik = false">
    <form class="pencere" style="max-width: 640px" @submit.prevent="kaydet">
      <div class="pencere-ust">
        <h3>Yeni Talep</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="pencereAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
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
            <label>İşlem</label>
            <select v-model="yeni.listing_type">
              <option v-for="(v, k) in ISLEM_TIPLERI" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div class="alan">
            <label>Tip (isteğe bağlı)</label>
            <select v-model="yeni.property_type">
              <option value="">Farketmez</option>
              <option v-for="(v, k) in GAYRIMENKUL_TIPLERI" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div class="alan">
            <label>İlçe (isteğe bağlı)</label>
            <select v-model="yeni.district">
              <option value="">Farketmez</option>
              <option v-for="i in ilceler" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>
        </div>

        <div class="izgara izgara-4">
          <div class="alan"><label>En düşük fiyat</label><input v-model.number="yeni.min_price" type="number" min="0" /></div>
          <div class="alan"><label>En yüksek fiyat</label><input v-model.number="yeni.max_price" type="number" min="0" /></div>
          <div class="alan"><label>En az m²</label><input v-model.number="yeni.min_area" type="number" min="0" /></div>
          <div class="alan"><label>En az oda</label><input v-model="yeni.min_room_count" placeholder="2+1" /></div>
        </div>

        <label class="onay" style="margin-top: 6px">
          <input type="checkbox" v-model="yeni.needs_parking" /> Otopark şart
        </label>

        <div class="alan" style="margin-top: 12px">
          <label>Not</label>
          <textarea v-model="yeni.notes" rows="2"></textarea>
        </div>

        <p class="kucuk soluk">Boş bıraktığınız kriterler eşleştirmede dikkate alınmaz.</p>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="pencereAcik = false">Vazgeç</button>
        <button class="dugme" :disabled="kaydediliyor">{{ kaydediliyor ? 'Kaydediliyor...' : 'Talebi Kaydet' }}</button>
      </div>
    </form>
  </div>

  <!-- Eşleşen portföyler -->
  <div v-if="eslesmeAcik" class="perde" @click.self="eslesmeAcik = false">
    <div class="pencere" style="max-width: 860px">
      <div class="pencere-ust">
        <h3>
          Eşleşen Portföyler —
          {{ eslesmeVerisi?.demand?.customer?.full_name }}
        </h3>
        <button class="dugme-ikincil dugme-kucuk" @click="eslesmeAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde" style="padding: 0">
        <div v-if="!eslesmeVerisi?.matches?.length" class="bos">
          Bu kriterlere uyan aktif portföy bulunamadı.
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Kod</th>
              <th>İlan</th>
              <th>Konum</th>
              <th>Özellik</th>
              <th class="sag">Fiyat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in eslesmeVerisi.matches" :key="p.id">
              <td><router-link :to="'/portfoy/' + p.id"><b>{{ p.code }}</b></router-link></td>
              <td>{{ p.title }}</td>
              <td class="kucuk">{{ p.district }}<div class="soluk">{{ p.neighborhood }}</div></td>
              <td class="kucuk">{{ p.room_count }} · {{ p.gross_area }} m²</td>
              <td class="sag"><b>{{ para(p.price) }}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
