<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, oturumKaydet } from '../api'

const yonlendirici = useRouter()
const eposta = ref('')
const sifre = ref('')
const hata = ref('')
const bekliyor = ref(false)

async function girisYap() {
  hata.value = ''
  bekliyor.value = true
  try {
    const cevap = await api.post('/auth/login', {
      email: eposta.value.trim(),
      password: sifre.value,
    })
    oturumKaydet(cevap.token, cevap.user)
    yonlendirici.push('/panel')
  } catch (e) {
    hata.value = e.message
    bekliyor.value = false
  }
}
</script>

<template>
  <div class="giris-zemin">
    <form class="giris-kutu" @submit.prevent="girisYap">
      <div class="giris-ust">
        <h1>Emlak &amp; Kiralama CRM</h1>
        <p>Portföy, talep ve sözleşme yönetimi</p>
      </div>

      <div class="giris-govde">
        <div v-if="hata" class="uyari uyari-hata">{{ hata }}</div>

        <div class="alan">
          <label>E-posta</label>
          <input v-model="eposta" autofocus />
        </div>

        <div class="alan">
          <label>Şifre</label>
          <input v-model="sifre" type="password" />
        </div>

        <button class="dugme" style="width: 100%" :disabled="bekliyor">
          {{ bekliyor ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>

        <p class="kucuk soluk" style="text-align: center; margin-top: 16px">
          Demo: <b>admin@emlak.com</b> / 123456<br />
          Danışman: <b>elif@emlak.com</b> / 123456
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.giris-zemin {
  min-height: 100vh;
  background: var(--yesil-koyu);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.giris-kutu {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}
.giris-ust {
  background: var(--yesil);
  color: #fff;
  padding: 26px 24px;
  text-align: center;
}
.giris-ust h1 { margin: 0; font-size: 21px; }
.giris-ust p { margin: 4px 0 0; font-size: 13px; color: #d6ebdc; }
.giris-govde { padding: 24px; }
</style>
