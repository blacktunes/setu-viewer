<template>
  <RouterView v-slot="{ Component }">
    <transition :name="transition" @after-enter="setTransition">
      <KeepAlive>
        <component class="component" :is="Component"></component>
      </KeepAlive>
    </transition>
  </RouterView>
  <van-tabbar route>
    <van-tabbar-item replace to="/">色图</van-tabbar-item>
    <van-tabbar-item replace to="/collection">收藏</van-tabbar-item>
    <van-tabbar-item replace to="/download">下载</van-tabbar-item>
    <van-tabbar-item replace to="/search">搜图</van-tabbar-item>
    <van-tabbar-item replace to="/pid">看图</van-tabbar-item>
  </van-tabbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const transition = ref('fade')

const setTransition = () => {
  transition.value = 'router'
}
</script>

<style lang="scss" scoped>
.component {
  min-height: 100vh;
}
</style>

<style lang="scss">
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

.router-enter-active {
  transition: all 0.3s;
}

.router-leave-active {
  transition: all 0.3s;
}

.router-enter-from {
  opacity: 0 !important;
  transform: translateY(0) !important;
}

.router-enter-to {
  opacity: 1 !important;
  transform: translateY(-100%) !important;
}

.router-leave-from {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.router-leave-to {
  opacity: 0 !important;
  transform: translateY(-100%) !important;
}
</style>
