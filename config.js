/**
 * API配置文件 - Vercel部署版本
 * 安全提示: 生产环境使用API代理和环境变量保护API密钥
 */

/**
 * 增强的环境检测系统
 * 支持多种部署平台和运行环境的智能识别
 */
export const ENV = {
  // 基础环境检测
  get hostname() {
    return typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  },
  
  get protocol() {
    return typeof window !== 'undefined' ? window.location.protocol : 'unknown';
  },

  // 开发环境检测
  get isDevelopment() {
    const hostname = this.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.endsWith('.local');
  },

  // 部署平台检测
  get deploymentPlatform() {
    const hostname = this.hostname;
    
    if (this.isDevelopment) return 'development';
    if (hostname.includes('vercel.app') || hostname.includes('vercel-app')) return 'vercel';
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) return 'netlify';
    if (hostname.includes('github.io') || hostname.includes('github.com')) return 'github-pages';
    if (hostname.includes('surge.sh')) return 'surge';
    if (hostname.includes('firebase.app') || hostname.includes('firebaseapp.com')) return 'firebase';
    if (hostname.includes('cloudflare')) return 'cloudflare-pages';
    if (hostname.includes('herokuapp.com')) return 'heroku';
    if (hostname.includes('railway.app')) return 'railway';
    
    return 'custom-server';
  },

  // 服务器功能检测
  get hasServerlessSupport() {
    const platform = this.deploymentPlatform;
    return ['vercel', 'netlify', 'firebase', 'cloudflare-pages'].includes(platform);
  },

  // 环境友好名称
  get environmentName() {
    const platform = this.deploymentPlatform;
    const names = {
      'development': '本地开发',
      'vercel': 'Vercel生产',
      'netlify': 'Netlify生产',
      'github-pages': 'GitHub Pages',
      'surge': 'Surge.sh',
      'firebase': 'Firebase',
      'cloudflare-pages': 'Cloudflare Pages',
      'heroku': 'Heroku',
      'railway': 'Railway',
      'custom-server': '自定义服务器'
    };
    return names[platform] || '未知环境';
  },

  // API代理可用性检测  
  get isUsingApiProxy() {
    // 延迟计算，避免循环依赖
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.getApiConfigs) {
      return API_CONFIG.getApiConfigs()[0].url.startsWith('/api/');
    }
    return false;
  },

  // 生产环境检测
  get isProduction() {
    return !this.isDevelopment;
  }
};

