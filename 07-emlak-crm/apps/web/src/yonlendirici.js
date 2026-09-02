import { createRouter, createWebHistory } from 'vue-router'
import { tokenAl } from './api'

import Giris from './sayfalar/Giris.vue'
import Panel from './sayfalar/Panel.vue'
import Portfoy from './sayfalar/Portfoy.vue'
import PortfoyDetay from './sayfalar/PortfoyDetay.vue'
import Musteriler from './sayfalar/Musteriler.vue'
import Talepler from './sayfalar/Talepler.vue'
import Randevular from './sayfalar/Randevular.vue'
import Sozlesmeler from './sayfalar/Sozlesmeler.vue'
import SozlesmeDetay from './sayfalar/SozlesmeDetay.vue'
import Tahsilatlar from './sayfalar/Tahsilatlar.vue'
import Raporlar from './sayfalar/Raporlar.vue'

const yollar = [
  { path: '/giris', component: Giris, meta: { serbest: true } },
  { path: '/', redirect: '/panel' },
  { path: '/panel', component: Panel },
  { path: '/portfoy', component: Portfoy },
  { path: '/portfoy/:id', component: PortfoyDetay },
  { path: '/musteriler', component: Musteriler },
  { path: '/talepler', component: Talepler },
  { path: '/randevular', component: Randevular },
  { path: '/sozlesmeler', component: Sozlesmeler },
  { path: '/sozlesmeler/:id', component: SozlesmeDetay },
  { path: '/tahsilatlar', component: Tahsilatlar },
  { path: '/raporlar', component: Raporlar },
]

const yonlendirici = createRouter({
  history: createWebHistory(),
  routes: yollar,
})

// Giriş yapmadan panele girilmesin
yonlendirici.beforeEach((hedef) => {
  if (!hedef.meta.serbest && !tokenAl()) {
    return '/giris'
  }
  if (hedef.path === '/giris' && tokenAl()) {
    return '/panel'
  }
})

export default yonlendirici
