# TidyQuest 打包指南（Tauri 2：一套代码 → 桌面 + 手机）

前端 React + Vite 原样复用，Tauri 只做壳。桌面和移动共用 `client/dist`，同一份 Rust 工程。

## 结构

```
client/
  src-tauri/
    Cargo.toml            # tauri 2 依赖
    tauri.conf.json       # 桌面 + 移动共用配置
    capabilities/         # 权限
    mobile-patches/       # Android 明文 HTTP 模板
    src/lib.rs, main.rs
    gen/                  # tauri android/ios init 生成，不入库
  src/utils/serverConfig.ts  # 后端地址配置
  src/components/shared/ServerConfigModal.tsx
```

## 后端是前提

App 里没有 Vite 代理，`/api` 必须指向真实地址。两种选择：

1. **局域网直连**：后端跑在家里 NAS / 服务器上，App 里填 `http://192.168.1.20:3000`。手机只在同一个 Wi-Fi 下能用。
2. **公网 + HTTPS**：推荐。域名 + 反代（Nginx/Caddy）签发证书，App 填 `https://tq.example.com`。

首次在 App 里打开登录页会自动弹出服务器配置框（Tauri 环境且未配置时），之后点登录页"服务器地址"可改。值存在 localStorage。

## 环境前置

### 桌面（Windows / macOS / Linux）

| 依赖 | 说明 |
|---|---|
| Rust | `rustup` 装 stable（本机已装 1.99.0） |
| MSVC 构建工具 | Windows 必需：VS Build Tools「Desktop development with C++」 |
| WebView2 | Windows 10/11 一般自带，缺失时安装包会引导下载 |
| macOS | Xcode Command Line Tools |
| Linux | `webkit2gtk-4.1` / `libayatana-appindicator3` 等（见 Tauri 官方 prerequisites） |

> 本机（Windows）当前缺 MSVC 链接器，`tauri build` 会在链接阶段失败。装完 VS Build Tools 后重开终端即可。

### Android

1. JDK 17
2. Android Studio → SDK Manager：Android SDK Platform（API 33+）、NDK（`ANDROID_HOME` 指向 SDK 目录）
3. 环境变量：`ANDROID_HOME`、`NDK_HOME`
4. 首次生成工程：`npm run tauri:android:init`

生成后必须打两个补丁（自托管 HTTP 后端需要）：

```bash
# 1) 复制明文流量配置
mkdir -p src-tauri/gen/android/app/src/main/res/xml
cp src-tauri/mobile-patches/network_security_config.xml \
   src-tauri/gen/android/app/src/main/res/xml/
```

```xml
<!-- 2) src-tauri/gen/android/app/src/main/AndroidManifest.xml 的 <application> 加两行 -->
<application
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

### iOS（只能在 macOS 上构建）

1. Xcode 15+、`xcode-select --install`
2. `npm run tauri:ios:init` → 生成 `gen/apple`
3. Xcode 打开 `src-tauri/gen/apple/TidyQuest.xcodeproj`，Signing 选自己的 Team
4. 若后端是 HTTP，在 `Info.plist` 加：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key><true/>
</dict>
```

## 常用命令（都在 `client/` 下）

```bash
npm run tauri:dev              # 桌面调试（会先起 vite）
npm run tauri:build            # 桌面安装包：MSI / NSIS / dmg / deb

npm run tauri:android:dev      # 安卓真机/模拟器调试
npm run tauri:android:build    # APK + AAB（AAB 需签名配置）

npm run tauri:ios:dev          # iOS 调试（macOS）
npm run tauri:ios:build        # IPA（macOS）
```

移动端调试时 Vite 已开 `host: true`，手机连同一 Wi-Fi 即可访问 dev server；Tauri 会把 `devUrl` 的 localhost 自动替换为本机局域网 IP。

## 打包前的检查清单

- [ ] `tauri.conf.json` 的 `identifier` 改成你自己的（默认 `com.tidyquest.app`），Android 包名和 iOS Bundle ID 都跟着走
- [ ] 版本号与 `package.json` 对齐（当前 0.6.3）
- [ ] 图标已生成：`npx tauri icon ../logoImage/<logo>.png`（会写入 `src-tauri/icons/`）
- [ ] Android 签名：`src-tauri/gen/android/app/build.gradle` 里配 `signingConfigs`，或用 `tauri signer generate` 生成上传密钥
- [ ] 后端 CORS：App 的 origin 是 `tauri://localhost`（Android 为 `http://localhost`），后端需允许，或干脆同域反代
- [ ] 后端监听 `0.0.0.0` 而非 `127.0.0.1`，否则局域网设备连不上

## 已知限制

- iOS/Android 上 WebView 与 App 共用 localStorage，但系统清理会丢登录态 —— 属正常行为
- 桌面上若要「一键自包含」（后端一起打包），需要把 Node 后端编进 sidecar，另开一轮改造
- 移动端推送暂未接，任务提醒沿用现有的 Telegram / ntfy 通道