export const API_CONFIG = {
  // 控制是否使用LLM服务
  USE_LLM: true,  // 设置为false可以使用本地模拟数据而不调用API
  
  // 支持的LLM模型类型
  SUPPORTED_MODELS: [
    {
      id: 'deepseek',
      name: 'Deepseek',
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 4000
    },
    {
      id: 'openai',
      name: 'ChatGPT',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 4000
    },
    {
      id: 'qwen',
      name: '通义千问',
      apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: 'qwen-turbo',
      temperature: 0.5,
      max_tokens: 4000
    }
  ],
  
  // 默认使用的模型
  DEFAULT_MODEL: 'deepseek',
  
  // 多API配置 - 根据环境自动选择
  MULTI_API_ENABLED: true,
  
  // 智能获取API配置的函数
  getApiConfigs() {
    // 获取当前环境信息
    const platform = ENV.deploymentPlatform;
    const hasServerless = ENV.hasServerlessSupport;
    const isDev = ENV.isDevelopment;
    
    // 智能选择API端点
    let baseUrl;
    let useProxy = false;
    
    if (isDev) {
      // 开发环境：直接调用外部API
      baseUrl = 'https://api.deepseek.com/v1/chat/completions';
      useProxy = false;
    } else if (hasServerless) {
      // 支持serverless的平台：使用API代理
      baseUrl = '/api/llm';
      useProxy = true;
    } else {
      // 不支持serverless的平台：直接调用外部API（需要用户配置CORS）
      baseUrl = 'https://api.deepseek.com/v1/chat/completions';
      useProxy = false;
      
      // 为静态托管平台提供警告
      console.warn(`
⚠️ 检测到当前平台 (${ENV.environmentName}) 不支持serverless函数
   将使用直接API调用模式，请确保：
   1. 已配置有效的API密钥
   2. API服务支持CORS跨域请求
   3. 考虑迁移到支持serverless的平台以提高安全性
      `);
    }
    
    // 生成配置数组
    const configs = [
      {
        id: 'default',
        key: "",
        url: baseUrl,
        model: "deepseek-chat",
        temperature: 0.3,
        max_tokens: 4000,
        useProxy: useProxy,
        platform: platform
      },
      {
        id: 'api2', 
        key: "",
        url: baseUrl,
        model: "deepseek-chat",
        temperature: 0.3,
        max_tokens: 4000,
        useProxy: useProxy,
        platform: platform
      },
      {
        id: 'api3',
        key: "",
        url: baseUrl, 
        model: "deepseek-chat",
        temperature: 0.3,
        max_tokens: 4000,
        useProxy: useProxy,
        platform: platform
      }
    ];
    
    // 异步检测API端点可用性（不阻塞初始化）
    if (!isDev && useProxy) {
      this._checkApiProxyAvailability(baseUrl);
    }
    
    return configs;
  },

  // API代理可用性异步检测
  async _checkApiProxyAvailability(apiUrl) {
    try {
      const isAvailable = await ApiEndpointChecker.checkEndpoint(apiUrl);
      
      if (!isAvailable) {
        console.warn(`
⚠️ API代理端点检测失败: ${apiUrl}
   可能的原因：
   1. serverless函数未正确部署
   2. 网络连接问题
   3. 端点路径配置错误
   
💡 建议解决方案：
   1. 检查Vercel/Netlify等平台的函数部署状态
   2. 确认 vercel.json 或 netlify.toml 配置正确
   3. 查看平台部署日志获取详细错误信息
        `);
        
        // 可以考虑自动降级到直接调用模式
        this._suggestFallbackMode();
      }
    } catch (error) {
      console.warn('API端点检测失败:', error.message);
    }
  },

  // 建议降级模式
  _suggestFallbackMode() {
    console.info(`
💡 自动降级建议：
   如果API代理持续不可用，可以：
   1. 在控制台执行: API_CONFIG.enableDirectMode()
   2. 手动配置API密钥到本地存储
   3. 重新加载页面使用直接调用模式
    `);
  },

  // 手动启用直接调用模式（降级方案）
  enableDirectMode() {
    const newConfigs = this.getApiConfigs().map(config => ({
      ...config,
      url: 'https://api.deepseek.com/v1/chat/completions',
      useProxy: false
    }));
    
    this.API_CONFIGS = newConfigs;
    this.API_URL = newConfigs[0].url;
    
    console.info('✅ 已切换到直接调用模式，请配置API密钥后重新尝试');
    return newConfigs;
  },
  
  // 本地开发模式API密钥配置
  // 仅在本地开发环境使用，生产环境请使用Vercel环境变量
  LOCAL_API_KEYS: {
    DEEPSEEK_API_KEY: "", // 在此处填入您的第一个Deepseek API密钥
    DEEPSEEK_API_KEY_2: "", // 在此处填入您的第二个Deepseek API密钥
    DEEPSEEK_API_KEY_3: "", // 在此处填入您的第三个Deepseek API密钥
    OPENAI_API_KEY: "", // OpenAI主要API密钥
    OPENAI_API_KEY_2: "", // OpenAI备用API密钥1
    OPENAI_API_KEY_3: "", // OpenAI备用API密钥2
    QWEN_API_KEY: "", // 通义千问主要API密钥
    QWEN_API_KEY_2: "", // 通义千问备用API密钥1
    QWEN_API_KEY_3: "" // 通义千问备用API密钥2
  },
  
  // 是否启用本地API密钥
  USE_LOCAL_API_KEYS: false, // 设置为true时将使用上面的LOCAL_API_KEYS
  
  // 调用参数
  TEMPERATURE: 0.3,  // 控制输出随机性
  MAX_TOKENS: 4000,  // 最大令牌数
  
  // 错误处理配置
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // 安全配置
  ENABLE_API_KEY_VALIDATION: true,
  HIDE_ERRORS_IN_PRODUCTION: true,
  
  // 用户配置
  ALLOW_USER_API_KEY: true, // 允许用户在前端配置自己的API密钥
};

// 延迟初始化顶层配置 - 避免ENV初始化顺序问题
// 这些配置将在首次访问时自动初始化
API_CONFIG._initialized = false;

