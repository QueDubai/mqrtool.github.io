# STO 桌台二维码生成工具

Vue 3 小工具：输入 `restaurantCode` 和 `tableCode`，生成微信小程序桌台页跳转二维码。

在线访问：

```text
https://quedubai.github.io/mqrtool.github.io/
```

> 说明：仓库为 `QueDubai/mqrtool.github.io` 时，GitHub Pages 默认地址是 `quedubai.github.io/mqrtool.github.io/`，不能直接通过 `mqrtool.github.io` 访问（该域名需属于名为 `mqrtool` 的 GitHub 组织/账号）。若需短域名，可购买独立域名并在仓库 Pages 设置里绑定。

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

## 构建

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

1. 推送到 `QueDubai/mqrtool.github.io` 的 `main` 分支
2. 仓库 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**
3. 推送后等待 Actions 完成

访问地址：

```text
https://quedubai.github.io/mqrtool.github.io/
```

如果仓库名变更，请同步修改 `vite.config.js` 里的 `base` 为 `/仓库名/`。

## 生成的链接格式

```text
https://open.weixin.qq.com/sns/getexpappinfo?appid=wx7bcc7dbe93cc91e8&path=package2%2Fpages%2Ftable%2Findex.html%3Frestaurant_code%3D{restaurantCode}%26table_code%3D{tableCode}#wechat-redirect
```

## 历史记录

最近 10 次生成记录保存在浏览器 `localStorage`，键名 `sto-qrcode-history`。
