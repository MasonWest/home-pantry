<template>
  <div class="item-form">
    <h2 class="form-title">添加物品</h2>
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">物品名称</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="请输入物品名称"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="quantity">数量</label>
        <input
          id="quantity"
          v-model.number="form.quantity"
          type="number"
          min="1"
          placeholder="1"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="expiry_date">过期日期</label>
        <input
          id="expiry_date"
          v-model="form.expiry_date"
          type="date"
          required
        />
      </div>
      
      <div class="form-group">
        <label>存放位置</label>
        <div class="location-options">
          <button
            v-for="loc in locations"
            :key="loc.value"
            type="button"
            class="location-btn"
            :class="{ active: form.location === loc.value }"
            @click="form.location = loc.value"
          >
            {{ loc.label }}
          </button>
        </div>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? '添加中...' : '添加物品' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { getTodayString } from '../utils/date.js'

const emit = defineEmits(['add'])

const locations = [
  { value: '冰箱', label: '🧊 冰箱' },
  { value: '冷冻', label: '❄️ 冷冻' },
  { value: '橱柜', label: '🗄️ 橱柜' },
  { value: '储藏室', label: '📦 储藏室' }
]

const form = reactive({
  name: '',
  quantity: 1,
  expiry_date: getTodayString(),
  location: '冰箱'
})

const loading = ref(false)

// 默认选择明天作为过期日期
watch(() => form.expiry_date, (newVal) => {
  if (!newVal) {
    form.expiry_date = getTodayString()
  }
}, { immediate: true })

async function handleSubmit() {
  if (!form.name.trim() || !form.expiry_date) return
  
  loading.value = true
  
  try {
    emit('add', {
      name: form.name.trim(),
      quantity: form.quantity,
      expiry_date: form.expiry_date,
      location: form.location
    })
    
    // 重置表单
    form.name = ''
    form.quantity = 1
    form.expiry_date = getTodayString()
    form.location = '冰箱'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.item-form {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a3d;
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #5a6a5a;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0e8e0;
  border-radius: 10px;
  font-size: 15px;
  color: #2d3a2d;
  background: #f8fcf8;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #7EC8A3;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(126, 200, 163, 0.15);
}

.location-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.location-btn {
  padding: 12px 8px;
  border: 1.5px solid #e0e8e0;
  border-radius: 10px;
  background: #f8fcf8;
  font-size: 14px;
  color: #5a6a5a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-btn:hover {
  border-color: #7EC8A3;
}

.location-btn.active {
  border-color: #7EC8A3;
  background: rgba(126, 200, 163, 0.15);
  color: #2d5a3d;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7EC8A3 0%, #5AB88A 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(126, 200, 163, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
