// api/llm.js - Vercel无服务器函数，用于代理LLM API请求
export default async function handler(req, res) {
    // 添加CORS头部
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 只允许POST请求
    if (req.method !== 'POST') {
      return res.status(405).json({ error: '仅支持POST请求' });
    }
  
    try {
      // ---------- 解析请求体 ----------
      let requestData = req.body;

      // 如果req.body为空，或者类型为字符串（未解析），尝试手动解析
      if (!requestData || typeof requestData === 'string') {
        try {
          // 如果req.body是字符串，直接解析
          if (typeof requestData === 'string' && requestData.trim() !== '') {
            requestData = JSON.parse(requestData);
          } else {
            // 从数据流中读取原始请求体
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf8');
            requestData = rawBody ? JSON.parse(rawBody) : {};
          }
        } catch (parseErr) {
          console.error('❌ 无法解析请求体为JSON:', parseErr);
          return res.status(400).json({ error: '请求体不是有效的JSON', details: parseErr.message });
        }
      }

      // 如果requestData仍是Buffer，尝试解析
      if (Buffer.isBuffer(requestData)) {
        try {
          requestData = JSON.parse(requestData.toString('utf8'));
        } catch (parseErr) {
          console.error('❌ 无法解析Buffer格式的请求体为JSON:', parseErr);
          return res.status(400).json({ error: '请求体不是有效的JSON(Buffer)', details: parseErr.message });
        }
      }

      // 检查请求格式
      console.log('接收到请求，数据格式:', {
        hasPrompt: !!requestData.prompt,
        promptType: typeof requestData.prompt,
        promptLength: requestData.prompt ? requestData.prompt.length : 0,
        hasMessages: !!requestData.messages,
        apiId: requestData.apiId,
        modelType: requestData.modelType
      });
      
      // 提取关键参数
      const { prompt, temperature, apiId, userApiKey, modelType = 'deepseek' } = requestData;
      
      // 创建默认prompt - 临时解决方案
      const effectivePrompt = prompt || "请提供评估结果";
      
      /* 暂时注释掉验证逻辑
      // 验证prompt是否存在且非空
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(422).json({ 
          error: 'Prompt参数无效',
          message: 'Prompt必须是非空字符串'
        });
      }
      */
      
      // 从环境变量获取API密钥
      let apiKey;
      let apiUrl;
      let model;
      
      // 优先使用用户提供的API密钥（如果有）
      if (userApiKey && userApiKey.length >= 20) {
        apiKey = userApiKey;
        console.log('使用用户提供的API密钥');
      } else {
        // 否则使用环境变量中的API密钥
        switch (modelType) {
          case 'openai':
            if (apiId === 'api2') {
              apiKey = process.env.OPENAI_API_KEY_2;
            } else if (apiId === 'api3') {
              apiKey = process.env.OPENAI_API_KEY_3;
            } else {
              apiKey = process.env.OPENAI_API_KEY;
            }
            console.log(`使用环境变量OpenAI API密钥 (${apiId || 'default'})`);
            break;
          case 'qwen':
            if (apiId === 'api2') {
              apiKey = process.env.QWEN_API_KEY_2;
            } else if (apiId === 'api3') {
              apiKey = process.env.QWEN_API_KEY_3;
            } else {
              apiKey = process.env.QWEN_API_KEY;
            }
            console.log(`使用环境变量通义千问API密钥 (${apiId || 'default'})`);
            break;
          case 'deepseek':
          default:
            if (apiId === 'api2') {
              apiKey = process.env.DEEPSEEK_API_KEY_2;
            } else if (apiId === 'api3') {
              apiKey = process.env.DEEPSEEK_API_KEY_3;
            } else {
              apiKey = process.env.DEEPSEEK_API_KEY;
            }
            console.log(`使用环境变量Deepseek API密钥 (${apiId || 'default'})`);
        }
      }
      
      // 验证API密钥
      if (!apiKey || apiKey === 'your-api-key-here') {
        return res.status(500).json({ 
          error: 'API密钥未配置',
          message: `请在环境变量中配置${modelType.toUpperCase()}API密钥或在前端提供有效的API密钥`,
          modelType: modelType,
          apiId: apiId || 'default'
        });
      }
      
      // 根据模型类型设置API参数
      switch (modelType) {
        case 'openai':
          apiUrl = "https://api.openai.com/v1/chat/completions";
          model = "gpt-3.5-turbo";
          break;
        case 'qwen':
          apiUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
          model = "qwen-turbo";
          break;
        case 'deepseek':
        default:
          apiUrl = "https://api.deepseek.com/v1/chat/completions";
          model = "deepseek-chat";
      }
      
      const maxTokens = 4000;
      
      // 构建请求体 - 确保消息格式正确
      let requestBody;
      let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      // 创建有效的messages数组，确保包含content字段
      const messages = [{ 
        role: "user", 
        content: effectivePrompt.trim() 
      }];
      
      switch (modelType) {
        case 'qwen':
          // 通义千问现在支持OpenAI兼容格式
          requestBody = {
            model: model,
            messages: messages,
            temperature: temperature || 0.5,
            max_tokens: maxTokens
          };
          break;
        case 'openai':
        case 'deepseek':
        default:
          // OpenAI/Deepseek格式
          requestBody = {
            model: model,
            messages: messages,
            temperature: temperature || 0.3,
            max_tokens: maxTokens
          };
      }
      
      // 日志记录请求内容，帮助调试
      console.log('发送请求到LLM服务:', {
        url: apiUrl,
        model: model,
        temperature: temperature,
        messagesCount: messages.length,
        firstMessageLength: messages[0].content.length > 50 ? 
          `${messages[0].content.substring(0, 50)}...` : 
          messages[0].content,
        promptSource: prompt ? 'user提供' : '使用默认值'
      });
      
      // 调用API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API调用失败: ${response.status} ${response.statusText}`);
        console.error(`错误详情: ${errorText}`);
        return res.status(response.status).json({ 
          error: `API调用失败: ${response.status} ${response.statusText}`,
          details: errorText 
        });
      }
      
      const data = await response.json();
      console.log(`API调用成功 (${modelType}/${apiId || 'default'})，返回数据长度:`, JSON.stringify(data).length);
      
      // 所有模型现在都使用OpenAI兼容格式，无需特殊处理
      const formattedResponse = data;
      
      // 添加text字段，确保前端代码能正确处理
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        formattedResponse.text = data.choices[0].message.content;
      }
      
      return res.status(200).json(formattedResponse);
    } catch (error) {
      console.error('服务器处理错误:', error);
      return res.status(500).json({ 
        error: `服务器错误: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } 