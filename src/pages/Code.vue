<template>
  <div class="code-page">
    <div class="code-page_workspace">
      <aside class="panel panel_history">
        <div class="panel_head">
          <h2 class="panel_title">历史记录</h2>
          <button v-if="list.length" class="btn btn_text" type="button" @click="clearList">清空</button>
        </div>
        <p class="panel_hint">最近 10 次，保存在浏览器本地</p>

        <ul v-if="list.length" class="history-list">
          <li v-for="item in list" :key="item.id" class="history-list_item">
            <button class="history-list_btn" :class="{ 'is-active': isActive(item) }" type="button" @click="restore(item)">
              <span v-if="item.env" class="history-list_env" :class="`history-list_env_${item.env}`">{{ item.env }}</span>
              <div class="history-list_meta">
                <span class="history-list_code">{{ item.restaurantCode }}</span>
                <span class="history-list_dot">·</span>
                <span class="history-list_code">{{ item.tableCode }}</span>
              </div>
              <span class="history-list_time">{{ formatDate(item.createdAt) }}</span>
            </button>
          </li>
        </ul>
        <p v-else class="panel_empty">暂无历史记录</p>
      </aside>

      <div class="code-page_main">
        <section class="panel panel_input">
          <h2 class="panel_title">生成参数</h2>
          <div class="input-grid">
            <label class="field">
              <span class="field_label">restaurantCode</span>
              <input v-model="restaurantCode" class="field_input" type="text" placeholder="例如 shiji_SHAMC_117" autocomplete="off" @keyup.enter="generate" />
            </label>
            <label class="field">
              <span class="field_label">tableCode</span>
              <input v-model="tableCode" class="field_input" type="text" placeholder="例如 1018" autocomplete="off" @keyup.enter="generate" />
            </label>
          </div>
          <div class="input-actions">
            <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>
            <div class="input-actions_bar">
              <div class="env-radio">
                <label v-for="item in envOptions" :key="item" class="env-radio_item">
                  <input v-model="env" class="env-radio_input" type="radio" :value="item" />
                  <span class="env-radio_label">{{ item }}</span>
                </label>
              </div>
              <button class="btn btn_primary" type="button" :disabled="generating" @click="generate">{{ generating ? '生成中…' : '生成二维码' }}</button>
            </div>
          </div>
        </section>

        <section class="panel panel_qr">
          <div class="panel_head"><h2 class="panel_title">二维码预览</h2></div>

          <div v-if="miniQr" class="qr-group">
            <div class="qr-col">
              <p class="qr-col_title">小程序扫码</p>
              <img class="qr-col_image" :src="miniQr" alt="小程序二维码" />
              <div class="qr-col_link">
                <p class="qr-col_url" :title="miniUrl">{{ miniUrl }}</p>
                <button class="btn btn_copy" type="button" @click="copy(miniUrl)">复制</button>
              </div>
            </div>
            <div class="qr-col">
              <p class="qr-col_title">EN 扫码</p>
              <img class="qr-col_image" :src="enQr" alt="EN 二维码" />
              <div class="qr-col_link">
                <p class="qr-col_url" :title="enUrl">{{ enUrl }}</p>
                <button class="btn btn_copy" type="button" @click="copy(enUrl)">复制</button>
              </div>
            </div>
          </div>

          <div v-else class="qr-placeholder">
            <div class="qr-placeholder_box"><span class="qr-placeholder_text">小程序</span></div>
            <div class="qr-placeholder_box"><span class="qr-placeholder_text">EN</span></div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { history } from '../utils/history'

const APP_ID = 'wx7bcc7dbe93cc91e8'
const EN_BASE = {
  sit: 'https://m.scantoorder-sit.marriott.com.cn/scantoorder/en/homepage',
  uat: 'https://m.scantoorder-uat.marriott.com.cn/scantoorder/en/homepage',
  prod: 'https://m.scantoorder.marriott.com.cn/scantoorder/en/homepage',
}
const envOptions = ['sit', 'uat'] // prod 暂隐藏，需要时加回
const QR_SIZE = 200

