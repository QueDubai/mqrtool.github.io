const STORAGE_KEY = 'sto-qrcode-history'
const MAX_ITEMS = 10

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.slice(0, MAX_ITEMS) : []
  } catch {
    return []
  }
}

export function saveHistoryItem(item) {
  const list = loadHistory()
  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      restaurantCode: item.restaurantCode,
      tableCode: item.tableCode,
      url: item.url,
      createdAt: new Date().toISOString(),
    },
    ...list.filter(
      (entry) =>
        entry.restaurantCode !== item.restaurantCode ||
        entry.tableCode !== item.tableCode,
    ),
  ].slice(0, MAX_ITEMS)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
