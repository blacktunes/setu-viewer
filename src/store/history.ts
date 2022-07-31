import { ref } from 'vue'

const key = 'woka-setu-history'

export const history = ref({
  small: new Set<number>(),
  smallNum: 0,
  regular: new Set<number>(),
  regularNum: 0,
})

export const setHistory = (type: 0 | 1, pid: number) => {
  if (type === 0) {
    ++history.value.smallNum
    history.value.small.add(pid)
  }
  if (type === 1) {
    ++history.value.smallNum
    history.value.regular.add(pid)
  }
  saveHistory()
}

const saveHistory = () => {
  const _history = {
    small: [...history.value.small],
    smallNum: history.value.smallNum,
    regular: [...history.value.regular],
    regularNum: history.value.regularNum
  }
  localStorage.setItem(key, JSON.stringify(_history))
}

try {
  const {
    small,
    smallNum,
    regular,
    regularNum
  } = JSON.parse(localStorage.getItem(key) || '{}')

  if (small) {
    history.value.small = new Set<number>(small || [])
  }
  if (smallNum) {
    history.value.smallNum = smallNum
  }
  if (regular) {
    history.value.regular = new Set<number>(regular || [])
  }
  if (regularNum) {
    history.value.regularNum = regularNum
  }
} catch { }
