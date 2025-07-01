# Vercel 部署指南 - 智衡权重确定平台

## 📋 项目概述

智衡权重确定平台是一个基于AI的统计权重方法推荐系统，支持三种大语言模型（Deepseek、OpenAI、Qwen）的并行调用，为用户提供智能化的权重方法推荐服务。

## 🚀 部署步骤

### 1. 准备工作

#### 1.1 获取API密钥
在部署前，您需要获取以下API密钥：

**Deepseek API 密钥**
- 访问：https://platform.deepseek.com/
- 注册账号并获取API密钥
- 建议获取3个密钥以实现并行调用优化

**OpenAI API 密钥（可选）**
- 访问：https://platform.openai.com/
- 获取API密钥
- 建议获取3个密钥以实现并行调用

**阿里云通义千问 API 密钥（可选）**
- 访问：https://dashscope.aliyun.com/
- 获取DashScope API密钥
- 建议获取3个密钥以实现并行调用

#### 1.2 准备代码
确保您的项目包含以下关键文件：
- `vercel.json` - Vercel配置文件
- `api/llm.js` - API代理函数
- `package.json` - 项目依赖（如果有）

### 2. Vercel部署

#### 2.1 通过GitHub部署（推荐）

1. **上传代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com/)
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择您的GitHub仓库
   - 点击 "Import"

#### 2.2 直接部署

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

### 3. 环境变量配置

在Vercel Dashboard中配置以下环境变量：

#### 3.1 必需的环境变量

**Deepseek API 密钥（必需）**
```
DEEPSEEK_API_KEY=sk-your-primary-deepseek-key
DEEPSEEK_API_KEY_2=sk-your-secondary-deepseek-key
DEEPSEEK_API_KEY_3=sk-your-tertiary-deepseek-key
```

#### 3.2 可选的环境变量

**OpenAI API 密钥**
```
OPENAI_API_KEY=sk-your-primary-openai-key
OPENAI_API_KEY_2=sk-your-secondary-openai-key
OPENAI_API_KEY_3=sk-your-tertiary-openai-key
```

**通义千问 API 密钥**
```
QWEN_API_KEY=your-primary-qwen-key
QWEN_API_KEY_2=your-secondary-qwen-key
QWEN_API_KEY_3=your-tertiary-qwen-key
```

#### 3.3 配置步骤

1. 在Vercel Dashboard中选择您的项目
2. 进入 "Settings" → "Environment Variables"
3. 添加上述环境变量
4. 重新部署项目使变量生效

### 4. 验证部署

#### 4.1 功能测试

1. **访问主页**
   - 访问您的Vercel部署URL
   - 确认页面正常加载

2. **测试API密钥配置**
   - 点击主页的"API密钥设置"按钮
   - 尝试保存和清除密钥功能

3. **测试权重推荐功能**
   - 进入"methomath"页面
   - 填写问卷并上传数据
   - 验证是否能正常获得推荐结果

#### 4.2 性能验证

1. **API响应测试**
   - 检查控制台日志中的API调用信息
   - 确认并行调用机制正常工作

2. **多模型测试**
   - 在API设置中切换不同模型
   - 验证每种模型都能正常工作

## ⚙️ 配置详解

### 并行API调用机制

系统支持每种模型配置3个API密钥，实现以下优化：

1. **负载均衡**：请求分散到不同API密钥
2. **响应速度**：使用Promise.race()获取最快响应
3. **容错性**：单个密钥失效时自动切换

### API代理架构

```
前端 → Vercel API代理 (/api/llm) → 外部LLM API
```

**优势：**
- 保护API密钥安全
- 统一请求格式
- 支持多模型切换

### 用户使用模式

1. **默认模式**：使用您配置的环境变量API密钥
2. **自定义模式**：用户在前端输入自己的API密钥

## 🔧 故障排除

### 常见问题

1. **405 Method Not Allowed**
   - 确认`api/llm.js`文件存在
   - 检查`vercel.json`路由配置

2. **API密钥错误**
   - 验证环境变量名称正确
   - 确认API密钥格式正确

3. **部署失败**
   - 检查项目根目录是否包含必要文件
   - 确认没有语法错误

### 调试方法

1. **查看部署日志**
   ```bash
   vercel logs <deployment-url>
   ```

2. **本地测试**
   ```bash
   vercel dev
   ```

3. **检查API调用**
   - 打开浏览器开发者工具
   - 查看Network和Console标签

## 📈 优化建议

### 性能优化

1. **配置多个API密钥**以获得最佳性能
2. **启用Vercel Analytics**监控使用情况
3. **配置CDN缓存**优化静态资源加载

### 安全建议

1. **定期轮换API密钥**
2. **监控API使用量**防止超额
3. **配置域名白名单**（如果API提供商支持）

### 成本控制

1. **设置API使用限制**
2. **监控每日调用量**
3. **实施用户请求频率限制**

## 📝 维护指南

### 定期维护

1. **更新依赖**：定期检查和更新项目依赖
2. **监控API状态**：检查各个LLM服务的可用性
3. **备份配置**：保存环境变量配置备份

### 扩展功能

1. **添加新的LLM模型**：修改`config.js`和`api/llm.js`
2. **增强错误处理**：改进用户反馈机制
3. **添加使用统计**：集成分析服务

## 🎯 用户指导

### 终端用户使用说明

1. **访问平台**：通过您提供的Vercel URL访问
2. **选择模式**：
   - 使用默认配置（消耗您的API配额）
   - 配置自己的API密钥（使用自己的配额）
3. **获得推荐**：填写问卷并上传数据获取权重方法推荐

### API密钥配置指导

为用户提供以下指导：

1. **获取密钥**：指导用户如何从各个平台获取API密钥
2. **配置方法**：说明如何在平台上配置密钥
3. **安全提醒**：提醒用户保护API密钥安全

## 📞 技术支持

如果遇到部署问题，请检查：

1. **Vercel状态页面**：https://vercel.com/status
2. **API服务状态**：各个LLM提供商的状态页面
3. **项目文档**：查看相关API文档

---

**部署成功后，您的智衡权重确定平台就可以为用户提供专业的AI驱动权重方法推荐服务了！**