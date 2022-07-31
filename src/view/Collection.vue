<template>
  <TopBtn :length="data.length" />
  <van-tabs
    v-model:active="active"
    color="pink"
    line-width="40"
    sticky
    shrink
    animated
    swipeable
    ref="tabRef"
  >
    <van-tab title="收藏">
      <ImageView
        :show="show"
        :list="data"
        :multicolumn="setting.multicolumn"
        @show-swiper="showSwiper"
        @set-loacl-data="setLoaclData"
        @search="search"
        ref="viewRef"
      />
    </van-tab>
  </van-tabs>
  <ImageSwiper :data="data" @swiper-change="swiperChange" ref="swiperRef" />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ImageSwiper from '../components/ImageSwiper.vue'
import ImageView from '../components/ImageView.vue'
import TopBtn from '../components/TopBtn.vue'
import { localData, setLoaclData } from '../store/local'
import { setting } from '../store/setting'
import { ApiRes } from '../type'

const router = useRouter()

const active = ref(0)

const show = ref(true)
const data = ref<ApiRes[]>([])
watch(localData.value, () => {
  show.value = false
  data.value = [...localData.value]
  show.value = true
})

const swiperRef = ref()
const showSwiper = (index: number) => {
  swiperRef.value?.showSwiper(index)
}

const viewRef = ref()
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
  router.push({
    path: '/',
    params: {
      refresh: '1',
    },
  })
}

setTimeout(() => {
  data.value = [...localData.value]
}, 50)
</script>
