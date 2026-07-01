const STORAGE_KEY = 'sto-qrcode-history'
const MAX = 10

export const history = (() => {
  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      return Array.isArray(list) ? list.slice(0, MAX) : []
    } catch {
      return []
    }
  }

  function write(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)))
  }

  return {
    get() {
      return read()
    },
    set(item) {
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          restaurantCode: item.restaurantCode,
          tableCode: item.tableCode,
          env: item.env,
          miniUrl: item.miniUrl,
          enUrl: item.enUrl,
          createdAt: new Date().toISOString(),
        },
        ...read().filter(
          (entry) =>
            entry.restaurantCode !== item.restaurantCode ||
            entry.tableCode !== item.tableCode,
        ),
      ].slice(0, MAX)
      write(next)
      return next
    },
    clear() {
      localStorage.removeItem(STORAGE_KEY)
    },
  }
})()
