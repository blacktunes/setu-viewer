<template>
  <div class="main">
    <HomeView class="view" ref="Home" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HomeView from './views/HomeView.vue'

const Home = ref()

defineExpose([Home])
</script>

<style lang="sass">
body
  background: #ddd
  --van-toast-position-bottom-distance: 10% !important

.main
  display: flex
  justify-content: center
  height: 100vh

@media screen and (max-width: 600px)
  .view
    width: 100vw

@media screen and (min-width: 600px)
  .view
    width: 600px
</style>
