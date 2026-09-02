<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { para, paraKisa, GAYRIMENKUL_TIPLERI, rolAdi } from '../bicim'

const danismanlar = ref([])
const tahsilatlar = ref([])
const portfoy = ref(null)
const hata = ref('')

onMounted(async () => {
  try {
    const [d, t, p] = await Promise.all([
      api.get('/reports/agents'),
      api.get('/reports/collections'),
      api.get('/reports/portfolio'),
    ])
    danismanlar.value = d
    tahsilatlar.value = t
    portfoy.value = p
  } catch (e) { hata.value = e.message }
})

// Grafikte en yüksek değere göre oranlama yapıyoruz
function enYuksekBeklenen() {
  return Math.max(1, ...tahsilatlar.value.map((a) => a.expected))
}

function enCokIlce() {
  return Math.max(1, ...(portfoy.value?.by_district || []).map((i) => i.adet))
}
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Raporlar</h2>
      <p>Danışman performansı, kira tahsilatları ve portföy dağılımı</p>
    </div>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>

  <div class="kart">
    <h3>Son 6 Ayın Kira Tahsilatı</h3>
    <div v-if="tahsilatlar.length === 0" class="bos">Veri yok.</div>
    <div v-else style="display: flex; gap: 10px; align-items: flex-end; height: 200px">
      <div v-for="a in tahsilatlar" :key="a.period"
        style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%">
        <div class="kucuk" style="text-align: center; margin-bottom: 4px">
          {{ paraKisa(a.collected) }}
        </div>
        <div style="position: relative; height: 130px; display: flex; align-items: flex-end">
          <!-- Beklenen tutar açık, tahsil edilen koyu -->
          <div style="width: 100%; background: #d9e6dc; border-radius: 6px 6px 0 0"
            :style="{ height: (a.expected / enYuksekBeklenen() * 100) + '%' }">
            <div style="width: 100%; background: var(--yesil); border-radius: 6px 6px 0 0; position: absolute; bottom: 0"
              :style="{ height: (a.collected / enYuksekBeklenen() * 100) + '%' }"></div>
          </div>
        </div>
        <div class="kucuk soluk" style="text-align: center; margin-top: 6px">{{ a.label }}</div>
      </div>
    </div>
    <p class="kucuk soluk" style="margin-top: 10px">
      Koyu yeşil: tahsil edilen · Açık yeşil: beklenen
    </p>
  </div>

  <div class="izgara izgara-2">
    <div class="kart">
      <h3>Portföy Dağılımı — İlçe</h3>
      <div v-if="!portfoy?.by_district?.length" class="bos">Veri yok.</div>
      <div v-for="i in portfoy?.by_district || []" :key="i.district" style="margin-bottom: 10px">
        <div style="display: flex; justify-content: space-between; font-size: 13px">
          <span>{{ i.district }}</span><b>{{ i.adet }}</b>
        </div>
        <div style="background: #e8eee9; height: 8px; border-radius: 4px; margin-top: 3px">
          <div style="background: var(--yesil); height: 8px; border-radius: 4px"
            :style="{ width: (i.adet / enCokIlce() * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="kart">
      <h3>Portföy Dağılımı — Tip</h3>
      <table>
        <tbody>
          <tr v-for="t in portfoy?.by_type || []" :key="t.property_type">
            <td>{{ GAYRIMENKUL_TIPLERI[t.property_type] || t.property_type }}</td>
            <td class="sag"><b>{{ t.adet }}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="kart">
    <h3>Danışman Performansı (bu ay)</h3>
    <table>
      <thead>
        <tr>
          <th>Danışman</th>
          <th>Rol</th>
          <th class="sag">Portföy</th>
          <th class="sag">Aktif</th>
          <th class="sag">Müşteri</th>
          <th class="sag">Randevu</th>
          <th class="sag">Sözleşme</th>
          <th class="sag">Komisyon</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in danismanlar" :key="d.id">
          <td><b>{{ d.name }}</b></td>
          <td class="kucuk soluk">{{ rolAdi(d.role) }}</td>
          <td class="sag">{{ d.properties }}</td>
          <td class="sag">{{ d.active_properties }}</td>
          <td class="sag">{{ d.customers }}</td>
          <td class="sag">{{ d.appointments_month }}</td>
          <td class="sag">{{ d.contracts_month }}</td>
          <td class="sag"><b>{{ para(d.commission_month) }}</b></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
