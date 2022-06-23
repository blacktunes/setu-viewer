<template>
  <van-cell-group inset class="info">
    <van-cell
      v-if="img.r18"
      size="large"
      title="R18"
      title-class="r18-tip"
      style="background: var(--van-tag-warning-color)"
    />
    <van-cell
      title-class="cell-title"
      title="author"
      :value="img.author"
      @click="search(1, img.uid)"
    />
    <van-cell
      title-class="cell-title"
      title="uid"
      :value="img.uid"
      @click="search(1, img.uid)"
    />
    <van-cell
      title-class="cell-title"
      title="title"
      :value="img.title"
      @click="search(2, img.title)"
    />
    <van-cell title-class="cell-title" title="pid" :value="img.pid" />
    <van-cell title-class="cell-title" title="tags">
      <template #right-icon>
        <div class="tags">
          <van-tag
            class="tag"
            plain
            type="primary"
            v-for="(item, key) in img.tags"
            :key="`${index}-${key}`"
            @click="search(2, item)"
            >{{ item }}</van-tag
          >
        </div>
      </template>
    </van-cell>
    <van-cell style="justify-content: center">
      <template #right-icon>
        <van-button
          style="width: 40px; height: 40px"
          icon="like"
          type="primary"
          round
          :plain="like"
          @click.stop="setLoaclData"
        />
      </template>
    </van-cell>
  </van-cell-group>
</template>

<script lang="ts" setup>
import { ApiRes } from '@/type'

defineProps<{ index: number; img: ApiRes; like: boolean }>()

const emit = defineEmits(['search', 'setLoaclData'])

const search = (type: 1 | 2 | 3, key: number | string) => {
  emit('search', type, key)
}

const setLoaclData = () => {
  emit('setLoaclData')
}
</script>

<style lang="sass" scoped>
.info
  margin: 10px

.tags
  display: flex
  flex-wrap: wrap
  justify-content: flex-end
  margin-left: 10px

  .tag
    margin: 2px 5px
</style>

<style lang="sass">
.r18-tip
  color: #fff
  text-align: center
  font-weight: bold

.cell-title
  flex: 0 0 50px !important
</style>
