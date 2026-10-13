# 家务小当家 · 开发常用命令速查

本机环境：Windows，Node 22，未安装 Docker，直接 Node 跑前后端。

环境变量统一写在**项目根目录 `.env`**，server 启动时自动加载。
所以 PowerShell / Git Bash / CMD **三种 shell 命令完全一样**，不用手打 `JWT_SECRET=...`。

> `.env` 已被 gitignore。换机器 clone 后先执行：`cp .env.example .env`（Git Bash）或 `Copy-Item .env.example .env`（PowerShell）。

---

## 1. 启动开发环境

开两个终端。

**终端 A — 后端（:3000）**
```bash
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/server"
npm run dev
```

**终端 B — 前端（:5173）**
```bash
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/client"
npm run dev
```

浏览器打开 <http://localhost:5173>。

**可选：根目录一条命令同时拉起前后端**
```bash
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest"
npm install          # 首次需要，装 concurrently
npm run dev
```

想临时覆盖某个变量（如切生产模式），在命令前加前缀即可，`.env` 里已设的值会被忽略：

| shell | 写法 |
|---|---|
| Git Bash | `NODE_ENV=production npm start` |
| PowerShell | `$env:NODE_ENV='production'; npm start` |
| CMD | `set NODE_ENV=production && npm start` |

---

## 2. 停止服务

### Git Bash
```bash
netstat -ano | grep LISTENING | grep -E ":3000|:5173"    # 最后一列是 PID
taskkill //PID <pid> //F
```

一次搞定两个端口：
```bash
for p in 3000 5173; do
  pid=$(netstat -ano | grep LISTENING | grep ":$p " | awk '{print $NF}' | head -1)
  [ -n "$pid" ] && taskkill //PID $pid //F
done
```

### PowerShell
```powershell
netstat -ano | Select-String "LISTENING" | Select-String ":3000",":5173"
taskkill /PID <pid> /F
```

一次搞定：
```powershell
foreach ($p in 3000, 5173) {
  $line = netstat -ano | Select-String "LISTENING" | Select-String ":$p "
  if ($line) { taskkill /PID ($line[0].ToString() -split '\s+')[-1] /F }
}
```

> ⚠️ 不要用 `taskkill //IM node.exe`（或 PowerShell 的 `Stop-Process -Name node`），会把别的 Node 进程一起杀掉。

---

## 3. 验证服务起来了没

本机开了代理，curl 访问 localhost 必须加 `--noproxy '*'`，否则会被代理拦：

**Git Bash**
```bash
curl -s -o /dev/null -w "%{http_code}\n" --noproxy '*' http://localhost:5173/
curl -s --noproxy '*' http://localhost:5173/api/auth/registration-status
curl -s --noproxy '*' -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"amos","password":"test12345"}'
```

**PowerShell**
> 必须写 `curl.exe`。PS 5.1 里 `curl` 是 `Invoke-WebRequest` 的别名，参数完全不兼容。
```powershell
curl.exe -s --noproxy '*' http://localhost:5173/api/auth/registration-status
curl.exe -s --noproxy '*' -X POST http://localhost:5173/api/auth/login -H "Content-Type: application/json" -d '{\"username\":\"amos\",\"password\":\"test12345\"}'
```

---

## 4. 构建 & 生产模式

```bash
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/client" && npm run build   # 产物 client/dist
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/server" && npm run build   # 产物 server/dist

# 生产单端口启动（:3000 同时提供 API 和静态前端）
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/server"
NODE_ENV=production npm start          # Git Bash
# $env:NODE_ENV='production'; npm start   ← PowerShell
```

---

## 5. 几个关键坑位

| # | 坑 | 说明 |
|---|---|---|
| 1 | **别在 PowerShell / CMD 里写 `VAR=value cmd`** | 这是 Git Bash 才有的语法，PowerShell 会报 `CommandNotFoundException`。环境变量走根目录 `.env`。 |
| 2 | **`.env` 只加载一次，且必须在 import 链最前** | `server/src/loadEnv.ts` 由 `index.ts` 第一行 import。改动/移动它前先看注释。 |
| 3 | **别杀全部 node.exe** | 按 PID 杀，见第 2 节。 |
| 4 | **根 `npm run dev` 要先装根依赖** | 根目录依赖 `concurrently`，没装会直接报命令找不到。 |
| 5 | **数据库是 `data/jiawu.db`** | 旧的 `data/tidyquest.db` 暂时保留，确认没问题后可手动删。 |

---

## 附：改完代码后的检查清单

```bash
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/client" && npx tsc -b --force && npm run build
cd "E:/ai工程师/Alipay Agent Emergence Award/TidyQuest/server" && npx tsc --noEmit && npm test
```

i18n 改动后记得核对 7 个语言 JSON 的键数量是否一致（`en/de/es/fr/it/nl/zh`，均应为 646 键）。
