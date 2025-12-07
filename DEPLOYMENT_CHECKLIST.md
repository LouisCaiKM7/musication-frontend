# 🚀 部署前检查清单

## ✅ 准备工作

### 1. Git 推送前检查

- [x] `.gitignore` 已更新（不再忽略 `musication-backend/` 目录）
- [x] `Dockerfile` 已创建
- [x] `.dockerignore` 已创建
- [ ] 确认 `.env` 文件**不在** Git 中（应该被忽略）
- [ ] 确认所有代码修改已保存

### 2. 推送到 GitHub

```bash
cd d:\姆泽佩专属\kld\musication-frontend

# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "Add music identification feature and Docker support"

# 推送
git push origin main
```

---

## 📦 后端部署（Render）

### Step 1: 创建 PostgreSQL 数据库

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New +** → **PostgreSQL**
3. 配置：
   - Name: `musication-db`
   - Region: 选择最近的
   - Plan: **Free**
4. 点击 **Create Database**
5. 等待状态变为 **Available**
6. **复制 Internal Database URL**（重要！）

---

### Step 2: 创建 Web Service (Docker)

1. 点击 **New +** → **Web Service**
2. 连接 GitHub 仓库
3. 选择你的仓库
4. 配置：

   **基础设置**
   - Name: `musication-backend`
   - Region: 与数据库相同
   - Branch: `main`
   - Root Directory: `musication-backend`
   - **Environment: Docker** ⬅️ 重要！
   - Plan: Free

5. 点击 **Advanced** 添加环境变量：

   ```
   FLASK_ENV=production
   DATABASE_URL=<粘贴步骤1的URL>
   BASE_URL=https://musication-backend.onrender.com
   FRONTEND_URL=https://你的前端.netlify.app
   UPLOAD_DIR=uploads
   FPCALC=/usr/bin/fpcalc
   ```

   **注意**：
   - `BASE_URL` 中的 `musication-backend` 改成你设置的 Name
   - `FRONTEND_URL` 暂时可以留空，前端部署后再更新

6. 点击 **Create Web Service**
7. 等待 5-10 分钟（Docker 构建时间较长）
8. 部署成功后，记录 URL（例如：`https://musication-backend.onrender.com`）

---

### Step 3: 测试后端

访问健康检查：
```
https://你的后端.onrender.com/health
```

应该返回：
```json
{"status": "ok"}
```

---

## 🎨 前端部署（Netlify）

### Step 1: 连接 GitHub

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 选择 **GitHub**
4. 授权并选择仓库：`musication-frontend`
5. 配置：
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 2: 设置环境变量

点击 **Show advanced** → **New variable**：

```
Key: NEXT_PUBLIC_API_URL
Value: https://你的后端.onrender.com
```

### Step 3: 部署

1. 点击 **Deploy site**
2. 等待 2-3 分钟
3. 记录 Netlify URL（例如：`https://your-app-123.netlify.app`）

---

### Step 4: 更新后端 CORS

1. 回到 Render → 后端服务 → **Environment**
2. 编辑 `FRONTEND_URL`，改成 Netlify URL
3. 保存（会自动重新部署）

---

## ✅ 最终验证

### 1. 后端健康检查
- [ ] 访问 `https://后端.onrender.com/health` 返回 OK

### 2. 前端访问
- [ ] 打开 Netlify URL
- [ ] 页面正常显示

### 3. 上传功能
- [ ] 上传一个 MP3 文件
- [ ] 文件出现在列表中
- [ ] 可以播放音频

### 4. 音乐识别功能
- [ ] 点击 ✨ 按钮
- [ ] 等待识别（可能需要 10-30 秒）
- [ ] 看到识别结果或"No matches found"

### 5. 删除功能
- [ ] 点击垃圾桶图标
- [ ] 文件被删除

---

## 🔧 常见问题

### Render 构建失败

**检查**：
- Dockerfile 是否在 `musication-backend/` 目录
- requirements.txt 是否存在
- 查看构建日志

### 数据库连接失败

**检查**：
- `DATABASE_URL` 是否正确复制
- 使用 **Internal** URL，不是 External
- 数据库状态是否为 Available

### CORS 错误

**检查**：
- 浏览器控制台看具体错误
- `FRONTEND_URL` 是否与 Netlify URL 完全一致
- 没有多余的 `/` 斜杠

### 首次访问很慢

**正常现象**：
- Render 免费版有冷启动（30-60秒）
- Docker 容器需要时间启动

---

## 📝 环境变量总结

### Render（后端）
```
FLASK_ENV=production
DATABASE_URL=<从数据库复制>
BASE_URL=https://你的后端.onrender.com
FRONTEND_URL=https://你的前端.netlify.app
UPLOAD_DIR=uploads
FPCALC=/usr/bin/fpcalc
```

### Netlify（前端）
```
NEXT_PUBLIC_API_URL=https://你的后端.onrender.com
```

---

## 🎉 完成！

部署成功后，你的音乐识别应用就可以在线使用了！

**后端**: `https://你的后端.onrender.com`  
**前端**: `https://你的前端.netlify.app`

---

## 📚 更多文档

- 详细 Docker 部署指南：`musication-backend/RENDER_DOCKER_DEPLOY.md`
- 原部署文档：`musication-backend/DEPLOYMENT.md`
