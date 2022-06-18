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
          <van-cell center title="MODE">
            <template #right-icon>
              <van-radio-group v-model="mode" direction="horizontal">
                <van-radio :name="0">随机</van-radio>
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
              开始瑟瑟
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
      error-text="请求失败，点击重新加载"
      @load="onLoad"
    >
      <van-empty
        v-if="list.length < 1 && !loading"
        :image="require('@/assets/empty.jpg')"
        image-size="300"
        style="height: 100%"
      />
      <van-swipe-cell v-for="(img, index) in list" :key="index">
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
          </van-cell-group>
        </template>
      </van-swipe-cell>
    </van-list>
    <transition name="van-slide-up">
      <van-button
        v-if="imageShow"
        class="save"
        icon="like"
        type="danger"
        plain
        round
        :loading="imageLoading"
        @click="saveImage"
      />
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { ImagePreview, DropdownItemInstance } from 'vant'
import { components } from '@/assets/global'
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

const api = 'https://feizhouxianyu.cn/api/setu?k=xianyu'
// const api = 'http://127.0.0.1:8900/api/setu?k=xianyu'

const imageShow = ref(false)
const imageLoading = ref(false)
const index = ref(0)
const imageUrl = computed(() => _list.value[index.value])

const showImage = (key: number) => {
  if (window.plus) {
    imageShow.value = true
    imageLoading.value = false
    index.value = key
  }
  components.instance = ImagePreview({
    images: _list.value,
    startPosition: key,
    showIndex: true,
    closeable: !window.plus,
    onClose: () => {
      imageShow.value = false
      components.instance = null
    },
    onChange: (newKey) => {
      index.value = newKey
    }
  })
}

const saveImage = () => {
  const dtask = window.plus.downloader.createDownload(imageUrl, {}, (d: { filename: string }, status: number) => {
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

const list = ref<ApiRes[]>([])
const _list = computed(() => list.value.map(item => item.urls.regular))

const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const onLoad = () => {
  getData()
}

const mode = ref(0)
const UID = ref()
const keyword = ref('')

const title = computed(() => {
  if (data.open) {
    if (data.mode === 1) {
      return `UID: ${data.UID}` || 'UID'
    }
    if (data.mode === 2) {
      return data.keyword || '关键词'
    }
  } else {
    if (mode.value === 1) {
      return `UID: ${UID.value}` || 'UID'
    }
    if (mode.value === 2) {
      return keyword.value || '关键词'
    }
  }
  return '随机涩图'
})

const data = reactive({
  open: false,
  click: false,
  mode: 0,
  UID: 0,
  keyword: ''
})

const open = () => {
  data.open = true
  data.click = false
  data.mode = mode.value
  data.UID = UID.value
  data.keyword = keyword.value
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
  list.value = []
  getData()
}

const canConfirm = computed(() => {
  if ((mode.value === 1 && (UID.value === data.UID || !UID.value)) || (mode.value === 2 && (keyword.value === data.keyword || !keyword.value)) || (mode.value === 0 && data.mode === 0)) {
    return true
  } else {
    return false
  }
})

const search = (type: 1 | 2, key: number | string) => {
  if (type === 1) {
    mode.value = 1
    UID.value = key
  }
  if (type === 2) {
    mode.value = 2
    keyword.value = key as string
  }
  list.value = []
  getData()
}

const getData = () => {
  finished.value = false
  let _api = api
  loading.value = true
  if (mode.value === 1) {
    _api += `&uid=${UID.value}`
  } else if (mode.value === 2) {
    _api += `&keyword=${keyword.value}`
  }
  axios.get(_api)
    .then((res: { data: ApiRes[] }) => {
      const temp: ApiRes[] = []
      res.data.forEach(item => {
        if (list.value.some(i => (i.pid === item.pid && i.p === item.p))) return
        temp.push(item)
      })
      list.value = [...list.value, ...temp]
      if (temp.length < 1 || list.value.length < 1) finished.value = true
    })
    .catch((error) => {
      console.error(error)
      error.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

defineExpose([dropdownItem])
</script>

<style lang="stylus" scoped>
.home
  display flex
  flex-direction column

  .list
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
