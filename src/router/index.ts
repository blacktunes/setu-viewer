import { createRouter, createWebHashHistory } from 'vue-router'

const view = import.meta.glob('@/view/**/*.vue')

const routes = Object.keys(view).map(path => {
  const name = path.replace('/src/view', '').replace('.vue', '').toLowerCase()

  return {
    path: name === '/home' ? '/' : name,
    component: view[path]
  }
})

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
