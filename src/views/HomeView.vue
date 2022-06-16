<template>
  <van-list
    v-model:loading="loading"
    v-model:error="error"
    error-text="请求失败，点击重新加载"
    @load="onLoad"
  >
    <img
      @click="showImage(img.urls.small)"
      style="width: 100%"
      v-for="(img, index) in list"
      v-lazy="img.urls.small"
      :key="index"
    />
  </van-list>
</template>

<script lang="ts" setup>
import { ImagePreview } from 'vant'
import { ref } from 'vue'
import axios from 'axios'

const showImage = (url: string) => {
  ImagePreview({
    images: [url],
    showIndex: false
  })
}

const list = ref<string[]>([])
const error = ref(false)
const loading = ref(false)
const onLoad = () => {
  axios.get('https://feizhouxianyu.cn/api/setu?k=xianyu')
    .then(res => {
      list.value = [...list.value, ...res.data]
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
      error.value = true
    })
}
</script>

<style lang="stylus" scoped></style>
