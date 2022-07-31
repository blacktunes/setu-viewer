<template>
  <transition name="fade">
    <RecycleScroller
      v-if="show && !multicolumn"
      class="scroller"
      :items="data"
      :buffer="500"
      keyField="pid"
      sizeField="realHeight"
      v-slot="{ item, index }"
      emitUpdate
      @update="scrollEnd"
      ref="scroller"
    >
      <van-swipe-cell style="width: 100%" :stop-propagation="true">
        <template #right>
          <transition name="van-slide-left">
            <InfoBox
              :index="index"
              :img="item"
              :like="checkLocalData(data[index])"
              @set-loacl-data="setLoaclData(item)"
              @search="search"
            />
          </transition>
        </template>
        <img
          v-lazy="item.urls.small"
          class="img"
          @click="showSwiper(index)"
          @load="imgLoaded(index, $event)"
        />
      </van-swipe-cell>
    </RecycleScroller>
  </transition>
  <transition name="fade">
    <RecycleScroller
      v-if="show && multicolumn"
      class="scroller"
      :items="data2"
      :buffer="500"
      keyField="id"
      :itemSize="height"
      v-slot="{ item }"
      emitUpdate
      @update="scrollEnd"
      ref="scroller"
    >
      <div class="item-wrapper">
        <div class="item" v-for="img in item.list" :key="item.pid">
          <img v-lazy="img.urls.small" class="img2" @click="showSwiper(img.id)" />
        </div>
      </div>
    </RecycleScroller>
  </transition>
</template>

<script lang="ts" setup>
import InfoBox from './InfoBox.vue'
import { ApiRes } from '../type'
import { computed, ref, watch } from 'vue'
import { checkLocalData } from '../store/local'

const props = defineProps<{
  show: boolean
  list: ApiRes[]
  multicolumn?: boolean
}>()

const emit = defineEmits<{
  (event: 'load', type: 0, pid: number): void
  (event: 'scrollEnd'): void
  (event: 'showSwiper', index: number): void
  (event: 'setLoaclData', item: ApiRes): void
  (event: 'search', type: 0 | 1 | 2, key: number | string): void
}>()

watch(props, () => {
  data.value = props.list
  data.value.forEach(item => {
    if (!item.realHeight) {
      item.realHeight = window.innerWidth
    }
  })
})

const height = computed(() => window.innerWidth / 3)

const scroller = ref()

const data = ref<ApiRes[]>([])
const data2 = computed(() => {
  let flag = 0
  let index = 0
  const temp: { id: number | string; list: ApiRes[] }[] = []
  for (const i in data.value) {
    const newData = { id: i, ...data.value[i] }
    if (flag === 0) {
      temp.push({
        id: index,
        list: [newData],
      })
    } else {
      temp[index].list.push(newData)
    }
    if (++flag === 3) {
      flag = 0
      index += 1
    }
  }
  return temp
})

const imgLoaded = (i: number, e: Event) => {
  data.value[i].realHeight = e['path'][0].offsetHeight
  emit('load', 0, data.value[i].pid)
}

const scrollEnd = (_startIndex: number, endIndex: number) => {
  if (data.value.length <= 1) return
  if (props.multicolumn) {
    if (data2.value.length - 1 - endIndex <= 5) {
      emit('scrollEnd')
    }
  } else {
    if (data.value.length - 1 - endIndex <= 5) {
      emit('scrollEnd')
    }
  }
}

const swiperChange = (index: number) => {
  if (props.multicolumn) {
    scroller.value.scrollToItem((index / 3) | 0)
  } else {
    scroller.value.scrollToItem(index)
  }
}

const showSwiper = (index: number) => {
  emit('showSwiper', index)
}

const setLoaclData = (item: ApiRes) => {
  emit('setLoaclData', item)
}

const search = (type: 0 | 1 | 2, key: number | string) => {
  emit('search', type, key)
}

defineExpose({ swiperChange })
</script>

<style lang="scss" scoped>
.scroller {
  width: 100vw;
  height: calc(100vh - var(--van-button-default-height) - var(--van-tabbar-height));
}

.img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-wrapper {
  display: flex;
  .item {
    width: 33vw;
    height: 33vw;
    .img2 {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
