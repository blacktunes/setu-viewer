<template>
  <div class="home">
    <van-sticky style="margin-bottom: 5px">
      <van-dropdown-menu>
        <van-dropdown-item
          :title="title"
          ref="item"
          @open="open"
          @closed="closed"
        >
          <van-cell center title="模式">
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
            >
              确认
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
        image="/empty.jpg"
        image-size="300"
        description="啥都没有"
        style="height: 100%"
      />
      <van-swipe-cell v-for="(img, index) in list" :key="index">
        <img
          @click="showImage(img.urls.regular)"
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
  </div>
</template>

<script lang="ts" setup>
import { DropdownItemInstance, ImagePreview } from 'vant'
import { computed, reactive, ref } from 'vue'
import axios from 'axios'

const api = 'https://feizhouxianyu.cn/api/setu?k=xianyu'
// const api = 'http://127.0.0.1:8900/api/setu?k=xianyu'

const showImage = (url: string) => {
  ImagePreview({
    images: [url],
    showIndex: false,
    closeable: true
  })
}

const list = ref<string[]>([])
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
  return 'SETU'
})

const data = reactive({
  open: false,
  click: false,
  mode: 0,
  UID: 0,
  keyword: ''
})

const item = ref<DropdownItemInstance>()

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

const onConfirm = () => {
  if (canConfirm.value) return
  data.click = true
  item.value?.toggle()
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
    .then(res => {
      list.value = [...new Set([...list.value, ...res.data])]
      if (list.value.length < 1) finished.value = true
    })
    .catch((error) => {
      console.error(error)
      error.value = true
    })
    .finally(() => {
      loading.value = false
    })
}
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
