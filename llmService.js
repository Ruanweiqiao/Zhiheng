/**
 * LLM服务 - 简化版推荐系统
 * 实现简化的推荐流程：规则匹配 → 平均分检查 → 条件LLM补充 → 语义分析 → 最终评分
 */

// =============== 导入和配置 ===============
import { API_CONFIG, getApiKey } from './config.js';
import { 
  userNeedsAnalysisPrompt, 
  dataAnalysisPrompt, 
  methodRecommendationPrompt,
  ruleBasedMatchingPrompt,
  semanticAnalysisPrompt,
  llmMethodRuleScoringPrompt,
  llmMethodDetailGenerationPrompt,
  personalizedImplementationPrompt
} from './agent-prompts.js';

// =============== 核心配置常量 ===============
const AVERAGE_SCORE_THRESHOLD = 9.0; // 平均分阈值
const FINAL_SCORING_WEIGHTS = {
  RULE_WEIGHT: 0.6,
  SEMANTIC_WEIGHT: 0.4
};

// =============== 工具函数 ===============

/**
 * 增强的JSON解析函数
 * 支持多种格式的LLM响应解析
 */
function parseJsonFromLLMResponse(text) {
  if (!text || typeof text !== 'string') {
    console.error('❌ JSON解析失败: 输入文本无效');
    return null;
  }

  console.log('📝 尝试解析LLM响应...');
  console.log('📄 原始响应文本:');
  console.log('---开始---');
  console.log(text);
  console.log('---结束---');
  console.log(`📊 文本长度: ${text.length} 字符`);

  // 策略1: 基础清理
  function basicClean(str) {
    return str.trim()
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/i, '');
  }

  // 策略2: 正则表达式提取JSON块
  function extractJsonBlock(str) {
    // 尝试匹配 { ... } 或 [ ... ] 结构
    const jsonPattern = /(\{[\s\S]*\}|\[[\s\S]*\])/;
    const match = str.match(jsonPattern);
    return match ? match[1] : str;
  }

  // 策略3: 移除前后的非JSON文本
  function removeNonJsonText(str) {
    // 找到第一个 { 或 [ 和最后一个 } 或 ]
    const firstBrace = Math.min(
      str.indexOf('{') !== -1 ? str.indexOf('{') : Infinity,
      str.indexOf('[') !== -1 ? str.indexOf('[') : Infinity
    );
    
    const lastBrace = Math.max(
      str.lastIndexOf('}'),
      str.lastIndexOf(']')
    );

    if (firstBrace !== Infinity && lastBrace !== -1 && firstBrace <= lastBrace) {
      return str.substring(firstBrace, lastBrace + 1);
    }
    return str;
  }

  // 策略4: 清理常见的非JSON字符
  function cleanCommonIssues(str) {
    return str
      .replace(/^\s*(?:Here's|这是|以下是).*?[:：]\s*/i, '') // 移除介绍性文字
      .replace(/\s*(?:希望|Hope|This).*$/i, '') // 移除结尾说明
      .replace(/\n\s*\n/g, '\n') // 移除多余空行
      .replace(/([,}\]])\s*\n\s*([,}\]])/g, '$1$2') // 修复换行导致的格式问题
      .trim();
  }

  // 策略5: 处理不完整的JSON
  function fixIncompleteJson(str) {
    // 检查是否有未闭合的括号
    let openBraces = 0;
    let openBrackets = 0;
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') openBraces++;
      else if (str[i] === '}') openBraces--;
      else if (str[i] === '[') openBrackets++;
      else if (str[i] === ']') openBrackets--;
    }
    
    // 添加缺失的闭合括号
    let result = str;
    while (openBraces > 0) {
      result += '}';
      openBraces--;
    }
    while (openBrackets > 0) {
      result += ']';
      openBrackets--;
    }
    
    return result;
  }

  // 策略6: 处理截断的JSON
  function handleTruncatedJson(str) {
    // 如果JSON被截断，尝试找到最后一个完整的属性
    const lastValidPos = str.lastIndexOf('",');
    if (lastValidPos > str.length / 2) {
      return str.substring(0, lastValidPos) + '"}';
    }
    return str;
  }

  // 策略7: 处理多余的逗号
  function fixTrailingCommas(str) {
    return str
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/}\s*,\s*}/g, '}}')
      .replace(/]\s*,\s*}/g, ']}');
  }

  // 策略8: 尝试构建最小可用JSON
  function buildMinimalJson(str) {
    // 如果所有策略都失败，尝试从响应中提取关键信息构建一个最小的JSON
    try {
      // 尝试提取taskDimension
      const taskDimMatch = str.match(/taskDimension[^{]*({[^}]*})/);
      const taskDim = taskDimMatch ? taskDimMatch[1] : '{}';
      
      // 尝试提取dataDimension
      const dataDimMatch = str.match(/dataDimension[^{]*({[^}]*})/);
      const dataDim = dataDimMatch ? dataDimMatch[1] : '{}';
      
      // 尝试提取userDimension
      const userDimMatch = str.match(/userDimension[^{]*({[^}]*})/);
      const userDim = userDimMatch ? userDimMatch[1] : '{}';
      
      // 尝试提取environmentDimension
      const envDimMatch = str.match(/environmentDimension[^{]*({[^}]*})/);
      const envDim = envDimMatch ? envDimMatch[1] : '{}';
      
      // 构建一个最小的JSON
      return `{
        "taskDimension": ${taskDim},
        "dataDimension": ${dataDim},
        "userDimension": ${userDim},
        "environmentDimension": ${envDim}
      }`;
    } catch (e) {
      console.error('构建最小JSON失败:', e);
      return str;
    }
  }

  const strategies = [
    (text) => basicClean(text),
    (text) => basicClean(extractJsonBlock(text)),
    (text) => basicClean(removeNonJsonText(text)),
    (text) => cleanCommonIssues(basicClean(text)),
    (text) => cleanCommonIssues(extractJsonBlock(text)),
    (text) => cleanCommonIssues(removeNonJsonText(text)),
    (text) => fixIncompleteJson(cleanCommonIssues(basicClean(text))),
    (text) => handleTruncatedJson(cleanCommonIssues(basicClean(text))),
    (text) => fixTrailingCommas(cleanCommonIssues(basicClean(text))),
    (text) => buildMinimalJson(text)
  ];

  // 尝试每种策略
  for (let i = 0; i < strategies.length; i++) {
    try {
      const cleanedText = strategies[i](text);
      console.log(`📝 JSON解析策略 ${i + 1}: 尝试解析长度为 ${cleanedText.length} 的文本`);
      console.log(`📝 策略 ${i + 1} 处理后的文本: ${cleanedText.substring(0, 100)}...`);
      
      const result = JSON.parse(cleanedText);
      console.log(`✅ JSON解析成功: 使用策略 ${i + 1}`);
      return result;
    } catch (error) {
      console.log(`❌ JSON解析策略 ${i + 1} 失败: ${error.message}`);
      continue;
    }
  }

  // 所有策略都失败，尝试创建一个模拟响应
  console.error('❌ 所有JSON解析策略都失败，创建模拟响应');
  
  // 从文本中提取关键信息
  const domainMatch = text.match(/domain["\s:]+([^"',}\n]+)/);
  const domain = domainMatch ? domainMatch[1].trim() : '未知领域';
  
  const purposeMatch = text.match(/purpose["\s:]+([^"',}\n]+)/);
  const purpose = purposeMatch ? purposeMatch[1].trim() : '综合评价';
  
  const complexityMatch = text.match(/complexity["\s:]+([^"',}\n]+)/);
  const complexity = complexityMatch ? complexityMatch[1].trim() : '中';
  
  // 创建一个基本的模拟响应
  return {
    taskDimension: {
      domain: domain,
      purpose: purpose,
      evaluationNature: "描述性",
      complexity: complexity,
      applicationScope: "内部管理"
    },
    dataDimension: {
      indicatorCount: "中等",
      variableType: "混合",
      dataQualityIssues: []
    },
    userDimension: {
      precision: "中",
      methodPreference: "无偏好",
      knowledgeLevel: "中级",
      riskTolerance: "中",
      specialRequirements: []
    },
    environmentDimension: {
      expertiseLevel: "有限",
      timeConstraint: "适中",
      computingResource: "基础",
      environmentConstraints: []
    },
    requirements: {
      objectivity: 7,
      interpretability: 8,
      efficiency: 6,
      stability: 7
    },
    constraints: ["时间有限", "专家资源有限"],
    priorities: ["可解释性", "准确性"],
    _isMockResponse: true
  };
}

/**
 * 过滤方法信息，移除数学模型和计算示例
 * 用于减少提示词长度
 */
function filterMethodsForPrompt(methods) {
  return methods.map(method => {
    // 创建方法的浅拷贝
    const filteredMethod = { ...method };
    
    // 删除数学模型和计算示例字段
    delete filteredMethod.mathematicalModel;
    delete filteredMethod.calculationExample;
    
    // 如果有实现步骤，保留前3步
    if (filteredMethod.implementationSteps && filteredMethod.implementationSteps.length > 3) {
      filteredMethod.implementationSteps = filteredMethod.implementationSteps.slice(0, 3);
      filteredMethod.implementationSteps.push("...(更多步骤已省略)");
    }
    
    // 如果有优势/局限性，保留前3项
    if (filteredMethod.advantages && filteredMethod.advantages.length > 3) {
      filteredMethod.advantages = filteredMethod.advantages.slice(0, 3);
      filteredMethod.advantages.push("...(更多优势已省略)");
    }
    
    if (filteredMethod.limitations && filteredMethod.limitations.length > 3) {
      filteredMethod.limitations = filteredMethod.limitations.slice(0, 3);
      filteredMethod.limitations.push("...(更多局限性已省略)");
    }
    
    return filteredMethod;
  });
}

/**
 * 增强的LLM API调用函数
 * 包含详细的错误处理和日志记录
 */
async function callLLMAPI(prompt, temperature = 0.3, apiConfig = null) {
  if (!API_CONFIG.USE_LLM) {
    throw new Error('LLM服务未启用');
  }

  // 使用提供的API配置或默认配置
  const config = apiConfig || {
    url: API_CONFIG.API_URL,
    id: 'default',
    model: API_CONFIG.MODEL,
    temperature: temperature,
    max_tokens: API_CONFIG.MAX_TOKENS
  };
  
  // 获取当前使用的模型类型
  const modelType = localStorage.getItem('current_model_type') || API_CONFIG.DEFAULT_MODEL;
  
  // 获取API密钥 - 从用户设置、本地配置或环境变量
  const apiKey = getApiKey(config.id || 'default', modelType);

  // 确定是使用API代理还是直接调用
  const isUsingProxy = config.url.startsWith('/api/');
  
  // 构建请求数据
  let requestBody;
  
  if (isUsingProxy) {
    // 使用API代理时，确保请求格式正确
    requestBody = {
      prompt: String(prompt), // 确保是字符串
      temperature: config.temperature || temperature,
      apiId: config.id,
      userApiKey: apiKey,
      modelType: modelType,
      max_tokens: config.max_tokens || API_CONFIG.MAX_TOKENS
    };
  } else {
    // 直接调用API时，构建标准的消息格式
    requestBody = {
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: config.temperature || temperature,
      max_tokens: config.max_tokens || API_CONFIG.MAX_TOKENS
    };
  }
  
  // 构建请求选项
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };
  
  // 如果是直接调用API，添加Authorization头
  if (!isUsingProxy && apiKey) {
    requestOptions.headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  // 添加请求体
  // requestOptions.body = JSON.stringify(requestBody);

  console.log('🌐 发送API请求:', {
    url: config.url,
    model: config.model,
    modelType: modelType,
    temperature: config.temperature || temperature,
    max_tokens: config.max_tokens || API_CONFIG.MAX_TOKENS,
    apiId: config.id || 'default',
    promptLength: prompt.length,
    isUsingProxy: isUsingProxy
  });

  try {
    const response = await fetch(config.url, requestOptions);
    
    console.log(`📡 API响应状态: ${response.status} ${response.statusText} (API: ${config.id || 'default'}, 模型: ${modelType})`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败详情:');
      console.error(`状态码: ${response.status}`);
      console.error(`状态信息: ${response.statusText}`);
      console.error(`错误响应: ${errorText}`);
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // 检查响应结构
    console.log('📨 API响应数据结构:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content,
      hasText: !!data.text,
      contentLength: data.choices?.[0]?.message?.content?.length || data.text?.length || 0,
      apiId: config.id || 'default',
      modelType: modelType
    });

    // 处理不同格式的响应
    let content;
    
    // 首先尝试从OpenAI格式的响应获取内容
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      content = data.choices[0].message.content;
    }
    // 然后尝试从text字段获取内容
    else if (data.text) {
      content = data.text;
    }
    // 如果以上都失败，尝试直接使用整个响应
    else {
      console.error('❌ 无法从API响应中提取内容:', data);
      throw new Error('API响应格式不正确');
    }

    console.log(`✅ API调用成功 (API: ${config.id || 'default'}, 模型: ${modelType})，返回内容长度:`, content.length);
    console.log('📄 API返回内容预览 (前200字符):', content.substring(0, 200) + '...');
    
    return content;
  } catch (error) {
    console.error(`❌ API调用过程中发生错误 (API: ${config.id || 'default'}, 模型: ${modelType}):`, error);
    console.error('🔍 请求详情:');
    console.error('- URL:', config.url);
    console.error('- Model:', config.model);
    console.error('- ModelType:', modelType);
    console.error('- Temperature:', config.temperature || temperature);
    console.error('- Max tokens:', config.max_tokens || API_CONFIG.MAX_TOKENS);
    console.error('- Prompt length:', prompt.length);
    console.error('- API Key (masked):', apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set');
    throw error;
  }
}

/**
 * 计算平均分
 */
function calculateAverageScore(results) {
  if (!results || results.length === 0) return 0;
  
  const totalScore = results.reduce((sum, result) => sum + (result.totalRuleScore || 0), 0);
  return totalScore / results.length;
}

// =============== 核心推荐函数 ===============

/**
 * 生成用户需求分析的备用数据
 */
function generateMockUserNeedsAnalysis(questionnaireData) {
  console.log('🎭 生成用户需求分析的mock数据...');
  
  // 基于问卷数据生成合理的分析结果
  const domain = questionnaireData.domain || '综合评价';
  const purpose = questionnaireData.purpose || '对多个选项进行排序/筛选';
  const precision = questionnaireData.precision || '中';
  const methodPreference = questionnaireData.methodPreference || '无偏好';
  
  return {
    taskDimension: {
      domain: domain,
      purpose: purpose,
      complexity: questionnaireData.complexity || '中',
      evaluationNature: questionnaireData.evaluationNature || '描述性',
      structure: questionnaireData.structure || '单层',
      precision: precision,
      riskTolerance: questionnaireData.riskTolerance || '中'
    },
    dataDimension: {
      dataTypes: questionnaireData.dataType || ['原始指标数据'],
      indicatorCount: questionnaireData.indicatorCount || '中等',
      variableType: questionnaireData.variableType || '定量',
      dataQuality: questionnaireData.dataQualityIssues || ['数据质量良好'],
      expectedSampleSize: '适中'
    },
    userDimension: {
      knowledgeLevel: questionnaireData.knowledgeLevel || '中级',
      methodPreference: methodPreference,
      specialRequirements: questionnaireData.specialRequirements || [],
      supplementaryText: questionnaireData.supplementaryText || ''
    },
    environmentDimension: {
      timeConstraint: questionnaireData.timeConstraint || '适中',
      computingResource: questionnaireData.computingResource || '专业',
      experts: questionnaireData.experts || '有限',
      application: questionnaireData.application || '学术研究发表',
      environmentConstraints: questionnaireData.environmentConstraints || []
    },
    analysisConfidence: 0.8,
    recommendationContext: `基于用户的${domain}领域需求，推荐适合的权重确定方法`
  };
}

/**
 * 用户需求分析 - 增强版
 */
export async function analyzeUserNeeds(questionnaireData) {
  console.log('🔍 开始用户需求分析...');
  
  try {
    // 验证问卷数据
    if (!questionnaireData || Object.keys(questionnaireData).length === 0) {
      console.warn('⚠️ 问卷数据为空或未定义，使用默认数据');
      questionnaireData = {
        domain: "综合评价",
        purpose: "对多个选项进行排序/筛选",
        evaluationNature: "描述性",
        complexity: "中",
        precision: "中",
        riskTolerance: "中",
        methodPreference: "无偏好",
        knowledgeLevel: "中级",
        timeConstraint: "适中",
        computingResource: "基础",
        experts: "有限"
      };
    }
    
    // 记录问卷数据
    console.log('📋 问卷数据:', JSON.stringify(questionnaireData, null, 2));
    
    // 构建提示词
    const prompt = userNeedsAnalysisPrompt.replace('{{questionnaireData}}', JSON.stringify(questionnaireData, null, 2));
    
    // 调用LLM API
    console.log('🔄 调用LLM API进行用户需求分析...');
    const response = await callLLMAPI(prompt, 0.2);
    
    // 解析响应
    console.log('🔄 解析LLM响应...');
    const result = parseJsonFromLLMResponse(response);
    
    // 验证结果
    if (!result) {
      console.warn('⚠️ LLM分析失败，使用备用方案');
      return generateMockUserNeedsAnalysis(questionnaireData);
    }
    
    // 验证结果结构
    if (!result.taskDimension || !result.userDimension) {
      console.warn('⚠️ LLM返回的结果结构不完整，使用备用方案');
      return generateMockUserNeedsAnalysis(questionnaireData);
    }
    
    // 检查是否是模拟响应
    if (result._isMockResponse) {
      console.warn('⚠️ 使用了模拟响应，可能不准确');
    }
    
    console.log('✅ 用户需求分析完成');
          return result;
  } catch (error) {
    console.error('❌ 用户需求分析失败:', error.message);
    console.log('🔄 启用备用方案...');
    
    try {
      const mockResult = generateMockUserNeedsAnalysis(questionnaireData);
      console.log('✅ 用户需求分析完成 (备用方案)');
      return mockResult;
    } catch (mockError) {
      console.error('❌ 备用方案也失败:', mockError.message);
      
      // 最终回退方案：返回一个最小的有效结果
      return {
        taskDimension: {
          domain: "未知领域",
          purpose: "综合评价",
          evaluationNature: "描述性",
          complexity: "中",
          applicationScope: "内部管理"
        },
        dataDimension: {
          indicatorCount: "中等",
          variableType: "混合",
          dataQualityIssues: []
        },
        userDimension: {
          precision: "中",
          methodPreference: "无偏好",
          knowledgeLevel: "中级",
          riskTolerance: "中",
          specialRequirements: []
        },
        environmentDimension: {
          expertiseLevel: "有限",
          timeConstraint: "适中",
          computingResource: "基础",
          environmentConstraints: []
        },
        _isFallbackResponse: true
      };
    }
  }
}

/**
 * 生成数据特征分析的备用数据
 */
function generateMockDataFeaturesAnalysis(dataFeatures) {
  console.log('🎭 生成数据特征分析的mock数据...');
  
  return {
    dataStructure: {
      indicatorCount: dataFeatures.indicatorCount || 12,
      sampleSize: dataFeatures.sampleSize || 100,
      dimensions: dataFeatures.dimensions || 3,
      hierarchyLevels: dataFeatures.hierarchyLevels || 1
    },
    dataQuality: {
      completeness: dataFeatures.completeness || 0.95,
      consistency: dataFeatures.consistency || 0.90,
      accuracy: dataFeatures.accuracy || 0.92,
      outlierRate: dataFeatures.outlierRate || 0.05
    },
    dataDistribution: {
      skewness: dataFeatures.skewness || 'normal',
      correlation: dataFeatures.correlation || 'moderate',
      variability: dataFeatures.variability || 'medium'
    },
    technicalRequirements: {
      computationComplexity: 'medium',
      storageRequirements: 'standard',
      processingTime: 'reasonable'
    },
    analysisConfidence: 0.85,
    dataReadiness: 'good'
  };
}

/**
 * 数据特征分析 - 增强版
 */
export async function analyzeDataFeatures(dataFeatures) {
  console.log('📊 开始数据特征分析...');
  
  try {
    const prompt = dataAnalysisPrompt.replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2));
    const response = await callLLMAPI(prompt, 0.2);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result) {
      console.warn('⚠️ LLM分析失败，使用备用方案');
      return generateMockDataFeaturesAnalysis(dataFeatures);
    }
    
    console.log('✅ 数据特征分析完成 (LLM)');
    return result;
  } catch (error) {
    console.error('❌ 数据特征分析失败:', error.message);
    console.log('🔄 启用备用方案...');
    
    try {
      const mockResult = generateMockDataFeaturesAnalysis(dataFeatures);
      console.log('✅ 数据特征分析完成 (备用方案)');
      return mockResult;
    } catch (mockError) {
      console.error('❌ 备用方案也失败:', mockError.message);
      throw new Error('数据特征分析完全失败，请检查输入数据');
    }
  }
}

/**
 * 规则匹配评分
 */
export async function performRuleMatching(userNeeds, dataFeatures, weightMethods) {
  console.log('⚖️ 开始规则匹配评分...');
  
  try {
      const prompt = ruleBasedMatchingPrompt
    .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
    .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
      .replace('{{weightMethods}}', JSON.stringify(weightMethods, null, 2));
    
    const response = await callLLMAPI(prompt, 0.3);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result || !result.ruleScoringResults) {
      throw new Error('规则匹配结果解析失败');
    }
    
    // 按总分排序，取前3名
    const sortedResults = result.ruleScoringResults
      .sort((a, b) => (b.totalRuleScore || 0) - (a.totalRuleScore || 0))
      .slice(0, 3);
    
    const averageScore = calculateAverageScore(sortedResults);
    
    console.log(`✅ 规则匹配完成，前3名平均分: ${averageScore.toFixed(2)}`);
    
      return {
      ruleScoringResults: sortedResults,
      topCandidates: sortedResults.map(r => r.methodName),
      averageScore: averageScore,
      needsLLMSupplement: averageScore <= AVERAGE_SCORE_THRESHOLD
    };
  } catch (error) {
    console.error('❌ 规则匹配失败:', error.message);
    throw error;
  }
}

/**
 * LLM方法补充推荐（条件触发）
 */
export async function performLLMSupplement(userNeeds, dataFeatures, weightMethodNames) {
  console.log('🤖 开始LLM方法补充推荐...');
  
  try {
    const prompt = methodRecommendationPrompt
      .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
      .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
      .replace('{{weightMethodNames}}', JSON.stringify(weightMethodNames, null, 2));
    
    const response = await callLLMAPI(prompt, 0.7);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result || !result.recommendations) {
      throw new Error('LLM方法推荐结果解析失败');
    }
    
    // 对LLM推荐的方法进行规则评分
    const llmRuleScoring = await performLLMMethodRuleScoring(result.recommendations, userNeeds, dataFeatures);
    
    console.log(`✅ LLM方法补充完成，推荐 ${result.recommendations.length} 个创新方法`);
    
    return {
      recommendations: result.recommendations,
      ruleScoringResults: llmRuleScoring.ruleScoringResults
    };
    } catch (error) {
    console.error('❌ LLM方法补充失败:', error.message);
    throw error;
  }
}

