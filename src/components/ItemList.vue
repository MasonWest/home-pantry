<template>
  <div class="item-list">
    <div class="list-header">
      <h2 class="list-title">物品清单</h2>
      <div class="header-right">
        <span class="item-count">{{ filteredItems.length }} 件</span>
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="$emit('change-view', 'list')"
            title="列表视图"
          >
            ☰
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="$emit('change-view', 'grid')"
            title="网格视图"
          >
            ⊞
          </button>
        </div>
      </div>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="filter-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索食材名称..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
      </div>
      
      <div class="location-filter">
        <button 
          v-for="loc in locationOptions"
          :key="loc.value"
          class="filter-btn"
          :class="{ active: selectedLocation === loc.value }"
          @click="selectedLocation = loc.value"
        >
          {{ loc.label }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">{{ items.length === 0 ? '还没有物品' : '没有匹配的物品' }}</p>
      <p class="empty-hint">{{ items.length === 0 ? '点击上方添加按钮添加第一个物品吧' : '试试调整搜索条件' }}</p>
    </div>
    
    <div v-else class="items" :class="viewMode">
      <ItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :viewMode="viewMode"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ItemCard from './ItemCard.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'list'
  },
  locationOptions: {
    type: Array,
    default: () => [
      { value: '全部', label: '全部' },
      { value: '冰箱', label: 'Fridge' },
      { value: '冷冻', label: '❄ 冷冻' },
      { value: '橱柜', label: 'Cabinet' },
      { value: '储藏室', label: '📦 储藏室' }
    ]
  }
})

defineEmits(['delete', 'change-view'])

// 搜索和筛选状态
const searchQuery = ref('')
const selectedLocation = ref('全部')

// 过滤后的物品列表
const filteredItems = computed(() => {
  let result = props.items
  
  // 按位置筛选
  if (selectedLocation.value !== '全部') {
    result = result.filter(item => item.location === selectedLocation.value)
  }
  
  // 按名称搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }
  
  return result
})
</script>

<style scoped>
.item-list {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 搜索和筛选区域 */
.filter-bar {
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 36px;
  border: 1.5px solid #e0e8e0;
  border-radius: 10px;
  font-size: 14px;
  background: #f8fcf8;
  color: #2d3a2d;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #7EC8A3;
  background: #fff;
}

.search-input::placeholder {
  color: #a0b0a0;
}

.clear-btn {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  border: none;
  background: #d0e0d0;
  color: #5a6a5a;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: #7EC8A3;
  color: #fff;
}

.location-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1.5px solid #e0e8e0;
  border-radius: 16px;
  background: #f8fcf8;
  font-size: 12px;
  color: #5a6a5a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #7EC8A3;
}

.filter-btn.active {
  border-color: #7EC8A3;
  background: rgba(126, 200, 163, 0.15);
  color: #2d5a3d;
  font-weight: 500;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a3d;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-count {
  font-size: 13px;
  color: #8a9a8a;
  background: #f0f5f0;
  padding: 4px 12px;
  border-radius: 12px;
}

.view-toggle {
  display: flex;
  background: #f0f5f0;
  border-radius: 8px;
  padding: 2px;
}

.toggle-btn {
  width: 32px;
  height: 28px;
  border: none;
  background: transparent;
  color: #8a9a8a;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #5a6a5a;
}

.toggle-btn.active {
  background: #fff;
  color: #7EC8A3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8a9a8a;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e8e0;
  border-top-color: #7EC8A3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  color: #5a6a5a;
  margin: 0 0 6px 0;
}

.empty-hint {
  font-size: 13px;
  color: #8a9a8a;
  margin: 0;
}

.items {
  max-height: calc(100vh - 380px);
  overflow-y: auto;
}

.items::-webkit-scrollbar {
  width: 4px;
}

.items::-webkit-scrollbar-track {
  background: transparent;
}

.items::-webkit-scrollbar-thumb {
  background: #d0e0d0;
  border-radius: 2px;
}

/* 网格视图布局 */
.items.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: none;
  overflow-y: visible;
}

.items.grid .item-card {
  margin-bottom: 0;
}

@media (max-width: 380px) {
  .items.grid {
    grid-template-columns: 1fr;
  }
}
</style>
