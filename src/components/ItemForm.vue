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
        <label>
          存放位置
          <button type="button" class="add-location-btn" @click="showManageModal = true" title="管理位置">
            +
          </button>
        </label>
        <div class="location-options">
          <button
            v-for="loc in locationOptions"
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
    
    <!-- 位置管理弹窗 -->
    <Teleport to="body">
      <div v-if="showManageModal" class="modal-overlay" @click.self="showManageModal = false">
        <div class="modal-content">
          <h3 class="modal-title">位置管理</h3>
          
          <!-- 新增位置 -->
          <div class="add-location-row">
            <input
              v-model="newLocationName"
              type="text"
              placeholder="输入新位置名称"
              class="modal-input"
              @keyup.enter="handleAddLocation"
            />
            <button type="button" class="add-btn" @click="handleAddLocation" :disabled="!newLocationName.trim()">+</button>
          </div>
          
          <!-- 位置列表 -->
          <div class="location-list">
            <div 
              v-for="loc in allLocations" 
              :key="loc.value"
              class="location-item"
            >
              <template v-if="editingId === loc.value">
                <input
                  v-model="editingName"
                  type="text"
                  class="edit-input"
                  @keyup.enter="handleSaveEdit"
                  @keyup.escape="cancelEdit"
                  ref="editInput"
                />
                <div class="item-actions">
                  <button type="button" class="action-btn save" @click="handleSaveEdit">✓</button>
                  <button type="button" class="action-btn cancel" @click="cancelEdit">✕</button>
                </div>
              </template>
              <template v-else>
                <span class="location-name">{{ loc.label }}</span>
                <div class="item-actions">
                  <button type="button" class="action-btn edit" @click="startEdit(loc)" title="重命名">✎</button>
                  <button 
                    type="button" 
                    class="action-btn delete" 
                    @click="handleDeleteLocation(loc)"
                    :disabled="loc.isDefault"
                    :title="loc.isDefault ? '默认位置不可删除' : '删除'"
                  >
                    🗑
                  </button>
                </div>
              </template>
            </div>
          </div>
          
          <button type="button" class="modal-btn close" @click="showManageModal = false">完成</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, inject } from 'vue'
import { getTodayString } from '../utils/date.js'

const props = defineProps({
  locationOptions: {
    type: Array,
    default: () => [
      { value: '冷藏', label: '❄ 冷藏' },
      { value: '冷冻', label: '🧊 冷冻' }
    ]
  }
})

const emit = defineEmits(['add', 'manage-locations'])

// 获取位置管理方法
const locationMethods = inject('locationMethods', null)

// 默认位置（只保留冷藏和冷冻）
const defaultLocations = [
  { value: '冷藏', label: '❄ 冷藏', isDefault: true },
  { value: '冷冻', label: '🧊 冷冻', isDefault: true }
]

// 合并所有位置
const allLocations = computed(() => {
  // 从 locationOptions 中获取自定义位置（包含 id）
  const customLocs = props.locationOptions
    .filter(loc => !defaultLocations.some(d => d.value === loc.value))
    .map(loc => ({ 
      value: loc.value, 
      label: loc.label, 
      id: loc.id,
      isDefault: false 
    }))
  
  return [...defaultLocations, ...customLocs]
})

const form = reactive({
  name: '',
  quantity: 1,
  expiry_date: getTodayString(),
  location: ''
})

const loading = ref(false)
const showManageModal = ref(false)
const newLocationName = ref('')

// 编辑状态
const editingId = ref(null)
const editingName = ref('')
const editInput = ref(null)

// 设置默认选中第一个位置
form.location = props.locationOptions[0]?.value || '冰箱'

// 监听位置选项变化，更新默认选中
watch(() => props.locationOptions, (newOpts) => {
  if (newOpts.length > 0 && !newOpts.some(o => o.value === form.location)) {
    form.location = newOpts[0].value
  }
}, { immediate: true })

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
    form.location = props.locationOptions[0]?.value || '冰箱'
  } finally {
    loading.value = false
  }
}

async function handleAddLocation() {
  const name = newLocationName.value.trim()
  if (!name) return
  
  if (!locationMethods) {
    console.error('locationMethods 未初始化')
    alert('系统错误，请刷新页面')
    return
  }
  
  await locationMethods.add(name)
  newLocationName.value = ''
  form.location = name
}