/**
 * LLM方法规则评分
 */
async function performLLMMethodRuleScoring(llmMethods, userNeeds, dataFeatures) {
  console.log('📏 对LLM推荐方法进行规则评分...');
  
  try {
    const prompt = llmMethodRuleScoringPrompt
      .replace('{{llmMethods}}', JSON.stringify(llmMethods, null, 2))
      .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
      .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2));
    
    const response = await callLLMAPI(prompt, 0.3);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result || !result.ruleScoringResults) {
      throw new Error('LLM方法规则评分结果解析失败');
    }
    
    console.log('✅ LLM方法规则评分完成');
    return result;
  } catch (error) {
    console.error('❌ LLM方法规则评分失败:', error.message);
    throw error;
  }
}

/**
 * 语义分析
 */
export async function performSemanticAnalysis(candidateMethods, userNeeds, dataFeatures, weightMethods) {
  console.log('🧠 开始语义分析...');
  
  try {
    const semanticResults = [];
    
    for (const methodName of candidateMethods) {
      // 查找方法详情
      const methodInfo = weightMethods.find(m => m.name === methodName);
      if (!methodInfo) {
        console.warn(`⚠️ 未找到方法详情: ${methodName}`);
        continue;
      }
      
      // 构建问题画像
      const problemProfile = {
        taskDimension: userNeeds.taskDimension,
        dataDimension: userNeeds.dataDimension || dataFeatures?.dataStructure,
        userDimension: userNeeds.userDimension,
        environmentDimension: userNeeds.environmentDimension
      };
      
      const prompt = semanticAnalysisPrompt
        .replace(/\{\{P\.taskDimension\.domain\}\}/g, problemProfile.taskDimension?.domain || '')
        .replace(/\{\{P\.taskDimension\.evaluationNature\}\}/g, problemProfile.taskDimension?.evaluationNature || '')
        .replace(/\{\{P\.taskDimension\.complexity\}\}/g, problemProfile.taskDimension?.complexity || '')
        .replace(/\{\{P\.taskDimension\.applicationScope\}\}/g, problemProfile.taskDimension?.applicationScope || '')
        .replace(/\{\{P\.dataDimension\.indicatorCount\}\}/g, problemProfile.dataDimension?.indicatorCount || '')
        .replace(/\{\{P\.dataDimension\.variableType\}\}/g, problemProfile.dataDimension?.variableType || '')
        .replace(/\{\{P\.dataDimension\.dataQualityIssues\}\}/g, JSON.stringify(problemProfile.dataDimension?.dataQualityIssues || []))
        .replace(/\{\{P\.userDimension\.precision\}\}/g, problemProfile.userDimension?.precision || '')
        .replace(/\{\{P\.userDimension\.structure\}\}/g, problemProfile.userDimension?.structure || '')
        .replace(/\{\{P\.userDimension\.relation\}\}/g, problemProfile.userDimension?.relation || '')
        .replace(/\{\{P\.userDimension\.methodPreference\}\}/g, problemProfile.userDimension?.methodPreference || '')
        .replace(/\{\{P\.userDimension\.knowledgeLevel\}\}/g, problemProfile.userDimension?.knowledgeLevel || '')
        .replace(/\{\{P\.userDimension\.riskTolerance\}\}/g, problemProfile.userDimension?.riskTolerance || '')
        .replace(/\{\{P\.userDimension\.specialRequirements\}\}/g, JSON.stringify(problemProfile.userDimension?.specialRequirements || []))
        .replace(/\{\{P\.userDimension\.supplementaryInsights\}\}/g, JSON.stringify(problemProfile.userDimension?.supplementaryInsights || []))
        .replace(/\{\{P\.environmentDimension\.expertiseLevel\}\}/g, problemProfile.environmentDimension?.expertiseLevel || '')
        .replace(/\{\{P\.environmentDimension\.timeConstraint\}\}/g, problemProfile.environmentDimension?.timeConstraint || '')
        .replace(/\{\{P\.environmentDimension\.computingResource\}\}/g, problemProfile.environmentDimension?.computingResource || '')
        .replace(/\{\{P\.environmentDimension\.environmentConstraints\}\}/g, JSON.stringify(problemProfile.environmentDimension?.environmentConstraints || []))
        .replace(/\{\{M\.name\}\}/g, methodInfo.name || '')
        .replace(/\{\{M\.type\}\}/g, methodInfo.type || '')
        .replace(/\{\{M\.detail\}\}/g, methodInfo.detail || '')
        .replace(/\{\{M\.suitConditions\}\}/g, JSON.stringify(methodInfo.suitConditions || []))
        .replace(/\{\{M\.advantages\}\}/g, JSON.stringify(methodInfo.advantages || []))
        .replace(/\{\{M\.limitations\}\}/g, JSON.stringify(methodInfo.limitations || []))
        .replace(/\{\{M\.implementationSteps\}\}/g, JSON.stringify(methodInfo.implementationSteps || []));
      
      const response = await callLLMAPI(prompt, 0.4);
      const result = parseJsonFromLLMResponse(response);
      
      if (result) {
        semanticResults.push({
          methodName: methodName,
          semanticMatchScore: result.semanticMatchScore || 0,
          matchExplanation: result.matchExplanation || '',
          advantages: result.advantages || [],
          risks: result.risks || [],
          implementationAdvice: result.implementationAdvice || [],
          suitabilityLevel: result.suitabilityLevel || '中'
        });
      }
    }
    
    console.log(`✅ 语义分析完成，分析了 ${semanticResults.length} 个方法`);
      return semanticResults;
  } catch (error) {
    console.error('❌ 语义分析失败:', error.message);
    throw error;
  }
}

