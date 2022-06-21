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
          <van-cell-group inset title="显示设置">
            <van-cell center title="多列">
              <template #right-icon>
                <van-switch
                  v-model="multiColumn"
                  size="24px"
                  style="margin-right: 12px"
                  @change="onMultiColumnChange"
                />
              </template>
            </van-cell>
            <van-cell center title="收藏">
              <template #right-icon>
                <van-switch
                  v-model="collection"
                  size="24px"
                  style="margin-right: 12px"
                  @change="onCollectionChange"
                />
              </template>
            </van-cell>
          </van-cell-group>
          <van-cell-group inset title="色图设置" v-if="!collection">
            <van-cell center title="数量">
              <template #right-icon>
                <van-slider
                  v-model="num"
                  min="10"
                  style="width: 220px"
                  @change="saveConfig"
                >
                  <template #button>
                    <div class="custom-button">{{ num }}</div>
                  </template>
                </van-slider>
              </template>
            </van-cell>
            <van-cell center title="R18">
              <template #right-icon>
                <van-radio-group
                  v-model="R18"
                  direction="horizontal"
                  @change="saveConfig"
                >
                  <van-radio :name="0">没有</van-radio>
                  <van-radio :name="1">全是</van-radio>
                  <van-radio :name="2">随便吧</van-radio>
                </van-radio-group>
              </template>
            </van-cell>
            <van-cell center title="模式">
              <template #right-icon>
                <van-radio-group v-model="mode" direction="horizontal">
                  <van-radio :name="0">随机</van-radio>
                  <van-radio :name="1" style="padding-right: 5px">
                    UID
                  </van-radio>
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
          </van-cell-group>
          <div class="btn-list" v-if="!collection">
            <van-button
              class="refresh"
              type="primary"
              icon="replay"
              round
              plain
              @click="onRefresh"
            />
            <van-button
              :disabled="canConfirm"
              type="primary"
              class="confirm"
              block
              round
              plain
              @click="onConfirm"
            >
              开始色色
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
      loading-text="正在色色..."
      error-text="要不点这重试?"
      finished-text=""
      offset="1500"
      @load="onLoad"
    >
      <van-empty
        v-if="(list.length < 1 && loading) || list.length < 1"
        :image="emptyImg"
        image-size="300"
        style="height: 90%"
      />
      <div class="other-list" v-if="multiColumn">
        <transition-group name="van-fade">
          <van-image
            v-for="(img, index) in list"
            :key="index"
            :id="index"
            :src="img.urls.thumb"
            lazy-load
            width="33%"
            @click="showImage(index)"
          >
            <template #loading>
              <div style="width: 100%">
                <img style="width: 100%" src="@/assets/loading.jpg" />
              </div>
            </template>
            <template #error>
              <div style="width: 100%">
                <img style="width: 100%" src="@/assets/error.jpg" />
              </div>
            </template>
          </van-image>
        </transition-group>
      </div>
      <template v-else>
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
                v-if="img.r18"
                size="large"
                title="R18"
                title-class="r18-tip"
                style="background: var(--van-tag-warning-color)"
              />
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
      </template>
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
import { Toast, ImagePreview, DropdownItemInstance } from 'vant'
import axios from 'axios'

type Size = 'mini' | 'thumb' | 'small' | 'regular' | 'original'

type ReqQuery = Partial<{
  r18: 0 | 1 | 2
  num: number
  uid: number | number[]
  keyword: string
  tag: string[]
  size: Size[]
  proxy: string
  dateAfter: number
  dateBefore: number
}>

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
    [key in Size]: string
  }
}

const VanImagePreview = ImagePreview.Component

// API
const api =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8900/api/setu'
    : 'https://api.lolicon.app/setu/v2'

const query: ReqQuery = {
  proxy: 'i.pixiv.re',
  size: ['thumb', 'small', 'regular']
}

// 菜单设置
const num = ref(20)
const R18 = ref(0)

const multiColumn = ref(false)
const collection = ref(false)

const onMultiColumnChange = () => {
  if (dropdownItem.value) {
    dropdownItem.value.toggle()
  }
  if (multiColumn.value) {
    if (num.value < 30) {
      num.value = 30
    }
  } else {
    if (!collection.value) {
      webList.value.splice(30)
    }
  }
  saveConfig()
}

const onCollectionChange = () => {
  if (collection.value) {
    if (dropdownItem.value) {
      dropdownItem.value.toggle()
    }
    finished.value = true
    local.value = true
  } else {
    local.value = false
    nextTick(() => {
      finished.value = false
    })
  }
}

const mode = ref(0)
const UID = ref()
const keyword = ref('')

// 下拉菜单
const title = computed(() => {
  if (collection.value) {
    return '收藏'
  }
  if (mode.value === 1) {
    const uid = data.open ? data.UID : UID.value
    return uid ? `UID: ${uid}` : 'UID'
  }
  if (mode.value === 2) {
    return (data.open ? data.keyword : keyword.value) || '关键词'
  }
  return '随机色图'
})

const data = reactive({
  open: false,
  click: false,
  mode: 0,
  UID: 0,
  keyword: '',
  num: 20,
  R18: 0
})

const open = () => {
  data.open = true
  data.click = false
  data.mode = mode.value
  data.UID = UID.value
  data.keyword = keyword.value
  data.num = num.value
  data.R18 = R18.value
}

const closed = () => {
  data.open = false
  if (data.click) return
  mode.value = data.mode
  UID.value = data.UID
  keyword.value = data.keyword
}

const dropdownItem = ref<DropdownItemInstance>()

const onRefresh = () => {
  if (dropdownItem.value) {
    dropdownItem.value.toggle()
  }
  webList.value = []
  getData()
}