// 确保配置已初始化的辅助函数
API_CONFIG._ensureInitialized = function() {
  if (!this._initialized) {
    this._API_CONFIGS = this.getApiConfigs();
    this._API_URL = this._API_CONFIGS[0].url;
    this._MODEL = this._API_CONFIGS[0].model;
    this._initialized = true;
  }
};

// 使用getter确保延迟初始化
Object.defineProperty(API_CONFIG, 'API_CONFIGS', {
  get: function() {
    this._ensureInitialized();
    return this._API_CONFIGS;
  }
});

Object.defineProperty(API_CONFIG, 'API_URL', {
  get: function() {
    this._ensureInitialized();
    return this._API_URL;
  }
});

Object.defineProperty(API_CONFIG, 'MODEL', {
  get: function() {
    this._ensureInitialized();
    return this._MODEL;
  }
});

/**
 * 安全获取API密钥
 * 优先级：用户自定义密钥 > 本地配置密钥 > 环境变量
 * @param {string} apiId - API配置ID，默认为'default'
 * @param {string} modelType - 模型类型，默认为'deepseek'
 * @returns {string} - API密钥
 */
export function getApiKey(apiId = 'default', modelType = 'deepseek') {
  // 从localStorage获取用户输入的密钥
  if (typeof localStorage !== 'undefined' && API_CONFIG.ALLOW_USER_API_KEY) {
    // 先尝试获取特定模型和API ID的密钥
    const userApiKey = localStorage.getItem(`${modelType}_api_key_${apiId}`);
    if (userApiKey && userApiKey !== "your-api-key-here") {
      return userApiKey;
    }
    
    // 再尝试获取特定模型的通用密钥
    const modelApiKey = localStorage.getItem(`${modelType}_api_key`);
    if (modelApiKey && modelApiKey !== "your-api-key-here") {
      return modelApiKey;
    }
    
    // 最后尝试获取通用密钥
    const commonUserApiKey = localStorage.getItem('deepseek_api_key');
    if (commonUserApiKey && commonUserApiKey !== "your-api-key-here") {
      return commonUserApiKey;
    }
  }
  
  // 如果启用了本地API密钥，从本地配置获取
  if (API_CONFIG.USE_LOCAL_API_KEYS) {
    switch(modelType) {
      case 'openai':
        if (apiId === 'api2') {
          return API_CONFIG.LOCAL_API_KEYS.OPENAI_API_KEY_2 || "";
        } else if (apiId === 'api3') {
          return API_CONFIG.LOCAL_API_KEYS.OPENAI_API_KEY_3 || "";
        } else {
          return API_CONFIG.LOCAL_API_KEYS.OPENAI_API_KEY || "";
        }
      case 'qwen':
        if (apiId === 'api2') {
          return API_CONFIG.LOCAL_API_KEYS.QWEN_API_KEY_2 || "";
        } else if (apiId === 'api3') {
          return API_CONFIG.LOCAL_API_KEYS.QWEN_API_KEY_3 || "";
        } else {
          return API_CONFIG.LOCAL_API_KEYS.QWEN_API_KEY || "";
        }
      case 'deepseek':
      default:
        if (apiId === 'api2') {
          return API_CONFIG.LOCAL_API_KEYS.DEEPSEEK_API_KEY_2 || "";
        } else if (apiId === 'api3') {
          return API_CONFIG.LOCAL_API_KEYS.DEEPSEEK_API_KEY_3 || "";
        } else {
          return API_CONFIG.LOCAL_API_KEYS.DEEPSEEK_API_KEY || "";
        }
    }
  }
  
  // 我们不再在前端访问环境变量中的API密钥，
  // 因为我们现在使用API代理，密钥保存在服务器端
  return "";
}

/**
 * 验证API密钥格式
 * @param {string} apiKey - 要验证的API密钥
 * @param {string} modelType - 模型类型，如'deepseek', 'openai', 'qwen'
 * @returns {object} - 验证结果对象，包含valid和message属性
 */
export function validateApiKey(apiKey, modelType = 'deepseek') {
  if (!apiKey || apiKey === "your-api-key-here") {
    return {
      valid: false,
      message: `请配置有效的${getModelName(modelType)}API密钥`
    };
  }
  
  // 根据不同模型类型进行验证
  switch(modelType) {
    case 'openai':
      if (!apiKey.startsWith("sk-")) {
        return {
          valid: false,
          message: "OpenAI API密钥格式不正确，应以'sk-'开头"
        };
      }
      break;
    case 'qwen':
      if (apiKey.length < 20) {
        return {
          valid: false,
          message: "通义千问API密钥长度不足"
        };
      }
      break;
    case 'deepseek':
    default:
      if (!apiKey.startsWith("sk-")) {
        return {
          valid: false,
          message: "Deepseek API密钥格式不正确，应以'sk-'开头"
        };
      }
      break;
  }
  
  if (apiKey.length < 20) {
    return {
      valid: false,
      message: "API密钥长度不足"
    };
  }
  
  return {
    valid: true,
    message: `${getModelName(modelType)}API密钥格式有效`
  };
}