/**
 * 生成最终推荐结果
 */
export async function generateFinalRecommendation(ruleResults, semanticResults, llmResults = null, personalizedImplementations = [], llmMethodDetails = []) {
  console.log('🎯 开始生成最终推荐结果...');
  
  try {
    const finalResults = [];
    
    // 合并规则匹配和语义分析结果
    for (const ruleResult of ruleResults) {
      const semanticResult = semanticResults.find(s => s.methodName === ruleResult.methodName);
      if (!semanticResult) continue;
      
      // 查找对应的个性化实施建议
      const personalizedImpl = personalizedImplementations.find(p => p.methodName === ruleResult.methodName);
      
      // 查找对应的LLM方法详情
      const methodDetail = llmMethodDetails.find(d => d.methodName === ruleResult.methodName);
      
      // 计算最终评分：0.6 × 规则分 + 0.4 × 语义分
      const finalScore = (ruleResult.totalRuleScore || 0) * FINAL_SCORING_WEIGHTS.RULE_WEIGHT + 
                        (semanticResult.semanticMatchScore || 0) * FINAL_SCORING_WEIGHTS.SEMANTIC_WEIGHT;
      
      // 判断方法来源 - 改进LLM方法检测逻辑
      let isLLMMethod = false;
      if (llmResults && llmResults.recommendations) {
        // 检查方法名是否在LLM推荐列表中
        isLLMMethod = llmResults.recommendations.some(r => 
          r.method === ruleResult.methodName || 
          r.methodName === ruleResult.methodName
        );
        
        // 如果还未找到，检查LLM方法详情
        if (!isLLMMethod && llmMethodDetails && llmMethodDetails.length > 0) {
          isLLMMethod = llmMethodDetails.some(d => d.methodName === ruleResult.methodName);
        }
        
        console.log(`📊 方法来源检测 - ${ruleResult.methodName}: ${isLLMMethod ? 'LLM推荐' : '数据库方法'}`);
      }
      
      finalResults.push({
        method: ruleResult.methodName, // 使用method作为标准键名
        methodName: ruleResult.methodName,
        ruleScore: ruleResult.totalRuleScore || 0,
        semanticScore: semanticResult.semanticMatchScore || 0,
        finalScore: finalScore,
        methodSource: isLLMMethod ? 'LLM推荐' : '数据库方法',
        ruleAnalysis: ruleResult,
        semanticAnalysis: semanticResult,
        personalizedImplementation: personalizedImpl ? personalizedImpl.personalizedImplementation : null,
        llmMethodDetails: methodDetail ? methodDetail.detail : null,
    scores: {
          ruleScore: ruleResult.totalRuleScore || 0,
          semanticScore: semanticResult.semanticMatchScore || 0,
          hybridScore: finalScore
        },
        dimensionalScores: ruleResult.dimensionalScores || {
          taskDimensionMatch: 0,
          dataDimensionMatch: 0,
          userDimensionMatch: 0,
          environmentDimensionMatch: 0
        },
        reason: ruleResult.matchingExplanation || semanticResult.matchExplanation || '',
        advantages: semanticResult.advantages || [],
        considerations: semanticResult.risks || [],
        implementationSteps: semanticResult.implementationAdvice || [],
        suitability: semanticResult.suitabilityLevel || '中'
      });
    }
    
    // 不再需要单独处理LLM方法，因为我们已经在前面的步骤中合并并筛选了
    
    // 按最终评分排序
    finalResults.sort((a, b) => b.finalScore - a.finalScore);
    
    console.log(`✅ 最终推荐生成完成，共 ${finalResults.length} 个方法`);
    console.log(`📊 最终排序: ${finalResults.map(r => `${r.methodName}(${r.finalScore.toFixed(2)})`).join(', ')}`);
    
  return {
      finalRecommendations: finalResults,
      topRecommendation: finalResults[0] || null,
      scoringWeights: FINAL_SCORING_WEIGHTS
    };
  } catch (error) {
    console.error('❌ 最终推荐生成失败:', error.message);
    throw error;
  }
}

