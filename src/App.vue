<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component"></component>
    </KeepAlive>
  </RouterView>
  <van-tabbar route>
    <van-tabbar-item replace to="/">色图</van-tabbar-item>
    <van-tabbar-item replace to="/collection">收藏</van-tabbar-item>
    <van-tabbar-item replace to="/download">下载</van-tabbar-item>
    <van-tabbar-item replace to="/search">搜图</van-tabbar-item>
    <van-tabbar-item replace to="/pid">看图</van-tabbar-item>
  </van-tabbar>
</template>

<script setup></script>

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
</style>
