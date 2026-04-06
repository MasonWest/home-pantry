<template>
  <div class="item-list">
    <div class="list-header">
      <h2 class="list-title">物品清单</h2>
      <span class="item-count">{{ items.length }} 件物品</span>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">还没有物品</p>
      <p class="empty-hint">点击上方添加按钮添加第一个物品吧</p>
    </div>
    
    <div v-else class="items">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import ItemCard from './ItemCard.vue'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['delete'])
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
  margin-bottom: 16px;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a3d;
  margin: 0;
}

.item-count {
  font-size: 13px;
  color: #8a9a8a;
  background: #f0f5f0;
  padding: 4px 12px;
  border-radius: 12px;
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
</style>
