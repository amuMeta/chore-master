# TidyQuest 打包 App — 产物汇总

路线：**Tauri 2**，一套 React + Vite 前端代码同时出桌面端和移动端。
当前范围：**Windows 桌面端已跑通**，Android 待环境就绪，iOS 暂缓。

产出时间：2026-10-14

## 目录

```
TidyQuest-App打包/
├── README.md                  本文件
├── docs/TAURI-BUILD.md        完整打包指南（环境 / 命令 / 检查清单 / 已知限制）
├── scripts/build-windows.bat  一键构建 Windows 安装包
├── config/
│   ├── tauri.conf.json        Tauri 主配置（identifier / CSP / bundle）
│   ├── Cargo.toml             Rust 依赖与 release profile
│   └── capabilities/default.json
├── src-patch/
│   ├── serverConfig.ts        后端地址管理（getApiBase / assetUrl / isTauri）
│   └── ServerConfigModal.tsx  登录页「服务器地址」配置弹窗
└── deploy/
    ├── DEPLOY.md              上云部署步骤（当前：阿里云 IP 121.43.226.135 + 8080）
    ├── setup-server.sh        服务器初始化：Docker + swap + 目录
    ├── docker-compose.prod.yml 生产 compose
    ├── Caddyfile.example      备案后启用 HTTPS
    └── backup.sh              SQLite 备份
└── installers/
    ├── TidyQuest_0.6.3_x64-setup.exe   1.64 MB（NSIS，推荐分发）
    └── TidyQuest_0.6.3_x64_en-US.msi   2.19 MB（企业部署用）
```

> `src-patch/` 里的两个文件已同步写入项目源码，这里是副本，方便对照。

## 这次改了什么

| 位置 | 改动 |
|---|---|
| `client/src-tauri/` | 新增 Tauri 工程（配置、Rust 入口、图标、Android 明文 HTTP 模板） |
| `client/src/utils/serverConfig.ts` | 新增：App 内可配置后端地址 |
| `client/src/components/shared/ServerConfigModal.tsx` | 新增：服务器地址弹窗，Tauri 环境首次自动弹出 |
| `client/src/hooks/useApi.ts` | `API_BASE` 从常量改为动态函数 |
| `client/src/components/shared/UserAvatar.tsx` | 头像 URL 走 `assetUrl()` 拼接后端地址 |
| `client/vite.config.ts` | `server.host = true` + `strictPort`（移动端调试需要） |

必须做后端地址配置的原因：打包后没有 Vite 代理，webview 里的 `/api` 指向不到任何东西。

## 环境

- Rust 1.99.0（`C:\Users\20226\.rustup\toolchains\stable-x86_64-pc-windows-msvc`）
- VS Build Tools 装在 **E:\VSBuildTools**（MSVC 14.44.35207）
- Windows SDK 10.0.26100.0 只能装到 `C:\Program Files (x86)\Windows Kits\10`（微软限制）
- 构建命令：`cd TidyQuest && .\build-windows.bat`，约 3 分钟

## 状态

- [x] 前端构建通过（tsc + vite）
- [x] Windows 安装包产出（MSI + NSIS）
- [ ] 安装后实机试运行 + 填服务器地址联调
- [ ] `identifier` 改为 `com.tidyquest.household` 后需重跑一次构建才生效
- [ ] Android 端（JDK17 + Android SDK/NDK 未装）
- [ ] 代码签名（未签名的包会触发 SmartScreen 警告）

## 下一步

1. 装 NSIS 包试运行，登录页填后端地址（后端需监听 `0.0.0.0`）
2. 重跑一次 `.\build-windows.bat` 让新 identifier 生效
3. 对外分发前：把后端部署到公网（域名 + HTTPS），否则别人装了连不上数据
4. Android：装 JDK 17 + Android Studio SDK/NDK → `npm run tauri:android:init` → 打明文 HTTP 补丁 → 出 APK

详细步骤见 `docs/TAURI-BUILD.md`。
