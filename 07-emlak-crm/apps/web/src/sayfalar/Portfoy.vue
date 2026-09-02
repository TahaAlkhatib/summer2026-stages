<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import {
  para, ISLEM_TIPLERI, GAYRIMENKUL_TIPLERI, PORTFOY_DURUMLARI,
} from '../bicim'

const liste = ref([])
const ilceler = ref([])
const sahipler = ref([])
const danismanlar = ref([])
const yukleniyor = ref(true)
const hata = ref('')
const bilgi = ref('')

const filtre = ref({ q: '', listing_type: '', property_type: '', district: '', status: 'aktif' })

const pencereAcik = ref(false)
const kaydediliyor = ref(false)
const yeni = ref(bosPortfoy())

function bosPortfoy() {
  return {
    title: '', listing_type: 'kiralik', property_type: 'daire',
    district: '', neighborhood: '', address: '', room_count: '2+1',
    gross_area: null, floor: null, building_age: null, heating: 'Doğalgaz (Kombi)',
    price: null, dues: 0, is_furnished: false, has_elevator: false, has_parking: false,
    owner_id: '', agent_id: '', description: '',
  }
}

async function yukle() {
  yukleniyor.value = true
  try {
    const parametreler = new URLSearchParams()
    for (const [anahtar, deger] of Object.entries(filtre.value)) {
      if (deger) parametreler.append(anahtar, deger)
    }
    liste.value = await api.get('/properties?' + parametreler.toString())
    hata.value = ''
  } catch (e) {
    hata.value = e.message
  }
  yukleniyor.value = false
}

onMounted(async () => {
  await yukle()
  try {
    ilceler.value = await api.get('/properties/districts')
    sahipler.value = await api.get('/owners')
    danismanlar.value = await api.get('/agents')
  } catch (e) { /* filtreler boş kalır, ana liste yine çalışır */ }
})

