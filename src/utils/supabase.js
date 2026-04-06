import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
// 在 .env 文件中设置:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 创建 Supabase 客户端
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 检查是否已配置 Supabase
export const isConfigured = () => !!supabase

// 表格名称
const TABLE_NAME = 'pantry_items'

/**
 * 获取所有物品，按过期时间升序排列
 */
export async function fetchItems() {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('expiry_date', { ascending: true })
  
  if (error) {
    console.error('获取物品失败:', error)
    return []
  }
  return data || []
}

/**
 * 添加新物品
 * @param {Object} item - 物品对象
 * @param {string} item.name - 物品名称
 * @param {number} item.quantity - 数量
 * @param {string} item.expiry_date - 过期日期 (YYYY-MM-DD)
 * @param {string} item.location - 存放位置
 */
export async function addItem(item) {
  if (!supabase) return { data: null, error: 'Supabase 未配置' }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([item])
    .select()
  
  if (error) {
    console.error('添加物品失败:', error)
    return { data: null, error }
  }
  return { data: data?.[0] || null, error: null }
}

/**
 * 删除物品
 * @param {number} id - 物品ID
 */
export async function deleteItem(id) {
  if (!supabase) return { error: 'Supabase 未配置' }
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除物品失败:', error)
    return { error }
  }
  return { error: null }
}

/**
 * 更新物品
 * @param {number} id - 物品ID
 * @param {Object} updates - 更新的字段
 */
export async function updateItem(id, updates) {
  if (!supabase) return { error: 'Supabase 未配置' }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('更新物品失败:', error)
    return { data: null, error }
  }
  return { data: data?.[0] || null, error: null }
}
