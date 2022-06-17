import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Lazyload } from 'vant'
import 'vant/lib/index.css'
import '@vant/touch-emulator'

createApp(App)
  .use(router)
  .use(Lazyload, {
    loading: '/loading.jpg',
    error: '/error.jpg'
  })
  .mount('#app')
