<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">🏠 家庭食材管理</h1>
      <p class="app-subtitle">记录每一样食材，避免浪费</p>
    </header>
    
    <main class="app-main">
      <ItemForm 
        :locationOptions="formLocationOptions" 
        @add="handleAdd" 
        @manage-locations="handleManageLocations"
      />
      <ItemList 
        :items="items" 
        :loading="loading" 
        :viewMode="viewMode"
        :locationOptions="filterLocationOptions"
        @delete="handleDelete"
        @change-view="viewMode = $event"
      />
    </main>
    
    <div v-if="!isSupabaseConfigured" class="config-warning">
      <span>⚠️ 请配置 Supabase 环境变量</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import ItemForm from './components/ItemForm.vue'
import ItemList from './components/ItemList.vue'
import { 
  fetchItems, 
  addItem, 
  deleteItem, 
  isConfigured,
  fetchLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  checkLocationUsage
} from './utils/supabase.js'

const items = ref([])
const customLocations = ref([])
const loading = ref(true)
const isSupabaseConfigured = ref(isConfigured())
const viewMode = ref('list') // 'list' 或 'grid'

// 系统默认位置（只保留冷藏和冷冻）
const defaultLocations = [
  { value: '冷藏', label: '❄ 冷藏' },
  { value: '冷冻', label: '🧊 冷冻' }
]

// 筛选器位置选项（含"全部"）
const filterLocationOptions = computed(() => {
  const customOpts = customLocations.value.map(loc => ({
    value: loc.name,
    label: loc.name,
    id: loc.id
  }))
  return [
    { value: '全部', label: '全部' },
    ...defaultLocations,
    ...customOpts
  ]
})

// 添加表单位置选项（不含"全部"）
const formLocationOptions = computed(() => {
  const customOpts = customLocations.value.map(loc => ({
    value: loc.name,
    label: loc.name,
    id: loc.id
  }))
  return [...defaultLocations, ...customOpts]
})

async function loadItems() {
  loading.value = true
  items.value = await fetchItems()
  loading.value = false
}

async function loadLocations() {
  customLocations.value = await fetchLocations()
}

async function handleAdd(itemData) {
  const { error } = await addItem(itemData)
  if (!error) {
    await loadItems()
  }
}

async function handleDelete(id) {
  // 确认删除操作，从数据库彻底删除
  const { error } = await deleteItem(id)
  if (!error) {
    await loadItems()
  }
}

// 位置管理：添加新位置
async function handleAddLocation(name) {
  const { error } = await addLocation(name)
  if (!error) {
    await loadLocations()
  }
}

// 位置管理：更新位置名称
async function handleUpdateLocation(id, name) {
  const { error } = await updateLocation(id, name)
  if (!error) {
    await loadLocations()
    // 同时更新物品表中的位置名称
    await loadItems()
  }
}

// 位置管理：删除位置（检查是否有食材）
async function handleDeleteLocation(id, name) {
  // 检查使用情况
  const usage = await checkLocationUsage(name)
  if (usage > 0) {
    alert(`该位置下还有 ${usage} 件食材，无法删除`)
    return
  }
  
  // 执行删除
  try {
    const { error } = await deleteLocation(id)
    if (error) {
      alert('删除失败: ' + error.message)
      return
    }
    await loadLocations()
  } catch (e) {
    alert('删除出错: ' + e.message)
  }
}

// 暴露位置管理相关方法给子组件
provide('locationMethods', {
  add: handleAddLocation,
  update: handleUpdateLocation,
  delete: handleDeleteLocation,
  checkUsage: checkLocationUsage
})

// 初始化加载数据
loadItems()
loadLocations()
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F5EC 0%, #F8FCF8 100%);
}

.app-header {
  text-align: center;
  padding: 32px 20px 20px;
  background: linear-gradient(135deg, #7EC8A3 0%, #5AB88A 100%);
  color: #fff;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.app-main {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.config-warning {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #FEF3C7;
  color: #92400E;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style>