const restaurantCode = ref('')
const tableCode = ref('')
const env = ref('sit')
const miniUrl = ref('')
const enUrl = ref('')
const miniQr = ref('')
const enQr = ref('')
const errorMessage = ref('')
const list = ref([])
const generating = ref(false)

function parseHotel(code) {
  const parts = code.trim().split('_').filter(Boolean)
  const upperParts = parts.filter((part) => /^[A-Z]+$/.test(part))
  if (!upperParts.length) return ''
  if (upperParts.length === 1) return upperParts[0]
  return upperParts[Math.floor(upperParts.length / 2)]
}

function buildMiniUrl(restaurant, table) {
  const path = `package2/pages/table/index.html?restaurant_code=${restaurant.trim()}&table_code=${table.trim()}`
  return `https://open.weixin.qq.com/sns/getexpappinfo?appid=${APP_ID}&path=${encodeURIComponent(path)}#wechat-redirect`
}

function buildEnUrl(restaurant, table) {
  const params = new URLSearchParams({
    hotel: parseHotel(restaurant),
    restaurant: restaurant.trim(),
    room: table.trim(),
  })
  return `${EN_BASE[env.value]}?${params.toString()}`
}

async function createQr(url) {
  return QRCode.toDataURL(url, {
    width: QR_SIZE,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  })
}

function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false })
}

function isActive(item) {
  if (!miniQr.value) return false
  const restaurant = restaurantCode.value.trim()
  const table = tableCode.value.trim()
  return item.restaurantCode === restaurant && item.tableCode === table && (item.env || 'sit') === env.value
}

async function generate() {
  errorMessage.value = ''
  miniQr.value = ''
  enQr.value = ''
  miniUrl.value = ''
  enUrl.value = ''

  const restaurant = restaurantCode.value.trim()
  const table = tableCode.value.trim()

  if (!restaurant || !table) {
    errorMessage.value = '请填写 restaurantCode 和 tableCode'
    return
  }

  if (!parseHotel(restaurant)) {
    errorMessage.value = 'restaurantCode 中需包含大写 hotel 码，如 shiji_SHAMC_316 或 SHAZH_1'
    return
  }

  generating.value = true
  try {
    const mini = buildMiniUrl(restaurant, table)
    const en = buildEnUrl(restaurant, table)
    const [miniImg, enImg] = await Promise.all([createQr(mini), createQr(en)])
    miniUrl.value = mini
    enUrl.value = en
    miniQr.value = miniImg
    enQr.value = enImg
    list.value = history.set({ restaurantCode: restaurant, tableCode: table, env: env.value, miniUrl: mini, enUrl: en })
  } catch (err) {
    errorMessage.value = err?.message || '生成失败，请重试'
  } finally {
    generating.value = false
  }
}

async function restore(item) {
  restaurantCode.value = item.restaurantCode
  tableCode.value = item.tableCode
  env.value = item.env || 'sit'
  await generate()
}

async function copy(text) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    window.alert('链接已复制')
  } catch {
    window.prompt('复制以下链接', text)
  }
}

function clearList() {
  if (!list.value.length) return
  if (!window.confirm('确定清空全部历史记录？')) return
  history.clear()
  list.value = []
}

onMounted(() => {
  list.value = history.get()
})
</script>

<style lang="less" scoped>
@brand-color: #b84c16;
@brand-focus-shadow: rgba(184, 76, 22, 0.12);
@page-max-width: 1160px;
@history-width: 320px;
@panel-min-height: 560px;
@qr-size: 200px;

.code-page {
  max-width: @page-max-width;
  margin: 0 auto;
  padding: 32px 20px 48px;
  min-height: 100vh;

  .code-page_workspace {
    display: grid;
    grid-template-columns: @history-width minmax(0, 1fr);
    gap: 14px;
    align-items: stretch;
    min-height: @panel-min-height;
  }

  .code-page_main {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 14px;
    min-height: @panel-min-height;
  }
}

