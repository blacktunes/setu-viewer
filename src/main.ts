import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import router from './router'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { Lazyload } from 'vant'

createApp(App)
  .use(router)
  .use(VueVirtualScroller)
  .use(Lazyload, {
    preload: 5,
    loading: new URL('./assets/loading.jpg', import.meta.url).href,
    error: new URL('./assets/error.jpg', import.meta.url).href
  })
  .mount('#app')
