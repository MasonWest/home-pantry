<template>
  <div class="item-card" :class="[statusClass, viewMode]">
    <!-- 列表视图 -->
    <template v-if="viewMode === 'list'">
      <div class="card-header">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-quantity">×{{ item.quantity }}</span>
      </div>
      
      <div class="card-body">
        <div class="item-location">
          <span class="location-icon">{{ locationIcon }}</span>
          {{ item.location }}
        </div>
        <div class="item-expiry">
          {{ expiryText }}
        </div>
      </div>
      
      <div class="card-footer">
        <button class="delete-btn" @click="handleDelete">
          ✓ 已吃完
        </button>
      </div>
    </template>
    
    <!-- 网格视图 -->
    <template v-else>
      <div class="grid-content">
        <div class="grid-status-bar" :class="statusClass"></div>
        <div class="grid-name">{{ item.name }}</div>
        <div class="grid-quantity">×{{ item.quantity }}</div>
        <div class="grid-location">
          <span>{{ locationIcon }}</span>
          <span>{{ item.location }}</span>
        </div>
        <div class="grid-expiry" :class="statusClass">
          {{ expiryText }}
        </div>
        <button class="grid-delete-btn" @click="handleDelete">
          ✓ 吃完
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getItemStatus, getExpiryText } from '../utils/date.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'list'
  }
})

const emit = defineEmits(['delete'])

function handleDelete() {
  if (confirm(`确定要将 "${props.item.name}" 标记为已吃完吗？`)) {
    emit('delete', props.item.id)
  }
}

const defaultLocationMap = {
  '冷藏': '❄',
  '冷冻': '🧊'
}

const locationIcon = computed(() => {
  // 默认位置使用原有图标
  if (defaultLocationMap[props.item.location]) {
    return defaultLocationMap[props.item.location]
  }
  // 自定义位置使用通用图标
  return '📍'
})

const statusClass = computed(() => {
  return `status-${getItemStatus(props.item.expiry_date)}`
})

const expiryText = computed(() => {
  return getExpiryText(props.item.expiry_date)
})
</script>

<style scoped>
.item-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #7EC8A3;
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.item-card.status-normal {
  border-left-color: #7EC8A3;
}

.item-card.status-warning {
  border-left-color: #F5B041;
}

.item-card.status-expired {
  border-left-color: #E74C3C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-name {
  font-size: 17px;
  font-weight: 600;
  color: #2d3a2d;
}

.item-quantity {
  font-size: 15px;
  color: #7a8a7a;
  background: #f0f5f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-location {
  font-size: 14px;
  color: #5a6a5a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location-icon {
  font-size: 16px;
}

.item-expiry {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.status-normal .item-expiry {
  color: #7EC8A3;
  background: rgba(126, 200, 163, 0.12);
}

.status-warning .item-expiry {
  color: #D68910;
  background: rgba(245, 176, 65, 0.15);
}

.status-expired .item-expiry {
  color: #E74C3C;
  background: rgba(231, 76, 60, 0.12);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #7a8a7a;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #7EC8A3;
  color: #fff;
}

/* ========== 网格视图样式 ========== */
.item-card.grid {
  border-left: none;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.grid-status-bar {
  height: 4px;
  background: #7EC8A3;
}

.grid-status-bar.status-normal {
  background: #7EC8A3;
}

.grid-status-bar.status-warning {
  background: #F5B041;
}

.grid-status-bar.status-expired {
  background: #E74C3C;
}

.grid-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3a2d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-quantity {
  font-size: 13px;
  color: #7a8a7a;
}

.grid-location {
  font-size: 12px;
  color: #5a6a5a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.grid-expiry {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.grid-expiry.status-normal {
  color: #7EC8A3;
  background: rgba(126, 200, 163, 0.12);
}

.grid-expiry.status-warning {
  color: #D68910;
  background: rgba(245, 176, 65, 0.15);
}

.grid-expiry.status-expired {
  color: #E74C3C;
  background: rgba(231, 76, 60, 0.12);
}

.grid-delete-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #f5f5f5;
  color: #7a8a7a;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.grid-delete-btn:hover {
  background: #7EC8A3;
  color: #fff;
}
</style>
