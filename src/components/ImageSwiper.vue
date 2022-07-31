<template>
  <transition name="fade">
    <div class="swiper-wrapper" v-show="isSwiper">
      <swiper
        :modules="[Virtual, Zoom]"
        zoom
        virtual
        @init="swiperInit"
        @slideChange="swiperChange"
      >
        <swiper-slide
          v-for="(item, index) in data"
          :key="index"
          :virtualIndex="index"
          zoom
          class="swiper"
          @click="closeSwiper"
        >
          <img v-lazy="item.urls.regular" class="img" @load="load(item.pid)" />
          <div class="title van-ellipsis">
            {{ item.title }}
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { Virtual, Zoom } from 'swiper'
import 'swiper/css'
import 'swiper/css/zoom'
import { Swiper as SwiperClass } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { ref } from 'vue'
import { ApiRes } from '../type'

defineProps<{
  data: ApiRes[]
}>()

const emit = defineEmits<{
  (event: 'swiperChange', index: number): void
  (evnet: 'imageLoad', type: 1, pid: number): void
}>()

const isSwiper = ref(false)
const swiperRef = ref<SwiperClass>()

const swiperInit = (e: SwiperClass) => {
  swiperRef.value = e
}

const swiperChange = (e: SwiperClass) => {
  emit('swiperChange', e.activeIndex)
}

const showSwiper = (index: number) => {
  isSwiper.value = true
  swiperRef.value?.slideTo(index)
}

let closeTimer: NodeJS.Timeout | null = null
const closeSwiper = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  } else {
    closeTimer = setTimeout(() => {
      isSwiper.value = false
      closeTimer = null
    }, 200)
  }
}

const load = (pid: number) => {
  emit('imageLoad', 1, pid)
}

defineExpose({ showSwiper })
</script>

<style lang="scss" scoped>
.swiper-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  .swiper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
  }
  .img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.title {
  max-width: calc(100vw - 130px);
  position: fixed;
  bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  padding: 5px;
  border-radius: 5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1 !important;
}
</style>
