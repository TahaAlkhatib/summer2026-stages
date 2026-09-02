<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { MUSTERI_KAYNAKLARI } from '../bicim'

const liste = ref([])
const danismanlar = ref([])
const arama = ref('')
const hata = ref('')
const bilgi = ref('')
const pencereAcik = ref(false)
const kaydediliyor = ref(false)
const yeni = ref({ full_name: '', phone: '', email: '', id_number: '', source: 'telefon', agent_id: '', notes: '' })

async function yukle() {
  try {
    liste.value = await api.get('/customers?q=' + encodeURIComponent(arama.value))
    hata.value = ''
  } catch (e) { hata.value = e.message }
}

onMounted(async () => {
  await yukle()
  try { danismanlar.value = await api.get('/agents') } catch (e) { /* boş kalır */ }
})

async function kaydet() {
  kaydediliyor.value = true
  hata.value = ''
  try {
    const m = await api.post('/customers', yeni.value)
    bilgi.value = m.full_name + ' kaydedildi.'
    pencereAcik.value = false
    yeni.value = { full_name: '', phone: '', email: '', id_number: '', source: 'telefon', agent_id: '', notes: '' }
    await yukle()
  } catch (e) { hata.value = e.message }
  kaydediliyor.value = false
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Müşteriler</h2>
      <p>{{ liste.length }} kayıt</p>
    </div>
    <button class="dugme" @click="pencereAcik = true">+ Yeni Müşteri</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="filtreler">
    <div class="alan">
      <label>Ara</label>
      <input v-model="arama" placeholder="Ad veya telefon" @keyup.enter="yukle" style="width: 260px" />
    </div>
    <button class="dugme" @click="yukle">Ara</button>
  </div>

  <div class="tablo-kutu">
    <table>
      <thead>
        <tr>
          <th>Ad Soyad</th>
          <th>Telefon</th>
          <th>Kaynak</th>
          <th>Danışman</th>
          <th class="sag">Talep</th>
          <th class="sag">Randevu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="liste.length === 0"><td colspan="6" class="bos">Kayıt bulunamadı.</td></tr>
        <tr v-for="m in liste" :key="m.id">
          <td><b>{{ m.full_name }}</b></td>
          <td>{{ m.phone }}</td>
          <td class="kucuk">{{ MUSTERI_KAYNAKLARI[m.source] || m.source }}</td>
          <td class="kucuk">{{ m.agent?.name }}</td>
          <td class="sag">{{ m.demands_count }}</td>
          <td class="sag">{{ m.appointments_count }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="pencereAcik" class="perde" @click.self="pencereAcik = false">
    <form class="pencere" style="max-width: 560px" @submit.prevent="kaydet">
      <div class="pencere-ust">
        <h3>Yeni Müşteri</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="pencereAcik = false">Kapat</button>
      </div>
      <div class="pencere-govde">
        <div class="izgara izgara-2">
          <div class="alan"><label>Ad Soyad</label><input v-model="yeni.full_name" /></div>
          <div class="alan"><label>Telefon</label><input v-model="yeni.phone" placeholder="+90 5.." /></div>
          <div class="alan"><label>E-posta</label><input v-model="yeni.email" /></div>
          <div class="alan"><label>TC Kimlik No</label><input v-model="yeni.id_number" /></div>
          <div class="alan">
            <label>Kaynak</label>
            <select v-model="yeni.source">
              <option v-for="(v, k) in MUSTERI_KAYNAKLARI" :key="k" :value="k">{{ v }}</option>
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
        <div class="alan"><label>Not</label><textarea v-model="yeni.notes" rows="2"></textarea></div>
      </div>
      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="pencereAcik = false">Vazgeç</button>
        <button class="dugme" :disabled="kaydediliyor">{{ kaydediliyor ? 'Kaydediliyor...' : 'Kaydet' }}</button>
      </div>
    </form>
  </div>
</template>