/**
 * 根据模型ID获取模型名称
 * @param {string} modelType - 模型类型ID
 * @returns {string} - 模型名称
 */
export function getModelName(modelType) {
  const model = API_CONFIG.SUPPORTED_MODELS.find(m => m.id === modelType);
  return model ? model.name : 'LLM';
}

/**
 * 设置用户API密钥
 * @param {string} apiKey - API密钥
 * @param {string} modelType - 模型类型，如'deepseek', 'openai', 'qwen'
 * @param {string} apiId - 可选，特定API配置的ID
 * @returns {boolean} - 设置是否成功
 */
export function setUserApiKey(apiKey, modelType = 'deepseek', apiId = null) {
  if (typeof localStorage !== 'undefined') {
    const validation = validateApiKey(apiKey, modelType);
    if (validation.valid) {
      // 如果指定了apiId，则为特定API设置密钥
      if (apiId) {
        localStorage.setItem(`${modelType}_api_key_${apiId}`, apiKey);
      } else {
        // 否则设置通用密钥
        localStorage.setItem(`${modelType}_api_key`, apiKey);
      }
      return true;
    }
  }
  return false;
}

/**
 * 获取用户已设置的API密钥（脱敏显示）
 * @param {string} modelType - 模型类型，如'deepseek', 'openai', 'qwen'
 * @param {string} apiId - 可选，特定API配置的ID
 * @returns {string} - 脱敏的API密钥
 */
