<template>
  <div class="home">
    <van-tag class="num-tag" type="primary" plain round v-if="numTag > 0">
      {{ numTag }}
    </van-tag>
    <van-sticky style="margin-bottom: 5px">
      <van-dropdown-menu>
        <van-dropdown-item
          :title="title"
          ref="dropdownItem"
          @open="open"
          @closed="onDropdownclosed"
        >
          <van-cell-group inset style="margin-top: 15px">
            <van-collapse v-model="activeNames">
              <van-collapse-item title="统计" name="1">
                <table border="0" cellspacing="0" class="table">
                  <tr>
                    <th class="van-hairline--bottom van-hairline--right"></th>
                    <th class="van-hairline--bottom">小图</th>
                    <th class="van-hairline--bottom">大图</th>
                  </tr>
                  <tr>
                    <th class="van-hairline--right first-row">图片数</th>
                    <td>{{ small.size }}</td>
                    <td>{{ regular.size }}</td>
                  </tr>
                  <tr>
                    <th class="van-hairline--right first-row">浏览数</th>
                    <td>{{ smallNum }}</td>
                    <td>{{ regularNum }}</td>
                  </tr>
                </table>
              </van-collapse-item>
            </van-collapse>
          </van-cell-group>
          <van-cell-group inset title="显示设置">
            <van-cell center title="显示列数">
              <template #right-icon>
                <van-slider
                  v-model="multiColNum"
                  :min="1"
                  :max="3"
                  style="width: 187px; margin-right: 20px"
                  @update:model-value="omMultiColNumChange"
                  @change="omMultiColNumChanged"
                >
                  <template #button>
                    <div class="custom-button">{{ multiColNum }}</div>
                  </template>
                </van-slider>
              </template>
            </van-cell>
            <van-cell center title="低质图片">
              <template #right-icon>
                <van-switch
                  v-model="useThumb"
                  size="24px"
                  style="margin-right: 12px"
                  @change="saveConfig"
                />
              </template>
            </van-cell>
            <van-cell center :title="collectionName">
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
                  :min="isMultiColumn ? multiColNum * 10 : 10"
                  style="width: 187px; margin-right: 20px"
                >
                  <template #button>
                    <div class="custom-button">{{ num }}</div>
                  </template>
                </van-slider>
              </template>
            </van-cell>
            <van-cell center title="R18">
              <template #right-icon>
                <van-radio-group v-model="R18" direction="horizontal">
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
      offset="1500"
      :finished-text="finishedText"
      @load="onLoad"
      ref="listRef"
    >
      <van-empty
        v-if="(list.length < 1 && loading) || list.length < 1"
        :image="emptyImg"
        image-size="300"
        style="height: 90%"
      />
      <div :class="{ 'other-list': isMultiColumn }">
        <transition-group name="van-fade">
          <van-swipe-cell
            v-for="(img, index) in list"
            :key="index"
            :id="index"
            :disabled="multiColNum > 1"
            :style="{
              width: isMultiColumn
                ? `${(100 / multiColNum).toFixed(0)}vw`
                : '100%',
              height: isMultiColumn
                ? `${(100 / multiColNum).toFixed(0)}vw`
                : '',
              transition: 'all 0.2s, height 0.2s'
            }"
          >
            <van-image
              width="100%"
              height="100%"
              lazy-load
              fit="cover"
              :src="useThumb ? img.urls.thumb : img.urls.small"
              @click="showImage(index)"
              @load="onSmallLoad(img.pid, img.p)"
            >
              <transition name="van-slide-down">
                <div
                  class="collection"
                  v-if="!collection && !checkLocalData(img)"
                ></div>
              </transition>
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
            <template #right>
              <InfoBox
                :index="index"
                :img="img"
                :like="checkLocalData(img)"
                @search="search"
                @setLoaclData="setLoaclData(img)"
              />
            </template>
          </van-swipe-cell>
        </transition-group>
      </div>
      <!-- </template> -->
    </van-list>
    <van-image-preview
      v-model:show="imageShow"
      :images="_list"
      :start-position="index"
      :loop="false"
      :close-on-popstate="false"
      @closed="onPreviewClosed"
      @change="onPreviewChange"
    >
      <template v-slot:index>
        <div class="index" @click="showInfo">
          <div class="index-title van-ellipsis">{{ list?.[index]?.title }}</div>
        </div>
      </template>
      <template #cover>
        <transition name="van-slide-up">
          <van-button
            v-if="imageShow && isApp"
            class="save"
            icon="down"
            type="primary"
            plain
            round
            :loading="imageLoading"
            @click="saveImage"
          />
        </transition>
      </template>
    </van-image-preview>
    <van-action-sheet v-model:show="previewInfo" @closed="onSearch(true)">
      <InfoBox
        v-if="!searchEnd"
        style="margin: 10px auto"
        :index="-1"
        :img="list?.[index]"
        :like="checkLocalData(list?.[index])"
        @search="search"
        @setLoaclData="setLoaclData(list?.[index])"
      />
    </van-action-sheet>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { Toast, ImagePreview, DropdownItemInstance, ListInstance } from 'vant'
