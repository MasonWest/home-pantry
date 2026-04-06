/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 */
export function getTodayString() {
  const today = new Date()
  return formatDateToString(today)
}

/**
 * 格式化日期为字符串 (YYYY-MM-DD)
 * @param {Date} date 
 */
export function formatDateToString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 计算距离过期的天数
 * @param {string} expiryDateStr - 过期日期字符串 (YYYY-MM-DD)
 * @returns {number} 距离天数 (负数表示已过期)
 */
export function getDaysUntilExpiry(expiryDateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const expiryDate = new Date(expiryDateStr)
  expiryDate.setHours(0, 0, 0, 0)
  
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * 获取物品状态
 * @param {string} expiryDateStr - 过期日期字符串
 * @returns {string} 'expired' | 'warning' | 'normal'
 */
export function getItemStatus(expiryDateStr) {
  const days = getDaysUntilExpiry(expiryDateStr)
  
  if (days < 0) return 'expired'
  if (days <= 3) return 'warning'
  return 'normal'
}

/**
 * 格式化日期为中文显示
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 */
export function formatDateChinese(dateStr) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

/**
 * 获取过期状态的描述文本
 * @param {string} expiryDateStr 
 */
export function getExpiryText(expiryDateStr) {
  const days = getDaysUntilExpiry(expiryDateStr)
  
  if (days < 0) {
    return `已过期 ${Math.abs(days)} 天`
  } else if (days === 0) {
    return '今天过期'
  } else if (days === 1) {
    return '明天过期'
  } else if (days <= 3) {
    return `${days} 天后过期`
  } else {
    return formatDateChinese(expiryDateStr)
  }
}
