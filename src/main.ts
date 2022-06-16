import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { List, Lazyload } from 'vant'
import 'vant/lib/index.css'

createApp(App)
  .use(router)
  .use(List)
  .use(Lazyload, {
    loading: '/loading.png'
  })
  .mount('#app')