import { imageShow, previewInfo, isApp } from '@/global'
import { ReqQuery, ApiRes } from '@/type'
import axios from 'axios'
import InfoBox from '@/components/InfoBox.vue'

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

const collection = ref(false)

const useThumb = ref(false)
const multiColNum = ref(1)

const isMultiColumn = computed(() => multiColNum.value > 1)

const saveConfig = () => {
  const config = {
    useThumb: useThumb.value,
    multiColNum: multiColNum.value,
    num: num.value,
    R18: R18.value
  }
  localStorage.setItem('setu-config', JSON.stringify(config))
}

const getConfig = () => {
  try {
    const config = JSON.parse(localStorage.getItem('setu-config') || '{}')
    for (const i in config) {
      // eslint-disable-next-line no-eval
      const j = eval(i)
      if (j) {
        j.value = config[i] || j.value
      }
    }
  } catch {}
}

const omMultiColNumChange = () => {
  if (num.value < multiColNum.value * 10) {
    num.value = multiColNum.value * 10
  }
}

const omMultiColNumChanged = () => {
  listRef.value?.check()
  saveConfig()
}

const onCollectionChange = () => {
  if (listRef.value) {
    listRef.value.$el.scrollTop = 0
  }
  if (collection.value) {
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

const collectionName = computed(() => {
  let temp = '色图收藏'
  if (loaclList.value.length > 0) {
    temp += ` (${loaclList.value.length})`
  }
  return temp
})

const numTag = computed(() => {
  if (collection.value) {
    return loaclList.value.length
  } else {
    return webList.value.length
  }
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

const onDropdownclosed = () => {
  data.open = false
  // activeNames.value = []
  if (data.click) return
  mode.value = data.mode
  UID.value = data.UID
  keyword.value = data.keyword
  num.value = data.num
  R18.value = data.R18
}

const dropdownItem = ref<DropdownItemInstance>()

const onRefresh = () => {
  data.click = true
  if (dropdownItem.value) {
    dropdownItem.value.toggle()
  }
  webList.value = []
  getData()
  saveConfig()
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

  saveConfig()
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
    (R18.value !== data.R18 || num.value !== data.num) &&
    ((mode.value === 2 && keyword.value === data.keyword) ||
      (mode.value === 1 && UID.value === data.UID) ||
      mode.value === 0)
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

let isSearch = false
let searchFlag = 0
const searchEnd = ref(false)

const onSearch = (flag: boolean) => {
  if (flag) {
    searchEnd.value = true
  }
  if (isSearch) {
    if (++searchFlag >= 2) {
      isSearch = false
      searchFlag = 0
      _search()
    }
  }
}

const search = (type: 1 | 2 | 3, key: number | string) => {
  if (type === 1) {
    if (UID.value === key) return
    mode.value = 1
    UID.value = key
  }
  if (type === 2) {
    if (keyword.value === key) return
    mode.value = 2
    keyword.value = key as string
  }

  if (previewInfo.value) {
    isSearch = true
    imageShow.value = false
    previewInfo.value = false
    return
  }

  _search()
}

const _search = () => {
  webList.value = []
  getData()
  collection.value = false
  local.value = false
  nextTick(() => {
    finished.value = false
  })
}

// 消息列表
const listRef = ref<ListInstance>()

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

const finishedText = computed(() => (collection.value ? '' : '没有色色了'))

const emptyImg = computed(() => {
  if (error.value) return require('@/assets/serve-error.jpg')
  if (loading.value) return require('@/assets/ready.jpg')
  if (list.value.length < 1) return require('@/assets/empty.jpg')
  return require('@/assets/loading.jpg')
})

const checkLocalData = (item: ApiRes) => {
  if (!item) return false
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
    loaclList.value.unshift(item)
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
const imageLoading = ref(false)
const index = ref(0)
let _index = 0

const showInfo = () => {
  searchEnd.value = false
  previewInfo.value = true
}

const showImage = (key: number) => {
  if (window.plus) {
    imageLoading.value = false
  }
  index.value = key
  _index = key
  imageShow.value = true
  onRegularLoad(list.value[index.value].pid, list.value[index.value].p)
}

const onPreviewChange = (newKey: number) => {
  index.value = newKey
  if (newKey !== _index) {
    onRegularLoad(list.value[index.value].pid, list.value[index.value].p)
    _index = -1
  }

  window.location.hash = String(newKey)
}

const onPreviewClosed = () => {
  onSearch(false)
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

// 统计
const activeNames = ref([])

const small = ref(new Set<string>())
const smallNum = ref(0)
const regular = ref(new Set<string>())
const regularNum = ref(0)

const onSmallLoad = (pid: number, p: number) => {
  if (collection.value) return
  ++smallNum.value
  const key = `${pid}-${p}`
  if (small.value.has(key)) return
  small.value.add(key)
  saveHistory()
}

const onRegularLoad = (pid: number, p: number) => {
  if (collection.value) return
  ++regularNum.value
  const key = `${pid}-${p}`
  if (regular.value.has(key)) return
  regular.value.add(key)
  saveHistory()
}

const saveHistory = () => {
  const history = {
    small: [...small.value],
    smallNum: smallNum.value,
    regular: [...regular.value],
    regularNum: regularNum.value
  }
  localStorage.setItem('setu-history', JSON.stringify(history))
}

const getHistory = () => {
  try {
    let history: {
      small?: string[]
      smallNum?: number
      regular?: string[]
      regularNum?: number
    } = {}
    history = JSON.parse(localStorage.getItem('setu-history') || '{}')
    small.value = new Set<string>(history.small || [])
    smallNum.value = history.smallNum || 0
    regular.value = new Set<string>(history.regular || [])
    regularNum.value = history.regularNum || 0
  } catch {}
}

// init
onMounted(() => {
  getData()
})
getLoaclData()
getConfig()
getHistory()

// ref
defineExpose([dropdownItem])
</script>

<style lang="sass" scoped>
.home
  display: flex
  flex-direction: column

  .num-tag
    position: fixed
    top: 15px
    right: 15px
    z-index: 100

  .loading
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)

  .other-list
    display: flex
    flex-wrap: wrap
    justify-content: flex-start

  .list
    overflow-y: auto
    flex: 1
    background: #ddd

  .collection
    position: absolute
    top: 0
    right: 0
    width: 20px
    height: 20px
    background: var(--van-primary-color)
    clip-path: polygon(0 0, 50% 0, 100% 50%, 100% 100%)

  .save
    z-index: 2000
    position: fixed
    bottom: 15px
    left: calc(50% - 22.5px)
    width: 45px
    height: 45px
    font-size: 20px

.table
  width: 100%
  text-align: right

  .first-row
    width: 60px
    text-align: left

.btn-list
  display: flex
  align-items: center
  padding: 15px 15px 0 15px

  .refresh
    width: 38px
    height: 38px
    margin-right: 10px
    font-size: 20px
    transform: rotateZ(90deg)

  .confirm
    font-size: 20px
    height: 40px

.index
  text-align: center
  padding: 1px 5px
  border-radius: 5px
  background: rgba(0, 0, 0, 0.1)

  .index-title
    max-width: 80vw
    margin: auto
    font-size: 14px

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
  border-bottom-left-radius: 10px
  border-bottom-right-radius: 10px

.van-swipe-cell__wrapper
  height: 100%

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