function startEdit(loc) {
  editingId.value = loc.value
  editingName.value = loc.label
  nextTick(() => {
    editInput.value?.focus()
  })
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function handleSaveEdit() {
  const newName = editingName.value.trim()
  const oldLoc = allLocations.value.find(l => l.value === editingId.value)
  
  if (!newName || !oldLoc) {
    cancelEdit()
    return
  }
  
  if (oldLoc.isDefault) {
    alert('默认位置不能重命名')
    cancelEdit()
    return
  }
  
  if (!locationMethods) {
    console.error('locationMethods 未初始化')
    alert('系统错误，请刷新页面')
    cancelEdit()
    return
  }
  
  if (!oldLoc.id) {
    alert('无法重命名该位置')
    cancelEdit()
    return
  }
  
  await locationMethods.update(oldLoc.id, newName)
  form.location = newName
  cancelEdit()
}

async function handleDeleteLocation(loc) {
  if (loc.isDefault) {
    alert('默认位置不能删除')
    return
  }
  
  if (!loc.id) {
    alert('无法删除该位置')
    return
  }
  
  if (!locationMethods) {
    alert('系统错误，请刷新页面')
    return
  }
  
  // 检查使用情况
  const usage = await locationMethods.checkUsage(loc.value)
  if (usage > 0) {
    alert(`该位置下还有 ${usage} 件食材，无法删除`)
    return
  }
  
  // 执行删除
  try {
    await locationMethods.delete(loc.id, loc.value)
    // 如果删除的是当前选中的位置，重置为第一个
    if (form.location === loc.value) {
      form.location = props.locationOptions[0]?.value || '冷藏'
    }
    alert('删除成功')
  } catch (e) {
    alert('删除失败: ' + e.message)
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
  overflow: hidden;
}

.form-group label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #5a6a5a;
  margin-bottom: 6px;
}

.add-location-btn {
  width: 22px;
  height: 22px;
  margin-left: 8px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #7EC8A3 0%, #5AB88A 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-location-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(126, 200, 163, 0.4);
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

/* 日期输入框样式优化 - 修复 iOS Safari 显示问题 */
input[type="date"] {
  width: 100% !important;
  min-width: 0 !important;
  font-size: 15px;
  /* iOS Safari 特定修复 */
  -webkit-appearance: none;
  appearance: none;
}

/* 修复 iOS 日期输入框显示问题 */
input[type="date"]::-webkit-datetime-edit {
  padding: 0;
}

input[type="date"]::-webkit-inner-spin-button {
  display: none;
}

/* iOS Safari 日期选择器最小宽度修复 */
@supports (-webkit-touch-callout: none) {
  input[type="date"] {
    min-width: 0 !important;
    max-width: 100% !important;
  }
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

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d5a3d;
  margin: 0 0 16px 0;
  text-align: center;
}

/* 新增位置行 */
.add-location-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.add-location-row .modal-input {
  flex: 1;
  margin-bottom: 0;
}

.add-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7EC8A3 0%, #5AB88A 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(126, 200, 163, 0.4);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 位置列表 */
.location-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  max-height: 300px;
}

.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f0f5f0;
}

.location-item:last-child {
  border-bottom: none;
}

.location-name {
  font-size: 15px;
  color: #2d3a2d;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid #7EC8A3;
  border-radius: 8px;
  font-size: 14px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  background: #f0f5f0;
  color: #5a6a5a;
}

.action-btn.edit:hover {
  background: #7EC8A3;
  color: #fff;
}

.action-btn.delete {
  background: #f0f5f0;
  color: #5a6a5a;
}

.action-btn.delete:hover:not(:disabled) {
  background: #E74C3C;
  color: #fff;
}

.action-btn.delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.save {
  background: #7EC8A3;
  color: #fff;
}

.action-btn.cancel {
  background: #f0f5f0;
  color: #5a6a5a;
}

.modal-btn.close {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7EC8A3 0%, #5AB88A 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.close:hover {
  box-shadow: 0 4px 12px rgba(126, 200, 163, 0.4);
}
</style>