export function getMaskedApiKey(modelType = 'deepseek', apiId = null) {
  const key = apiId ? 
    localStorage.getItem(`${modelType}_api_key_${apiId}`) : 
    localStorage.getItem(`${modelType}_api_key`);
  
  if (!key || key === "your-api-key-here") {
    return "未配置";
  }
  
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

/**
 * 检查是否已设置API密钥
 * @param {string} modelType - 模型类型，如'deepseek', 'openai', 'qwen'
 * @returns {boolean} - 是否已设置有效的API密钥
 */
export function hasUserApiKey(modelType = 'deepseek') {
  if (typeof localStorage !== 'undefined') {
    const key = localStorage.getItem(`${modelType}_api_key`);
    return key && key !== "your-api-key-here";
  }
  return false;
}

/**
 * 清除所有用户设置的API密钥
 */
export function clearUserApiKeys() {
  if (typeof localStorage !== 'undefined') {
    // 清除旧的密钥格式
    localStorage.removeItem('deepseek_api_key');
    
    // 清除所有模型的密钥
    API_CONFIG.SUPPORTED_MODELS.forEach(model => {
      localStorage.removeItem(`${model.id}_api_key`);
      
      // 清除特定API的密钥
      localStorage.removeItem(`${model.id}_api_key_api2`);
      localStorage.removeItem(`${model.id}_api_key_api3`);
    });
    
    // 清除界面上的输入框
    if (typeof document !== 'undefined') {
      // Deepseek
      const deepseekInput = document.getElementById('deepseek_api_key');
      const deepseekInput2 = document.getElementById('deepseek_api_key_api2');
      const deepseekInput3 = document.getElementById('deepseek_api_key_api3');
      if (deepseekInput) deepseekInput.value = '';
      if (deepseekInput2) deepseekInput2.value = '';
      if (deepseekInput3) deepseekInput3.value = '';
      
      // OpenAI
      const openaiInput = document.getElementById('openai_api_key');
      const openaiInput2 = document.getElementById('openai_api_key_api2');
      const openaiInput3 = document.getElementById('openai_api_key_api3');
      if (openaiInput) openaiInput.value = '';
      if (openaiInput2) openaiInput2.value = '';
      if (openaiInput3) openaiInput3.value = '';
      
      // Qwen
      const qwenInput = document.getElementById('qwen_api_key');
      const qwenInput2 = document.getElementById('qwen_api_key_api2');
      const qwenInput3 = document.getElementById('qwen_api_key_api3');
      if (qwenInput) qwenInput.value = '';
      if (qwenInput2) qwenInput2.value = '';
      if (qwenInput3) qwenInput3.value = '';
      
      // 显示状态消息
      const apiKeyStatus = document.getElementById('apiKeyStatus');
      if (apiKeyStatus) {
        apiKeyStatus.textContent = 'API密钥已清除';
        apiKeyStatus.className = 'api-key-status success';
        
        // 5秒后自动清除状态消息
        setTimeout(() => {
          apiKeyStatus.textContent = '';
          apiKeyStatus.className = 'api-key-status';
        }, 5000);
      }
    }
  }
}


/**
 * API端点可用性检测系统
 */
const ApiEndpointChecker = {
  // 缓存检测结果，避免重复检测
  _cache: new Map(),
  _cacheExpiry: 5 * 60 * 1000, // 5分钟缓存

  /**
   * 检测API端点是否可用
   * @param {string} endpoint - API端点URL
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<boolean>} - 端点是否可用
   */
  async checkEndpoint(endpoint, timeout = 3000) {
    const cacheKey = endpoint;
    const cached = this._cache.get(cacheKey);
    
    // 检查缓存
    if (cached && Date.now() - cached.timestamp < this._cacheExpiry) {
      return cached.available;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(endpoint, {
        method: 'OPTIONS', // 使用OPTIONS方法进行预检
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      // 检查响应状态（404表示端点不存在，405表示方法不允许但端点存在）
      const available = response.status !== 404;
      
      // 缓存结果
      this._cache.set(cacheKey, {
        available,
        timestamp: Date.now(),
        status: response.status
      });
      
      return available;
    } catch (error) {
      // 缓存失败结果
      this._cache.set(cacheKey, {
        available: false,
        timestamp: Date.now(),
        error: error.message
      });
      
      return false;
    }
  },

  /**
   * 获取缓存的检测结果信息
   * @param {string} endpoint - API端点URL
   * @returns {object|null} - 缓存的检测信息
   */
  getCachedResult(endpoint) {
    return this._cache.get(endpoint);
  },

  /**
   * 清除检测缓存
   */
  clearCache() {
    this._cache.clear();
  }
};

// 增强的API配置状态检测
async function getApiConfigStatus() {
  const configs = API_CONFIG.getApiConfigs();
  const status = {
    // 环境信息
    environment: ENV.environmentName,
    platform: ENV.deploymentPlatform, 
    hasServerless: ENV.hasServerlessSupport,
    hostname: ENV.hostname,
    
    // API配置信息
    apiMode: ENV.isUsingApiProxy ? 'API代理模式' : '直接调用模式',
    apiUrl: configs[0].url,
    useProxy: configs[0].useProxy,
    
    // 本地配置
    localKeysEnabled: API_CONFIG.USE_LOCAL_API_KEYS,
    
    // 用户配置
    userKeysCount: 0,
    availableModels: [],
    modelStatus: {},
    
    // 系统状态
    configErrors: [],
    warnings: [],
    suggestions: []
  };

  // 检查用户已配置的密钥
  if (typeof localStorage !== 'undefined') {
    API_CONFIG.SUPPORTED_MODELS.forEach(model => {
      const hasKey = localStorage.getItem(`${model.id}_api_key`);
      if (hasKey && hasKey !== "your-api-key-here") {
        status.userKeysCount++;
        status.availableModels.push(model.name);
        status.modelStatus[model.id] = {
          name: model.name,
          hasUserKey: true,
          keyMasked: `${hasKey.substring(0, 8)}...${hasKey.substring(hasKey.length - 4)}`
        };
      } else {
        status.modelStatus[model.id] = {
          name: model.name,
          hasUserKey: false,
          keyMasked: '未配置'
        };
      }
    });
  }

  // API端点可用性检测（如果使用代理）
  if (status.useProxy && !ENV.isDevelopment) {
    try {
      const endpointResult = ApiEndpointChecker.getCachedResult(status.apiUrl);
      if (endpointResult) {
        status.endpointStatus = {
          available: endpointResult.available,
          lastChecked: new Date(endpointResult.timestamp).toLocaleTimeString(),
          status: endpointResult.status,
          error: endpointResult.error
        };
        
        if (!endpointResult.available) {
          status.configErrors.push('API代理端点不可用');
          status.suggestions.push('考虑使用直接调用模式或检查serverless函数部署');
        }
      }
    } catch (error) {
      status.warnings.push('端点状态检测失败');
    }
  }

  // 配置建议生成
  if (status.userKeysCount === 0 && ENV.isDevelopment) {
    status.suggestions.push('在开发环境中建议配置API密钥进行测试');
  }
  
  if (!status.hasServerless && !ENV.isDevelopment) {
    status.warnings.push('当前平台不支持serverless，使用直接调用模式可能存在CORS问题');
    status.suggestions.push('考虑迁移到Vercel、Netlify等支持serverless的平台');
  }

  return status;
}

// 异步显示增强的配置状态报告
async function displayConfigStatus() {
  try {
    const configStatus = await getApiConfigStatus();
    
    // 格式化状态图标
    const getStatusIcon = (available) => available ? '✅' : '❌';
    const getWarningIcon = (hasWarnings) => hasWarnings ? '⚠️' : '✅';
    
    console.log(`
🔒 智衡平台 - 增强配置状态报告
┌─────────────────────────────────────────────────────────┐
│ 🌐 运行环境: ${configStatus.environment.padEnd(25)} │
│ 🏢 部署平台: ${configStatus.platform.padEnd(25)} │  
│ 🔧 API模式: ${configStatus.apiMode.padEnd(25)} │
│ 🌐 API地址: ${configStatus.apiUrl.padEnd(25)} │
│ ⚙️  Serverless: ${(configStatus.hasServerless ? '支持' : '不支持').padEnd(23)} │
│ 🔑 本地密钥: ${(configStatus.localKeysEnabled ? '已启用' : '未启用').padEnd(23)} │
│ 👤 用户密钥: ${configStatus.userKeysCount}个模型已配置${' '.repeat(16)} │
└─────────────────────────────────────────────────────────┘

📊 模型配置状态:
${Object.values(configStatus.modelStatus).map(model => 
  `   ${model.hasUserKey ? '✅' : '⭕'} ${model.name}: ${model.keyMasked}`
).join('\n')}

${configStatus.endpointStatus ? `
🔍 API端点状态:
   状态: ${getStatusIcon(configStatus.endpointStatus.available)} ${configStatus.endpointStatus.available ? '可用' : '不可用'}
   检测时间: ${configStatus.endpointStatus.lastChecked}
   ${configStatus.endpointStatus.error ? `错误: ${configStatus.endpointStatus.error}` : ''}
` : ''}

${configStatus.configErrors.length > 0 ? `
❌ 配置错误:
${configStatus.configErrors.map(error => `   • ${error}`).join('\n')}
` : ''}

${configStatus.warnings.length > 0 ? `
⚠️ 注意事项:
${configStatus.warnings.map(warning => `   • ${warning}`).join('\n')}
` : ''}

${configStatus.suggestions.length > 0 ? `
💡 建议优化:
${configStatus.suggestions.map(suggestion => `   • ${suggestion}`).join('\n')}
` : ''}

🎯 快速指导:
${ENV.isDevelopment ? 
  '   • 开发环境: 可直接配置API密钥测试功能' : 
  '   • 生产环境: 建议使用环境变量保护API密钥安全'
}
   • 配置密钥: 主页点击"🔑 API密钥设置"
   • 多模型: 支持Deepseek、OpenAI、通义千问切换
   • 并行优化: 配置多个密钥可提升响应速度
`);

    // 导出状态到window对象供调试使用
    if (typeof window !== 'undefined') {
      window.zhihengConfigStatus = configStatus;
    }
    
  } catch (error) {
    console.error('配置状态检测失败:', error);
    console.log(`
🔒 智衡平台 - 基础状态报告
┌─────────────────────────────────────────────┐
│ 🌐 运行环境: ${ENV.environmentName.padEnd(20)} │
│ 🔧 API模式: ${ENV.isUsingApiProxy ? 'API代理模式' : '直接调用模式'.padEnd(18)} │
│ ❌ 状态检测: 失败${' '.repeat(19)} │
└─────────────────────────────────────────────┘

⚠️ 请检查控制台错误信息或手动验证配置
    `);
  }
}

// 立即显示配置状态
displayConfigStatus();

// 在开发环境中提供简单的控制方法
if (typeof window !== 'undefined') {
  window.setApiKey = setUserApiKey;
  window.clearApiKeys = clearUserApiKeys;
  
  // 改进的API密钥检查函数
  window.checkApiKey = (modelType = 'deepseek') => {
    const key = getApiKey('default', modelType);
    const validation = validateApiKey(key, modelType);
    console.log(`${getModelName(modelType)} API密钥验证结果:`, validation);
    return validation;
  };
  
  // 检查所有模型的API密钥状态
  window.checkAllApiKeys = () => {
    console.log('\n🔍 检查所有模型API密钥状态:');
    API_CONFIG.SUPPORTED_MODELS.forEach(model => {
      const key = getApiKey('default', model.id);
      const validation = validateApiKey(key, model.id);
      const status = validation.valid ? '✅' : '❌';
      console.log(`${status} ${model.name}: ${validation.message}`);
    });
  };

  // 显示当前配置状态（异步版本）
  window.showConfigStatus = async () => {
    try {
      const status = await getApiConfigStatus();
      console.table({
        '运行环境': status.environment,
        '部署平台': status.platform,
        'API模式': status.apiMode,
        'Serverless支持': status.hasServerless ? '是' : '否',
        '本地密钥': status.localKeysEnabled ? '已启用' : '未启用',
        '用户密钥数': status.userKeysCount,
        '可用模型': status.availableModels.join(', ') || '无'
      });
      
      // 详细模型状态
      console.log('\n📊 详细模型状态:');
      console.table(status.modelStatus);
      
      return status;
    } catch (error) {
      console.error('获取配置状态失败:', error);
    }
  };

  // 配置验证和诊断工具
  window.validateConfig = async () => {
    console.log('🔍 开始配置验证...\n');
    
    const issues = [];
    const suggestions = [];
    
    try {
      // 1. 环境检测
      console.log(`✅ 环境检测: ${ENV.environmentName} (${ENV.platform})`);
      
      // 2. API端点检测
      if (ENV.isUsingApiProxy && !ENV.isDevelopment) {
        console.log('🔍 检测API端点可用性...');
        const isAvailable = await ApiEndpointChecker.checkEndpoint('/api/llm');
        if (isAvailable) {
          console.log('✅ API端点可用');
        } else {
          console.log('❌ API端点不可用');
          issues.push('API代理端点不可用');
          suggestions.push('检查serverless函数部署状态');
        }
      }
      
      // 3. API密钥验证
      console.log('\n🔑 验证API密钥配置:');
      let hasValidKey = false;
      for (const model of API_CONFIG.SUPPORTED_MODELS) {
        const key = getApiKey('default', model.id);
        const validation = validateApiKey(key, model.id);
        console.log(`   ${validation.valid ? '✅' : '❌'} ${model.name}: ${validation.message}`);
        if (validation.valid) hasValidKey = true;
      }
      
      if (!hasValidKey) {
        issues.push('没有配置有效的API密钥');
        suggestions.push('在主页点击"API密钥设置"配置密钥');
      }
      
      // 4. 浏览器兼容性检测
      console.log('\n🌐 浏览器兼容性检测:');
      const features = {
        'fetch API': typeof fetch !== 'undefined',
        'localStorage': typeof localStorage !== 'undefined',
        'AbortController': typeof AbortController !== 'undefined',
        'ES6 Modules': typeof Symbol !== 'undefined'
      };
      
      Object.entries(features).forEach(([feature, supported]) => {
        console.log(`   ${supported ? '✅' : '❌'} ${feature}`);
        if (!supported) {
          issues.push(`浏览器不支持${feature}`);
          suggestions.push('升级到现代浏览器版本');
        }
      });
      
      // 5. 生成诊断报告
      console.log('\n📋 诊断报告:');
      if (issues.length === 0) {
        console.log('✅ 配置正常，所有检查都通过！');
      } else {
        console.log(`❌ 发现 ${issues.length} 个问题:`);
        issues.forEach(issue => console.log(`   • ${issue}`));
        
        console.log('\n💡 建议解决方案:');
        suggestions.forEach(suggestion => console.log(`   • ${suggestion}`));
      }
      
      return { issues, suggestions, valid: issues.length === 0 };
      
    } catch (error) {
      console.error('配置验证失败:', error);
      return { issues: ['验证过程失败'], suggestions: ['检查控制台错误信息'], valid: false };
    }
  };

  // 故障排除助手
  window.troubleshoot = async () => {
    console.log('🔧 智衡平台故障排除助手\n');
    
    // 获取配置状态
    const status = await getApiConfigStatus();
    
    console.log('1️⃣ 环境信息:');
    console.log(`   运行环境: ${status.environment}`);
    console.log(`   部署平台: ${status.platform}`);
    console.log(`   API模式: ${status.apiMode}`);
    console.log(`   API地址: ${status.apiUrl}`);
    
    console.log('\n2️⃣ 常见问题排查:');
    
    // 405错误排查
    if (!ENV.isDevelopment && ENV.isUsingApiProxy) {
      console.log('🔍 检查405错误...');
      const endpointExists = await ApiEndpointChecker.checkEndpoint('/api/llm');
      if (!endpointExists) {
        console.log('❌ 原因: API端点不存在');
        console.log('💡 解决方案:');
        console.log('   • 确认已部署到Vercel等支持serverless的平台');
        console.log('   • 检查vercel.json配置文件');
        console.log('   • 临时解决: API_CONFIG.enableDirectMode()');
      }
    }
    
    // API密钥问题排查
    console.log('\n🔍 检查API密钥问题...');
    const hasKeys = status.userKeysCount > 0;
    if (!hasKeys) {
      console.log('❌ 原因: 未配置API密钥');
      console.log('💡 解决方案:');
      console.log('   • 访问主页点击"API密钥设置"');
      console.log('   • 或控制台执行: setApiKey("sk-your-key", "deepseek")');
    }
    
    // CORS问题排查
    if (!ENV.hasServerlessSupport && !ENV.isDevelopment) {
      console.log('\n🔍 检查CORS问题...');
      console.log('⚠️ 当前平台不支持serverless，可能遇到CORS限制');
      console.log('💡 解决方案:');
      console.log('   • 迁移到Vercel、Netlify等平台');
      console.log('   • 或使用支持CORS的API代理服务');
    }
    
    console.log('\n3️⃣ 一键修复选项:');
    console.log('   • API_CONFIG.enableDirectMode() - 切换到直接调用模式');
    console.log('   • clearApiKeys() - 清除所有API密钥重新配置');
    console.log('   • validateConfig() - 运行完整配置验证');
    
    return status;
  };

  // 一键健康检查
  window.healthCheck = async () => {
    console.log('🏥 智衡平台健康检查\n');
    
    const results = {
      environment: '✅ 正常',
      apiEndpoint: '待检查',
      apiKeys: '待检查',
      browser: '✅ 正常',
      overall: '检查中...'
    };
    
    try {
      // 检查API端点
      if (ENV.isUsingApiProxy && !ENV.isDevelopment) {
        const endpointOk = await ApiEndpointChecker.checkEndpoint('/api/llm');
        results.apiEndpoint = endpointOk ? '✅ 正常' : '❌ 异常';
      } else {
        results.apiEndpoint = '⭕ 跳过';
      }
      
      // 检查API密钥
      const status = await getApiConfigStatus();
      results.apiKeys = status.userKeysCount > 0 ? '✅ 已配置' : '⚠️ 未配置';
      
      // 总体状态
      const hasIssues = Object.values(results).some(r => r.includes('❌'));
      results.overall = hasIssues ? '⚠️ 发现问题' : '✅ 状态良好';
      
      console.table(results);
      
      if (hasIssues) {
        console.log('\n🔧 建议运行 troubleshoot() 获取详细解决方案');
      }
      
      return results;
      
    } catch (error) {
      console.error('健康检查失败:', error);
      return { ...results, overall: '❌ 检查失败' };
    }
  };
  
  console.log(`
🛠️ 智衡平台开发工具已加载：

📊 状态查询:
   showConfigStatus()     - 显示详细配置状态
   healthCheck()          - 快速健康检查
   validateConfig()       - 完整配置验证

🔧 故障排除:
   troubleshoot()         - 智能故障排除助手
   checkApiKey(model)     - 检查指定模型API密钥
   checkAllApiKeys()      - 检查所有模型API密钥

⚙️ 配置管理:
   setApiKey(key, model, apiId) - 设置API密钥
   clearApiKeys()         - 清除所有API密钥
   API_CONFIG.enableDirectMode() - 启用直接调用模式

💡 快速示例:
   healthCheck()          - 一键健康检查
   setApiKey('sk-xxx', 'deepseek') - 配置Deepseek密钥
   troubleshoot()         - 遇到问题时运行
  `);
}