/**
 * 主要推荐流程入口函数 - 增强版
 */
export async function processMethodRecommendation(requestData, updateStage = null) {
  console.log('🚀 开始权重方法推荐流程...');
  console.log('📋 接收到的请求数据:', {
    hasQuestionnaireData: !!requestData.questionnaireData,
    hasUserNeeds: !!requestData.userNeeds,
    hasDataFeatures: !!requestData.dataFeatures,
    hasWeightMethods: !!requestData.weightMethods,
    weightMethodsLength: requestData.weightMethods?.length
  });
  
  // 定义一个更新阶段的函数
  const updateAnalysisStage = (stage, message) => {
    if (typeof updateStage === 'function') {
      updateStage(stage, message);
    } else {
      console.log(`阶段更新: ${stage} - ${message}`);
    }
  };
  
  try {
    const { questionnaireData, userNeeds: providedUserNeeds, dataFeatures, weightMethods } = requestData;
    
    // 验证输入数据
    if (!weightMethods || !Array.isArray(weightMethods) || weightMethods.length === 0) {
      throw new Error('权重方法库为空或格式不正确');
    }
    
    console.log(`📊 权重方法库包含 ${weightMethods.length} 个方法`);
    
    // 1. 用户需求分析 - 优先使用已提供的分析结果
    let userNeeds = providedUserNeeds;
    if (!userNeeds) {
      console.log('🔍 第1步: 用户需求分析...');
      if (!questionnaireData || typeof questionnaireData !== 'object' || Object.keys(questionnaireData).length === 0) {
        console.warn('⚠️ 警告: 问卷数据为空或无效，将使用默认值');
        // 创建默认问卷数据
        const defaultQuestionnaireData = {
          domain: "综合评价",
          purpose: "对多个选项进行排序/筛选",
          evaluationNature: "描述性",
          complexity: "中",
          precision: "中",
          riskTolerance: "中",
          methodPreference: "无偏好",
          knowledgeLevel: "中级",
          timeConstraint: "适中",
          computingResource: "基础",
          experts: "有限",
          taskDimension: {
            domain: "综合评价",
            purpose: "对多个选项进行排序/筛选",
            evaluationNature: "描述性",
            complexity: "中"
          },
          dataDimension: {
            indicatorCount: "中等",
            variableType: "混合",
            dataQualityIssues: []
          },
          userDimension: {
            precision: "中",
            methodPreference: "无偏好",
            knowledgeLevel: "中级",
            riskTolerance: "中",
            specialRequirements: []
          },
          environmentDimension: {
            experts: "有限",
            timeConstraint: "适中",
            computingResource: "基础",
            environmentConstraints: []
          }
        };
        userNeeds = await analyzeUserNeeds(defaultQuestionnaireData);
    } else {
        userNeeds = await analyzeUserNeeds(questionnaireData);
      }
      console.log('✅ 用户需求分析完成');
    } else {
      console.log('✅ 使用已提供的用户需求分析结果，跳过分析步骤');
    }
    
    // 2. 数据特征分析（如果有数据）- 优先使用已提供的分析结果
    console.log('🔍 第2步: 数据特征分析...');
    let dataAnalysis = dataFeatures;
    if (!dataAnalysis) {
      console.log('ℹ️ 无数据特征提供，跳过数据分析');
    } else {
      console.log('✅ 使用已提供的数据特征分析结果，跳过分析步骤');
    }
    
    // 3. 规则匹配评分
    console.log('🔍 第3步: 规则匹配评分...');
    let ruleMatchingResults;
    try {
      // 使用多API批处理替代单API处理
      ruleMatchingResults = await performBatchRuleMatching(userNeeds, dataAnalysis, weightMethods);
      console.log('✅ 规则匹配评分完成');
      
      // 如果有批处理详情，记录相关信息
      if (ruleMatchingResults.batchProcessingDetails) {
        console.log('📊 批处理详情:', {
          batchCount: ruleMatchingResults.batchProcessingDetails.batchCount,
          totalMethods: ruleMatchingResults.batchProcessingDetails.totalMethods,
          processingTime: ruleMatchingResults.batchProcessingDetails.processingTime + '秒'
        });
      }
    } catch (error) {
      console.error(`❌ 规则匹配评分失败: ${error.message}`);
      console.log('🔄 使用备用规则匹配结果...');
      
      // 创建备用规则匹配结果
      ruleMatchingResults = {
        ruleScoringResults: weightMethods.slice(0, 3).map((method, index) => ({
          methodName: method.name,
          totalRuleScore: 7 - index,  // 简单地按顺序降低分数
        dimensionalScores: {
            taskDimensionMatch: 7,
            dataDimensionMatch: 7,
            userDimensionMatch: 7,
            environmentDimensionMatch: 7
          },
          matchingExplanation: "备用规则匹配结果",
          recommendationReason: "系统自动生成的备用推荐"
        })),
        topCandidates: weightMethods.slice(0, 3).map(m => m.name),
        averageScore: 6,
        needsLLMSupplement: false
      };
    }
    
    // 4. 检查是否需要LLM补充 (第一阶段的辅助步骤)
    console.log('🔍 第一阶段(规则匹配) - 补充步骤: 检查是否需要LLM补充...');
    let llmSupplementResults = null;
    if (ruleMatchingResults.needsLLMSupplement) {
      console.log(`⚠️ 平均分 ${ruleMatchingResults.averageScore.toFixed(2)} ≤ ${AVERAGE_SCORE_THRESHOLD}，触发LLM补充推荐`);
      try {
        // 更新分析阶段 - AI扩展方法评估
        updateAnalysisStage('llmCheck', '正在进行AI扩展方法评估...');
        
        const weightMethodNames = weightMethods.map(m => m.name);
        llmSupplementResults = await performLLMSupplement(userNeeds, dataAnalysis, weightMethodNames);
        console.log('✅ LLM补充推荐完成');
        
        // 更新分析阶段 - AI扩展方法规则匹配
        updateAnalysisStage('llmRuleMatching', '正在进行AI扩展方法规则匹配...');
        
        // 修改部分开始：合并规则匹配结果和LLM补充结果，重新排序取前3个
        console.log('🔄 合并规则匹配和LLM补充方法，重新排序...');
        
        // 收集所有方法的规则评分结果
        const allRuleResults = [
          ...ruleMatchingResults.ruleScoringResults,
          ...(llmSupplementResults.ruleScoringResults || [])
        ];
        
        // 按规则得分重新排序
        const resortedResults = allRuleResults.sort((a, b) => 
          (b.totalRuleScore || 0) - (a.totalRuleScore || 0)
        );
        
        // 只取前3个作为最终候选
        const topThreeCandidates = resortedResults.slice(0, 3);
        
        console.log(`✅ 重新排序完成，选取规则得分最高的前3个方法进行后续分析`);
        console.log(`📊 最终候选方法: ${topThreeCandidates.map(m => m.methodName).join(', ')}`);
        
        // 更新ruleMatchingResults，只保留前3个方法
        ruleMatchingResults = {
          ...ruleMatchingResults,
          ruleScoringResults: topThreeCandidates,
          topCandidates: topThreeCandidates.map(m => m.methodName)
        };
        // 修改部分结束
        
    } catch (error) {
        console.error(`❌ LLM补充推荐失败: ${error.message}`);
        console.log('ℹ️ 继续使用规则匹配结果');
      }
    } else {
      console.log(`✅ 平均分 ${ruleMatchingResults.averageScore.toFixed(2)} > ${AVERAGE_SCORE_THRESHOLD}，无需LLM补充`);
    }
    
    // 4.5 LLM方法详情并行生成（提前到语义分析前）
    let llmMethodDetails = [];
    try {
      // 筛选LLM推荐方法
      const llmCandidateMethods = [];
      if (llmSupplementResults && llmSupplementResults.recommendations) {
        for (const methodName of ruleMatchingResults.topCandidates) {
          if (llmSupplementResults.recommendations.some(r => r.method === methodName)) {
            llmCandidateMethods.push(methodName);
          }
        }
      }
      if (llmCandidateMethods.length > 0) {
        // 更新分析阶段 - AI扩展方法详情生成
        updateAnalysisStage('llmDetails', '正在生成AI扩展方法详情...');
        
        llmMethodDetails = await performParallelLLMMethodDetails(
          llmCandidateMethods,
          userNeeds,
          dataAnalysis
        );
        console.log('✅ LLM方法详情并行生成完成');
      }
    } catch (error) {
      console.error('❌ LLM方法详情并行生成失败:', error.message);
      llmMethodDetails = [];
    }

    // 5. 语义分析 (第二阶段)
    console.log('🔍 第二阶段: 语义分析...');
    // 修改为只使用重新排序后的前3个方法
    const allCandidateMethods = ruleMatchingResults.topCandidates;
    
    // 更新分析阶段 - 候选方法语义匹配
    updateAnalysisStage('semanticAnalysis', '正在进行候选方法语义匹配...');
    
    console.log(`📊 需要进行语义分析的候选方法: ${allCandidateMethods.length}个 (${allCandidateMethods.join(', ')})`);
    
    let semanticAnalysisResults = [];
    try {
      semanticAnalysisResults = await performParallelSemanticAnalysis(
        allCandidateMethods, 
        userNeeds, 
        dataAnalysis, 
        weightMethods,
        llmMethodDetails // 新增参数，传递LLM方法详情
      );
      console.log('✅ 语义分析完成');
    } catch (error) {
      console.error(`❌ 语义分析失败: ${error.message}`);
      console.log('🔄 使用备用语义分析结果...');
      
      // 创建备用语义分析结果
      semanticAnalysisResults = allCandidateMethods.map(methodName => ({
        methodName: methodName,
        semanticMatchScore: 7,  // 默认中等分数
        matchExplanation: "备用语义分析结果",
        advantages: ["方法适用性良好", "实施难度适中"],
        risks: ["可能需要专业知识支持"],
        implementationAdvice: ["参考相关文献", "咨询领域专家"],
        suitabilityLevel: "中"
      }));
    }
    
    // 5.5 个性化实施建议生成 (新增步骤)
    console.log('🔍 第二阶段补充: 个性化实施建议生成...');
    
    // 更新分析阶段 - 个性化建议生成
    updateAnalysisStage('personalization', '正在生成个性化建议...');
    
    let personalizedImplementations = [];
    try {
      personalizedImplementations = await performParallelPersonalizedImplementation(
        allCandidateMethods,
        userNeeds,
        dataAnalysis
      );
      console.log('✅ 个性化实施建议生成完成');
    } catch (error) {
      console.error(`❌ 个性化实施建议生成失败: ${error.message}`);
      console.log('🔄 使用备用个性化实施建议...');
      
      // 创建备用个性化实施建议
      personalizedImplementations = allCandidateMethods.map(methodName => ({
        methodName,
        personalizedImplementation: "无法生成个性化实施建议，请咨询专业人士获取实施指导。"
      }));
    }

    // 6. 生成最终推荐结果
    console.log('🔍 第三阶段: 混合排序 - 生成最终推荐...');
    
    // 更新分析阶段 - 最终结果生成
    updateAnalysisStage('finalResult', '生成最终结果...');
    
    let finalRecommendation;
    try {
      // 修改generateFinalRecommendation函数调用，添加personalizedImplementations和llmMethodDetails参数
      finalRecommendation = await generateFinalRecommendation(
        ruleMatchingResults.ruleScoringResults,
        semanticAnalysisResults,
        llmSupplementResults,
        personalizedImplementations,
        llmMethodDetails
      );
      console.log('✅ 混合排序完成，最终推荐生成完成');
    } catch (error) {
      console.error(`❌ 最终推荐生成失败: ${error.message}`);
      console.log('🔄 使用备用最终推荐结果...');
      
      // 创建备用最终推荐结果
      const backupFinalResults = ruleMatchingResults.ruleScoringResults.map((rule, index) => {
        const semantic = semanticAnalysisResults.find(s => s.methodName === rule.methodName) || {
          semanticMatchScore: 7,
          matchExplanation: "备用语义分析"
        };
        
        return {
          methodName: rule.methodName,
          ruleScore: rule.totalRuleScore || 7,
          semanticScore: semantic.semanticMatchScore || 7,
          finalScore: ((rule.totalRuleScore || 7) * FINAL_SCORING_WEIGHTS.RULE_WEIGHT + 
                      (semantic.semanticMatchScore || 7) * FINAL_SCORING_WEIGHTS.SEMANTIC_WEIGHT),
          source: 'database',
          ruleAnalysis: rule,
          semanticAnalysis: semantic
        };
      });
      
      finalRecommendation = {
        finalRecommendations: backupFinalResults,
        topRecommendation: backupFinalResults[0] || null,
        scoringWeights: FINAL_SCORING_WEIGHTS
      };
    }
    
    console.log('🎉 权重方法推荐流程完成！');
    
    // 返回完整结果
    return {
      userNeeds: userNeeds,
      dataAnalysis: dataAnalysis,
      ruleMatchingResults: ruleMatchingResults,
      llmSupplementResults: llmSupplementResults,
      semanticAnalysisResults: semanticAnalysisResults,
      personalizedImplementations: personalizedImplementations,
      finalRecommendation: finalRecommendation,
      processingSummary: {
        usedLLMSupplement: !!llmSupplementResults,
        averageRuleScore: ruleMatchingResults.averageScore,
        totalCandidates: allCandidateMethods.length,
        finalMethodsCount: finalRecommendation.finalRecommendations.length,
        hasPersonalizedImplementations: personalizedImplementations.length > 0,
        completionStatus: 'success',
        batchProcessingDetails: ruleMatchingResults.batchProcessingDetails || null
      }
    };
    
    } catch (error) {
    console.error('❌ 推荐流程失败:', error.message);
    
    // 尝试创建一个最小的有效结果
    try {
      console.log('🔄 创建最小有效结果...');
      
      // 使用前3个方法作为备用推荐
      const backupMethods = (requestData.weightMethods || []).slice(0, 3);
      if (backupMethods.length === 0) {
        throw new Error('无法创建备用推荐，权重方法库为空');
      }
      
      const backupRecommendations = backupMethods.map((method, index) => ({
        methodName: method.name,
        ruleScore: 7 - index * 0.5,
        semanticScore: 7 - index * 0.5,
        finalScore: 7 - index * 0.5,
        source: 'database',
        ruleAnalysis: {
          totalRuleScore: 7 - index * 0.5,
          dimensionalScores: {
            taskDimensionMatch: 7,
            dataDimensionMatch: 7,
            userDimensionMatch: 7,
            environmentDimensionMatch: 7
          }
        },
        semanticAnalysis: {
          semanticMatchScore: 7 - index * 0.5,
          matchExplanation: "系统自动生成的备用推荐",
          advantages: method.advantages || ["方法适用性良好"],
          risks: method.limitations || ["可能需要专业知识支持"],
          implementationAdvice: method.implementationSteps || ["参考相关文献"]
        },
        personalizedImplementation: "系统自动生成的备用实施建议，建议咨询专业人士获取更详细的实施指导。"
      }));
      
      // 创建备用个性化实施建议
      const backupPersonalizedImplementations = backupMethods.map(method => ({
        methodName: method.name,
        personalizedImplementation: "系统自动生成的备用实施建议，建议咨询专业人士获取更详细的实施指导。"
      }));
        
      return {
        userNeeds: {
          taskDimension: { domain: "未知领域" },
          userDimension: { methodPreference: "无偏好" },
          environmentDimension: { expertiseLevel: "有限" }
        },
        dataAnalysis: null,
        ruleMatchingResults: {
          ruleScoringResults: backupRecommendations.map(r => ({
            methodName: r.methodName,
            totalRuleScore: r.ruleScore
          })),
          topCandidates: backupRecommendations.map(r => r.methodName),
          averageScore: 6,
          needsLLMSupplement: false
        },
        llmSupplementResults: null,
        semanticAnalysisResults: backupRecommendations.map(r => ({
          methodName: r.methodName,
          semanticMatchScore: r.semanticScore,
          matchExplanation: "备用语义分析结果"
        })),
        personalizedImplementations: backupPersonalizedImplementations,
        finalRecommendation: {
          finalRecommendations: backupRecommendations,
          topRecommendation: backupRecommendations[0],
          scoringWeights: FINAL_SCORING_WEIGHTS
        },
        processingSummary: {
          usedLLMSupplement: false,
          averageRuleScore: 6,
          totalCandidates: backupRecommendations.length,
          finalMethodsCount: backupRecommendations.length,
          hasPersonalizedImplementations: true,
          completionStatus: 'fallback',
          error: error.message
        }
      };
    } catch (fallbackError) {
      console.error('❌ 创建备用结果也失败:', fallbackError.message);
      throw new Error(`推荐流程完全失败: ${error.message}. 备用方案失败: ${fallbackError.message}`);
    }
  }
}

