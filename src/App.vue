<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">🏠 家庭食材管理</h1>
      <p class="app-subtitle">记录每一样食材，避免浪费</p>
    </header>
    
    <main class="app-main">
      <ItemForm @add="handleAdd" />
      <ItemList :items="items" :loading="loading" @delete="handleDelete" />
    </main>
    
    <div v-if="!isSupabaseConfigured" class="config-warning">
      <span>⚠️ 请配置 Supabase 环境变量</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ItemForm from './components/ItemForm.vue'
import ItemList from './components/ItemList.vue'
import { 
  fetchItems, 
  addItem, 
  deleteItem, 
  isConfigured 
} from './utils/supabase.js'

const items = ref([])
const loading = ref(true)
const isSupabaseConfigured = ref(isConfigured())

async function loadItems() {
  loading.value = true
  items.value = await fetchItems()
  loading.value = false
}

async function handleAdd(itemData) {
  const { error } = await addItem(itemData)
  if (!error) {
    await loadItems()
  }
}

async function handleDelete(id) {
  const { error } = await deleteItem(id)
  if (!error) {
    await loadItems()
  }
}

onMounted(() => {
  loadItems()
})
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
