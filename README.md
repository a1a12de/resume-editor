# 简历编辑器

一个基于 HTML/CSS/JavaScript 的简历编辑器，支持 Supabase 云端数据存储。

## 功能特性

- ✅ 可视化简历编辑
- ✅ 7大板块：基本信息、个人简介、教育背景、工作经历、项目经历、获奖情况、专业技能
- ✅ 用户注册/登录
- ✅ 云端数据存储
- ✅ 导出 HTML 和 PDF

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/你的用户名/resume-editor.git
cd resume-editor
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 Supabase 配置
```

`.env` 文件内容：
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 3. 生成配置文件

```bash
# 安装 Node.js 后执行
node build.js
```

这会根据 `.env` 文件生成 `js/config.js`。

### 4. 运行项目

直接在浏览器中打开 `resume.html` 文件，或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server
```

## 获取 Supabase 配置

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目或选择现有项目
3. 进入 Project Settings → API
4. 复制以下信息：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 创建数据库表

在 Supabase SQL Editor 中执行以下 SQL：

```sql
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar VARCHAR(10) DEFAULT '',
    name VARCHAR(100) DEFAULT '',
    job_title VARCHAR(200) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(200) DEFAULT '',
    address VARCHAR(500) DEFAULT '',
    birthday VARCHAR(50) DEFAULT '',
    work_years VARCHAR(50) DEFAULT '',
    education_level VARCHAR(50) DEFAULT '',
    job_intention VARCHAR(200) DEFAULT '',
    summary TEXT DEFAULT '',
    education_list JSONB DEFAULT '[]'::jsonb,
    work_list JSONB DEFAULT '[]'::jsonb,
    project_list JSONB DEFAULT '[]'::jsonb,
    award_list JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resume" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resume" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resume" ON resumes FOR DELETE USING (auth.uid() = user_id);
```

## 部署

### EdgeOne 部署

1. 登录 [EdgeOne 控制台](https://console.edgeone.com/)
2. 新建站点 → 选择 Git 部署
3. 授权 GitHub 并选择此仓库
4. 配置构建命令：`node build.js`
5. 部署

**注意**：部署前需要在 EdgeOne 的环境变量设置中添加：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 安全说明

- `.env` 和 `js/config.js` 文件已添加到 `.gitignore`，不会上传到 GitHub
- Supabase 的 `anon key` 是公开密钥，设计上可以暴露在前端
- 数据安全由 Supabase 的 RLS (Row Level Security) 策略保护

## 技术栈

- HTML5 + CSS3 + JavaScript
- [Supabase](https://supabase.com) - 后端服务
- Supabase Auth - 用户认证
- Supabase Database - 数据存储

## License

MIT
