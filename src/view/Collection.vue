<template>
  <div>
    <TopBtn :length="data.length" />
    <div class="top-bar">
      <van-icon style="margin-left: 10px;" name="like" color="pink" />
    </div>
    <ImageView
      :show="show"
      :list="data"
      :multicolumn="setting.multicolumn"
      @show-swiper="showSwiper"
      @set-loacl-data="setLoaclData"
      @search="search"
      ref="viewRef"
    />
    <ImageSwiper :data="data" @swiper-change="swiperChange" ref="swiperRef" />
  </div>
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

<style lang="scss" scoped>
.top-bar {
  height: var(--van-button-default-height);
  line-height: var(--van-button-default-height);
  background: #fff;
}
</style>
