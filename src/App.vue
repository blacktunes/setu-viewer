<template>
  <div class="main">
    <router-view class="view" />
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="stylus">
body
  background #ddd

.main
  display flex
  justify-content center
  height 100vh

@media screen and (max-width 600px)
  .view
    width 100vw

@media screen and (min-width 600px)
  .view
    width 600px
</style>
