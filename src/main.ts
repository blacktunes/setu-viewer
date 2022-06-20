/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApp } from 'vue'
import App from './App.vue'
import { Lazyload } from 'vant'
import 'vant/lib/index.css'
import '@vant/touch-emulator'

const app = createApp(App)
  .use(Lazyload, {
    preload: 4,
    loading: require('@/assets/loading.jpg'),
    error: require('@/assets/error.jpg')
  })
  .mount('#app')

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
        window.plus.nativeUI.toast('再次返回退出应用')
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
