<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { para, paraKisa, tarihSaat, RANDEVU_DURUMLARI, ISLEM_TIPLERI } from '../bicim'
import { bugun } from '../bicim'

const ozet = ref(null)
const bugunkuRandevular = ref([])
const hatirlatmalar = ref([])
const hata = ref('')

onMounted(async () => {
  try {
    const [o, r, t] = await Promise.all([
      api.get('/reports/summary'),
      api.get('/appointments?date=' + bugun()),
      api.get('/installments?reminders=1&days=7'),
    ])
    ozet.value = o
    bugunkuRandevular.value = r
    hatirlatmalar.value = t
  } catch (e) {
    hata.value = e.message
  }
})
</script>

<template>
  <div class="sayfa-basligi">
    <div>
      <h2>Genel Durum</h2>
      <p>Ofisin güncel özeti</p>
    </div>
  </div>

  <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>
  <div v-else-if="!ozet" class="bos">Yükleniyor...</div>

  <template v-else>
    <div class="kartlar" style="margin-bottom: 18px">
      <div class="ozet-kart">
        <div class="etiket">Aktif portföy</div>
        <div class="deger" style="color: var(--yesil-koyu)">{{ ozet.active_properties }}</div>
        <div class="alt">{{ ozet.for_sale }} satılık · {{ ozet.for_rent }} kiralık</div>
      </div>
      <div class="ozet-kart">
        <div class="etiket">Bugünkü randevu</div>
        <div class="deger" style="color: var(--mavi)">{{ ozet.today_appointments }}</div>
        <div class="alt">planlanmış görüşme</div>
      </div>
      <div class="ozet-kart">
        <div class="etiket">Aktif talep</div>
        <div class="deger" style="color: var(--altin)">{{ ozet.active_demands }}</div>
        <div class="alt">{{ ozet.customers }} müşteri kayıtlı</div>
      </div>
      <div class="ozet-kart">
        <div class="etiket">Aktif sözleşme</div>
        <div class="deger" style="color: var(--yesil)">{{ ozet.active_contracts }}</div>
        <div class="alt">satış + kira</div>
      </div>
      <div class="ozet-kart">
        <div class="etiket">Bu ay tahsilat</div>
        <div class="deger" style="color: var(--yesil)">{{ paraKisa(ozet.month_collected) }}</div>
        <div class="alt">kira ödemeleri</div>
      </div>
      <div class="ozet-kart">
        <div class="etiket">Geciken ödeme</div>
        <div class="deger" style="color: var(--kirmizi)">{{ ozet.overdue_count }}</div>
        <div class="alt">{{ para(ozet.overdue_amount) }}</div>
      </div>
    </div>

    <div class="izgara izgara-2">
      <div class="kart">
        <h3>Bugünkü Randevular</h3>
        <div v-if="bugunkuRandevular.length === 0" class="bos">Bugün randevu yok.</div>
        <table v-else>
          <tbody>
            <tr v-for="r in bugunkuRandevular" :key="r.id">
              <td style="width: 60px"><b>{{ (r.scheduled_at || '').slice(11, 16) }}</b></td>
              <td>
                {{ r.customer.full_name }}
                <div class="kucuk soluk">{{ r.property.title }}</div>
              </td>
              <td class="kucuk soluk">{{ r.agent.name }}</td>
              <td class="sag">
                <span class="rozet" :class="RANDEVU_DURUMLARI[r.status].sinif">
                  {{ RANDEVU_DURUMLARI[r.status].etiket }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="kart">
        <h3>Yaklaşan / Geciken Kira Ödemeleri</h3>
        <div v-if="hatirlatmalar.length === 0" class="bos">Yaklaşan ödeme yok.</div>
        <table v-else>
          <tbody>
            <tr v-for="t in hatirlatmalar.slice(0, 8)" :key="t.id">
              <td>
                {{ t.contract.customer.full_name }}
                <div class="kucuk soluk">{{ t.contract.property.title }}</div>
              </td>
              <td class="sag">{{ para(t.amount) }}</td>
              <td class="sag" style="width: 120px">
                <span v-if="t.is_overdue" class="rozet rozet-kirmizi">
                  {{ -t.days_left }} gün gecikti
                </span>
                <span v-else class="rozet rozet-sari">{{ t.days_left }} gün kaldı</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>