const onConfirm = () => {
  if (canConfirm.value) return

  data.click = true
  if (dropdownItem.value) {
    dropdownItem.value.toggle()
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
    (mode.value === 2 && keyword.value === data.keyword) ||
    (mode.value === 1 && UID.value === data.UID)
)

const canConfirm = computed(() => {
  if (
    (mode.value === 1 && (UID.value === data.UID || !UID.value)) ||
    (mode.value === 2 && (keyword.value === data.keyword || !keyword.value)) ||
    (mode.value === 0 && data.mode === 0)
  ) {
    if (R18.value !== data.R18 || num.value !== data.num) {
      return false
    }
    return true
  } else {
    return false
  }
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

// 消息列表
const local = ref(false)
const webList = ref<ApiRes[]>([])
const loaclList = ref<ApiRes[]>([])
const list = computed(() => (local.value ? loaclList.value : webList.value))
const _list = computed(() => list.value.map(item => item.urls.regular))

const error = ref(false)
const loading = ref(false)
const finished = ref(false)
const onLoad = () => {
  getData()
}

const emptyImg = computed(() => {
  if (error.value) return require('@/assets/loading.jpg')
  if (loading.value) return require('@/assets/ready.jpg')
  if (list.value.length < 1) return require('@/assets/empty.jpg')
  return require('@/assets/loading.jpg')
})

const checkLocalData = (item: ApiRes) => {
  return !loaclList.value.some(
    _item => _item.pid === item.pid && _item.p === item.p
  )
}

const setLoaclData = (item: ApiRes) => {
  const loaclIndex = loaclList.value.findIndex(
    _item => _item.pid === item.pid && _item.p === item.p
  )
  if (loaclIndex !== -1) {
    loaclList.value.splice(loaclIndex, 1)
  } else {
    loaclList.value.push(item)
  }
  localStorage.setItem('setu-data', JSON.stringify(loaclList.value))
}

const getLoaclData = () => {
  try {
    const temp2: ApiRes[] = JSON.parse(
      localStorage.getItem('setu-data') || '[]'
    )
    loaclList.value = temp2
  } catch {
    loaclList.value = []
  }
}

const getData = () => {
  if (error.value) return

  finished.value = false
  loading.value = true
  const data = {
    ...query,
    r18: R18.value,
    num: num.value
  }
  if (mode.value === 1) {
    data.uid = UID.value
  } else if (mode.value === 2) {
    data.keyword = keyword.value
  }
  axios
    .post(api, data)
    .then((res: { data: { error?: string; data: ApiRes[] } }) => {
      if (res.data.error) throw Error(res.data.error)

      const temp: ApiRes[] = []
      res.data.data.forEach(item => {
        if (webList.value.some(i => i.pid === item.pid && i.p === item.p)) {
          return
        }
        temp.push(item)
      })
      webList.value = [...webList.value, ...temp]
      if (temp.length < 1 || webList.value.length < 1) finished.value = true
    })
    .catch(err => {
      loading.value = false
      error.value = true
      console.error(err)
      Toast({
        message: err.message || '我网呢?',
        icon: 'cross'
      })
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 300)
    })
}

// 图片预览
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
  const dtask = window.plus.downloader.createDownload(
    _list.value[index.value],
    {},
    (d, status) => {
      if (status === 200) {
        window.plus.gallery.save(d.filename || `${Date.now()}.jpg`, () => {
          Toast({
            message: `${d.filename}已保存`,
            position: 'bottom'
          })
        })
      } else {
        Toast({
          message: `${d.filename}下载失败`,
          position: 'bottom'
        })
      }
      imageLoading.value = false
    }
  )
  imageLoading.value = true
  dtask.start()
}

const saveConfig = () => {
  const config = {
    multiColumn: multiColumn.value,
    num: num.value,
    R18: R18.value
  }
  localStorage.setItem('setu-config', JSON.stringify(config))
}

// init
onMounted(() => {
  getData()
})
getLoaclData()
try {
  const config = JSON.parse(localStorage.getItem('setu-config') || '{}')
  multiColumn.value = config.multiColumn ?? false
  num.value = config.num ?? 20
  R18.value = config.R18 ?? 0
} catch {}

// ref
defineExpose([dropdownItem, imageShow])
</script>

<style lang="sass" scoped>
.home
  display: flex
  flex-direction: column

  .other-list
    display: flex
    flex-wrap: wrap
    justify-content: flex-start
    margin-left: 1%

  .list
    overflow-y: auto
    flex: 1
    background: #ddd

    .info
      margin: 10px

    .tags
      display: flex
      flex-wrap: wrap
      justify-content: flex-end
      margin-left: 10px

      .tag
        margin: 2px 5px

  .save
    z-index: 9999
    position: fixed
    bottom: 15px
    left: calc(50% - 22.5px)
    width: 45px
    height: 45px
    font-size: 20px

.btn-list
  display: flex
  align-items: center
  padding: 15px 15px 0 15px

  .refresh
    width: 40px
    height: 40px
    margin-right: 10px

  .confirm
    height: 40px

@media screen and (max-width: 600px)
  .info
    width: 80vw

@media screen and (min-width: 600px)
  .info
    width: 480px
</style>

<style lang="sass">
.van-swipe-cell__right
  overflow: auto

.van-field
  padding: 10px 0 !important

.van-dropdown-item__content
  background: #eee !important
  padding-bottom: 16px

.r18-tip
  color: #fff
  text-align: center
  font-weight: bold

.cell-title
  flex: 0 0 50px !important

.custom-button
  width: 26px
  color: #fff
  font-size: 10px
  line-height: 18px
  text-align: center
  background-color: var(--van-primary-color)
  border-radius: 100px

@media screen and (min-width: 600px)
  .van-dropdown-item--down
    width: 600px
    left: 50% !important
    transform: translateX(-50%)
</style>
