<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { kullaniciAl, oturumKapat } from './api'
import { rolAdi } from './bicim'

const rota = useRoute()
const yonlendirici = useRouter()

const girisSayfasi = computed(() => rota.path === '/giris')
const kullanici = computed(() => {
  // rota degisince tekrar okunsun diye rota.path'e bagimli
  rota.path
  return kullaniciAl()
})

const menu = [
  { yol: '/panel', etiket: 'Genel Durum' },
  { yol: '/portfoy', etiket: 'Portföy' },
  { yol: '/musteriler', etiket: 'Müşteriler' },
  { yol: '/talepler', etiket: 'Talepler' },
  { yol: '/randevular', etiket: 'Randevular' },
  { yol: '/sozlesmeler', etiket: 'Sözleşmeler' },
  { yol: '/tahsilatlar', etiket: 'Kira Tahsilatları' },
  { yol: '/raporlar', etiket: 'Raporlar' },
]

function cikisYap() {
  oturumKapat()
  yonlendirici.push('/giris')
}
</script>

<template>
  <router-view v-if="girisSayfasi" />

  <div v-else class="uygulama">
    <aside class="kenar">
      <div class="kenar-baslik">
        <h1>Emlak CRM</h1>
        <span>Portföy ve Kiralama Yönetimi</span>
      </div>

      <nav>
        <router-link
          v-for="m in menu"
          :key="m.yol"
          :to="m.yol"
          :class="{ aktif: rota.path === m.yol || rota.path.startsWith(m.yol + '/') }"
        >
          {{ m.etiket }}
        </router-link>
      </nav>

      <div class="kenar-alt" v-if="kullanici">
        <div class="ad">{{ kullanici.name }}</div>
        <div class="rol">{{ rolAdi(kullanici.role) }}</div>
        <button class="dugme-ikincil dugme-kucuk" style="width: 100%" @click="cikisYap">
          Çıkış Yap
        </button>
      </div>
    </aside>

    <main class="icerik">
      <router-view />
    </main>
  </div>
</template>