// =============== 辅助函数导出（保持兼容性）===============

export const logger = {
  // 基础日志方法
  log: console.log,
  error: console.error,
  warn: console.warn,
  
  // 扩展的日志方法
  separator: (title) => {
    const line = '='.repeat(80);
    console.log(`\n${line}`);
    if (title) {
      console.log(`🔸 ${title}`);
      console.log(line);
    }
  },
  
  info: (category, message, data) => {
    console.log(`ℹ️ [${category}] ${message}`, data ? data : '');
  },
  
  dataFlow: (stage, action, data) => {
    console.log(`📊 [数据流] ${stage} → ${action}`, data ? data : '');
  },
  
  performance: (operation, duration, metrics) => {
    console.log(`⏱️ [性能] ${operation}: ${duration}s`, metrics ? metrics : '');
  },
  
  success: (category, message, data) => {
    console.log(`✅ [${category}] ${message}`, data ? data : '');
  },
  
  debug: (category, message, data) => {
    console.log(`🐛 [调试] [${category}] ${message}`, data ? data : '');
  }
};

export { parseJsonFromLLMResponse, filterMethodsForPrompt };

/**
 * 生成LLM方法详情（用于完整推荐信息）
 */
export async function generateLLMMethodDetails(methodName, methodInfo, userNeeds, dataFeatures, apiConfig = null) {
  console.log(`📋 生成方法详情: ${methodName || methodInfo.method || methodInfo.name}`);
  
  try {
      // 准备方法信息对象
      const methodData = typeof methodName === 'string' ? 
        { 
          name: methodName,
          ...methodInfo 
        } : methodInfo;
      
      const prompt = llmMethodDetailGenerationPrompt
        .replace('{{methodInfo}}', JSON.stringify(methodData, null, 2))
        .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
        .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2));
      
    const response = await callLLMAPI(prompt, 0.4, apiConfig);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result) {
      throw new Error('方法详情生成结果解析失败');
    }
    
    console.log('✅ 方法详情生成完成');
    
    // 从复杂结构中提取需要的字段，转换为UI需要的格式
    if (result.methodDetails) {
      const md = result.methodDetails;
      const transformedResult = {
        detail: md.theoreticalFoundation?.basicPrinciple || '',
        type: md.category || '',
        suitConditions: md.applicabilityAnalysis?.suitableConditions || [],
        advantages: md.methodCharacteristics?.keyAdvantages || [],
        limitations: md.methodCharacteristics?.limitations || [],
        implementationSteps: [
          ...(md.detailedImplementation?.preparationSteps || []),
          ...(md.detailedImplementation?.calculationSteps || []),
          ...(md.detailedImplementation?.validationSteps || [])
        ],
        suitableScenarios: md.applicabilityAnalysis?.suitableConditions || [],
        mathematicalModel: md.theoreticalFoundation?.mathematicalModel || '',
        calculationExample: md.detailedImplementation?.calculationExample || ''
      };
      
      return transformedResult;
    }
    
    return result;
    } catch (error) {
    console.error('❌ 方法详情生成失败:', error.message);
    throw error;
    }
  }

  /**
   * 生成个性化实施建议
 */
