/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApp } from 'vue'
import App from './App.vue'
import { Lazyload, Toast } from 'vant'
import 'vant/lib/index.css'
import '@vant/touch-emulator'
import '@/assets/style.sass'

let firstBack: number | null = null
const plusReady = () => {
  window.plus.key.addEventListener('backbutton', () => {
    const homeRef = app.$refs.Home as any

    if (homeRef[0].state.showPopup) {
      homeRef[0].toggle()
    } else if (homeRef[1]) {
      homeRef[1] = false
    } else {
      if (!firstBack) {
        firstBack = new Date().getTime()
        Toast({
          message: '再次返回停止色色',
          position: 'bottom'
        })
        setTimeout(() => {
          firstBack = null
        }, 2000)
      } else {
        if (new Date().getTime() - firstBack < 1000) {
          window.plus.runtime.quit()
        }
      }
    }
  }, false)
}

if (window.plus) {
  plusReady()
} else {
  document.addEventListener('plusready', plusReady, false)
}

const app = createApp(App)
  .use(Lazyload, {
    preload: 5,
    loading: require('@/assets/loading.jpg'),
    error: require('@/assets/error.jpg')
  })
  .mount('#app')
