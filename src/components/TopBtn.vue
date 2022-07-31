<template>
  <div class="top-wrapper">
    <van-button class="btn" size="mini" :color="loading ? 'pink' : ''" round>
      {{ length }}
    </van-button>
    <van-button
      class="btn"
      size="mini"
      icon="ellipsis"
      round
      style="margin-right: 10px"
      @click="setting.multicolumn = !setting.multicolumn"
    ></van-button>
  </div>
</template>

<script lang="ts" setup>
import { setting } from '../store/setting'

defineProps<{
  loading?: boolean
  length: number
}>()
</script>

<style lang="scss" scoped>
.top-wrapper {
  display: flex;
  align-items: center;
  align-content: center;
  position: fixed;
  z-index: 999;
  top: 0;
  right: 0;
  height: var(--van-button-default-height);
  .btn {
    margin-right: 5px;
    width: 24px;
  }
}
</style>