export async function generatePersonalizedImplementation(methodName, userNeeds, dataFeatures) {
  console.log(`🎯 生成个性化实施建议: ${methodName}`);
  
  try {
    const prompt = personalizedImplementationPrompt
        .replace('{{methodName}}', methodName)
      .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
      .replace('{{knowledgeLevel}}', userNeeds.userDimension?.knowledgeLevel || '')
      .replace('{{methodPreference}}', userNeeds.userDimension?.methodPreference || '')
      .replace('{{precision}}', userNeeds.userDimension?.precision || '')
      .replace('{{riskTolerance}}', userNeeds.userDimension?.riskTolerance || '')
      .replace('{{timeConstraint}}', userNeeds.environmentDimension?.timeConstraint || '')
      .replace('{{computingResource}}', userNeeds.environmentDimension?.computingResource || '')
      .replace('{{expertiseLevel}}', userNeeds.environmentDimension?.expertiseLevel || '')
      .replace('{{specialRequirements}}', JSON.stringify(userNeeds.userDimension?.specialRequirements || []))
      .replace('{{supplementaryInsights}}', JSON.stringify(userNeeds.userDimension?.supplementaryInsights || []));
    
    const response = await callLLMAPI(prompt, 0.4);
    const result = parseJsonFromLLMResponse(response);
    
    if (!result) {
      throw new Error('个性化实施建议结果解析失败');
    }
    
    console.log('✅ 个性化实施建议生成完成');
    return result;
    } catch (error) {
    console.error('❌ 个性化实施建议生成失败:', error.message);
      throw error;
    }
  }

  /**
 * 多API批处理规则匹配
 * 将权重方法分成多个批次，使用不同API并行处理
 */
export async function performBatchRuleMatching(userNeeds, dataFeatures, weightMethods) {
  console.log('⚖️ 开始多API批处理规则匹配评分...');
  
  try {
    // 检查是否启用多API
    if (!API_CONFIG.MULTI_API_ENABLED || !API_CONFIG.API_CONFIGS || API_CONFIG.API_CONFIGS.length < 2) {
      console.log('⚠️ 多API未启用或配置不足，回退到单API处理');
      return await performRuleMatching(userNeeds, dataFeatures, weightMethods);
    }
    
    // 获取可用的API配置
    const apiConfigs = API_CONFIG.API_CONFIGS;
    console.log(`🔌 可用API数量: ${apiConfigs.length}`);
    
    // 计算每个批次的方法数量
    const batchCount = Math.min(3, apiConfigs.length); // 最多3个批次
    const methodsPerBatch = Math.ceil(weightMethods.length / batchCount);
    console.log(`📊 权重方法总数: ${weightMethods.length}, 分成 ${batchCount} 个批次, 每批约 ${methodsPerBatch} 个方法`);
    
    // 分割方法为多个批次
    const batches = [];
    for (let i = 0; i < batchCount; i++) {
      const startIdx = i * methodsPerBatch;
      const endIdx = Math.min(startIdx + methodsPerBatch, weightMethods.length);
      if (startIdx < weightMethods.length) {
        batches.push(weightMethods.slice(startIdx, endIdx));
      }
    }
    
    console.log(`🔄 实际创建批次数: ${batches.length}`);
    batches.forEach((batch, idx) => {
      console.log(`📦 批次 ${idx+1}: ${batch.length} 个方法, 使用API: ${apiConfigs[idx].id}`);
    });
    
    // 并行处理每个批次
    const batchPromises = batches.map((batch, index) => {
      const apiConfig = apiConfigs[index % apiConfigs.length]; // 循环使用API配置
      return processBatch(batch, userNeeds, dataFeatures, apiConfig, index + 1);
    });
    
    // 等待所有批次完成
    const batchStartTime = performance.now();
    const batchResults = await Promise.all(batchPromises);
    const batchEndTime = performance.now();
    const batchDuration = ((batchEndTime - batchStartTime) / 1000).toFixed(2);
    console.log(`⏱️ 所有批次处理完成，总耗时: ${batchDuration}秒`);
    
    // 合并所有批次的结果
    const allRuleScoringResults = [];
    let hasErrors = false;
    batchResults.forEach((result, idx) => {
      if (result.error) {
        console.error(`❌ 批次 ${idx+1} 处理失败: ${result.error}`);
        hasErrors = true;
      } else {
        console.log(`📊 批次 ${idx+1} 结果: ${result.ruleScoringResults.length} 个方法评分`);
        allRuleScoringResults.push(...result.ruleScoringResults);
      }
    });
    
    // 如果所有批次都失败，回退到单API处理
    if (allRuleScoringResults.length === 0) {
      console.log('⚠️ 所有批次处理失败，回退到单API处理');
      return await performRuleMatching(userNeeds, dataFeatures, weightMethods);
    }
    
    // 按总分排序，取前3名
    const sortedResults = allRuleScoringResults
      .sort((a, b) => (b.totalRuleScore || 0) - (a.totalRuleScore || 0))
      .slice(0, 3);
    
    const averageScore = calculateAverageScore(sortedResults);
    
    console.log(`✅ 多API批处理规则匹配完成，前3名平均分: ${averageScore.toFixed(2)}`);
    
    return {
      ruleScoringResults: sortedResults,
      topCandidates: sortedResults.map(r => r.methodName),
      averageScore: averageScore,
      needsLLMSupplement: averageScore <= AVERAGE_SCORE_THRESHOLD,
      batchProcessingDetails: {
        batchCount: batches.length,
        totalMethods: weightMethods.length,
        processingTime: batchDuration,
        hasErrors: hasErrors,
        error: hasErrors ? "部分批次处理失败，但仍有有效结果" : null
      }
    };
  } catch (error) {
    console.error('❌ 多API批处理规则匹配失败:', error.message);
    console.log('🔄 回退到单API处理...');
    return await performRuleMatching(userNeeds, dataFeatures, weightMethods);
  }
}

/**
 * 处理单个批次的规则匹配
 */
async function processBatch(batchMethods, userNeeds, dataFeatures, apiConfig, batchNumber) {
  console.log(`🔄 开始处理批次 ${batchNumber}, 包含 ${batchMethods.length} 个方法, 使用API: ${apiConfig.id}`);
  
  try {
    // 过滤方法信息，移除数学模型和计算示例
    const filteredMethods = filterMethodsForPrompt(batchMethods);
    
    const batchStartTime = performance.now();
    
    // 构建提示词
    const prompt = ruleBasedMatchingPrompt
        .replace('{{userNeeds}}', JSON.stringify(userNeeds, null, 2))
      .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
      .replace('{{weightMethods}}', JSON.stringify(filteredMethods, null, 2));
    
    // 使用指定的API配置调用LLM
    const response = await callLLMAPI(prompt, apiConfig.temperature || 0.3, apiConfig);
    const result = parseJsonFromLLMResponse(response);
    
    const batchEndTime = performance.now();
    const batchDuration = ((batchEndTime - batchStartTime) / 1000).toFixed(2);
    
    if (!result || !result.ruleScoringResults) {
      throw new Error(`批次 ${batchNumber} 规则匹配结果解析失败`);
    }
    
    console.log(`✅ 批次 ${batchNumber} 处理完成，耗时: ${batchDuration}秒, 结果数量: ${result.ruleScoringResults.length}`);
  
      return {
      ruleScoringResults: result.ruleScoringResults,
      batchNumber: batchNumber,
      apiId: apiConfig.id,
      processingTime: batchDuration
    };
    } catch (error) {
    console.error(`❌ 批次 ${batchNumber} 处理失败:`, error.message);
    // 返回空结果，不中断整个流程
    return {
      ruleScoringResults: [],
      batchNumber: batchNumber,
      apiId: apiConfig.id,
      error: error.message
    };
  }
}

/**
 * 并行语义分析
 * 使用多API并行处理候选方法的语义分析
 */
