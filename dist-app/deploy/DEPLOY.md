# 部署到阿里云（无域名 / 未备案 / 直接用公网 IP）

当前服务器：`121.43.226.135`（阿里云大陆节点，免费试用）

> 大陆节点未备案时 **80/443 会被封**，所以用 **8080 端口 + HTTP** 直连。
> 备案通过后再切 Caddy + HTTPS（见文末）。

## 1. 阿里云控制台

安全组放行：22（SSH）、8080。**不要放行 3000**。

## 2. 登录服务器

```bash
ssh root@121.43.226.135
```

## 3. 装 Docker

把 `setup-server.sh` 传上去跑：

```bash
bash setup-server.sh
```

（脚本会装 Docker、compose 插件、加 2G swap、建 `/srv/tidyquest`）

## 4. 拉代码（必须 feat/tauri-desktop 分支）

先测 GitHub 连通性，大陆服务器经常被掐：

```bash
timeout 20 git ls-remote https://github.com/amuMeta/chore-master.git HEAD
```

通了就 clone：

```bash
git clone -b feat/tauri-desktop https://github.com/amuMeta/chore-master.git /srv/tidyquest
cd /srv/tidyquest
```

> ⚠️ **必须用 `feat/tauri-desktop` 分支**。默认分支 `main` 还没有「可配置服务器地址」
> （`src/utils/serverConfig.ts` + `ServerConfigModal.tsx`），装出来的桌面 App 连不上后端。

GitHub 超时的话，两条退路：

```bash
# 1) 走加速镜像
git clone -b feat/tauri-desktop https://ghfast.top/https://github.com/amuMeta/chore-master.git /srv/tidyquest
```

```powershell
# 2) 本地打包上传（Windows PowerShell）
cd "E:\ai工程师\Alipay Agent Emergence Award\TidyQuest"
tar --exclude=node_modules --exclude=client/node_modules --exclude=client/src-tauri --exclude=.git --exclude=data -czf tq.tar.gz .
```
再用控制台 Workbench 的「文件管理」传到 `/root/`，然后
`mkdir -p /srv/tidyquest && tar -xzf /root/tq.tar.gz -C /srv/tidyquest`。

## 5. 一键部署

```bash
cd /srv/tidyquest && bash dist-app/deploy/deploy.sh
```

脚本会自动：生成随机 `JWT_SECRET` 写入 `.env`、拷贝生产 compose、构建并启动容器、等健康检查。
首次构建约 3–8 分钟。**以后更新代码也是这一条命令**（会 `git pull` + 重建容器）。

若 `docker pull` 拉 `node:22-alpine` 超时，去阿里云控制台 → 容器镜像服务 → 镜像加速器
拿专属地址，写进 `/etc/docker/daemon.json` 后 `systemctl restart docker`。

## 7. 验证

```bash
curl http://121.43.226.135:8080/api/auth/registration-status
```

返回 JSON 就成了。浏览器打开 `http://121.43.226.135:8080` 也能直接用网页版。

## 8. App 里填地址

`http://121.43.226.135:8080`

- 桌面端：登录页 →「服务器地址」→ 填上面的地址
- 安卓端：必须先打明文 HTTP 补丁，否则 Android 9+ 会拒绝连接（模板在
  `client/src-tauri/mobile-patches/network_security_config.xml`，步骤见 `../docs/TAURI-BUILD.md`）

## 9. 运维

```bash
# 备份数据库（保留 14 天）
bash dist-app/deploy/backup.sh
# 加到 crontab：0 3 * * * /srv/tidyquest/dist-app/deploy/backup.sh

# 更新
git pull && docker compose -f docker-compose.prod.yml up -d --build
```

免费试用到期机器会被回收，**务必定期把 `data/jiawu.db` 拷到本地**。

## 10. 以后升级到 HTTPS

1. 买域名 → A 记录指向 121.43.226.135 → 提交备案
2. 备案通过后：compose 端口改成 `127.0.0.1:3000:3000`
3. 放 `Caddyfile.example` 为 `/srv/tidyquest/Caddyfile`（改掉域名），启动 Caddy 容器
4. App 地址换成 `https://你的域名`，安卓端连明文补丁都可以省了

## 安全提醒

- HTTP 明文传输，账号密码和 token 都在公网上裸奔，只适合短期试用
- SSH 用强密码或密钥，别用弱口令
- `JWT_SECRET` 必须是随机值，不能用 `.env.example` 里的示例
