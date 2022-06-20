<template>
  <div class="home">
    <van-sticky style="margin-bottom: 5px">
      <van-dropdown-menu>
        <van-dropdown-item
          :title="title"
          ref="dropdownItem"
          @open="open"
          @closed="closed"
        >
          <van-cell center title="色色模式">
            <template #right-icon>
              <van-radio-group v-model="mode" direction="horizontal">
                <van-radio :name="0">随机</van-radio>
                <van-radio :name="3">收藏</van-radio>
                <van-radio :name="1">UID</van-radio>
                <van-radio :name="2">关键词</van-radio>
              </van-radio-group>
            </template>
          </van-cell>
          <van-cell center v-if="mode === 1">
            <template #right-icon>
              <van-field
                v-model="UID"
                clearable
                type="number"
                placeholder="UID"
                @keydown.enter="onConfirm"
              />
            </template>
          </van-cell>
          <van-cell center v-if="mode === 2">
            <template #right-icon>
              <van-field
                v-model="keyword"
                clearable
                placeholder="关键词"
                @keydown.enter="onConfirm"
              />
            </template>
          </van-cell>
          <div style="padding: 10px 16px">
            <van-button
              type="primary"
              block
              round
              @click="onConfirm"
              :disabled="canConfirm"
              plain
            >
              {{ btnText }}
            </van-button>
          </div>
        </van-dropdown-item>
      </van-dropdown-menu>
    </van-sticky>
    <van-list
      class="list"
      v-model:loading="loading"
      v-model:error="error"
      :finished="finished"
      :immediate-check="false"
      @load="onLoad"
      loading-text="正在色色..."
      error-text="要不点这重试?"
      finished-text=""
    >
      <van-empty
        v-if="(list.length < 1 && loading) || list.length < 1"
        :image="emptyImg"
        image-size="300"
        style="height: 90%"
      />
      <van-swipe-cell v-for="(img, index) in list" :key="index" :id="index">
        <img
          @click="showImage(index)"
          style="width: 100%"
          v-lazy="img.urls.small"
          draggable="false"
        />
        <template #right>
          <van-cell-group inset class="info">
            <van-cell
              title-class="cell-title"
              title="author"
              :value="img.author"
              @click="search(1, img.uid)"
            />
            <van-cell
              title-class="cell-title"
              title="uid"
              :value="img.uid"
              @click="search(1, img.uid)"
            />
            <van-cell
              title-class="cell-title"
              title="title"
              :value="img.title"
              @click="search(2, img.title)"
            />
            <van-cell title-class="cell-title" title="pid" :value="img.pid" />
            <van-cell title-class="cell-title" title="tags">
              <template #right-icon>
                <div class="tags">
                  <van-tag
                    class="tag"
                    plain
                    type="primary"
                    v-for="(item, key) in img.tags"
                    :key="`${index}-${key}`"
                    @click="search(2, item)"
                    >{{ item }}</van-tag
                  >
                </div>
              </template>
            </van-cell>
            <van-cell style="justify-content: center">
              <template #right-icon>
                <van-button
                  style="width: 40px; height: 40px"
                  icon="like"
                  type="danger"
                  round
                  :plain="checkLocalData(img)"
                  @click.stop="setLoaclData(img)"
                />
              </template>
            </van-cell>
          </van-cell-group>
        </template>
      </van-swipe-cell>
    </van-list>
    <van-image-preview
      v-model:show="imageShow"
      :images="_list"
      :start-position="index"
      :loop="false"
      :close-on-popstate="false"
      @close="onClose"
      @change="onChange"
    >
      <template #cover>
        <transition name="van-slide-up">
          <van-button
            v-if="imageShow"
            class="save"
            icon="down"
            type="danger"
            plain
            round
            :loading="imageLoading"
            @click="saveImage"
          />
        </transition>
      </template>
    </van-image-preview>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ImagePreview, DropdownItemInstance } from 'vant'
import axios from 'axios'

interface ApiRes {
  pid: number
  p: number
  uid: number
  title: string
  author: string
  r18: boolean
  width: number
  height: number
  tags: string[]
  ext: string
  uploadDate: number
  urls: {
    small: string
    regular: string
  }
}

const VanImagePreview = ImagePreview.Component

// const api = 'https://feizhouxianyu.cn/api/setu?k=xianyu'
// const api = 'http://127.0.0.1:8900/api/setu?k=xianyu'
const api = 'https://api.lolicon.app/setu/v2?proxy=i.pixiv.re&size=small&size=regular&num=10'
const mode = ref(0)

const local = ref(false)
const webList = ref<ApiRes[]>([])
const loaclList = ref<ApiRes[]>([])
const list = computed(() => local.value ? loaclList.value : webList.value)
const _list = computed(() => list.value.map(item => item.urls.regular))

const imageShow = ref(false)
const imageLoading = ref(false)
const index = ref(0)
let _index = 0

const showImage = (key: number) => {
  if (window.plus) {
    imageLoading.value = false
  }
  index.value = key
  _index = key
  imageShow.value = true
}

const onClose = () => {
  imageShow.value = false
}

const onChange = (newKey: number) => {
  index.value = newKey
  if (newKey === _index) return
  if (_index !== -1) _index = -1

  window.location.hash = String(newKey)
}

const saveImage = () => {
  if (!window.plus) return
  const dtask = window.plus.downloader.createDownload(_list.value[index.value], {}, (d: { filename: string }, status: number) => {
    if (status === 200) {
      window.plus.gallery.save(d.filename, () => {
        window.plus.nativeUI.toast(`${d.filename}已保存`)
      })
    } else {
      window.plus.nativeUI.toast(`${d.filename}下载失败`)
    }
    imageLoading.value = false
  })
  imageLoading.value = true
  dtask.start()
}