export async function performParallelSemanticAnalysis(candidateMethods, userNeeds, dataFeatures, weightMethods, llmMethodDetails = []) {
  console.log('🧠 开始并行语义分析...');
  try {
    if (!API_CONFIG.MULTI_API_ENABLED || !API_CONFIG.API_CONFIGS || API_CONFIG.API_CONFIGS.length < 2) {
      console.log('⚠️ 多API未启用或配置不足，回退到串行语义分析');
      return await performSemanticAnalysis(candidateMethods, userNeeds, dataFeatures, weightMethods, llmMethodDetails);
    }
    const apiConfigs = API_CONFIG.API_CONFIGS;
    const methodApiMap = candidateMethods.map((methodName, index) => {
      const apiConfig = apiConfigs[index % apiConfigs.length];
      // 查找LLM方法详情
      const llmDetailObj = llmMethodDetails.find(d => d.methodName === methodName);
      return { methodName, apiConfig, llmDetail: llmDetailObj ? llmDetailObj.detail : null };
    });
    const semanticPromises = methodApiMap.map(mapping =>
      analyzeMethodSemantics(
        mapping.methodName,
          userNeeds, 
          dataFeatures, 
        weightMethods,
        mapping.apiConfig,
        mapping.llmDetail // 新增参数
      )
    );
      const startTime = performance.now();
    const semanticResults = await Promise.all(semanticPromises);
      const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`⏱️ 并行语义分析完成，总耗时: ${duration}秒`);
    return semanticResults;
  } catch (error) {
    console.error('❌ 并行语义分析失败:', error.message);
    return await performSemanticAnalysis(candidateMethods, userNeeds, dataFeatures, weightMethods, llmMethodDetails);
  }
}

// 修改analyzeMethodSemantics，支持llmDetail参数
async function analyzeMethodSemantics(methodName, userNeeds, dataFeatures, weightMethods, apiConfig, llmDetail = null) {
  // 判断是否为LLM方法
  let methodObj = weightMethods.find(m => m.name === methodName);
  let prompt;
  if (!methodObj && llmDetail) {
    // LLM方法，使用llmDetail填充prompt
    prompt = semanticAnalysisPrompt
      .replace('{{P.taskDimension.domain}}', userNeeds.taskDimension?.domain || '')
      .replace('{{P.taskDimension.evaluationNature}}', userNeeds.taskDimension?.evaluationNature || '')
      .replace('{{P.taskDimension.complexity}}', userNeeds.taskDimension?.complexity || '')
      .replace('{{P.taskDimension.applicationScope}}', userNeeds.taskDimension?.applicationScope || '')
      .replace('{{P.dataDimension.indicatorCount}}', userNeeds.dataDimension?.indicatorCount || '')
      .replace('{{P.dataDimension.variableType}}', userNeeds.dataDimension?.variableType || '')
      .replace('{{P.dataDimension.dataQualityIssues}}', (userNeeds.dataDimension?.dataQualityIssues || []).join(','))
      .replace('{{P.userDimension.precision}}', userNeeds.userDimension?.precision || '')
      .replace('{{P.userDimension.structure}}', userNeeds.userDimension?.structure || '')
      .replace('{{P.userDimension.relation}}', userNeeds.userDimension?.relation || '')
      .replace('{{P.userDimension.methodPreference}}', userNeeds.userDimension?.methodPreference || '')
      .replace('{{P.userDimension.knowledgeLevel}}', userNeeds.userDimension?.knowledgeLevel || '')
      .replace('{{P.userDimension.riskTolerance}}', userNeeds.userDimension?.riskTolerance || '')
      .replace('{{P.userDimension.specialRequirements}}', (userNeeds.userDimension?.specialRequirements || []).join(','))
      .replace(/{{P.userDimension.supplementaryInsights}}/g, (userNeeds.userDimension?.supplementaryInsights || []).join(','))
      .replace('{{P.environmentDimension.expertiseLevel}}', userNeeds.environmentDimension?.expertiseLevel || '')
      .replace('{{P.environmentDimension.timeConstraint}}', userNeeds.environmentDimension?.timeConstraint || '')
      .replace('{{P.environmentDimension.computingResource}}', userNeeds.environmentDimension?.computingResource || '')
      .replace('{{P.environmentDimension.environmentConstraints}}', (userNeeds.environmentDimension?.environmentConstraints || []).join(','))
      // LLM方法详情部分
      .replace('{{M.name}}', methodName)
      .replace('{{M.type}}', llmDetail.type || '')
      .replace('{{M.detail}}', llmDetail.detail || '')
      .replace('{{M.suitConditions}}', (llmDetail.suitConditions || []).join(','))
      .replace('{{M.advantages}}', (llmDetail.advantages || []).join(','))
      .replace('{{M.limitations}}', (llmDetail.limitations || []).join(','))
      .replace('{{M.implementationSteps}}', (llmDetail.implementationSteps || []).join(','));
      } else {
    // 数据库方法，原有逻辑
    methodObj = methodObj || {};
    prompt = semanticAnalysisPrompt
      .replace('{{P.taskDimension.domain}}', userNeeds.taskDimension?.domain || '')
      .replace('{{P.taskDimension.evaluationNature}}', userNeeds.taskDimension?.evaluationNature || '')
      .replace('{{P.taskDimension.complexity}}', userNeeds.taskDimension?.complexity || '')
      .replace('{{P.taskDimension.applicationScope}}', userNeeds.taskDimension?.applicationScope || '')
      .replace('{{P.dataDimension.indicatorCount}}', userNeeds.dataDimension?.indicatorCount || '')
      .replace('{{P.dataDimension.variableType}}', userNeeds.dataDimension?.variableType || '')
      .replace('{{P.dataDimension.dataQualityIssues}}', (userNeeds.dataDimension?.dataQualityIssues || []).join(','))
      .replace('{{P.userDimension.precision}}', userNeeds.userDimension?.precision || '')
      .replace('{{P.userDimension.structure}}', userNeeds.userDimension?.structure || '')
      .replace('{{P.userDimension.relation}}', userNeeds.userDimension?.relation || '')
      .replace('{{P.userDimension.methodPreference}}', userNeeds.userDimension?.methodPreference || '')
      .replace('{{P.userDimension.knowledgeLevel}}', userNeeds.userDimension?.knowledgeLevel || '')
      .replace('{{P.userDimension.riskTolerance}}', userNeeds.userDimension?.riskTolerance || '')
      .replace('{{P.userDimension.specialRequirements}}', (userNeeds.userDimension?.specialRequirements || []).join(','))
      .replace(/{{P.userDimension.supplementaryInsights}}/g, (userNeeds.userDimension?.supplementaryInsights || []).join(','))
      .replace('{{P.environmentDimension.expertiseLevel}}', userNeeds.environmentDimension?.expertiseLevel || '')
      .replace('{{P.environmentDimension.timeConstraint}}', userNeeds.environmentDimension?.timeConstraint || '')
      .replace('{{P.environmentDimension.computingResource}}', userNeeds.environmentDimension?.computingResource || '')
      .replace('{{P.environmentDimension.environmentConstraints}}', (userNeeds.environmentDimension?.environmentConstraints || []).join(','))
      // 数据库方法详情部分
      .replace('{{M.name}}', methodObj.name || methodName)
      .replace('{{M.type}}', methodObj.type || '')
      .replace('{{M.detail}}', methodObj.detail || '')
      .replace('{{M.suitConditions}}', (methodObj.suitConditions || []).join(','))
      .replace('{{M.advantages}}', (methodObj.advantages || []).join(','))
      .replace('{{M.limitations}}', (methodObj.limitations || []).join(','))
      .replace('{{M.implementationSteps}}', (methodObj.implementationSteps || []).join(','));
  }
  const response = await callLLMAPI(prompt, 0.4, apiConfig);
  const result = parseJsonFromLLMResponse(response);
  if (!result) {
    throw new Error(`方法 ${methodName} 的语义分析结果解析失败`);
  }
    return {
    methodName: methodName,
    ...result
  };
}

/**
 * 并行个性化实施建议生成
 * 使用多API并行处理候选方法的个性化实施建议
 */
export async function performParallelPersonalizedImplementation(candidateMethods, userNeeds, dataFeatures) {
  console.log('🎯 开始并行生成个性化实施建议...');
  
  try {
    // 检查是否启用多API
    if (!API_CONFIG.MULTI_API_ENABLED || !API_CONFIG.API_CONFIGS || API_CONFIG.API_CONFIGS.length < 2) {
      console.log('⚠️ 多API未启用或配置不足，回退到串行生成个性化实施建议');
      
      // 串行处理每个方法的个性化实施建议
      const personalizedImplementations = [];
      for (const methodName of candidateMethods) {
        try {
          const result = await generatePersonalizedImplementation(methodName, userNeeds, dataFeatures);
          personalizedImplementations.push({
            methodName,
            personalizedImplementation: result?.personalizedGuidance?.implementationStrategy?.recommendedApproach || 
                                       "无法生成个性化实施建议"
          });
        } catch (error) {
          console.error(`❌ 方法 ${methodName} 的个性化实施建议生成失败:`, error.message);
          personalizedImplementations.push({
            methodName,
            personalizedImplementation: "生成个性化实施建议时出错"
          });
        }
      }
      
      return personalizedImplementations;
    }
    
    // 获取可用的API配置
    const apiConfigs = API_CONFIG.API_CONFIGS;
    console.log(`🔌 可用API数量: ${apiConfigs.length}, 候选方法数量: ${candidateMethods.length}`);
    
    // 创建方法-API配置映射
    const methodApiMap = [];
    candidateMethods.forEach((methodName, index) => {
      const apiConfig = apiConfigs[index % apiConfigs.length]; // 循环使用API配置
      methodApiMap.push({
        methodName,
        apiConfig
      });
    });
    
    console.log('📊 方法-API映射:', methodApiMap.map(m => `${m.methodName} -> ${m.apiConfig.id}`).join(', '));
    
    // 并行处理每个方法的个性化实施建议
    const implementationPromises = methodApiMap.map(mapping => 
      generateMethodPersonalizedImplementation(mapping.methodName, userNeeds, dataFeatures, mapping.apiConfig)
    );
    
    // 等待所有生成完成
      const startTime = performance.now();
    const implementationResults = await Promise.all(implementationPromises);
      const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`⏱️ 并行个性化实施建议生成完成，总耗时: ${duration}秒`);
    
    // 过滤出有效结果
    const validResults = implementationResults.filter(result => result && !result.error);
    
    // 检查是否有失败的生成
    const failedCount = implementationResults.length - validResults.length;
    if (failedCount > 0) {
      console.warn(`⚠️ ${failedCount}个方法的个性化实施建议生成失败`);
    }
    
    // 如果全部失败，回退到串行处理
    if (validResults.length === 0) {
      console.log('⚠️ 所有并行个性化实施建议生成都失败，回退到串行处理');
      
      // 串行处理每个方法的个性化实施建议
      const personalizedImplementations = [];
      for (const methodName of candidateMethods) {
        try {
          const result = await generatePersonalizedImplementation(methodName, userNeeds, dataFeatures);
          personalizedImplementations.push({
            methodName,
            personalizedImplementation: result?.personalizedGuidance?.implementationStrategy?.recommendedApproach || 
                                       "无法生成个性化实施建议"
          });
    } catch (error) {
          console.error(`❌ 方法 ${methodName} 的个性化实施建议生成失败:`, error.message);
          personalizedImplementations.push({
            methodName,
            personalizedImplementation: "生成个性化实施建议时出错"
          });
        }
      }
      
      return personalizedImplementations;
    }
    
    console.log(`✅ 并行个性化实施建议生成完成，成功生成 ${validResults.length} 个方法的建议`);
    return validResults;
    } catch (error) {
    console.error('❌ 并行个性化实施建议生成失败:', error.message);
    console.log('🔄 回退到串行处理...');
    
    // 串行处理每个方法的个性化实施建议
    const personalizedImplementations = [];
    for (const methodName of candidateMethods) {
      try {
        const result = await generatePersonalizedImplementation(methodName, userNeeds, dataFeatures);
        personalizedImplementations.push({
          methodName,
          personalizedImplementation: result?.personalizedGuidance?.implementationStrategy?.recommendedApproach || 
                                     "无法生成个性化实施建议"
        });
    } catch (error) {
        console.error(`❌ 方法 ${methodName} 的个性化实施建议生成失败:`, error.message);
        personalizedImplementations.push({
          methodName,
          personalizedImplementation: "生成个性化实施建议时出错"
        });
      }
    }
    
    return personalizedImplementations;
    }
  }

  /**
 * 生成单个方法的个性化实施建议
 * 用于并行个性化实施建议生成
 */
