<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { buildWechatMiniProgramUrl } from './utils/url'
import { loadHistory, saveHistoryItem, clearHistory } from './utils/history'

const restaurantCode = ref('')
const tableCode = ref('')
const generatedUrl = ref('')
const qrDataUrl = ref('')
const errorMessage = ref('')
const history = ref([])
const generating = ref(false)

function formatTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function generate() {
  errorMessage.value = ''
  qrDataUrl.value = ''
  generatedUrl.value = ''

  const restaurant = restaurantCode.value.trim()
  const table = tableCode.value.trim()

  if (!restaurant || !table) {
    errorMessage.value = '请填写 restaurantCode 和 tableCode'
    return
  }

  generating.value = true
  try {
    const url = buildWechatMiniProgramUrl(restaurant, table)
    generatedUrl.value = url
    qrDataUrl.value = await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff',
      },
    })
    history.value = saveHistoryItem({
      restaurantCode: restaurant,
      tableCode: table,
      url,
    })
  } catch (err) {
    errorMessage.value = err?.message || '生成失败，请重试'
  } finally {
    generating.value = false
  }
}

async function restoreFromHistory(item) {
  restaurantCode.value = item.restaurantCode
  tableCode.value = item.tableCode
  await generate()
}

async function copyUrl() {
  if (!generatedUrl.value) return
  try {
    await navigator.clipboard.writeText(generatedUrl.value)
    window.alert('链接已复制')
  } catch {
    window.prompt('复制以下链接', generatedUrl.value)
  }
}

function handleClearHistory() {
  if (!history.value.length) return
  if (!window.confirm('确定清空全部历史记录？')) return
  clearHistory()
  history.value = []
}

onMounted(() => {
  history.value = loadHistory()
})
</script>

<template>
  <div class="page">
    <header class="header">
      <h1>STO 桌台二维码生成</h1>
      <p>输入餐厅码与桌台码，生成微信小程序跳转二维码</p>
    </header>

    <main class="layout">
      <section class="card">
        <h2>生成二维码</h2>

        <label class="field">
          <span>restaurantCode</span>
          <input
            v-model="restaurantCode"
            type="text"
            placeholder="例如 shiji_SHAMC_117"
            autocomplete="off"
            @keyup.enter="generate"
          />
        </label>

        <label class="field">
          <span>tableCode</span>
          <input
            v-model="tableCode"
            type="text"
            placeholder="例如 1018"
            autocomplete="off"
            @keyup.enter="generate"
          />
        </label>

        <button class="btn primary" type="button" :disabled="generating" @click="generate">
          {{ generating ? '生成中…' : '生成二维码' }}
        </button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div v-if="qrDataUrl" class="result">
          <img class="qr-image" :src="qrDataUrl" alt="二维码" />
          <div class="url-box">
            <p class="url-label">跳转链接</p>
            <p class="url-text">{{ generatedUrl }}</p>
            <button class="btn ghost" type="button" @click="copyUrl">复制链接</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="history-head">
          <h2>历史记录</h2>
          <button
            v-if="history.length"
            class="btn text"
            type="button"
            @click="handleClearHistory"
          >
            清空
          </button>
        </div>
        <p class="hint">最近 10 次，保存在浏览器本地</p>

        <ul v-if="history.length" class="history-list">
          <li v-for="item in history" :key="item.id" class="history-item">
            <button class="history-btn" type="button" @click="restoreFromHistory(item)">
              <div class="history-meta">
                <strong>{{ item.restaurantCode }}</strong>
                <span class="divider">·</span>
                <strong>{{ item.tableCode }}</strong>
              </div>
              <span class="history-time">{{ formatTime(item.createdAt) }}</span>
            </button>
          </li>
        </ul>
        <p v-else class="empty">暂无历史记录</p>
      </section>
    </main>
  </div>
</template>