async function kaydet() {
  kaydediliyor.value = true
  hata.value = ''
  try {
    const veri = { ...yeni.value }
    // Boş sayı alanları null olarak gitsin
    for (const alan of ['gross_area', 'floor', 'building_age', 'price', 'dues']) {
      if (veri[alan] === '' ) veri[alan] = null
    }
    const kayit = await api.post('/properties', veri)
    bilgi.value = kayit.code + ' numaralı portföy eklendi.'
    pencereAcik.value = false
    yeni.value = bosPortfoy()
    await yukle()
  } catch (e) {
    hata.value = e.message
  }
  kaydediliyor.value = false
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Portföy</h2>
      <p>{{ liste.length }} kayıt listeleniyor</p>
    </div>
    <button class="dugme" @click="pencereAcik = true">+ Yeni Portföy</button>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari">{{ bilgi }}</div>

  <div class="filtreler">
    <div class="alan">
      <label>Ara</label>
      <input v-model="filtre.q" placeholder="Başlık, kod, ilçe..." @keyup.enter="yukle" />
    </div>
    <div class="alan">
      <label>İşlem</label>
      <select v-model="filtre.listing_type">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in ISLEM_TIPLERI" :key="k" :value="k">{{ v }}</option>
      </select>
    </div>
    <div class="alan">
      <label>Tip</label>
      <select v-model="filtre.property_type">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in GAYRIMENKUL_TIPLERI" :key="k" :value="k">{{ v }}</option>
      </select>
    </div>
    <div class="alan">
      <label>İlçe</label>
      <select v-model="filtre.district">
        <option value="">Hepsi</option>
        <option v-for="i in ilceler" :key="i" :value="i">{{ i }}</option>
      </select>
    </div>
    <div class="alan">
      <label>Durum</label>
      <select v-model="filtre.status">
        <option value="">Hepsi</option>
        <option v-for="(v, k) in PORTFOY_DURUMLARI" :key="k" :value="k">{{ v.etiket }}</option>
      </select>
    </div>
    <button class="dugme" @click="yukle">Listele</button>
  </div>

  <div class="tablo-kutu">
    <table>
      <thead>
        <tr>
          <th>Kod</th>
          <th>İlan</th>
          <th>Konum</th>
          <th>Özellik</th>
          <th class="sag">Fiyat</th>
          <th>Danışman</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="yukleniyor"><td colspan="7" class="bos">Yükleniyor...</td></tr>
        <tr v-else-if="liste.length === 0"><td colspan="7" class="bos">Kayıt bulunamadı.</td></tr>
        <tr v-for="p in liste" :key="p.id">
          <td><router-link :to="'/portfoy/' + p.id"><b>{{ p.code }}</b></router-link></td>
          <td>
            {{ p.title }}
            <div class="kucuk soluk">
              {{ ISLEM_TIPLERI[p.listing_type] }} · {{ GAYRIMENKUL_TIPLERI[p.property_type] }}
            </div>
          </td>
          <td>
            {{ p.district }}
            <div class="kucuk soluk">{{ p.neighborhood }}</div>
          </td>
          <td class="kucuk">
            <span v-if="p.room_count">{{ p.room_count }}</span>
            <span v-if="p.gross_area"> · {{ p.gross_area }} m²</span>
            <div class="soluk" v-if="p.has_parking || p.is_furnished">
              <span v-if="p.has_parking">Otopark</span>
              <span v-if="p.has_parking && p.is_furnished"> · </span>
              <span v-if="p.is_furnished">Eşyalı</span>
            </div>
          </td>
          <td class="sag"><b>{{ para(p.price) }}</b></td>
          <td class="kucuk">{{ p.agent?.name }}</td>
          <td>
            <span class="rozet" :class="PORTFOY_DURUMLARI[p.status].sinif">
              {{ PORTFOY_DURUMLARI[p.status].etiket }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Yeni portföy penceresi -->
  <div v-if="pencereAcik" class="perde" @click.self="pencereAcik = false">
    <form class="pencere" @submit.prevent="kaydet">
      <div class="pencere-ust">
        <h3>Yeni Portföy</h3>
        <button type="button" class="dugme-ikincil dugme-kucuk" @click="pencereAcik = false">Kapat</button>
      </div>

      <div class="pencere-govde">
        <div class="alan">
          <label>İlan Başlığı</label>
          <input v-model="yeni.title" placeholder="Örn: Moda'da Denize Yakın Ferah 2+1" />
        </div>

        <div class="izgara izgara-4">
          <div class="alan">
            <label>İşlem</label>
            <select v-model="yeni.listing_type">
              <option v-for="(v, k) in ISLEM_TIPLERI" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div class="alan">
            <label>Tip</label>
            <select v-model="yeni.property_type">
              <option v-for="(v, k) in GAYRIMENKUL_TIPLERI" :key="k" :value="k">{{ v }}</option>
            </select>
          </div>
          <div class="alan">
            <label>İlçe</label>
            <input v-model="yeni.district" />
          </div>
          <div class="alan">
            <label>Mahalle</label>
            <input v-model="yeni.neighborhood" />
          </div>
        </div>

        <div class="izgara izgara-4">
          <div class="alan">
            <label>Oda</label>
            <input v-model="yeni.room_count" placeholder="2+1" />
          </div>
          <div class="alan">
            <label>Brüt m²</label>
            <input v-model.number="yeni.gross_area" type="number" min="1" />
          </div>
          <div class="alan">
            <label>Kat</label>
            <input v-model.number="yeni.floor" type="number" />
          </div>
          <div class="alan">
            <label>Bina Yaşı</label>
            <input v-model.number="yeni.building_age" type="number" min="0" />
          </div>
        </div>

        <div class="izgara izgara-3">
          <div class="alan">
            <label>Fiyat (₺)</label>
            <input v-model.number="yeni.price" type="number" min="1" />
          </div>
          <div class="alan">
            <label>Aidat (₺)</label>
            <input v-model.number="yeni.dues" type="number" min="0" />
          </div>
          <div class="alan">
            <label>Isıtma</label>
            <input v-model="yeni.heating" />
          </div>
        </div>

        <div class="izgara izgara-2">
          <div class="alan">
            <label>Mal Sahibi</label>
            <select v-model="yeni.owner_id">
              <option value="">Seçin</option>
              <option v-for="s in sahipler" :key="s.id" :value="s.id">
                {{ s.full_name }} — {{ s.phone }}
              </option>
            </select>
          </div>
          <div class="alan">
            <label>Portföy Sorumlusu</label>
            <select v-model="yeni.agent_id">
              <option value="">Seçin</option>
              <option v-for="d in danismanlar" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
        </div>

        <div class="alan">
          <label>Adres</label>
          <input v-model="yeni.address" />
        </div>

        <div class="izgara izgara-3">
          <label class="onay"><input type="checkbox" v-model="yeni.has_parking" /> Otopark</label>
          <label class="onay"><input type="checkbox" v-model="yeni.has_elevator" /> Asansör</label>
          <label class="onay"><input type="checkbox" v-model="yeni.is_furnished" /> Eşyalı</label>
        </div>

        <div class="alan" style="margin-top: 12px">
          <label>Açıklama</label>
          <textarea v-model="yeni.description" rows="3"></textarea>
        </div>
      </div>

      <div class="pencere-alt">
        <button type="button" class="dugme-ikincil" @click="pencereAcik = false">Vazgeç</button>
        <button class="dugme" :disabled="kaydediliyor">
          {{ kaydediliyor ? 'Kaydediliyor...' : 'Portföyü Kaydet' }}
        </button>
      </div>
    </form>
  </div>
</template>