async function generateMethodPersonalizedImplementation(methodName, userNeeds, dataFeatures, apiConfig) {
  console.log(`🎯 开始生成方法 ${methodName} 的个性化实施建议 (API: ${apiConfig.id})`);
  
  try {
    const prompt = personalizedImplementationPrompt
        .replace('{{methodName}}', methodName)
        .replace('{{dataFeatures}}', JSON.stringify(dataFeatures, null, 2))
      .replace('{{knowledgeLevel}}', userNeeds.userDimension?.knowledgeLevel || '')
      .replace('{{methodPreference}}', userNeeds.userDimension?.methodPreference || '')
      .replace('{{precision}}', userNeeds.userDimension?.precision || '')
      .replace('{{riskTolerance}}', userNeeds.userDimension?.riskTolerance || '')
      .replace('{{timeConstraint}}', userNeeds.environmentDimension?.timeConstraint || '')
      .replace('{{computingResource}}', userNeeds.environmentDimension?.computingResource || '')
      .replace('{{expertiseLevel}}', userNeeds.environmentDimension?.expertiseLevel || '')
      .replace('{{specialRequirements}}', JSON.stringify(userNeeds.userDimension?.specialRequirements || []))
      .replace('{{supplementaryInsights}}', JSON.stringify(userNeeds.userDimension?.supplementaryInsights || []));
      
      const startTime = performance.now();
    const response = await callLLMAPI(prompt, 0.4, apiConfig);
      const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const result = parseJsonFromLLMResponse(response);
    
    if (!result) {
      throw new Error(`方法 ${methodName} 的个性化实施建议生成结果解析失败`);
    }
    
    console.log(`✅ 方法 ${methodName} 的个性化实施建议生成完成 (API: ${apiConfig.id})，耗时: ${duration}秒`);
    
    // 提取关键信息，简化结构
    const implementation = result.personalizedGuidance?.implementationStrategy?.recommendedApproach || 
                           "无法生成个性化实施建议";
    
    // 构建更丰富的实施建议，包括步骤计划和风险缓解
    let detailedImplementation = implementation;
    
    // 添加阶段计划
    if (result.personalizedGuidance?.stepByStepPlan?.phases) {
      detailedImplementation += "\n\n实施阶段计划:";
      result.personalizedGuidance.stepByStepPlan.phases.forEach((phase, index) => {
        detailedImplementation += `\n${index + 1}. ${phase.phaseName} (预计耗时: ${phase.duration || '未指定'})`;
        if (phase.tasks && phase.tasks.length > 0) {
          detailedImplementation += "\n   任务:";
          phase.tasks.forEach(task => {
            detailedImplementation += `\n   - ${task}`;
          });
        }
      });
    }
    
    // 添加风险缓解策略
    if (result.personalizedGuidance?.riskMitigation?.potentialRisks) {
      detailedImplementation += "\n\n风险缓解:";
      const risks = result.personalizedGuidance.riskMitigation.potentialRisks;
      const measures = result.personalizedGuidance.riskMitigation.preventiveMeasures || [];
      
      risks.forEach((risk, index) => {
        detailedImplementation += `\n${index + 1}. ${risk}`;
        if (measures[index]) {
          detailedImplementation += `\n   缓解措施: ${measures[index]}`;
        }
      });
    }
    
    // 添加特殊需求处理方案
    if (result.personalizedGuidance?.customizations?.specialRequirementsHandling) {
      detailedImplementation += "\n\n特殊需求处理方案:";
      detailedImplementation += `\n${result.personalizedGuidance.customizations.specialRequirementsHandling}`;
    }
        
        return {
          methodName: methodName,
      personalizedImplementation: detailedImplementation,
      rawResult: result,
      apiId: apiConfig.id,
      processingTime: duration
    };
    } catch (error) {
    console.error(`❌ 方法 ${methodName} 的个性化实施建议生成失败 (API: ${apiConfig.id}):`, error.message);
    return {
      methodName: methodName,
      error: error.message,
      apiId: apiConfig.id
    };
  }
}

/**
 * 并行生成LLM推荐方法的详细信息
 * @param {string[]} llmMethods - LLM推荐方法名称数组
 * @param {object} userNeeds - 用户需求
 * @param {object} dataFeatures - 数据特征
 * @returns {Promise<Array<{methodName, detail, error?}>>}
 */
export async function performParallelLLMMethodDetails(llmMethods, userNeeds, dataFeatures) {
  console.log('🔄 开始并行生成LLM方法详情...');
  if (!llmMethods || llmMethods.length === 0) {
    console.log('⚠️ 没有LLM方法需要生成详情');
    return [];
  }
  
  try {
    const apiConfigs = API_CONFIG.API_CONFIGS || [];
    console.log(`🔌 可用API数量: ${apiConfigs.length}, 需要生成详情的方法数量: ${llmMethods.length}`);
    
    const methodApiMap = llmMethods.map((methodName, idx) => ({
      methodName,
      apiConfig: apiConfigs[idx % apiConfigs.length] || null
    }));
    
    console.log('📊 方法-API映射:', methodApiMap.map(m => `${m.methodName} -> ${m.apiConfig?.id || 'default'}`).join(', '));
      
      const startTime = performance.now();
    const detailPromises = methodApiMap.map(({ methodName, apiConfig }) =>
      generateLLMMethodDetails(methodName, {}, userNeeds, dataFeatures, apiConfig)
        .then(detail => ({ methodName, detail }))
        .catch(error => {
          console.error(`❌ 方法 ${methodName} 详情生成失败:`, error.message);
          return { methodName, detail: null, error: error.message };
        })
    );
    
    const results = await Promise.all(detailPromises);
      const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const successCount = results.filter(r => r.detail).length;
    console.log(`✅ 并行LLM方法详情生成完成，成功: ${successCount}/${results.length}，总耗时: ${duration}秒`);
    
    return results;
    } catch (error) {
    console.error('❌ 并行LLM方法详情生成失败:', error.message);
    return [];
  }
} 

/**
 * 使用API密钥调用LLM服务
 * @param {string} prompt - 提示词
 * @param {number} temperature - 温度参数
 * @param {string} apiId - 使用哪个API配置，可选值：'default', 'api2', 'api3'
 * @param {string} modelType - 模型类型，可选值：'deepseek', 'openai', 'qwen'
 * @returns {Promise<string>} - LLM响应
 */
export async function callLLM(prompt, temperature = 0.7, apiId = 'default', modelType = 'deepseek') {
  const userApiKey = getApiKey(apiId, modelType);
  
  // 构建请求体
  const requestBody = {
    prompt,
    temperature,
    apiId,
    userApiKey,
    modelType
  };
  
  try {
    // 调用API代理
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API错误: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    // 修正：处理OpenAI/Deepseek/Qwen格式响应
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    // 兼容旧格式，如果有text字段则使用它
    if (data.text) {
      return data.text;
    }
    
    // 如果以上都失败，尝试直接返回整个响应作为字符串
    if (typeof data === 'string') {
      return data;
    }
    
    // 最后手段：将整个响应对象转为JSON字符串
    console.warn('⚠️ 无法从API响应中提取内容，返回完整响应');
    return JSON.stringify(data);
  } catch (error) {
    console.error('调用LLM服务失败:', error);
    throw error;
  }
}

/**
 * 并行调用多个API，返回最快响应
 * @param {string} prompt - 提示词
 * @param {number} temperature - 温度参数
 * @param {string} modelType - 模型类型，可选值：'deepseek', 'openai', 'qwen'
 * @returns {Promise<string>} - 最快的LLM响应
 */
export async function callLLMParallel(prompt, temperature = 0.7, modelType = 'deepseek') {
  // 创建三个API调用的Promise
  const apiPromises = [
    callLLM(prompt, temperature, 'default', modelType),
    callLLM(prompt, temperature, 'api2', modelType),
    callLLM(prompt, temperature, 'api3', modelType)
  ];
  
  try {
    // 使用Promise.race获取最快的响应
    return await Promise.race(apiPromises);
  } catch (error) {
    console.error('并行调用LLM失败:', error);
    throw error;
  }
}