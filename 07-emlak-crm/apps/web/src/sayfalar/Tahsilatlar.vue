<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { para, tarih, TAKSIT_DURUMLARI, ODEME_YONTEMLERI } from '../bicim'

const liste = ref([])
const gunSayisi = ref(15)
const sadeceGeciken = ref(false)
const hata = ref('')
const bilgi = ref('')
const yukleniyor = ref(true)

const tahsilatAcik = ref(false)
const seciliTaksit = ref(null)
const tahsilat = ref({ amount: null, payment_method: 'havale' })

async function yukle() {
  yukleniyor.value = true
  try {
    liste.value = await api.get('/installments?reminders=1&days=' + gunSayisi.value)
    hata.value = ''
  } catch (e) { hata.value = e.message }
  yukleniyor.value = false
}

onMounted(yukle)

async function gecikenleriIsaretle() {
  try {
    const cevap = await api.post('/installments/refresh-overdue')
    bilgi.value = cevap.message
    await yukle()
  } catch (e) { hata.value = e.message }
}

function tahsilatAc(t) {
  seciliTaksit.value = t
  tahsilat.value = { amount: t.remaining, payment_method: 'havale' }
  tahsilatAcik.value = true
}

async function tahsilatKaydet() {
  hata.value = ''
  try {
    const cevap = await api.put('/installments/' + seciliTaksit.value.id + '/pay', tahsilat.value)
    bilgi.value = cevap.message
    tahsilatAcik.value = false
    await yukle()
  } catch (e) { hata.value = e.message }
}

function gosterilenler() {
  return sadeceGeciken.value ? liste.value.filter((t) => t.is_overdue) : liste.value
}

function toplamTutar() {
  return gosterilenler().reduce((t, x) => t + Number(x.remaining), 0)
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Kira Tahsilatları</h2>
      <p>Vadesi yaklaşan ve geciken ödemeler</p>
    </div>
    <button class="dugme-ikincil" @click="gecikenleriIsaretle">Gecikenleri İşaretle</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="filtreler">
    <div class="alan">
      <label>Önümüzdeki gün sayısı</label>
      <select v-model.number="gunSayisi" @change="yukle">
        <option :value="7">7 gün</option>
        <option :value="15">15 gün</option>
        <option :value="30">30 gün</option>
        <option :value="60">60 gün</option>
      </select>
    </div>
    <label class="onay" style="align-self: center; padding-bottom: 9px">
      <input type="checkbox" v-model="sadeceGeciken" /> Sadece gecikenler
    </label>
  </div>

  <div class="kartlar" style="margin-bottom: 16px">
    <div class="ozet-kart">
      <div class="etiket">Listelenen ödeme</div>
      <div class="deger">{{ gosterilenler().length }}</div>
    </div>
    <div class="ozet-kart">
      <div class="etiket">Toplam beklenen</div>
      <div class="deger" style="color: var(--altin)">{{ para(toplamTutar()) }}</div>
    </div>
    <div class="ozet-kart">
      <div class="etiket">Geciken</div>
      <div class="deger" style="color: var(--kirmizi)">
        {{ liste.filter((t) => t.is_overdue).length }}
      </div>
    </div>
  </div>

  <div class="tablo-kutu">
    <table>
      <thead>
        <tr>
          <th>Kiracı</th>
          <th>Portföy</th>
          <th>Dönem</th>
          <th>Vade</th>
          <th class="sag">Tutar</th>
          <th class="sag">Kalan</th>
          <th>Durum</th>
          <th class="sag"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="yukleniyor"><td colspan="8" class="bos">Yükleniyor...</td></tr>
        <tr v-else-if="gosterilenler().length === 0"><td colspan="8" class="bos">Kayıt yok.</td></tr>
        <tr v-for="t in gosterilenler()" :key="t.id">
          <td>
            <b>{{ t.contract.customer.full_name }}</b>
            <div class="kucuk soluk">{{ t.contract.code }}</div>
          </td>
          <td class="kucuk">
            {{ t.contract.property.title }}
            <div class="soluk">{{ t.contract.property.district }}</div>
          </td>
          <td>{{ t.period }}</td>
          <td>
            {{ tarih(t.due_date) }}
            <div class="kucuk" :class="t.is_overdue ? '' : 'soluk'"
              :style="t.is_overdue ? 'color: var(--kirmizi)' : ''">
              {{ t.is_overdue ? (-t.days_left) + ' gün gecikti' : t.days_left + ' gün kaldı' }}
            </div>
          </td>
          <td class="sag">{{ para(t.amount) }}</td>
          <td class="sag"><b>{{ para(t.remaining) }}</b></td>
          <td>
            <span class="rozet" :class="TAKSIT_DURUMLARI[t.status].sinif">
              {{ TAKSIT_DURUMLARI[t.status].etiket }}
            </span>
          </td>
          <td class="sag">
            <button class="dugme dugme-kucuk" @click="tahsilatAc(t)">Tahsil Et</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="tahsilatAcik" class="perde" @click.self="tahsilatAcik = false">
    <form class="pencere" style="max-width: 420px" @submit.prevent="tahsilatKaydet">
      <div class="pencere-ust">
        <h3>Kira Tahsilatı</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="tahsilatAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
        <p style="margin-top: 0">
          <b>{{ seciliTaksit?.contract?.customer?.full_name }}</b><br />
          <span class="soluk kucuk">
            {{ seciliTaksit?.period }} dönemi · vade {{ tarih(seciliTaksit?.due_date) }} ·
            kalan {{ para(seciliTaksit?.remaining) }}
          </span>
        </p>
        <div class="alan">
          <label>Tahsil Edilen Tutar (₺)</label>
          <input type="number" step="0.01" v-model.number="tahsilat.amount" />
        </div>
        <div class="alan">
          <label>Ödeme Yöntemi</label>
          <select v-model="tahsilat.payment_method">
            <option v-for="(v, k) in ODEME_YONTEMLERI" :key="k" :value="k">{{ v }}</option>
          </select>
        </div>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="tahsilatAcik = false">Vazgeç</button>
        <button class="dugme">Kaydet</button>
      </div>
    </form>
  </div>
</template>
