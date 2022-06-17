/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApp } from 'vue'
import App from './App.vue'
import { Lazyload } from 'vant'
import { components } from './assets/global'
import 'vant/lib/index.css'
import '@vant/touch-emulator'

const app = createApp(App)
  .use(Lazyload, {
    loading: require('@/assets/loading.jpg'),
    error: require('@/assets/error.jpg')
  })
  .mount('#app')

let firstBack: number | null = null
const plusReady = () => {
  plus.key.addEventListener('backbutton', () => {
    if ((app.$refs.Home as any).$refs.dropdownItem.state.showPopup) {
      (app.$refs.Home as any).$refs.dropdownItem.toggle()
    } else if (components.instance) {
      components.instance.close()
    } else {
      if (!firstBack) {
        firstBack = new Date().getTime()
        plus.nativeUI.toast('再次返回退出应用')
        setTimeout(() => {
          firstBack = null
        }, 2000)
      } else {
        if (new Date().getTime() - firstBack < 1000) {
          plus.runtime.quit()
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
