/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApp } from 'vue'
import App from './App.vue'
import { Lazyload, Toast } from 'vant'
import { imageShow, previewInfo, isApp } from '@/global'
import 'vant/lib/index.css'
import '@vant/touch-emulator'
import '@/assets/style.sass'

let firstBack: number | null = null
const plusReady = () => {
  isApp.value = true

  window.plus.key.addEventListener('backbutton', () => {
    const homeRef = app.$refs.Home as any

    if (homeRef[0].state.showPopup) {
      homeRef[0].toggle()
      return
    }
    if (previewInfo.value) {
      previewInfo.value = false
      return
    }
    if (imageShow.value) {
      imageShow.value = false
      return
    }
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
  }, false)
}

if (window.plus) {
  plusReady()
} else {
  document.addEventListener('plusready', plusReady, false)
}

const app = createApp(App)
  .use(Lazyload, {
    preload: 5
  })
  .mount('#app')
