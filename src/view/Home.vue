<template>
  <div>
    <TopBtn :loading="loading" :length="data.length" />
    <van-tabs
      v-model:active="active"
      color="pink"
      line-width="40"
      shrink
      swipeable
      ellipsis
      ref="tabRef"
    >
      <van-tab :title="title">
        <ImageView
          :show="!isRefresh"
          :list="data"
          :multicolumn="setting.multicolumn"
          @scroll-end="getData"
          @show-swiper="showSwiper"
          @set-loacl-data="setLoaclData"
          @search="search"
          @load="setHistory"
          ref="viewRef"
        />
      </van-tab>
      <van-tab title="设置">
        <div class="setting">
          <van-cell-group inset class="card">
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
                    <td>{{ history.small.size }}</td>
                    <td>{{ history.regular.size }}</td>
                  </tr>
                  <tr>
                    <th class="van-hairline--right first-row">浏览数</th>
                    <td>{{ history.smallNum }}</td>
                    <td>{{ history.regularNum }}</td>
                  </tr>
                </table>
              </van-collapse-item>
            </van-collapse>
          </van-cell-group>
          <van-cell-group inset class="card">
            <van-cell title="代理" is-link arrow-direction="down" @click="proxyPopover = true">
              <van-popover
                v-model:show="proxyPopover"
                :actions="proxyActions"
                @select="proxyPopoverSelect"
              >
                <template #reference>{{
                  setting.proxy ? proxyActions[1].text : proxyActions[0].text
                }}</template>
              </van-popover>
            </van-cell>
            <van-field
              v-model="setting.customProxy"
              input-align="right"
              label="代理地址"
              v-if="setting.proxy"
            />
          </van-cell-group>
          <van-cell-group inset class="card">
            <van-cell title="R18" is-link arrow-direction="down" @click="r18Popover = true">
              <van-popover
                v-model:show="r18Popover"
                :actions="r18Actions"
                @select="r18PopoverSelect"
              >
                <template #reference>{{ r18Actions[setting.r18].text }}</template>
              </van-popover>
            </van-cell>
          </van-cell-group>
          <van-cell-group inset class="card">
            <van-cell title="模式" is-link arrow-direction="down" @click="modePopover = true">
              <van-popover
                v-model:show="modePopover"
                :actions="modeActions"
                @select="modePopoverSelect"
              >
                <template #reference>{{ modeActions[setting.mode].text }}</template>
              </van-popover>
            </van-cell>
            <van-field
              v-model="setting.uid"
              input-align="right"
              label="UID"
              type="digit"
              v-if="setting.mode === 1"
            />
            <van-field
              v-model="setting.keyword"
              input-align="right"
              label="关键字"
              v-if="setting.mode === 2"
            />
            <van-button type="primary" block :disabled="canRefresh" @click="getData(true)"
              >开始色色</van-button
            >
          </van-cell-group>
        </div>
      </van-tab>
    </van-tabs>
    <ImageSwiper
      :data="data"
      @swiper-change="swiperChange"
      @imageLoad="setHistory"
      ref="swiperRef"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from '@vue/reactivity'
import axios from 'axios'
import { TabsInstance } from 'vant'
import { onActivated, ref } from 'vue'
import { useRoute } from 'vue-router'
import ImageSwiper from '../components/ImageSwiper.vue'
import ImageView from '../components/ImageView.vue'
import TopBtn from '../components/TopBtn.vue'
import { history, setHistory } from '../store/history'
import { setLoaclData } from '../store/local'
import { setting } from '../store/setting'
import { ApiRes, ReqQuery } from '../type'

// 设置
const activeNames = ref(['1'])

const proxyPopover = ref(false)
const proxyActions = [
  { text: '默认', flag: false },
  { text: '自定义', flag: true },
]
const proxyPopoverSelect = (action: typeof proxyActions[number]) => {
  setting.value.proxy = action.flag
}

const r18Popover = ref(false)
const r18Actions = [
  { text: '没有', flag: 0 },
  { text: '全是', flag: 1 },
  { text: '随便', flag: 2 },
]
const r18PopoverSelect = (action: typeof r18Actions[number]) => {
  setting.value.r18 = action.flag
}

const modePopover = ref(false)
const modeActions = [
  { text: '随机', flag: 0 },
  { text: 'UID', flag: 1 },
  { text: '关键字', flag: 2 },
]
const modePopoverSelect = (action: typeof modeActions[number]) => {
  setting.value.mode = action.flag
}

const canRefresh = computed(
  () =>
    loading.value ||
    (setting.value.mode === 1 && !setting.value.uid) ||
    (setting.value.mode === 2 && !setting.value.keyword)
)

// 标签
const active = ref(0)
const tabRef = ref<TabsInstance>()

const title = computed(() => {
  if (active.value !== 0 || setting.value.mode === 0) {
    return '随机色图'
  }
  if (setting.value.mode === 1) {
    return `UID: ${setting.value.uid}`
  }
  if (setting.value.mode === 2) {
    return `关键字: ${setting.value.keyword}`
  }
})

const data = ref<ApiRes[]>([])

const viewRef = ref()

const isRefresh = ref(false)
const loading = ref(false)
const finish = ref(false)
const getData = (refresh?: boolean) => {
  if (refresh) finish.value = false

  if (loading.value || finish.value) return

  if (refresh) {
    isRefresh.value = true
    data.value = []
    tabRef.value?.scrollTo(0)
  }

  loading.value = true

  const query: ReqQuery = {
    num: 20,
    size: ['small', 'regular', 'original'],
    proxy: setting.value.proxy ? setting.value.customProxy : setting.value.defaultProxy,
    r18: setting.value.r18,
    uid: setting.value.mode === 1 ? setting.value.uid : undefined,
    keyword: setting.value.mode === 2 ? setting.value.keyword : undefined,
  }

  axios
    .post(import.meta.env.VITE_API, query)
    .then((res: { data: { error?: string; data: ApiRes[] } }) => {
      if (res.data.error) throw Error(res.data.error)

      if (res.data.data.length === 0) {
        finish.value = true
      }

      if (refresh) {
        data.value = res.data.data
        return
      }

      const temp: ApiRes[] = []
      res.data.data.forEach((item) => {
        if (data.value.some((i) => i.pid === item.pid)) {
          return
        }
        temp.push(item)
      })
      data.value = [...data.value, ...temp]

      if (temp.length === 0) {
        finish.value = true
      }
    })
    .finally(() => {
      loading.value = false
      isRefresh.value = false
    })
}

const swiperRef = ref()

const showSwiper = (index: number) => {
  swiperRef.value?.showSwiper(index)
}

const swiperChange = (index: number) => {
  viewRef.value.swiperChange(index)
}

const search = (type: 0 | 1 | 2, key: number | string) => {
  setting.value.mode = type
  if (type === 1) {
    setting.value.uid = Number(key)
  }
  if (type === 2) {
    setting.value.keyword = String(key)
  }
  getData(true)
}

onActivated(() => {
  const route = useRoute()
  if (route.query.refresh) {
    getData(true)
  }
})

// init
getData()
</script>

<style lang="scss" scoped>
.setting {
  min-height: calc(100vh - var(--van-button-default-height));
  padding: 10px 5px;
  box-sizing: border-box;
  .card {
    margin-bottom: 10px;
  }
}

.table {
  width: 100%;
  text-align: right;
  .first-row {
    width: 60px;
    text-align: left;
  }
}
</style>
