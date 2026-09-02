<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import {
  para, tarihSaat, ISLEM_TIPLERI, GAYRIMENKUL_TIPLERI,
  PORTFOY_DURUMLARI, RANDEVU_DURUMLARI, ILGI_SEVIYELERI,
} from '../bicim'

const rota = useRoute()
const portfoy = ref(null)
const randevular = ref([])
const hata = ref('')
const bilgi = ref('')

async function yukle() {
  try {
    const cevap = await api.get('/properties/' + rota.params.id)
    portfoy.value = cevap.property
    randevular.value = cevap.appointments
  } catch (e) {
    hata.value = e.message
  }
}

onMounted(yukle)

async function durumDegistir(durum) {
  try {
    await api.put('/properties/' + rota.params.id, { status: durum })
    bilgi.value = 'Portföy durumu güncellendi.'
    await yukle()
  } catch (e) {
    hata.value = e.message
  }
}
</script>

<template>
  <router-link to="/portfoy" class="kucuk">← Portföy listesi</router-link>

  <div v-if="hata" class="uyari uyari-hata" style="margin-top: 10px">{{ hata }}</div>
  <div v-if="bilgi" class="uyari uyari-basari" style="margin-top: 10px">{{ bilgi }}</div>
  <div v-if="!portfoy" class="bos">Yükleniyor...</div>

  <template v-else>
    <div class="sayfa-basligi" style="margin-top: 10px">
      <div>
        <h2>{{ portfoy.code }}</h2>
        <p>{{ portfoy.title }}</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <span class="rozet" :class="PORTFOY_DURUMLARI[portfoy.status].sinif">
          {{ PORTFOY_DURUMLARI[portfoy.status].etiket }}
        </span>
        <select :value="portfoy.status" @change="durumDegistir($event.target.value)" style="width: 150px">
          <option v-for="(v, k) in PORTFOY_DURUMLARI" :key="k" :value="k">{{ v.etiket }}</option>
        </select>
      </div>
    </div>

    <div class="izgara izgara-2">
      <div>
        <div class="kart">
          <h3>İlan Bilgileri</h3>
          <div class="izgara izgara-3">
            <div><label>İşlem</label><b>{{ ISLEM_TIPLERI[portfoy.listing_type] }}</b></div>
            <div><label>Tip</label><b>{{ GAYRIMENKUL_TIPLERI[portfoy.property_type] }}</b></div>
            <div><label>Fiyat</label><b style="color: var(--yesil)">{{ para(portfoy.price) }}</b></div>
            <div><label>Oda</label><b>{{ portfoy.room_count || '-' }}</b></div>
            <div><label>Brüt m²</label><b>{{ portfoy.gross_area || '-' }}</b></div>
            <div><label>Kat</label><b>{{ portfoy.floor ?? '-' }}</b></div>
            <div><label>Bina yaşı</label><b>{{ portfoy.building_age ?? '-' }}</b></div>
            <div><label>Isıtma</label><b>{{ portfoy.heating || '-' }}</b></div>
            <div><label>Aidat</label><b>{{ para(portfoy.dues) }}</b></div>
          </div>

          <div style="margin-top: 14px">
            <span v-if="portfoy.has_parking" class="rozet rozet-mavi" style="margin-right: 6px">Otopark</span>
            <span v-if="portfoy.has_elevator" class="rozet rozet-mavi" style="margin-right: 6px">Asansör</span>
            <span v-if="portfoy.is_furnished" class="rozet rozet-mavi">Eşyalı</span>
          </div>
        </div>

        <div class="kart">
          <h3>Konum</h3>
          <p style="margin: 0">
            {{ portfoy.city }} / {{ portfoy.district }}
            <span v-if="portfoy.neighborhood"> / {{ portfoy.neighborhood }}</span>
          </p>
          <p class="kucuk soluk" style="margin: 4px 0 0">{{ portfoy.address }}</p>
        </div>

        <div class="kart" v-if="portfoy.description">
          <h3>Açıklama</h3>
          <p style="margin: 0">{{ portfoy.description }}</p>
        </div>
      </div>

      <div>
        <div class="kart">
          <h3>Mal Sahibi</h3>
          <div><b>{{ portfoy.owner?.full_name }}</b></div>
          <div class="kucuk soluk">{{ portfoy.owner?.phone }}</div>
          <div class="kucuk soluk" v-if="portfoy.owner?.iban">IBAN: {{ portfoy.owner.iban }}</div>
        </div>

        <div class="kart">
          <h3>Portföy Sorumlusu</h3>
          <div><b>{{ portfoy.agent?.name }}</b></div>
          <div class="kucuk soluk">{{ portfoy.agent?.phone }}</div>
        </div>

        <div class="kart">
          <h3>Randevu Geçmişi ({{ randevular.length }})</h3>
          <div v-if="randevular.length === 0" class="bos">Bu portföy için randevu yok.</div>
          <table v-else>
            <tbody>
              <tr v-for="r in randevular" :key="r.id">
                <td>
                  {{ r.customer.full_name }}
                  <div class="kucuk soluk">{{ tarihSaat(r.scheduled_at) }}</div>
                  <div class="kucuk soluk" v-if="r.result_note">"{{ r.result_note }}"</div>
                </td>
                <td class="sag">
                  <span class="rozet" :class="RANDEVU_DURUMLARI[r.status].sinif">
                    {{ RANDEVU_DURUMLARI[r.status].etiket }}
                  </span>
                  <div v-if="r.interest_level" style="margin-top: 4px">
                    <span class="rozet" :class="ILGI_SEVIYELERI[r.interest_level].sinif">
                      {{ ILGI_SEVIYELERI[r.interest_level].etiket }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
</template>
