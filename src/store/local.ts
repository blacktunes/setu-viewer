import { ref } from 'vue'
import { ApiRes } from '../type'

const key = 'woka-setu-data'

export const localData = ref<ApiRes[]>([])

try {
  const temp: ApiRes[] = JSON.parse(
    localStorage.getItem(key) || '[]'
  )
  localData.value = temp
} catch {
  localData.value = []
}

export const setLoaclData = (item: ApiRes) => {
  const loaclIndex = localData.value.findIndex(
    _item => _item.pid === item.pid
  )
  if (loaclIndex !== -1) {
    localData.value.splice(loaclIndex, 1)
  } else {
    localData.value.unshift(JSON.parse(JSON.stringify(item)))
  }
  localStorage.setItem(key, JSON.stringify(localData.value))
}

export const checkLocalData = (item: ApiRes) => {
  if (!item) return false
  return !localData.value.some(
    _item => _item.pid === item.pid
  )
}
