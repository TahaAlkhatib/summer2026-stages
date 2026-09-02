<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api, evrakIndir } from '../api'
import {
  para, tarih, dosyaBoyutu, SOZLESME_TIPLERI, SOZLESME_DURUMLARI,
  TAKSIT_DURUMLARI, ODEME_YONTEMLERI, EVRAK_TURLERI,
} from '../bicim'

const rota = useRoute()
const sozlesme = ref(null)
const toplamlar = ref(null)
const evraklar = ref([])
const hata = ref('')
const bilgi = ref('')

// Tahsilat penceresi
const tahsilatAcik = ref(false)
const seciliTaksit = ref(null)
const tahsilat = ref({ amount: null, payment_method: 'havale' })

// Evrak yükleme
const dosya = ref(null)
const evrak = ref({ doc_type: 'sozlesme', title: '' })
const yukleniyor = ref(false)

async function yukle() {
  try {
    const cevap = await api.get('/contracts/' + rota.params.id)
    sozlesme.value = cevap.contract
    toplamlar.value = cevap.totals
    evraklar.value = cevap.contract.documents || []
    hata.value = ''
  } catch (e) { hata.value = e.message }
}

onMounted(yukle)

function tahsilatAc(taksit) {
  seciliTaksit.value = taksit
  tahsilat.value = {
    amount: Number(taksit.amount) - Number(taksit.paid_amount),
    payment_method: 'havale',
  }
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

async function evrakYukle() {
  if (!dosya.value) {
    hata.value = 'Lütfen bir dosya seçin.'
    return
  }
  yukleniyor.value = true
  hata.value = ''
  try {
    const form = new FormData()
    form.append('file', dosya.value)
    form.append('doc_type', evrak.value.doc_type)
    form.append('title', evrak.value.title || dosya.value.name)
    form.append('contract_id', rota.params.id)

    await api.yukle('/documents', form)
    bilgi.value = 'Evrak arşive eklendi.'
    evrak.value = { doc_type: 'sozlesme', title: '' }
    dosya.value = null
    document.getElementById('dosyaSecici').value = ''
    await yukle()
  } catch (e) { hata.value = e.message }
  yukleniyor.value = false
}

async function indir(e) {
  try {
    await evrakIndir(e.id, e.file_name)
  } catch (err) { hata.value = err.message }
}

async function feshet() {
  const sebep = prompt('Fesih sebebi:')
  if (sebep === null) return
  try {
    const cevap = await api.put('/contracts/' + rota.params.id + '/terminate', { reason: sebep })
    bilgi.value = cevap.message
    await yukle()
  } catch (e) { hata.value = e.message }
}
</script>

<template>
  <router-link to="/sozlesmeler" class="kucuk">← Sözleşmeler</router-link>

  <div v-if="hata" class="uyari uyari-hata" style="margin-top: 10px">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari" style="margin-top: 10px">{{ bilgi }}</div>
  <div v-if="!sozlesme" class="bos">Yükleniyor...</div>

  <template v-else>
    <div class="sayfa-basligi" style="margin-top: 10px">
      <div>
        <h2>{{ sozlesme.code }}</h2>
        <p>
          {{ SOZLESME_TIPLERI[sozlesme.type] }} sözleşmesi ·
          {{ sozlesme.property.code }} — {{ sozlesme.property.title }}
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <span class="rozet" :class="SOZLESME_DURUMLARI[sozlesme.status].sinif">
          {{ SOZLESME_DURUMLARI[sozlesme.status].etiket }}
        </span>
        <button v-if="sozlesme.status === 'aktif'" class="dugme-tehlike dugme-kucuk" @click="feshet">
          Sözleşmeyi Feshet
        </button>
      </div>
    </div>

    <div class="izgara izgara-2" style="align-items: start">
      <div>
        <div class="kart">
          <h3>Sözleşme Bilgileri</h3>
          <div class="izgara izgara-3">
            <div><label>Başlangıç</label><b>{{ tarih(sozlesme.start_date) }}</b></div>
            <div><label>Bitiş</label><b>{{ sozlesme.end_date ? tarih(sozlesme.end_date) : '-' }}</b></div>
            <div><label>Süre</label><b>{{ sozlesme.duration_months ? sozlesme.duration_months + ' ay' : '-' }}</b></div>
            <div>
              <label>{{ sozlesme.type === 'kira' ? 'Aylık kira' : 'Satış bedeli' }}</label>
              <b style="color: var(--yesil)">{{ para(sozlesme.amount) }}</b>
            </div>
            <div><label>Depozito</label><b>{{ para(sozlesme.deposit) }}</b></div>
            <div><label>Ödeme günü</label><b>{{ sozlesme.payment_day ? 'Her ayın ' + sozlesme.payment_day + '. günü' : '-' }}</b></div>
            <div><label>Komisyon oranı</label><b>%{{ sozlesme.commission_rate }}</b></div>
            <div><label>Komisyon tutarı</label><b>{{ para(sozlesme.commission_amount) }}</b></div>
            <div><label>Danışman</label><b>{{ sozlesme.agent?.name }}</b></div>
          </div>
        </div>

        <div class="kart" v-if="sozlesme.type === 'kira'">
          <h3>Kira Taksit Takvimi</h3>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Dönem</th><th>Vade</th>
                <th class="sag">Tutar</th><th class="sag">Ödenen</th>
                <th>Durum</th><th class="sag"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in sozlesme.installments" :key="t.id">
                <td>{{ t.sequence }}</td>
                <td>{{ t.period }}</td>
                <td>{{ tarih(t.due_date) }}</td>
                <td class="sag">{{ para(t.amount) }}</td>
                <td class="sag">{{ para(t.paid_amount) }}</td>
                <td>
                  <span class="rozet" :class="TAKSIT_DURUMLARI[t.status].sinif">
                    {{ TAKSIT_DURUMLARI[t.status].etiket }}
                  </span>
                </td>
                <td class="sag">
                  <button v-if="t.status !== 'odendi' && t.status !== 'iptal'"
                    class="dugme dugme-kucuk" @click="tahsilatAc(t)">Tahsil Et</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="kart" v-if="toplamlar && sozlesme.type === 'kira'">
          <h3>Tahsilat Durumu</h3>
          <div style="display: flex; justify-content: space-between; padding: 4px 0">
            <span class="soluk">Toplam kira</span><b>{{ para(toplamlar.total) }}</b>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0">
            <span class="soluk">Tahsil edilen</span><b style="color: var(--yesil)">{{ para(toplamlar.paid) }}</b>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid var(--cizgi); margin-top: 6px">
            <span class="soluk">Kalan</span><b>{{ para(toplamlar.remaining) }}</b>
          </div>
          <div v-if="toplamlar.overdue_count > 0" class="uyari uyari-hata" style="margin: 12px 0 0">
            {{ toplamlar.overdue_count }} taksit gecikmiş durumda.
          </div>
        </div>

        <div class="kart">
          <h3>Taraflar</h3>
          <div style="margin-bottom: 12px">
            <label>Kiracı / Alıcı</label>
            <b>{{ sozlesme.customer.full_name }}</b>
            <div class="kucuk soluk">{{ sozlesme.customer.phone }}</div>
          </div>
          <div>
            <label>Mal Sahibi</label>
            <b>{{ sozlesme.owner.full_name }}</b>
            <div class="kucuk soluk">{{ sozlesme.owner.phone }}</div>
            <div class="kucuk soluk" v-if="sozlesme.owner.iban">IBAN: {{ sozlesme.owner.iban }}</div>
          </div>
        </div>

        <div class="kart">
          <h3>Evrak Arşivi ({{ evraklar.length }})</h3>

          <div v-if="evraklar.length === 0" class="bos">Henüz evrak yüklenmedi.</div>
          <table v-else style="margin-bottom: 14px">
            <tbody>
              <tr v-for="e in evraklar" :key="e.id">
                <td>
                  <b>{{ e.title }}</b>
                  <div class="kucuk soluk">
                    {{ EVRAK_TURLERI[e.doc_type] || e.doc_type }} ·
                    {{ dosyaBoyutu(e.file_size) }} · {{ e.uploader?.name }}
                  </div>
                </td>
                <td class="sag">
                  <button class="dugme-ikincil dugme-kucuk" @click="indir(e)">İndir</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="border-top: 1px solid var(--cizgi); padding-top: 12px">
            <div class="alan">
              <label>Evrak Türü</label>
              <select v-model="evrak.doc_type">
                <option v-for="(v, k) in EVRAK_TURLERI" :key="k" :value="k">{{ v }}</option>
              </select>
            </div>
            <div class="alan">
              <label>Başlık</label>
              <input v-model="evrak.title" placeholder="Örn: Tapu fotokopisi" />
            </div>
            <div class="alan">
              <label>Dosya (PDF, JPG, PNG, Word — en fazla 10 MB)</label>
              <input id="dosyaSecici" type="file" @change="dosya = $event.target.files[0]" />
            </div>
            <button class="dugme" style="width: 100%" :disabled="yukleniyor" @click="evrakYukle">
              {{ yukleniyor ? 'Yükleniyor...' : 'Evrakı Arşive Ekle' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tahsilat penceresi -->
    <div v-if="tahsilatAcik" class="perde" @click.self="tahsilatAcik = false">
      <form class="pencere" style="max-width: 420px" @submit.prevent="tahsilatKaydet">
        <div class="pencere-ust">
          <h3>Kira Tahsilatı</h3>
          <button type="button" class="dugme-ikincil dugme-kucuk" @click="tahsilatAcik = false">Kapat</button>
        </div>
        <div class="pencere-govde">
          <p style="margin-top: 0">
            <b>{{ seciliTaksit?.period }}</b> dönemi ·
            vade {{ tarih(seciliTaksit?.due_date) }}
            <br />
            <span class="soluk kucuk">
              Taksit {{ para(seciliTaksit?.amount) }} ·
              Ödenen {{ para(seciliTaksit?.paid_amount) }}
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
          <button class="dugme">Tahsilatı Kaydet</button>
        </div>
      </form>
    </div>
  </template>
</template>