.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);

  .panel_title {
    margin: 0;
    font-size: 18px;
  }

  .panel_head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .panel_hint,
  .panel_empty {
    margin: 0 0 12px;
    color: #9ca3af;
    font-size: 13px;
  }

  &.panel_history {
    display: flex;
    flex-direction: column;
    min-height: @panel-min-height;

    .panel_head {
      margin-bottom: 4px;
    }
  }

  &.panel_input .panel_title {
    margin-bottom: 16px;
  }

  &.panel_qr {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .field_label {
    font-size: 14px;
    color: #374151;
    font-weight: 600;
  }

  .field_input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: @brand-color;
      box-shadow: 0 0 0 3px @brand-focus-shadow;
    }
  }
}

.input-actions {
  margin-top: 20px;

  .input-actions_bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
  }
}

.env-radio {
  display: flex;
  align-items: center;
  gap: 12px;

  .env-radio_item {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
    text-transform: uppercase;

    .env-radio_input {
      accent-color: @brand-color;
    }

    .env-radio_label {
      text-transform: uppercase;
    }
  }
}

.field-error {
  margin: 0 0 8px;
  color: #dc2626;
  font-size: 14px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.btn_primary {
    margin-left: 24px;
    background: #16a34a;
    color: #fff;
    font-weight: 600;

    &:hover {
      background: #15803d;
    }
  }

  &.btn_copy {
    flex-shrink: 0;
    padding: 4px 10px;
    font-size: 12px;
    background: #fff7ed;
    color: #9a3412;
    border: 1px solid #fed7aa;
  }

  &.btn_text {
    background: transparent;
    color: #6b7280;
    padding: 4px 8px;
    font-size: 14px;
  }
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;

  .history-list_item {
    margin: 0;
  }

  .history-list_btn {
    position: relative;
    width: 100%;
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #fafafa;
    border-radius: 10px;
    padding: 22px 14px 12px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: @brand-color;
      background: #fff7ed;
    }

    &.is-active {
      border-color: #22c55e;
      background: #f0fdf4;
      box-shadow: 0 0 0 1px #22c55e;
    }
  }

  .history-list_meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    color: #111827;
  }

  .history-list_code {
    font-weight: 600;
  }

  .history-list_dot {
    color: #d1d5db;
  }

  .history-list_env {
    position: absolute;
    top: 0;
    left: 0;
    padding: 2px 8px;
    border-radius: 10px 0 8px 0;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.4;
    text-transform: uppercase;
  }

  .history-list_env_sit {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .history-list_env_uat {
    background: #ffedd5;
    color: #c2410c;
  }

  .history-list_env_prod {
    background: #fce7f3;
    color: #be185d;
  }

  .history-list_time {
    font-size: 12px;
    color: #9ca3af;
  }
}

.qr-group {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;

  .qr-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .qr-col_title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .qr-col_image {
    width: @qr-size;
    height: @qr-size;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
  }

  .qr-col_link {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
  }

  .qr-col_url {
    flex: 1;
    max-width: 280px;
    min-width: 0;
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.qr-placeholder {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;

  .qr-placeholder_box {
    width: @qr-size;
    height: @qr-size;
    margin: 0 auto;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .qr-placeholder_text {
    color: #9ca3af;
    font-size: 14px;
  }
}

@media (max-width: 960px) {
  .code-page {
    .code-page_workspace,
    .code-page_main {
      min-height: auto;
    }

    .code-page_workspace {
      grid-template-columns: 1fr;
    }
  }

  .panel.panel_history {
    min-height: auto;
  }

  .input-grid,
  .qr-group,
  .qr-placeholder {
    grid-template-columns: 1fr;
  }

  .input-actions {
    .input-actions_bar {
      flex-wrap: wrap;
    }
  }
}
</style>
