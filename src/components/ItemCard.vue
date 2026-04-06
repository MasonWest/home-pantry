<template>
  <div class="item-card" :class="statusClass">
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
      <button class="delete-btn" @click="$emit('delete', item.id)">
        ✓ 已吃完
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getItemStatus, getExpiryText } from '../utils/date.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])

const locationMap = {
  '冰箱': '🧊',
  '冷冻': '❄️',
  '橱柜': '🗄️',
  '储藏室': '📦'
}

const locationIcon = computed(() => locationMap[props.item.location] || '📦')

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
</style>