const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const onLoad = () => {
  getData()
}

const emptyImg = computed(() => {
  if (loading.value) return require('@/assets/ready.jpg')
  if (list.value.length < 1) return require('@/assets/empty.jpg')
  return require('@/assets/loading.jpg')
})

const UID = ref()
const keyword = ref('')

const title = computed(() => {
  if (mode.value === 1) {
    const uid = data.open ? data.UID : UID.value
    return uid ? `UID: ${uid}` : 'UID'
  }
  if (mode.value === 2) {
    return (data.open ? data.keyword : keyword.value) || '关键词'
  }
  if (mode.value === 3) {
    return '收藏'
  }
  return '随机色图'
})

const data = reactive({
  open: false,
  click: false,
  mode: 0,
  _mode: 0,
  UID: 0,
  keyword: ''
})

const open = () => {
  data.open = true
  data.click = false
  data.mode = mode.value
  data.UID = UID.value
  data.keyword = keyword.value

  if (mode.value !== 3) {
    data._mode = mode.value
  }
}

const closed = () => {
  data.open = false
  if (data.click) return
  mode.value = data.mode
  UID.value = data.UID
  keyword.value = data.keyword
}

const dropdownItem = ref<DropdownItemInstance>()

const onConfirm = () => {
  if (canConfirm.value) return

  data.click = true
  if (dropdownItem.value) {
    dropdownItem.value.toggle()
  }
  if (mode.value === 3) {
    getLoaclData()
    finished.value = true
    local.value = true
    return
  }
  finished.value = false
  local.value = false

  if (mode.value !== 1) UID.value = null
  if (mode.value !== 2) keyword.value = ''

  if (shouldGetData.value) {
    finished.value = true
    nextTick(() => {
      finished.value = false
    })
    return
  }
  webList.value = []
  getData()
}

const shouldGetData = computed(
  () =>
    (data.mode === 3 && mode.value === data._mode) ||
    (mode.value === 2 && keyword.value === data.keyword) ||
    (mode.value === 1 && UID.value === data.UID)
)

const canConfirm = computed(() => {
  if (
    (mode.value === 1 && (UID.value === data.UID || !UID.value)) ||
    (mode.value === 2 && (keyword.value === data.keyword || !keyword.value)) ||
    (mode.value === 3 && data.mode === 3) ||
    (mode.value === 0 && data.mode === 0)
  ) {
    if (data.mode === 3 && mode.value === data._mode) return false
    return true
  } else {
    return false
  }
})

const btnText = computed(() => {
  if (!canConfirm.value && shouldGetData.value) return '继续色色'
  if (mode.value === 3) return '我的色图'
  return '开始色色'
})

const search = (type: 1 | 2 | 3, key: number | string) => {
  if (type === 1) {
    mode.value = 1
    UID.value = key
  }
  if (type === 2) {
    mode.value = 2
    keyword.value = key as string
  }
  webList.value = []
  getData()
}

const checkLocalData = (item: ApiRes) => {
  return !loaclList.value.some(_item => _item.pid === item.pid && _item.p === item.p)
}

const setLoaclData = (item: ApiRes) => {
  const loaclIndex = loaclList.value.findIndex(_item => _item.pid === item.pid && _item.p === item.p)
  if (loaclIndex !== -1) {
    loaclList.value.splice(loaclIndex, 1)
  } else {
    loaclList.value.push(item)
  }
  localStorage.setItem('collection', JSON.stringify(loaclList.value))
}

const getLoaclData = () => {
  try {
    const temp2: ApiRes[] = JSON.parse(localStorage.getItem('collection') || '[]')
    loaclList.value = temp2
  } catch {
    loaclList.value = []
  }
}

const getData = () => {
  if (error.value) return

  finished.value = false
  let _api = api
  loading.value = true
  if (mode.value === 1) {
    _api += `&uid=${UID.value}`
  } else if (mode.value === 2) {
    _api += `&keyword=${keyword.value}`
  }
  axios.get(_api)
    .then((res: { data: { error?: string, data: ApiRes[] } }) => {
      if (!ready.value) ready.value = true

      if (res.data.error) throw Error(res.data.error)

      const temp: ApiRes[] = []
      res.data.data.forEach(item => {
        if (webList.value.some(i => (i.pid === item.pid && i.p === item.p))) return
        temp.push(item)
      })
      webList.value = [...webList.value, ...temp]
      if (temp.length < 1 || webList.value.length < 1) finished.value = true
    })
    .catch(err => {
      loading.value = false
      error.value = true
      console.error(err)
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 300)
    })
}

const ready = ref(false)
onMounted(() => {
  getData()
})
getLoaclData()

defineExpose([dropdownItem, imageShow])
</script>

<style lang="stylus" scoped>
.home
  display flex
  flex-direction column

  .list
    overflow-y auto
    flex 1
    background #ddd

    .info
      margin 10px

    .tags
      display flex
      flex-wrap wrap
      justify-content flex-end
      margin-left 10px

      .tag
        margin 2px 5px

  .save
    z-index 9999
    position fixed
    bottom 15px
    left calc(50% - 22.5px)
    width 45px
    height 45px
    font-size 20px

@media screen and (max-width 600px)
  .info
    width 80vw

@media screen and (min-width 600px)
  .info
    width 480px
</style>

<style lang="stylus">
.van-swipe-cell__right
  overflow-y auto

.cell-title
  flex 0 0 50px !important

.van-field
  padding 10px 0 !important

@media screen and (min-width 600px)
  .van-dropdown-item--down
    width 600px
    left 50% !important
    transform translateX(-50%)
</style>
