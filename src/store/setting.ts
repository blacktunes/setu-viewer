import { ref, watch } from 'vue'

const key = 'woka-setu-setting'

export const setting = ref<{
  multicolumn: boolean
  proxy: boolean
  defaultProxy: string
  customProxy: string
  r18: number
  mode: number
  uid?: number
  keyword?: string
}>({
  multicolumn: false,
  proxy: false,
  defaultProxy: 'https://i.pixiv.re',
  customProxy: 'https://i.pixiv.re',
  r18: 0,
  mode: 0,
  uid: undefined,
  keyword: undefined,
})

try {
  const { multicolumn, proxy, customProxy, r18 } = JSON.parse(localStorage.getItem(key) || '{}')
  if (multicolumn) {
    setting.value.multicolumn = multicolumn
  }
  if (proxy) {
    setting.value.proxy = proxy
  }
  if (customProxy) {
    setting.value.customProxy = customProxy
  }
  if (r18) {
    setting.value.r18 = r18
  }
} catch { }

export const saveSetting = () => {
  localStorage.setItem(key, JSON.stringify(setting.value))
}

watch(setting.value, () => {
  saveSetting()
})
