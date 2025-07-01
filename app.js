/**
 * 指标权重方法推荐系统
 * 主应用逻辑文件
 */

// 导入依赖
import { weightMethodsDB } from './weightMethods.js';
import { 
  userNeedsAnalysisPrompt, 
  dataAnalysisPrompt, 
  methodRecommendationPrompt,
  ruleBasedMatchingPrompt,
  semanticAnalysisPrompt
} from './agent-prompts.js';
import { 
  processMethodRecommendation, 
  logger, 
  parseJsonFromLLMResponse,
  analyzeUserNeeds,
  analyzeDataFeatures,
  performRuleMatching,
  generateLLMMethodDetails,
  performParallelLLMMethodDetails
} from './llmService.js';
import { API_CONFIG } from './config.js';

// 全局状态管理
const state = {
  userQuestionnaireData: {}, // 存储用户问卷数据
  uploadedFiles: [], // 存储上传的文件
  recommendationResults: [], // 存储推荐结果
  dataTypeFiles: {}, // 存储不同数据类型的上传文件
  currentStep: 1, // 当前步骤
  currentSection: 1, // 当前问卷部分 (1-4)
  totalSections: 4, // 总问卷部分数
  isLoading: false, // 加载状态
  error: null, // 错误信息
  dataAnalysisResult: null, // 数据分析结果
  shouldStopAnalysis: false, // 标志：是否应该停止分析
  isAnalyzing: false, // 标志：是否正在分析中
  analysisTimeoutId: null // 存储分析延迟定时器ID
};

// 工具函数
const utils = {
  /**
   * 获取单选框值
   * @param {HTMLInputElement[]} radioGroup - 单选框组
   * @returns {string|null} 选中的值
   */
  getRadioValue(radioGroup) {
    for (let i = 0; i < radioGroup.length; i++) {
      if (radioGroup[i].checked) {
        return radioGroup[i].value;
      }
    }
    return null;
  },

  /**
   * 获取复选框值
   * @param {HTMLInputElement[]} checkboxGroup - 复选框组
   * @returns {string[]} 选中的值数组
   */
  getCheckboxValues(checkboxGroup) {
    return Array.from(checkboxGroup)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  },

  /**
   * 查找表单组元素
   * @param {HTMLElement} element - 表单元素
   * @returns {HTMLElement|null} 表单组元素
   */
  findFormGroup(element) {
    let current = element;
    while (current && !current.classList.contains('form-group')) {
      current = current.parentElement;
    }
    return current;
  },

  /**
   * 显示错误信息
   * @param {string} message - 错误信息
   * @param {HTMLElement} element - 目标元素
   */
  showError(message, element) {
    const formGroup = this.findFormGroup(element);
    if (formGroup) {
      formGroup.classList.add('error');
      let errorMsg = formGroup.querySelector('.error-message');
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        formGroup.appendChild(errorMsg);
      }
      errorMsg.textContent = message;
    }
  },

  /**
   * 清除错误信息
   * @param {HTMLElement} element - 目标元素
   */
  clearError(element) {
    const formGroup = this.findFormGroup(element);
    if (formGroup) {
      formGroup.classList.remove('error');
      const errorMsg = formGroup.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    }
  }
};

// 用户需求分析
const userNeedsAnalysis = {
  /**
   * 确定用户优先级
   * @returns {string[]} 优先级列表
   */
  determineUserPriorities() {
    const priorities = [];
    const { application, precision, experts } = state.userQuestionnaireData;
    
    if (application === '学术研究发表') {
      priorities.push('客观性', '可重复性');
    } else if (application === '对外公开报告') {
      priorities.push('解释性', '透明度');
    } else {
      priorities.push('实用性', '效率');
    }
    
    if (precision === '高') {
      priorities.push('精确性');
    }
    
    if (experts === '充足') {
      priorities.push('专业判断');
    } else if (experts === '无') {
      priorities.push('客观数据驱动');
    }
    
    return priorities;
  },

  /**
   * 获取用户需求数据
   * @returns {Object} 用户需求数据
   */
  getUserNeeds() {
    const { domain, experts, precision, application, timeConstraint } = state.userQuestionnaireData;
    
    return {
      domain: domain || "未知领域",
      expertiseLevel: experts === '充足' ? '高' : experts === '有限' ? '中' : '低',
      stabilityNeed: precision === '高' ? '高' : precision === '中' ? '中' : '低',
      flexibilityNeed: application === '学术研究发表' ? '高' : '中',
      interpretabilityNeed: application === '对外公开报告' ? '高' : '中',
      timeConstraint: timeConstraint === '快速' ? '紧' : timeConstraint === '适中' ? '中' : '宽松',
      priorityFeatures: this.determineUserPriorities()
    };
  }
};

// 数据特征分析
const dataAnalysis = {
  /**
   * 获取数据特征
   * @returns {Object} 数据特征
   */
  getDataFeatures() {
    const selectedDataTypes = state.userQuestionnaireData.dataType || [];
    const features = {
      sampleSize: Math.floor(Math.random() * 200) + 50,
      indicatorCount: Math.floor(Math.random() * 20) + 5,
      distribution: Math.random() > 0.5 ? '正态' : '非正态',
      missingValues: Math.random() > 0.7 ? '少量' : Math.random() > 0.4 ? '中等' : '无',
      outliers: Math.random() > 0.7 ? '少量' : Math.random() > 0.4 ? '中等' : '无',
      correlation: Math.random() > 0.6 ? '强' : Math.random() > 0.3 ? '中' : '弱',
      variability: Math.random() > 0.5 ? '高' : '中',
      summary: '无法分析真实数据，使用模拟数据特征'
    };

    // 根据数据类型添加特定特征
    if (selectedDataTypes.includes('原始指标数据')) {
      features.objectiveDataQuality = Math.random() > 0.5 ? '优' : '良';
      features.objectiveDataSuitability = '适合熵权法、变异系数法、CRITIC法等客观赋权';
    }

    if (selectedDataTypes.includes('专家对指标重要性的评分')) {
      features.expertConsistency = Math.random() > 0.6 ? '高' : '中';
      features.expertCount = state.userQuestionnaireData.expertsCount || Math.floor(Math.random() * 10) + 3;
      features.subjectiveDataSuitability = '适合专家打分法、德尔菲法等主观赋权';
    }

    if (selectedDataTypes.includes('专家的成对比较判断')) {
      features.pairwiseConsistency = Math.random() > 0.7 ? '一致性良好' : '一致性一般';
      features.ahpSuitability = '适合层次分析法(AHP)及其改进方法';
    }

    if (selectedDataTypes.includes('其他特殊数据')) {
      features.specialDataType = '多投入多产出数据或参考序列';
      features.specialMethodSuitability = '适合DEA或灰色关联分析等特殊方法';
    }

    return features;
  },
  
  /**
   * 获取基于问卷的预期数据特征
   * @param {boolean} hasNoData - 是否选择了"无已有数据"
   * @returns {Object} 基于问卷的预期数据特征
   */
  getExpectedDataFeatures(hasNoData) {
    // 从问卷中获取数据维度信息
    const { indicatorCount, variableType, dataQualityIssues } = state.userQuestionnaireData.dataDimension || {};
    
    // 构建预期数据特征对象
    return {
      dataStructure: {
        indicatorCount: indicatorCount || "未知",
        indicatorTypes: ["预期指标"],
        variableTypes: variableType || "未知",
        indicatorCountRange: indicatorCount === "少" ? "预计少量(10个以下)" : 
                             indicatorCount === "中" ? "预计中等(10-30个)" : 
                             indicatorCount === "多" ? "预计大量(30个以上)" : "未知",
        hierarchyLevels: state.userQuestionnaireData.userDimension?.structure === "多层次" ? 
                         `预计${state.userQuestionnaireData.userDimension?.levels || "多"}层` : "预计单层"
      },
      dataQuality: {
        completeness: 5, // 默认中等
        reliability: 5,
        consistency: 5,
        missingValuePattern: dataQualityIssues && dataQualityIssues.includes("缺失值") ? "预计存在" : "预计无",
        outlierSituation: dataQualityIssues && dataQualityIssues.includes("异常值") ? "预计存在" : "预计无",
        dataQualityRequirement: dataQualityIssues && dataQualityIssues.includes("无问题") ? "预计高" : "预计中",
        missingDataTolerance: dataQualityIssues && dataQualityIssues.includes("缺失值") ? "预计中" : "预计高"
      },
      distributionFeatures: {
        distribution: dataQualityIssues && dataQualityIssues.includes("分布不均") ? "预计非正态/偏态" : "预计正态",
        sampleSize: dataQualityIssues && dataQualityIssues.includes("样本量小") ? "预计小" : indicatorCount === "多" ? "预计大" : "预计中",
        variability: "预计中等",
        normalityTest: dataQualityIssues && dataQualityIssues.includes("分布不均") ? "预计可能不通过" : "预计可能通过"
      },
      correlationFeatures: {
        overallCorrelation: state.userQuestionnaireData.userDimension?.relation === "依赖" ? "预计高" : "预计中低",
        multicollinearityIssues: state.userQuestionnaireData.userDimension?.relation === "依赖" ? "预计可能存在" : "预计可能性低",
        significantCorrelations: []
      },
      limitations: [
        "数据特征基于用户问卷预期",
        ...(!dataQualityIssues ? [] : dataQualityIssues.map(issue => `预计数据问题: ${issue}`))
      ],
      dataRequirements: {
        sampleSizeRequirement: indicatorCount === "多" ? "预计需要大样本" : "预计需要适中样本",
        distributionRequirement: "未指定特殊要求",
        qualityThreshold: "预计中等要求"
      },
      methodSuitability: {
        // 基于变量类型和问题复杂度调整方法适合度
        objectiveMethodSuitability: variableType === "定量" ? 8 : 
                                    variableType === "混合" ? 6 : 4,
        subjectiveMethodSuitability: variableType === "定性" ? 8 : 
                                    variableType === "混合" ? 7 : 5,
        hybridMethodSuitability: variableType === "混合" ? 9 : 7  // 混合方法通常适应性更好
      }
    };
  }
};

// 方法推荐
const methodRecommendation = {
  /**
   * 计算方法匹配度分数
   * @param {Object} method - 权重方法
   * @param {Object} userNeeds - 用户需求
   * @param {Object} dataFeatures - 数据特征
   * @returns {number} 匹配度分数
   */
  calculateMethodScore(method, userNeeds, dataFeatures) {
    let score = 0;
    const weights = {
      expertiseMatch: 2,    // 专家资源匹配权重
      timeMatch: 1.5,       // 时间约束匹配权重
      dataMatch: 2,         // 数据特征匹配权重
      interpretabilityMatch: 1.5,  // 可解释性匹配权重
      complexityMatch: 1,   // 复杂度匹配权重
      costMatch: 1          // 成本匹配权重
    };

    // 专家资源匹配度评分
    if (userNeeds.experts === '充足' && method.characteristics.expertDependency === '高') {
      score += weights.expertiseMatch;
    } else if (userNeeds.experts === '无' && method.characteristics.expertDependency === '低') {
      score += weights.expertiseMatch;
    }

    // 时间约束匹配度评分
    if (userNeeds.timeConstraint === '紧' && method.characteristics.timeCost === '低') {
      score += weights.timeMatch;
    } else if (userNeeds.timeConstraint === '宽松' && method.characteristics.timeCost === '高') {
      score += weights.timeMatch;
    }

    // 数据特征匹配度评分
    if (dataFeatures.sampleSize > 100 && method.characteristics.dataRequirement === '高') {
      score += weights.dataMatch;
    } else if (dataFeatures.sampleSize < 50 && method.characteristics.dataRequirement === '低') {
      score += weights.dataMatch;
    }

    // 可解释性匹配度评分
    if (userNeeds.interpretability === '高' && method.characteristics.interpretability === '高') {
      score += weights.interpretabilityMatch;
    }

    // 复杂度匹配度评分
    if (userNeeds.complexity === '低' && method.characteristics.complexity === '低') {
      score += weights.complexityMatch;
    }

    // 成本匹配度评分
    if (userNeeds.cost === '低' && method.characteristics.cost === '低') {
      score += weights.costMatch;
    }

    return score;
  },

  /**
   * 处理LLM响应
   * @param {string} llmResponse - LLM响应文本
   * @returns {Array} 解析后的推荐结果
   */
  parseLLMResponse(llmResponse) {
    try {
      // 尝试解析JSON格式的响应
      if (typeof llmResponse === 'string') {
        try {
          return JSON.parse(llmResponse);
        } catch (e) {
          // 如果不是JSON格式，进行文本解析
          return this.parseTextResponse(llmResponse);
        }
      }
      return llmResponse;
    } catch (error) {
      console.error("解析LLM响应失败:", error);
      throw error;
    }
  },

  /**
   * 解析文本格式的响应
   * @param {string} text - 响应文本
   * @returns {Array} 解析后的推荐结果
   */
  parseTextResponse(text) {
    const recommendations = [];
    const lines = text.split('\n');
    let currentMethod = null;

    for (const line of lines) {
      if (line.includes('方法名称：') || line.includes('方法:')) {
        if (currentMethod) {
          recommendations.push(currentMethod);
        }
        currentMethod = {
          method: line.split('：')[1]?.trim() || line.split(':')[1]?.trim(),
          suitability: '中',
          reason: '',
          advantages: [],
          implementation: ''
        };
      } else if (line.includes('适合度：') || line.includes('适合度:')) {
        const suitability = line.split('：')[1]?.trim() || line.split(':')[1]?.trim();
        if (currentMethod) {
          currentMethod.suitability = suitability;
        }
      } else if (line.includes('推荐理由：') || line.includes('推荐理由:')) {
        if (currentMethod) {
          currentMethod.reason = line.split('：')[1]?.trim() || line.split(':')[1]?.trim();
        }
      } else if (line.includes('方法优势：') || line.includes('方法优势:')) {
        if (currentMethod) {
          currentMethod.advantages = line.split('：')[1]?.trim().split('、') || 
                                   line.split(':')[1]?.trim().split('、');
        }
      } else if (line.includes('实施建议：') || line.includes('实施建议:')) {
        if (currentMethod) {
          currentMethod.implementation = line.split('：')[1]?.trim() || line.split(':')[1]?.trim();
        }
      }
    }

    if (currentMethod) {
      recommendations.push(currentMethod);
    }

    return recommendations;
  },

  /**
   * 验证和补充推荐结果
   * @param {Array} recommendations - 推荐结果
   * @param {Array} weightMethods - 权重方法库
   * @returns {Array} 补充后的推荐结果
   */
  validateAndEnrichRecommendations(recommendations, weightMethods) {
    return recommendations.map(rec => {
      // 查找方法库中的详细信息
      const methodDetail = weightMethods.find(m => m.name === rec.method);
      
      if (methodDetail) {
        // 补充方法详细信息
        return {
          ...rec,
          advantages: rec.advantages.length > 0 ? rec.advantages : methodDetail.advantages,
          implementation: rec.implementation || methodDetail.implementationSteps.join('\n'),
          details: methodDetail
        };
      }
      
      return rec;
    });
  },

  /**
   * 处理权重方法推荐
   * @param {Object} userNeeds - 用户需求
   * @param {Object} dataFeatures - 数据特征
   * @param {Array} weightMethods - 权重方法库
   * @param {string} prompt - 推荐提示词
   * @returns {Promise<Array>} 推荐结果
   */
  async processMethodRecommendation(userNeeds, dataFeatures, weightMethods, prompt) {
    try {
      // 直接使用原始权重方法库，llmService.js中会进行过滤
      console.log("调用processMethodRecommendation进行方法推荐");
      
      return await processMethodRecommendation(userNeeds, dataFeatures, weightMethods, prompt);
    } catch (error) {
      console.error("方法推荐处理失败:", error);
      throw new Error("推荐处理失败，请检查agent配置或重试");
    }
  },

  /**
   * 获取回退推荐结果
   * @returns {Array} 默认推荐结果
   */
  getFallbackRecommendations() {
    return [
      {
        method: "熵权法",
        suitability: "高",
        reason: "作为最常用的客观赋权方法，适用于大多数场景",
        advantages: [
          "客观性强",
          "计算简单",
          "不需要专家判断",
          "结果稳定"
        ],
        implementation: "1. 数据标准化\n2. 计算信息熵\n3. 计算权重"
      },
      {
        method: "层次分析法(AHP)",
        suitability: "中",
        reason: "适合需要专家判断的复杂决策问题",
        advantages: [
          "考虑专家经验",
          "可处理多层次结构",
          "结果可解释性强"
        ],
        implementation: "1. 构建判断矩阵\n2. 计算权重\n3. 一致性检验"
      }
    ];
  }
};

// 文件处理
const fileHandler = {
  /**
   * 处理文件上传
   * @param {FileList} files - 上传的文件列表
   */
  processFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 检查文件是否已存在
      const existingFile = state.uploadedFiles.find(f => f.name === file.name);
      if (!existingFile) {
        state.uploadedFiles.push(file);
        this.displayFile(file);
      }
    }
  },

  /**
   * 显示文件信息
   * @param {File} file - 文件对象
   */
  displayFile(file) {
    const fileList = document.getElementById('fileList');
    
    // 检查fileList元素是否存在
    if (!fileList) {
      console.error('找不到文件列表元素(#fileList)');
      return; // 如果元素不存在，直接返回，避免后续操作
    }
    
    const li = document.createElement('li');
    
    // 创建文件名显示
    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';
    
    // 根据文件类型添加不同图标
    const fileIcon = document.createElement('span');
    fileIcon.className = 'file-icon';
    
    if (file.name.endsWith('.csv')) {
      fileIcon.textContent = '📊';
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      fileIcon.textContent = '📈';
    } else {
      fileIcon.textContent = '📄';
    }
    
    const fileName = document.createElement('span');
    fileName.textContent = file.name;
    
    fileNameDiv.appendChild(fileIcon);
    fileNameDiv.appendChild(fileName);
    
    // 创建文件操作按钮
    const fileActions = document.createElement('div');
    fileActions.className = 'file-actions';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'file-remove';
    removeButton.textContent = '✕';
    removeButton.title = '删除文件';
    removeButton.addEventListener('click', () => this.removeFile(file.name));
    
    fileActions.appendChild(removeButton);
    
    li.appendChild(fileNameDiv);
    li.appendChild(fileActions);
    
    fileList.appendChild(li);
    
    // 检查预览容器是否存在
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      // 显示文件预览
      this.displayFilePreview(file);
    } else {
      console.warn('找不到预览容器(.preview-container)，跳过文件预览');
    }
  },

  /**
   * 移除文件
   * @param {string} fileName - 文件名
   */
  removeFile(fileName) {
    state.uploadedFiles = state.uploadedFiles.filter(file => file.name !== fileName);
    
    // 更新显示
    const fileList = document.getElementById('fileList');
    const items = fileList.querySelectorAll('li');
    items.forEach(item => {
      const nameElement = item.querySelector('.file-name span:last-child');
      if (nameElement && nameElement.textContent === fileName) {
        fileList.removeChild(item);
      }
    });
  },

  /**
   * 显示文件预览
   * @param {File} file - 文件对象
   */
  displayFilePreview(file) {
    const previewContainer = document.querySelector('.preview-container');
    
    // 检查预览容器是否存在
    if (!previewContainer) {
      console.error('找不到预览容器(.preview-container)');
      return; // 如果容器不存在，直接返回
    }
    
    // 清空数据分析结果
    const dataAnalysisResults = document.getElementById('dataAnalysisResults');
    const indicatorsList = document.getElementById('indicatorsList');
    const dataOverview = document.getElementById('dataOverview');
    
    if (dataAnalysisResults) {
      dataAnalysisResults.innerHTML = '<p class="analysis-message">正在分析数据...</p>';
    }
    if (indicatorsList) indicatorsList.innerHTML = '';
    if (dataOverview) dataOverview.innerHTML = '';
    
    // 仅处理CSV和Excel文件
    if (file.name.endsWith('.csv')) {
      // 读取CSV文件预览
      const reader = new FileReader();
      reader.onload = function(e) {
        const csvData = e.target.result;
        this.displayCsvPreview(csvData, previewContainer);
        
        // 智能解析CSV数据
        this.analyzeDataStructure(csvData, 'csv', file.name);
      }.bind(this);
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Excel文件提示
      previewContainer.innerHTML = '<div class="preview-message">Excel文件将在后台分析，无法直接预览</div>';
      
      // 在这里可以添加Excel文件解析逻辑，但需要额外的库如xlsx.js
      if (dataAnalysisResults) {
        dataAnalysisResults.innerHTML = '<p class="analysis-message">Excel文件需要在后台解析，将在分析过程中处理</p>';
      }
    } else {
      // 其他文件提示
      previewContainer.innerHTML = '<div class="preview-message">文件类型不支持预览，但会在分析中使用</div>';
      
      if (dataAnalysisResults) {
        dataAnalysisResults.innerHTML = '<p class="analysis-message">文件类型不被自动识别，将在分析过程中处理</p>';
      }
    }
  },
  
  /**
   * 分析数据结构，智能识别指标和数据
   * @param {string} data - 文件数据内容
   * @param {string} fileType - 文件类型(csv, excel等)
   * @param {string} fileName - 文件名
   */
  analyzeDataStructure(data, fileType, fileName) {
    console.log(`开始分析数据结构: ${fileName}, 类型: ${fileType}`);
    
    // 初始化结果元素
    const dataAnalysisResults = document.getElementById('dataAnalysisResults');
    const indicatorsList = document.getElementById('indicatorsList');
    const dataOverview = document.getElementById('dataOverview');
    
    if (!dataAnalysisResults || !indicatorsList || !dataOverview) {
      console.error('找不到数据分析结果元素');
      return;
    }
    
    try {
      if (fileType === 'csv') {
        // 解析CSV数据
        const rows = data.split('\n');
        if (rows.length < 2) {
          throw new Error('数据行数不足，无法分析');
        }
        
        // 提取表头
        const headers = rows[0].split(',').map(h => h.trim());
        console.log('识别到的表头:', headers);
        
        // 检查数据类型和结构
        const dataTypeByColumn = this.detectDataTypes(rows, headers);
        
        // 识别可能的指标列
        const indicators = this.identifyIndicators(headers, dataTypeByColumn, rows);
        console.log('识别到的指标:', indicators);
        
        // 显示分析结果
        dataAnalysisResults.innerHTML = `
          <p class="analysis-success">数据解析成功，共有 ${rows.length-1} 行数据，${headers.length} 列。</p>
          <p>通过智能分析，识别出 ${indicators.length} 个可能的指标。</p>
        `;
        
        // 显示指标列表
        indicatorsList.innerHTML = '';
        indicators.forEach(indicator => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span class="indicator-name">${indicator.name}</span>
            <span class="indicator-type">(${indicator.type})</span>
            <span class="indicator-stats">数值范围: ${indicator.min.toFixed(2)} - ${indicator.max.toFixed(2)}, 平均值: ${indicator.avg.toFixed(2)}</span>
          `;
          indicatorsList.appendChild(li);
        });
        
        // 显示数据概览
        dataOverview.innerHTML = `
          <p>数据完整度: ${this.calculateCompleteness(rows, headers).toFixed(2)}%</p>
          <p>数据行数: ${rows.length-1}</p>
          <p>数据列数: ${headers.length}</p>
          <p>可能的评价单元数: ${this.identifyEvaluationUnits(rows, headers).length}</p>
        `;
        
        // 保存分析结果到状态
        state.dataAnalysisResult = {
          indicators: indicators,
          headers: headers,
          evaluationUnits: this.identifyEvaluationUnits(rows, headers),
          dataSize: {
            rows: rows.length-1,
            columns: headers.length
          },
          dataCompleteness: this.calculateCompleteness(rows, headers)
        };
        
      } else {
        dataAnalysisResults.innerHTML = '<p class="analysis-message">当前只支持CSV格式的数据自动解析</p>';
      }
    } catch (error) {
      console.error('数据解析错误:', error);
      dataAnalysisResults.innerHTML = `<p class="analysis-error">数据解析过程中出现错误: ${error.message}</p>`;
    }
  },
  
  /**
   * 检测每列数据的类型
   * @param {string[]} rows - 数据行
   * @param {string[]} headers - 表头
   * @returns {Object} 每列的数据类型
   */
  detectDataTypes(rows, headers) {
    const dataTypeByColumn = {};
    
    headers.forEach((header, colIndex) => {
      const values = [];
      let numericCount = 0;
      let stringCount = 0;
      
      // 采样最多20行进行类型检测
      const sampleSize = Math.min(rows.length - 1, 20);
      for (let i = 1; i <= sampleSize; i++) {
        if (!rows[i] || rows[i].trim() === '') continue;
        
        const cells = rows[i].split(',');
        if (colIndex < cells.length) {
          const value = cells[colIndex].trim();
          values.push(value);
          
          // 检查是否为数字
          if (!isNaN(parseFloat(value)) && isFinite(value)) {
            numericCount++;
          } else {
            stringCount++;
          }
        }
      }
      
      // 确定数据类型
      const numericRatio = numericCount / values.length;
      dataTypeByColumn[header] = {
        type: numericRatio > 0.8 ? 'numeric' : 'string',
        numericRatio: numericRatio
      };
    });
    
    return dataTypeByColumn;
  },
  
  /**
   * 识别可能是指标的列
   * @param {string[]} headers - 表头
   * @param {Object} dataTypeByColumn - 每列的数据类型
   * @param {string[]} rows - 数据行
   * @returns {Array} 指标信息列表
   */
  identifyIndicators(headers, dataTypeByColumn, rows) {
    const indicators = [];
    
    headers.forEach((header, colIndex) => {
      const dataType = dataTypeByColumn[header];
      
      // 数值型列更可能是指标
      if (dataType.type === 'numeric') {
        // 计算数值统计信息
        const stats = this.calculateColumnStats(rows, colIndex);
        
        // 忽略ID列或序号列（通常变化很小且递增）
        if (!this.isLikelyIdColumn(header, stats)) {
          indicators.push({
            name: header,
            type: '数值型',
            index: colIndex,
            ...stats
          });
        }
      } else {
        // 某些字符串列也可能是分类型指标
        if (this.isPotentialCategoryIndicator(rows, colIndex)) {
          indicators.push({
            name: header,
            type: '分类型',
            index: colIndex,
            categories: this.getUniqueCategories(rows, colIndex),
            min: 0,
            max: 0,
            avg: 0
          });
        }
      }
    });
    
    return indicators;
  },
  
  /**
   * 计算列的统计信息
   * @param {string[]} rows - 数据行
   * @param {number} colIndex - 列索引
   * @returns {Object} 统计信息
   */
  calculateColumnStats(rows, colIndex) {
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const cells = rows[i].split(',');
      if (colIndex < cells.length) {
        const value = parseFloat(cells[colIndex]);
        if (!isNaN(value)) {
          sum += value;
          count++;
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    }
    
    return {
      min: count > 0 ? min : 0,
      max: count > 0 ? max : 0,
      avg: count > 0 ? sum / count : 0,
      count: count
    };
  },
  
  /**
   * 判断某列是否可能是ID列或序号列
   * @param {string} header - 列名
   * @param {Object} stats - 统计信息
   * @returns {boolean} 是否可能是ID列
   */
  isLikelyIdColumn(header, stats) {
    const idPattern = /id|编号|序号|index|no\./i;
    return (idPattern.test(header) && stats.max - stats.min + 1 === stats.count);
  },
  
  /**
   * 判断某列是否可能是分类型指标
   * @param {string[]} rows - 数据行
   * @param {number} colIndex - 列索引
   * @returns {boolean} 是否可能是分类型指标
   */
  isPotentialCategoryIndicator(rows, colIndex) {
    const uniqueValues = new Set();
    const sampleSize = Math.min(rows.length - 1, 50);
    
    for (let i = 1; i <= sampleSize; i++) {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const cells = rows[i].split(',');
      if (colIndex < cells.length) {
        uniqueValues.add(cells[colIndex].trim());
      }
    }
    
    // 分类型指标通常有有限的几个不同值
    return uniqueValues.size > 1 && uniqueValues.size <= 10;
  },
  
  /**
   * 获取某列的唯一分类值
   * @param {string[]} rows - 数据行
   * @param {number} colIndex - 列索引
   * @returns {string[]} 唯一分类值列表
   */
  getUniqueCategories(rows, colIndex) {
    const uniqueValues = new Set();
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const cells = rows[i].split(',');
      if (colIndex < cells.length) {
        uniqueValues.add(cells[colIndex].trim());
      }
    }
    
    return Array.from(uniqueValues);
  },
  
  /**
   * 识别评价单元(通常是第一列名称列)
   * @param {string[]} rows - 数据行
   * @param {string[]} headers - 表头
   * @returns {string[]} 评价单元列表
   */
  identifyEvaluationUnits(rows, headers) {
    const units = [];
    const namePatterns = /名称|姓名|地区|企业|学校|单位|项目|name|title|region|area|district|company|project/i;
    
    // 查找可能的名称列
    let nameColumnIndex = 0;
    for (let i = 0; i < headers.length; i++) {
      if (namePatterns.test(headers[i])) {
        nameColumnIndex = i;
        break;
      }
    }
    
    // 如果没找到匹配的名称列，则使用第一列
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const cells = rows[i].split(',');
      if (nameColumnIndex < cells.length) {
        units.push(cells[nameColumnIndex].trim());
      }
    }
    
    return units;
  },
  
  /**
   * 计算数据完整度
   * @param {string[]} rows - 数据行
   * @param {string[]} headers - 表头
   * @returns {number} 完整度百分比
   */
  calculateCompleteness(rows, headers) {
    let totalCells = 0;
    let nonEmptyCells = 0;
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i] || rows[i].trim() === '') continue;
      
      const cells = rows[i].split(',');
      for (let j = 0; j < Math.min(cells.length, headers.length); j++) {
        totalCells++;
        if (cells[j] && cells[j].trim() !== '') {
          nonEmptyCells++;
        }
      }
    }
    
    return totalCells > 0 ? (nonEmptyCells / totalCells) * 100 : 0;
  },

  /**
   * 显示CSV预览
   * @param {string} csvData - CSV数据
   * @param {HTMLElement} container - 容器元素
   */
  displayCsvPreview(csvData, container) {
    // 检查容器是否存在
    if (!container) {
      console.error('预览容器不存在');
      return; // 如果容器不存在，直接返回
    }
    
    const rows = csvData.split('\n');
    const headerRow = rows[0].split(',');
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'preview-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerTr = document.createElement('tr');
    
    headerRow.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerTr.appendChild(th);
    });
    
    thead.appendChild(headerTr);
    table.appendChild(thead);
    
    // 创建表体，最多显示10行
    const tbody = document.createElement('tbody');
    const displayRows = Math.min(rows.length - 1, 10);
    
    for (let i = 1; i <= displayRows; i++) {
      if (rows[i].trim() === '') continue;
      
      const dataTr = document.createElement('tr');
      const rowData = rows[i].split(',');
      
      rowData.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        dataTr.appendChild(td);
      });
      
      tbody.appendChild(dataTr);
    }
    
    table.appendChild(tbody);
    
    // 显示行数信息
    const infoDiv = document.createElement('div');
    infoDiv.className = 'preview-info';
    infoDiv.textContent = `显示 ${displayRows} 行（共 ${rows.length - 1} 行）`;
    
    container.innerHTML = '';
    container.appendChild(table);
    container.appendChild(infoDiv);
  }
};

// UI控制
const uiController = {
  /**
   * 初始化事件监听
   */
  initEventListeners() {
    // 步骤控制按钮
    const analyzeBtn = document.getElementById('analyzeBtn');
    const backToStep1Btn = document.getElementById('backToStep1');
    const startOverBtn = document.getElementById('startOver');
    const downloadReportBtn = document.getElementById('downloadReport');
    
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        this.validateAndAnalyze();
      });
    }
    
    if (backToStep1Btn) backToStep1Btn.addEventListener('click', () => this.stopAnalysisAndGoBack());
    if (startOverBtn) startOverBtn.addEventListener('click', () => this.stopAnalysisAndReset());
    if (downloadReportBtn) downloadReportBtn.addEventListener('click', () => this.downloadReport());
    
    // 数据类型选择事件
    const dataTypeCheckboxes = document.querySelectorAll('.data-type-checkbox');
    if (dataTypeCheckboxes) {
      dataTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          this.handleDataTypeSelection(e);
        });
      });
    }
    
    // 数据文件上传事件
    const dataFileInputs = document.querySelectorAll('.data-file-input');
    if (dataFileInputs) {
      dataFileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          this.handleDataFileSelection(e);
        });
      });
    }
  },

  /**
   * 验证表单并开始分析（完全重写版）
   * 核心逻辑：循环验证直到所有字段完成
   */
  validateAndAnalyze() {
    try {
      console.log('🚀 开始验证和分析流程...');
      
      // 清除之前的错误状态
      this.clearAllSectionErrors();
      
      // 1. 完整验证所有字段
      const validationResult = this.validateQuestionnaireForm();
      
      if (!validationResult.isValid) {
        console.log('📝 验证失败，跳转到未完成字段...');
        // 跳转到第一个未完成的字段，并显示"分析并推荐"按钮
        this.jumpToFirstIncompleteField(validationResult.firstIncompleteField);
        return; // 停止分析，等待用户填写
      }
      
      console.log('✅ 所有字段验证通过，开始分析流程...');
      
      // 2. 收集问卷数据
      this.collectQuestionnaireData();
      
      // 3. 检查是否有数据类型选择
      const hasNoData = state.userQuestionnaireData.dataType && 
                      state.userQuestionnaireData.dataType.includes("无已有数据");
      
      // 4. 验证文件上传（如果需要）
      if (!hasNoData && !this.validateFileUpload()) {
        console.log('📁 文件上传验证失败');
        return;
      }
      
      // 5. 所有验证都通过，开始分析
      console.log('🎯 所有验证完成，开始分析和推荐...');
      this.startAnalysisProcess();
      
    } catch (error) {
      console.error('验证和分析过程中出现错误:', error);
      alert(`分析过程中出现错误: ${error.message}`);
    }
  },

  /**
   * 停止分析并返回修改
   */
  stopAnalysisAndGoBack() {
    console.log('🛑 用户点击返回修改，停止分析流程...');
    
    // 完全清理分析流程
    this.cleanupAnalysisProcess();
    
    // 返回到第一步
    this.goToStep(1);
    
    console.log('✅ 已停止分析流程并返回修改');
  },

  /**
   * 停止分析并重新开始
   */
  stopAnalysisAndReset() {
    console.log('🛑 用户点击重新开始，停止分析流程...');
    
    // 完全清理分析流程
    this.cleanupAnalysisProcess();
    
    // 重置应用
    this.resetApplication();
    
    console.log('✅ 已停止分析流程并重新开始');
  },

  /**
   * 清理分析流程
   * 清理所有正在进行的分析相关操作
   */
  cleanupAnalysisProcess() {
    console.log('🧹 清理分析流程...');
    
    // 清理定时器
    if (state.analysisTimeoutId) {
      clearTimeout(state.analysisTimeoutId);
      state.analysisTimeoutId = null;
      console.log('✅ 已清理分析定时器');
    }
    
    // 重置状态标志
    state.shouldStopAnalysis = true;
    state.isAnalyzing = false;
    state.isLoading = false;
    
    // 隐藏加载界面
    const loadingResults = document.getElementById('loadingResults');
    if (loadingResults) {
      loadingResults.style.display = 'none';
    }
    
    console.log('✅ 分析流程清理完成');
  },

  /**
   * 开始分析流程
   * 统一处理分析启动的UI状态和数据准备
   */
  startAnalysisProcess() {
    try {
      console.log('🎯 启动分析流程...');
      
      // 0. 检查是否已有分析在进行，如果有则先清理
      if (state.isAnalyzing) {
        console.log('⚠️ 检测到已有分析在进行，先清理旧流程...');
        this.cleanupAnalysisProcess();
      }
      
      // 清理可能存在的旧定时器
      if (state.analysisTimeoutId) {
        console.log('🧹 清理旧的分析定时器');
        clearTimeout(state.analysisTimeoutId);
        state.analysisTimeoutId = null;
      }
      
      // 1. 重置所有分析相关标志
      state.shouldStopAnalysis = false;
      state.isAnalyzing = true;
      state.isLoading = true;
      
      // 2. 初始化UI状态
      const loadingResults = document.getElementById('loadingResults');
      const resultsContainer = document.getElementById('resultsContainer');
      
      if (loadingResults) {
        loadingResults.style.display = 'flex';
        
        // 重置所有分析阶段
        document.querySelectorAll('.analysis-stage').forEach(el => {
          el.classList.remove('active', 'completed');
        });
        
        // 设置第一个阶段为活动状态
        const firstStage = document.getElementById('stageUserNeeds');
        if (firstStage) firstStage.classList.add('active');
        
        // 更新加载文本
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = '正在分析用户需求...';
      }
      
      if (resultsContainer) resultsContainer.style.display = 'none';
      
      // 3. 切换到结果页面
      this.goToStep(2);
      
      // 4. 开始分析流程（短暂延迟确保UI更新完成）
      state.analysisTimeoutId = setTimeout(() => {
        state.analysisTimeoutId = null; // 清除定时器ID
        this.analyzeDataAndRecommend();
      }, 300);
      
    } catch (error) {
      console.error('启动分析流程时出现错误:', error);
      alert(`启动分析时出现错误: ${error.message}`);
      state.isLoading = false;
    }
  },

  /**
   * 导航到指定步骤
   * @param {number} stepNumber - 步骤编号
   */
  goToStep(stepNumber) {
    // 更新步骤显示
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      step.classList.remove('active');
      if (index + 1 === stepNumber) {
        step.classList.add('active');
      }
    });
    
    // 更新步骤指示器
    const stepBullets = document.querySelectorAll('.step-bullet');
    const stepLabels = document.querySelectorAll('.step-label');
    const stepLines = document.querySelectorAll('.step-line');
    
    // 如果是 step2 (结果页面)，则在指示器中显示为 step5 (查看结果)
    const indicatorStep = stepNumber === 2 ? 5 : stepNumber;
    
    stepBullets.forEach((bullet, index) => {
      bullet.classList.remove('active', 'completed');
      if (index + 1 === indicatorStep) {
        bullet.classList.add('active');
      } else if (index + 1 < indicatorStep) {
        bullet.classList.add('completed');
      }
    });
    
    stepLabels.forEach((label, index) => {
      label.classList.remove('active');
      if (index + 1 === indicatorStep) {
        label.classList.add('active');
      }
    });
    
    stepLines.forEach((line, index) => {
      line.classList.remove('active');
      if (index + 1 < indicatorStep) {
        line.classList.add('active');
      }
    });
    
    // 根据步骤调整滚动位置
    if (stepNumber === 2) {
      // 进入推荐结果页面时，滚动到步骤指示器位置，显示完整的推荐流程
      const stepsContainer = document.querySelector('.steps-container');
      if (stepsContainer) {
        stepsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      // 其他情况滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  },

  /**
   * 字段到节的映射
   */
  getFieldSectionMapping() {
    return {
      // Section 1: 核心任务特征
      'domain': 1,
      'purpose': 1,
      'experts': 1,
      'timeConstraint': 1,
      'precision': 1,
      'structure': 1,
      'relation': 1,
      'application': 1,
      
      // Section 2: 数据条件
      'dataType': 2,
      'indicatorCount': 2,
      'variableType': 2,
      'dataQualityIssues': 2,
      
      // Section 3: 实施环境
      'implementationTime': 3,
      'computationalResources': 3,
      'teamSize': 3,
      'budget': 3,
      'softwareAvailability': 3,
      'riskTolerance': 3,
      
      // Section 4: 用户偏好
      'methodPreference': 4,
      'knowledgeLevel': 4,
      'specialRequirements': 4
    };
  },

  /**
   * 验证问卷表单（完全重写版）
   * @returns {Object} 验证结果 {isValid: boolean, firstIncompleteField: {field, section, element}}
   */
  validateQuestionnaireForm() {
    console.log('🔍 开始完整验证问卷表单...');
    
    let isValid = true;
    let firstIncompleteField = null;
    const form = document.getElementById('questionnaireForm');
    
    if (!form) {
      console.error('❌ 找不到问卷表单元素');
      return { isValid: false, firstIncompleteField: null };
    }
    
    // 清除之前的错误状态
    document.querySelectorAll('.form-group.error').forEach(group => {
      utils.clearError(group.querySelector('input, select, textarea'));
    });
    
    // 按页面顺序验证所有字段
    const validationResult = this.validateAllFieldsBySection(form);
    
    console.log(`✅ 验证完成 - 总体有效性: ${validationResult.isValid}`);
    if (validationResult.firstIncompleteField) {
      console.log(`🎯 需要跳转到: ${validationResult.firstIncompleteField.field} (第${validationResult.firstIncompleteField.section}页)`);
    }
    
    return validationResult;
  },

  /**
   * 按页面顺序验证所有字段
   * @param {HTMLFormElement} form - 表单元素
   * @returns {Object} 验证结果
   */
  validateAllFieldsBySection(form) {
    let isValid = true;
    let firstIncompleteField = null;
    
    // 按页面顺序验证
    for (let section = 1; section <= 4; section++) {
      console.log(`📋 检查第${section}页...`);
      
      const sectionResult = this.validateSection(form, section);
      
      if (!sectionResult.isValid) {
        isValid = false;
        if (!firstIncompleteField) {
          firstIncompleteField = sectionResult.firstIncompleteField;
          console.log(`🚨 在第${section}页发现第一个未完成字段: ${firstIncompleteField.field}`);
        }
      }
    }
    
    return { isValid, firstIncompleteField };
  },

  /**
   * 验证单个页面的所有字段
   * @param {HTMLFormElement} form - 表单元素
   * @param {number} section - 页面编号
   * @returns {Object} 页面验证结果
   */
  validateSection(form, section) {
    let isValid = true;
    let firstIncompleteField = null;
    
    switch (section) {
      case 1:
        return this.validateSection1(form);
      case 2:
        return this.validateSection2(form);
      case 3:
        return this.validateSection3(form);
      case 4:
        return this.validateSection4(form);
      default:
        return { isValid: true, firstIncompleteField: null };
    }
  },

  /**
   * 验证第1页：核心任务特征
   */
  validateSection1(form) {
    let isValid = true;
    let firstIncompleteField = null;
    
    const requiredFields = [
      'domain', 'purpose', 'evaluationNature', 'complexity', 
      'structure', 'relation', 'precision', 'riskTolerance'
    ];
    
    console.log('  📝 检查第1页必填字段:', requiredFields);
    
    for (const field of requiredFields) {
      const elements = form.elements[field];
      if (!elements) continue;
      
      let fieldValid = false;
      
      if (elements instanceof RadioNodeList) {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].checked) {
            fieldValid = true;
            break;
          }
        }
      }
      
      if (!fieldValid) {
        isValid = false;
        if (!firstIncompleteField) {
          firstIncompleteField = {
            field: field,
            section: 1,
            element: elements[0] || elements
          };
        }
        utils.showError('此项为必填项', elements[0] || elements);
        this.markSectionAsIncomplete(1);
        console.log(`  ❌ 字段 ${field} 未填写`);
      } else {
        utils.clearError(elements[0] || elements);
        console.log(`  ✅ 字段 ${field} 已填写`);
      }
    }
    
    // 检查条件性必填字段
    const domainOther = this.checkConditionalField(form, 'domain', '其他', 'domainOther', 1);
    if (!domainOther.isValid && !firstIncompleteField) {
      firstIncompleteField = domainOther.firstIncompleteField;
      isValid = false;
    }
    
    return { isValid, firstIncompleteField };
  },

  /**
   * 验证第2页：数据条件
   */
  validateSection2(form) {
    let isValid = true;
    let firstIncompleteField = null;
    
    console.log('  📊 检查第2页数据类型选择...');
    
    // 验证数据类型选择
    const dataTypeCheckboxes = document.querySelectorAll('input[name="dataType"]');
    let hasDataType = false;
    let hasNoData = false;
    
    dataTypeCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        hasDataType = true;
        if (checkbox.value === "无已有数据") {
          hasNoData = true;
        }
      }
    });
    
    if (!hasDataType) {
      isValid = false;
      firstIncompleteField = {
        field: 'dataType',
        section: 2,
        element: dataTypeCheckboxes[0]
      };
      utils.showError('请至少选择一种数据类型', dataTypeCheckboxes[0]);
      this.markSectionAsIncomplete(2);
      console.log('  ❌ 数据类型未选择');
    } else {
      utils.clearError(dataTypeCheckboxes[0]);
      console.log('  ✅ 数据类型已选择');
      
      // 如果选择了"无已有数据"，验证预计数据特征
      if (hasNoData) {
        console.log('  📈 检查预计数据特征...');
        
        const indicatorCountResult = this.checkRequiredRadio(form, 'indicatorCount', 2);
        if (!indicatorCountResult.isValid && !firstIncompleteField) {
          firstIncompleteField = indicatorCountResult.firstIncompleteField;
          isValid = false;
        }
        
        const variableTypeResult = this.checkRequiredRadio(form, 'variableType', 2);
        if (!variableTypeResult.isValid && !firstIncompleteField) {
          firstIncompleteField = variableTypeResult.firstIncompleteField;
          isValid = false;
        }
      }
    }
    
    return { isValid, firstIncompleteField };
  },

  /**
   * 验证第3页：实施环境
   */
  validateSection3(form) {
    let isValid = true;
    let firstIncompleteField = null;
    
    const requiredFields = [
      'timeConstraint', 'computingResource', 'experts', 
      'application', 'applicationScope', 'specialNeeds'
    ];
    
    console.log('  🌐 检查第3页必填字段:', requiredFields);
    
    for (const field of requiredFields) {
      const result = this.checkRequiredRadio(form, field, 3);
      if (!result.isValid) {
        isValid = false;
        if (!firstIncompleteField) {
          firstIncompleteField = result.firstIncompleteField;
        }
      }
    }
    
    // 检查条件性必填字段
    const conditionalFields = [
      { triggerField: 'experts', triggerValue: '充足', requiredField: 'expertsCount' },
      { triggerField: 'experts', triggerValue: '有限', requiredField: 'expertsLimitedCount' },
      { triggerField: 'application', triggerValue: '其他', requiredField: 'applicationOther' },
      { triggerField: 'specialNeeds', triggerValue: '是', requiredField: 'specialNeedsText' },
      { triggerField: 'environmentConstraints', triggerValue: '其他', requiredField: 'environmentConstraintsOther' }
    ];
    
    for (const conditional of conditionalFields) {
      const result = this.checkConditionalField(
        form, 
        conditional.triggerField, 
        conditional.triggerValue, 
        conditional.requiredField, 
        3
      );
      if (!result.isValid && !firstIncompleteField) {
        firstIncompleteField = result.firstIncompleteField;
        isValid = false;
      }
    }
    
    return { isValid, firstIncompleteField };
  },

  /**
   * 验证第4页：用户偏好
   */
  validateSection4(form) {
    let isValid = true;
    let firstIncompleteField = null;
    
    const requiredFields = ['methodPreference', 'knowledgeLevel'];
    
    console.log('  👤 检查第4页必填字段:', requiredFields);
    
    for (const field of requiredFields) {
      const result = this.checkRequiredRadio(form, field, 4);
      if (!result.isValid) {
        isValid = false;
        if (!firstIncompleteField) {
          firstIncompleteField = result.firstIncompleteField;
        }
      }
    }
    
    // 检查条件性必填字段
    const specialRequirementsOther = this.checkConditionalField(form, 'specialRequirements', '其他', 'specialRequirementsOther', 4);
    if (!specialRequirementsOther.isValid && !firstIncompleteField) {
      firstIncompleteField = specialRequirementsOther.firstIncompleteField;
      isValid = false;
    }
    
    return { isValid, firstIncompleteField };
  },

  /**
   * 检查必填单选字段
   */
  checkRequiredRadio(form, fieldName, section) {
    const elements = form.elements[fieldName];
    if (!elements) {
      console.log(`  ⚠️ 字段 ${fieldName} 不存在`);
      return { isValid: true, firstIncompleteField: null };
    }
    
    let fieldValid = false;
    
    if (elements instanceof RadioNodeList) {
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
          fieldValid = true;
          break;
        }
      }
    }
    
    if (!fieldValid) {
      const firstIncompleteField = {
        field: fieldName,
        section: section,
        element: elements[0] || elements
      };
      utils.showError('此项为必填项', elements[0] || elements);
      this.markSectionAsIncomplete(section);
      console.log(`  ❌ 字段 ${fieldName} 未填写`);
      return { isValid: false, firstIncompleteField };
    } else {
      utils.clearError(elements[0] || elements);
      console.log(`  ✅ 字段 ${fieldName} 已填写`);
      return { isValid: true, firstIncompleteField: null };
    }
  },

  /**
   * 检查条件性必填字段
   */
  checkConditionalField(form, triggerField, triggerValue, requiredField, section) {
    const triggerElements = form.elements[triggerField];
    const requiredElement = form.elements[requiredField];
    
    if (!triggerElements || !requiredElement) {
      return { isValid: true, firstIncompleteField: null };
    }
    
    let shouldValidate = false;
    
    if (triggerElements instanceof RadioNodeList) {
      for (let i = 0; i < triggerElements.length; i++) {
        if (triggerElements[i].checked && triggerElements[i].value === triggerValue) {
          shouldValidate = true;
          break;
        }
      }
    } else if (triggerElements instanceof NodeList) {
      // 处理checkbox组
      for (let i = 0; i < triggerElements.length; i++) {
        if (triggerElements[i].checked && triggerElements[i].value === triggerValue) {
          shouldValidate = true;
          break;
        }
      }
    }
    
    if (shouldValidate) {
      let fieldValid = false;
      if (requiredElement.value && requiredElement.value.trim() !== '') {
        fieldValid = true;
      }
      
      if (!fieldValid) {
        const firstIncompleteField = {
          field: requiredField,
          section: section,
          element: requiredElement
        };
        utils.showError('此项为必填项', requiredElement);
        this.markSectionAsIncomplete(section);
        console.log(`  ❌ 条件性字段 ${requiredField} 未填写`);
        return { isValid: false, firstIncompleteField };
      } else {
        utils.clearError(requiredElement);
        console.log(`  ✅ 条件性字段 ${requiredField} 已填写`);
      }
    }
    
    return { isValid: true, firstIncompleteField: null };
  },

  /**
   * 标记节为未完成状态
   * @param {number} sectionNumber - 节编号
   */
  markSectionAsIncomplete(sectionNumber) {
    const stepBullet = document.querySelector(`.step-bullet[data-step="${sectionNumber}"]`);
    const stepLabel = document.querySelector(`.step-label[data-step="${sectionNumber}"]`);
    
    if (stepBullet) {
      stepBullet.classList.add('error');
    }
    if (stepLabel) {
      stepLabel.classList.add('error');
    }
  },

  /**
   * 清除所有节的错误状态
   */
  clearAllSectionErrors() {
    document.querySelectorAll('.step-bullet, .step-label').forEach(element => {
      element.classList.remove('error');
    });
  },

  /**
   * 跳转到第一个未完成的字段
   * @param {Object} incompleteField - 未完成字段信息
   */
  jumpToFirstIncompleteField(incompleteField) {
    if (!incompleteField) return;
    
    const { section, element } = incompleteField;
    
    // 导航到对应节
    stepNavigationController.showSection(section);
    
    // 在未完成的页面显示"分析并推荐"按钮
    setTimeout(() => {
      this.showAnalyzeButtonOnIncompletePage(section);
    }, 100);
    
    // 滚动并聚焦到字段
    setTimeout(() => {
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // 聚焦到字段
        setTimeout(() => {
          element.focus();
          
          // 高亮显示字段
          const formGroup = utils.findFormGroup(element);
          if (formGroup) {
            formGroup.classList.add('highlight-incomplete');
            setTimeout(() => {
              formGroup.classList.remove('highlight-incomplete');
            }, 3000);
          }
        }, 500);
      }
    }, 300);
  },

  /**
   * 在未完成的页面显示"分析并推荐"按钮
   * @param {number} section - 当前页面节数
   */
  showAnalyzeButtonOnIncompletePage(section) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (prevBtn) {
      prevBtn.style.display = section > 1 ? 'block' : 'none';
    }
    
    if (nextBtn && analyzeBtn) {
      // 在未完成页面同时显示"下一步"和"分析并推荐"按钮
      nextBtn.style.display = section < state.totalSections ? 'block' : 'none';
      analyzeBtn.style.display = 'block';
      
      // 添加特殊类名用于样式控制
      const formNavigation = document.querySelector('.form-navigation');
      if (formNavigation) {
        formNavigation.classList.add('incomplete-page-navigation');
      }
    }
  },

  /**
   * 收集问卷数据
   * @returns {Object} 收集到的问卷数据
   */
  collectQuestionnaireData() {
    const form = document.getElementById('questionnaireForm');
    if (!form) {
      console.error('找不到表单元素');
      return {};
    }
    
    // 清空之前的数据
    state.userQuestionnaireData = {
      taskDimension: {},
      dataDimension: {},
      userDimension: {},
      environmentDimension: {}
    };
    
    try {
      // 收集任务维度
      const taskRadioFields = [
        'domain', 'purpose', 'evaluationNature', 
        'complexity', 'applicationScope'
      ];
      
      taskRadioFields.forEach(field => {
        const elements = form.elements[field];
        if (elements) {
          state.userQuestionnaireData.taskDimension[field] = utils.getRadioValue(elements);
        } else {
          console.warn(`⚠️ 任务维度 - 找不到字段: ${field}`);
        }
      });
      
      // 处理特殊情况：领域其他选项
      if (state.userQuestionnaireData.taskDimension.domain === '其他' && form.elements['domainOther']) {
        state.userQuestionnaireData.taskDimension.domainOther = form.elements['domainOther'].value;
      }
      
      // 数据维度收集
      const dataTypeCheckboxes = document.querySelectorAll('input[name="dataType"]');
      const selectedDataTypes = Array.from(dataTypeCheckboxes)
                                    .filter(cb => cb.checked)
                                    .map(cb => cb.value);
      
      // 数据类型（多选）
      state.userQuestionnaireData.dataDimension.availableDataTypes = selectedDataTypes;
      
      // 检查是否选择了"无已有数据"
      const hasNoData = selectedDataTypes.includes("无已有数据");
      
      // 如果选择了"无已有数据"，收集预计数据特征信息
      if (hasNoData) {
        // 预计指标数量
        if (form.elements['indicatorCount']) {
          state.userQuestionnaireData.dataDimension.indicatorCount = 
            utils.getRadioValue(form.elements['indicatorCount']);
        } else {
          state.userQuestionnaireData.dataDimension.indicatorCount = '中';
        }
        
        // 预计变量类型
        if (form.elements['variableType']) {
          state.userQuestionnaireData.dataDimension.variableType = 
            utils.getRadioValue(form.elements['variableType']);
          console.log(`✓ 数据维度 - variableType: ${state.userQuestionnaireData.dataDimension.variableType}`);
        } else {
          console.warn('⚠️ 数据维度 - 找不到字段: variableType');
          state.userQuestionnaireData.dataDimension.variableType = '混合';
        }
        
        // 预计数据质量问题
        if (form.elements['dataQualityIssues']) {
          state.userQuestionnaireData.dataDimension.dataQualityIssues = 
            utils.getCheckboxValues(form.elements['dataQualityIssues']);
          console.log(`✓ 数据维度 - dataQualityIssues: ${state.userQuestionnaireData.dataDimension.dataQualityIssues.join(', ')}`);
        } else {
          console.warn('⚠️ 数据维度 - 找不到字段: dataQualityIssues');
          state.userQuestionnaireData.dataDimension.dataQualityIssues = [];
        }
      } else {
        // 存储每个数据类型对应的文件
        state.userQuestionnaireData.dataDimension.dataFiles = {};
        selectedDataTypes.forEach(type => {
          if (type !== "无已有数据" && state.dataTypeFiles[type]) {
            state.userQuestionnaireData.dataDimension.dataFiles[type] = state.dataTypeFiles[type].name;
            console.log(`✓ 数据维度 - dataFiles[${type}]: ${state.dataTypeFiles[type].name}`);
          } else if (type !== "无已有数据") {
            console.warn(`⚠️ 数据维度 - 找不到文件: ${type}`);
          }
        });
      }
      
      // 用户维度数据收集
      console.log('📋 收集用户维度数据...');
      const userRadioFields = [
        'precision', 'structure', 'relation', 'methodPreference', 
        'knowledgeLevel', 'riskTolerance'
      ];
      
      userRadioFields.forEach(field => {
        const elements = form.elements[field];
        if (elements) {
          state.userQuestionnaireData.userDimension[field] = utils.getRadioValue(elements);
          console.log(`✓ 用户维度 - ${field}: ${state.userQuestionnaireData.userDimension[field]}`);
        } else {
          console.warn(`⚠️ 用户维度 - 找不到字段: ${field}`);
          // 设置默认值
          const defaultValues = {
            'precision': '中',
            'structure': '单层',
            'relation': '独立',
            'methodPreference': '无偏好',
            'knowledgeLevel': '中级',
            'riskTolerance': '中'
          };
          state.userQuestionnaireData.userDimension[field] = defaultValues[field];
        }
      });
      
      // 特殊需求（多选）
      if (form.elements['specialRequirements']) {
        state.userQuestionnaireData.userDimension.specialRequirements = 
          utils.getCheckboxValues(form.elements['specialRequirements']);
        console.log(`✓ 用户维度 - specialRequirements: ${state.userQuestionnaireData.userDimension.specialRequirements.join(', ')}`);
          
        // 处理其他选项
        if (state.userQuestionnaireData.userDimension.specialRequirements.includes('其他') && 
            form.elements['specialRequirementsOther']) {
          state.userQuestionnaireData.userDimension.specialRequirementsText = 
            form.elements['specialRequirementsOther'].value;
          console.log(`✓ 用户维度 - specialRequirementsText: ${state.userQuestionnaireData.userDimension.specialRequirementsText}`);
        }
      } else {
        console.warn('⚠️ 用户维度 - 找不到字段: specialRequirements');
        state.userQuestionnaireData.userDimension.specialRequirements = [];
      }
      
      // 指标体系层级数
      if (state.userQuestionnaireData.userDimension.structure === '多层次' && form.elements['levels']) {
        state.userQuestionnaireData.userDimension.levels = form.elements['levels'].value;
        console.log(`✓ 用户维度 - levels: ${state.userQuestionnaireData.userDimension.levels}`);
      }
      
      // 环境维度数据收集
      console.log('📋 收集环境维度数据...');
      const envRadioFields = ['experts', 'timeConstraint', 'computingResource'];
      
      envRadioFields.forEach(field => {
        const elements = form.elements[field];
        if (elements) {
          state.userQuestionnaireData.environmentDimension[field] = utils.getRadioValue(elements);
          console.log(`✓ 环境维度 - ${field}: ${state.userQuestionnaireData.environmentDimension[field]}`);
        } else {
          console.warn(`⚠️ 环境维度 - 找不到字段: ${field}`);
          // 设置默认值
          const defaultValues = {
            'experts': '有限',
            'timeConstraint': '适中',
            'computingResource': '基础'
          };
          state.userQuestionnaireData.environmentDimension[field] = defaultValues[field];
        }
      });
      
      // 专家数量
      if (state.userQuestionnaireData.environmentDimension.experts === '充足' && form.elements['expertsCount']) {
        state.userQuestionnaireData.environmentDimension.expertsCount = 
          form.elements['expertsCount'].value;
        console.log(`✓ 环境维度 - expertsCount: ${state.userQuestionnaireData.environmentDimension.expertsCount}`);
      } else if (state.userQuestionnaireData.environmentDimension.experts === '有限' && 
                form.elements['expertsLimitedCount']) {
        state.userQuestionnaireData.environmentDimension.expertsCount = 
          form.elements['expertsLimitedCount'].value;
        console.log(`✓ 环境维度 - expertsCount: ${state.userQuestionnaireData.environmentDimension.expertsCount}`);
      }
      
      // 环境约束（多选）
      if (form.elements['environmentConstraints']) {
        state.userQuestionnaireData.environmentDimension.environmentConstraints = 
          utils.getCheckboxValues(form.elements['environmentConstraints']);
        console.log(`✓ 环境维度 - environmentConstraints: ${state.userQuestionnaireData.environmentDimension.environmentConstraints.join(', ')}`);
          
        // 处理其他选项
        if (state.userQuestionnaireData.environmentDimension.environmentConstraints.includes('其他') && 
            form.elements['environmentConstraintsOther']) {
          state.userQuestionnaireData.environmentDimension.environmentConstraintsText = 
            form.elements['environmentConstraintsOther'].value;
          console.log(`✓ 环境维度 - environmentConstraintsText: ${state.userQuestionnaireData.environmentDimension.environmentConstraintsText}`);
        }
      } else {
        console.warn('⚠️ 环境维度 - 找不到字段: environmentConstraints');
        state.userQuestionnaireData.environmentDimension.environmentConstraints = [];
      }
      
      // 为了兼容性，将关键字段复制到顶层
      state.userQuestionnaireData.domain = state.userQuestionnaireData.taskDimension.domain;
      state.userQuestionnaireData.purpose = state.userQuestionnaireData.taskDimension.purpose;
      state.userQuestionnaireData.experts = state.userQuestionnaireData.environmentDimension.experts;
      state.userQuestionnaireData.timeConstraint = state.userQuestionnaireData.environmentDimension.timeConstraint;
      state.userQuestionnaireData.precision = state.userQuestionnaireData.userDimension.precision;
      state.userQuestionnaireData.structure = state.userQuestionnaireData.userDimension.structure;
      state.userQuestionnaireData.relation = state.userQuestionnaireData.userDimension.relation;
      state.userQuestionnaireData.dataType = state.userQuestionnaireData.dataDimension.availableDataTypes;
      
      // 适配旧版 specialNeeds 字段
      if (form.elements['specialNeeds']) {
        state.userQuestionnaireData.specialNeeds = utils.getRadioValue(form.elements['specialNeeds']);
        console.log(`✓ 旧版兼容 - specialNeeds: ${state.userQuestionnaireData.specialNeeds}`);
        if (state.userQuestionnaireData.specialNeeds === '是' && form.elements['specialNeedsText']) {
          state.userQuestionnaireData.specialNeedsText = form.elements['specialNeedsText'].value;
          console.log(`✓ 旧版兼容 - specialNeedsText: ${state.userQuestionnaireData.specialNeedsText}`);
        }
      }
      
      // 适配旧版 application 字段
      if (form.elements['application']) {
        state.userQuestionnaireData.application = utils.getRadioValue(form.elements['application']);
        console.log(`✓ 旧版兼容 - application: ${state.userQuestionnaireData.application}`);
      }
      
      // 检查是否有补充说明
      if (form.elements['supplementaryText']) {
        const supplementaryText = form.elements['supplementaryText'].value.trim();
        if (supplementaryText) {
          state.userQuestionnaireData.userDimension.supplementaryText = supplementaryText;
          console.log(`✓ 用户维度 - supplementaryText: ${supplementaryText.substring(0, 50)}...`);
        }
      }
      
      // 验证数据完整性
      const missingFields = [];
      
      // 检查任务维度必填字段
      ['domain', 'purpose'].forEach(field => {
        if (!state.userQuestionnaireData.taskDimension[field]) {
          missingFields.push(`任务维度-${field}`);
        }
      });
      
      // 检查用户维度必填字段
      ['precision', 'methodPreference', 'knowledgeLevel'].forEach(field => {
        if (!state.userQuestionnaireData.userDimension[field]) {
          missingFields.push(`用户维度-${field}`);
        }
      });
      
      // 检查环境维度必填字段
      ['experts', 'timeConstraint'].forEach(field => {
        if (!state.userQuestionnaireData.environmentDimension[field]) {
          missingFields.push(`环境维度-${field}`);
        }
      });
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ 问卷数据不完整，缺少字段: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ 问卷数据收集完成:', state.userQuestionnaireData);
    } catch (error) {
      console.error(`❌ 问卷数据收集失败: ${error.message}`);
      console.error(error);
      
      // 确保返回最小有效数据
      if (!state.userQuestionnaireData.taskDimension.domain) {
        state.userQuestionnaireData.taskDimension.domain = '综合评价';
      }
      if (!state.userQuestionnaireData.userDimension.methodPreference) {
        state.userQuestionnaireData.userDimension.methodPreference = '无偏好';
      }
    }
    
    return state.userQuestionnaireData;
  },

  /**
   * 验证文件上传
   * @returns {boolean} 验证结果
   */
  validateFileUpload() {
    console.log('开始验证文件上传...');
    const selectedDataTypes = utils.getCheckboxValues(document.querySelectorAll('input[name="dataType"]'));
    console.log('已选择的数据类型:', selectedDataTypes);
    
    // 如果选择了"无已有数据"，则不需要验证文件上传
    if (selectedDataTypes.includes("无已有数据")) {
      console.log('选择了"无已有数据"，跳过文件验证');
      return true;
    }
    
    // 检查是否上传了文件
    const hasUploadedFiles = selectedDataTypes.some(type => 
      type !== "无已有数据" && state.dataTypeFiles[type]
    );
    
    console.log('文件上传验证结果:', hasUploadedFiles);
    
    if (!hasUploadedFiles) {
      alert('请为每个选择的数据类型上传对应的文件');
      return false;
    }
    
    return true;
  },

  /**
   * 分析数据并推荐
   */
  async analyzeDataAndRecommend() {
    try {
      // 检查是否应该停止分析
      if (state.shouldStopAnalysis) {
        console.log('🛑 分析已被停止，退出分析流程');
        return;
      }
      
      // 检查是否已有分析在进行中（重复执行保护）
      if (!state.isAnalyzing) {
        console.log('⚠️ 分析状态异常，isAnalyzing为false，可能是重复调用，退出分析流程');
        return;
      }
      
      // 详细日志：主推荐流程开始
      logger.separator('主推荐流程开始');
      logger.info('流程启动', '开始执行完整的数据分析和权重方法推荐流程');
      logger.dataFlow('流程启动', '初始状态检查', {
        hasQuestionnaireData: !!state.userQuestionnaireData,
        uploadedFilesCount: state.uploadedFiles.length,
        currentSection: state.currentSection,
        isLoading: state.isLoading
      });
      
      // 显示加载中状态
      state.isLoading = true;
      
      // 确保加载状态和结果容器的显示状态正确
      const loadingResultsElement = document.getElementById('loadingResults');
      const resultsContainerElement = document.getElementById('resultsContainer');
      
      if (loadingResultsElement) loadingResultsElement.style.display = 'flex';
      if (resultsContainerElement) resultsContainerElement.style.display = 'none';
      
      logger.debug('UI状态', '更新界面加载状态', {
        loadingVisible: !!loadingResultsElement,
        resultsHidden: !!resultsContainerElement
      });
      
      // 确保分析阶段初始化正确
      document.querySelectorAll('.analysis-stage').forEach(el => {
        el.classList.remove('active', 'completed');
      });
      
      // 初始化进度条
      const progressBar = document.getElementById('analysisProgressBar');
      if (progressBar) {
        progressBar.style.width = '0%';
      }
      
      // 更新分析阶段显示
      updateAnalysisStage('userNeeds', '正在分析用户需求特征...');
      
      // 1. 分析用户需求
      logger.separator('第一阶段：用户需求分析');
      logger.info('用户需求分析', '开始分析用户问卷数据');
      logger.dataFlow('用户需求分析', '问卷数据输入', {
        questionnaireKeys: Object.keys(state.userQuestionnaireData),
        dataSize: JSON.stringify(state.userQuestionnaireData).length
      });
      
      const startUserNeedsTime = performance.now();
      
      // 检查是否应该停止分析
      if (state.shouldStopAnalysis) {
        console.log('🛑 分析已被停止，退出用户需求分析');
        return;
      }
      
      const userNeedsAnalysis = await analyzeUserNeeds(state.userQuestionnaireData);
      const endUserNeedsTime = performance.now();
      const userNeedsDuration = ((endUserNeedsTime - startUserNeedsTime)/1000).toFixed(2);
      
      logger.performance('用户需求分析', userNeedsDuration, {
        analysisKeys: Object.keys(userNeedsAnalysis),
        dimensionsCount: Object.keys(userNeedsAnalysis).filter(k => k.includes('Dimension')).length
      });
      logger.success('用户需求分析', `用户需求分析完成，耗时: ${userNeedsDuration}秒`);
      logger.dataFlow('用户需求分析', '分析输出', {
        taskDimension: !!userNeedsAnalysis.taskDimension,
        dataDimension: !!userNeedsAnalysis.dataDimension,
        userDimension: !!userNeedsAnalysis.userDimension,
        environmentDimension: !!userNeedsAnalysis.environmentDimension
      });
      
      // 保存用户需求分析结果到state中，方便后续使用
      state.userNeedsAnalysis = userNeedsAnalysis;
      
      // 更新分析阶段显示
      updateAnalysisStage('dataFeatures', '正在分析数据特征...');
      
      // 检查是否应该停止分析
      if (state.shouldStopAnalysis) {
        console.log('🛑 分析已被停止，退出数据特征分析');
        return;
      }
      
      // 2. 分析数据特征 (如果有数据)
      logger.separator('第二阶段：数据特征分析');
      logger.info('数据特征分析', '开始分析数据特征');
      
      let dataFeatures = {};
      
      // 检查用户是否选择了"无已有数据"
      const hasNoData = state.userQuestionnaireData.dataType && 
                      state.userQuestionnaireData.dataType.includes("无已有数据");
      
      logger.dataFlow('数据特征分析', '数据状态检查', {
        hasUploadedFiles: state.uploadedFiles.length > 0,
        hasNoData: hasNoData,
        uploadedFilesCount: state.uploadedFiles.length,
        dataType: state.userQuestionnaireData.dataType
      });
      
      if (state.uploadedFiles.length > 0 && !hasNoData) {
        try {
          logger.info('数据分析', '检测到上传文件，开始实际数据分析');
          logger.dataFlow('数据分析', '文件信息', {
            fileNames: state.uploadedFiles.map(f => f.name),
            totalFiles: state.uploadedFiles.length
          });
          
          const startDataAnalysisTime = performance.now();
          
          // 这里应该是对上传的数据文件进行分析
          // 简化示例中我们使用模拟数据或默认特征
          dataFeatures = dataAnalysis.getDataFeatures();
          // 增加分析信息
          dataFeatures = await analyzeDataFeatures(dataFeatures);
          
          const endDataAnalysisTime = performance.now();
          const dataAnalysisDuration = ((endDataAnalysisTime - startDataAnalysisTime)/1000).toFixed(2);
          
          logger.performance('数据分析', dataAnalysisDuration, {
            dataFeaturesKeys: Object.keys(dataFeatures),
            analysisType: 'actual-file-data'
          });
          logger.success('数据分析', `实际数据分析完成，耗时: ${dataAnalysisDuration}秒`);
          logger.dataFlow('数据分析', '分析输出', {
            dataStructure: !!dataFeatures.dataStructure,
            dataQuality: !!dataFeatures.dataQuality,
            distributionFeatures: !!dataFeatures.distributionFeatures,
            methodSuitability: !!dataFeatures.methodSuitability
          });
          
          // 更新UI显示，表明这是基于实际数据的分析
          const dataAnalysisResults = document.getElementById('dataAnalysisResults');
          if (dataAnalysisResults) {
            dataAnalysisResults.innerHTML = `
              <p class="analysis-success">
                数据解析成功，分析基于实际上传的数据
                <span class="data-status actual">实际数据</span>
              </p>
            `;
          }
          
          // 保存数据特征分析结果到state中，方便后续使用
          state.dataAnalysisResult = dataFeatures;
        } catch (error) {
          logger.error('数据分析', `数据分析失败: ${error.message}`, {
            errorType: error.constructor.name,
            filesCount: state.uploadedFiles.length,
            fallbackStrategy: 'use-default-features'
          });
          // 如果数据分析失败，使用默认特征
          dataFeatures = {
            dataQuality: {
              completeness: 5,
              reliability: 5,
              consistency: 5
            },
            characteristics: {
              sampleSize: "未知",
              distribution: "未知",
              correlation: "未知"
            },
            limitations: ["数据分析失败，使用默认特征"],
            suitability: {
              objectiveMethods: 5,
              subjectiveMethods: 5,
              hybridMethods: 5
            }
          };
        }
      } else {
        // 如果没有上传数据或选择了"无已有数据"，使用问卷数据构建预期的数据特征
        // 使用新方法获取预期数据特征，不再将hasNoData作为影响因素传递
        dataFeatures = dataAnalysis.getExpectedDataFeatures();
        
        // 从问卷中获取数据维度信息
        const { indicatorCount, variableType, dataQualityIssues } = state.userQuestionnaireData.dataDimension || {};
        
        // 更新UI显示，区分实际数据和预期数据，但不影响数据特征本身
        const dataAnalysisResults = document.getElementById('dataAnalysisResults');
        if (dataAnalysisResults) {
          if (hasNoData) {
            dataAnalysisResults.innerHTML = `
              <p class="analysis-message">
                <svg class="info-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7.5" stroke="#667788"/>
                  <path d="M8 4V9" stroke="#667788" stroke-linecap="round"/>
                  <circle cx="8" cy="12" r="1" fill="#667788"/>
                </svg>
                当前无已有数据，将基于问卷中预计的数据特征进行推荐
                <span class="data-status expected">预期数据</span>
              </p>
              <div class="expected-data-features">
                <p><strong>预计指标数量：</strong> ${indicatorCount === "少" ? "少量(10个以下)" : 
                                             indicatorCount === "中" ? "中等(10-30个)" : 
                                             indicatorCount === "多" ? "大量(30个以上)" : "未指定"}</p>
                <p><strong>预计变量类型：</strong> ${variableType === "定量" ? "主要是定量指标" : 
                                           variableType === "定性" ? "主要是定性指标" : 
                                           variableType === "混合" ? "定量和定性指标混合" : "未指定"}</p>
                <p><strong>预计数据质量问题：</strong> ${dataQualityIssues && dataQualityIssues.length > 0 ? 
                  dataQualityIssues.join(', ') : "未指定潜在问题"}</p>
                <p><strong>预计指标结构：</strong> ${state.userQuestionnaireData.userDimension?.structure || "未指定"}</p>
                <p><strong>预计指标关系：</strong> ${state.userQuestionnaireData.userDimension?.relation || "未指定"}</p>
              </div>
            `;
          } else {
            dataAnalysisResults.innerHTML = `
              <p class="analysis-message">
                未上传数据，将基于问卷中预计的数据特征进行推荐
                <span class="data-status expected">预期数据</span>
              </p>
              <div class="expected-data-features">
                <p><strong>预计指标数量：</strong> ${indicatorCount === "少" ? "少量(10个以下)" : 
                                             indicatorCount === "中" ? "中等(10-30个)" : 
                                             indicatorCount === "多" ? "大量(30个以上)" : "未指定"}</p>
                <p><strong>预计变量类型：</strong> ${variableType === "定量" ? "主要是定量指标" : 
                                           variableType === "定性" ? "主要是定性指标" : 
                                           variableType === "混合" ? "定量和定性指标混合" : "未指定"}</p>
                <p><strong>预计数据质量问题：</strong> ${dataQualityIssues && dataQualityIssues.length > 0 ? 
                  dataQualityIssues.join(', ') : "未指定潜在问题"}</p>
              </div>
            `;
          }
        }
      }
      
      logger.success('数据特征分析', '数据特征分析阶段完成');
      logger.dataFlow('数据特征分析', '最终输出', {
        dataFeaturesStructure: Object.keys(dataFeatures),
        hasDataQuality: !!dataFeatures.dataQuality,
        hasMethodSuitability: !!dataFeatures.methodSuitability,
        analysisType: (state.uploadedFiles.length > 0 && !hasNoData) ? 'actual' : 'expected',
        dataSourceType: hasNoData ? 'no-data' : (state.uploadedFiles.length > 0 ? 'uploaded-data' : 'questionnaire-only')
      });
      
      // 更新分析阶段显示
      updateAnalysisStage('ruleMatching', '正在进行规则匹配评分...');
      
      // 3. 开始三阶段方法匹配 - 第一阶段：规则匹配
      logger.separator('第三阶段：方法匹配 - 规则匹配评分');
      logger.info('方法推荐', '开始执行三阶段方法匹配流程');
      logger.dataFlow('方法推荐', '推荐输入', {
        userNeedsKeys: Object.keys(userNeedsAnalysis),
        dataFeaturesKeys: Object.keys(dataFeatures),
        weightMethodsCount: weightMethodsDB.length,
        useLLM: API_CONFIG.USE_LLM,
        matchingStages: ['规则匹配', '语义分析', '混合排序']
      });
      
      let recommendations;
      let hybridResults;
      
      if (API_CONFIG.USE_LLM) {
        try {
          logger.info('LLM推荐', '启用LLM高级混合推荐流程');
          const startRecommendationTime = performance.now();
          
          // 更新分析阶段显示 - AI扩展方法评估
          updateAnalysisStage('llmCheck', '正在进行AI扩展方法评估...');
          
          // 使用新的高级混合推荐流程，传递updateAnalysisStage函数作为回调
          hybridResults = await processMethodRecommendation({
            questionnaireData: state.userQuestionnaireData, 
            userNeeds: userNeedsAnalysis, 
            dataFeatures: dataFeatures, 
            weightMethods: weightMethodsDB
          }, updateAnalysisStage);
          
          // 根据处理结果更新显示最终阶段
          // 检查处理阶段是否完成
          if (hybridResults && hybridResults.processingSummary) {
            // 更新分析阶段显示 - 候选方法语义匹配
            updateAnalysisStage('semanticAnalysis', '正在进行候选方法语义匹配...');
          }
          
          const endRecommendationTime = performance.now();
          const recommendationDuration = ((endRecommendationTime - startRecommendationTime)/1000).toFixed(2);
          
          // 添加对多API批处理结果的处理
          const batchDetails = hybridResults?.processingSummary?.batchProcessingDetails;
          const usedMultiApi = !!batchDetails;
          
          logger.performance('LLM推荐', recommendationDuration, {
            recommendationType: hybridResults.recommendationType || 'advanced',
            finalRecommendationsCount: hybridResults.finalRecommendation?.finalRecommendations?.length || 0,
            usedLLMSupplement: hybridResults.llmSupplementResults ? true : false,
            usedMultiApi: usedMultiApi,
            batchCount: batchDetails?.batchCount || 1,
            batchProcessingTime: batchDetails?.processingTime || 'N/A'
          });
          
              if (usedMultiApi) {
      if (batchDetails.error) {
        logger.warn('多API处理', `批处理过程中出现错误: ${batchDetails.error}`);
      } else {
        logger.info('多API处理', `使用了${batchDetails.batchCount}个API批次处理${batchDetails.totalMethods}个方法，耗时${batchDetails.processingTime}秒`);
      }
    }
          
          logger.success('LLM推荐', `高级混合推荐完成，耗时: ${recommendationDuration}秒`);
          
          // 添加新的日志，记录重新排序的过程
          if (hybridResults.processingSummary?.usedLLMSupplement) {
            logger.info('候选方法处理', '使用了LLM补充并重新排序候选方法');
            logger.dataFlow('候选方法处理', '重新排序', {
              originalCandidatesCount: hybridResults.ruleMatchingResults?.ruleScoringResults?.length || 0,
              llmSupplementCount: hybridResults.llmSupplementResults?.recommendations?.length || 0,
              finalCandidatesCount: 3, // 我们固定选择3个候选方法
              finalCandidates: hybridResults.semanticAnalysisResults?.map(s => s.methodName) || []
            });
          }
          
          // 更新分析阶段显示 - 个性化建议生成
          updateAnalysisStage('personalization', '正在生成个性化建议...');
          
          // 保存完整的混合推荐结果
          state.hybridRecommendationResults = hybridResults;
          
          // 根据推荐类型提取最终推荐 - 添加安全验证
          if (hybridResults && hybridResults.finalRecommendation && hybridResults.finalRecommendation.finalRecommendations && 
              Array.isArray(hybridResults.finalRecommendation.finalRecommendations) && 
              hybridResults.finalRecommendation.finalRecommendations.length > 0) {
            // 新的高级混合推荐统一返回finalRecommendations
            recommendations = hybridResults.finalRecommendation.finalRecommendations.map(rec => ({
              method: rec.methodName,
              suitability: rec.semanticAnalysis?.suitabilityLevel || '中',
              reason: rec.semanticAnalysis?.matchExplanation || "基于规则和语义分析的推荐",
              advantages: rec.semanticAnalysis?.advantages || [],
              considerations: rec.semanticAnalysis?.risks || [],
              implementationSteps: rec.semanticAnalysis?.implementationAdvice || [],
              implementation: rec.semanticAnalysis?.implementationAdvice ? rec.semanticAnalysis.implementationAdvice.join('\n') : '',
              dimensionalScores: rec.ruleAnalysis?.dimensionalScores || {
                taskDimensionMatch: 0,
                dataDimensionMatch: 0,
                userDimensionMatch: 0,
                environmentDimensionMatch: 0
              },
              scores: {
                ruleScore: rec.ruleScore || 0,
                semanticScore: rec.semanticScore || 0,
                hybridScore: rec.finalScore || 0
              },
              methodSource: rec.methodSource || "数据库方法",
              // 添加LLM方法详情，确保在点击时可以直接显示
              llmMethodDetails: rec.llmMethodDetails || null,
              personalizedImplementation: rec.personalizedImplementation || null
            }));
            
            logger.debug('结果处理', '成功处理新格式的推荐结果', {
              format: 'finalRecommendation.finalRecommendations',
              count: recommendations.length,
              methods: recommendations.map(r => r.method).join(', ')
            });
          } else if (hybridResults && hybridResults.finalRecommendations && Array.isArray(hybridResults.finalRecommendations) && hybridResults.finalRecommendations.length > 0) {
            // 兼容旧版格式
            recommendations = hybridResults.finalRecommendations.map(rec => ({
              method: rec.method,
              suitability: rec.matchingDegree,
              reason: rec.reason,
              advantages: rec.advantages || [],
              considerations: rec.considerations || [],
              implementationSteps: rec.implementationSteps || [],
              implementation: rec.implementationSteps ? rec.implementationSteps.join('\n') : '',
              dimensionalScores: rec.dimensionalScores || {
                taskDimensionMatch: 0,
                dataDimensionMatch: 0,
                userDimensionMatch: 0,
                environmentDimensionMatch: 0
              },
              scores: {
                ruleScore: rec.ruleScore || 0,
                semanticScore: rec.semanticScore || 0,
                hybridScore: rec.hybridScore || 0
              },
              methodSource: hybridResults.metadata?.candidatesSources ? 
                (hybridResults.metadata.candidatesSources[hybridResults.finalRecommendations.indexOf(rec)] || 'database') : 
                'database',
              // 添加LLM方法详情，确保在点击时可以直接显示
              llmMethodDetails: rec.llmMethodDetails || null,
              personalizedImplementation: rec.personalizedImplementation || null
            }));
            
            logger.debug('结果处理', '成功处理旧版格式的推荐结果', {
              format: 'finalRecommendations',
              count: recommendations.length
            });
          } else {
            // 最终fallback：无法识别的格式
            logger.warn('结果处理', '无法识别的推荐结果格式，尝试提取有用信息', {
              hasHybridResults: !!hybridResults,
              hybridResultsKeys: hybridResults ? Object.keys(hybridResults) : [],
              hasFinalRecommendation: !!hybridResults?.finalRecommendation,
              hasRuleMatchingResults: !!hybridResults?.ruleMatchingResults
            });
            
            // 尝试从不同位置提取推荐结果
            if (hybridResults?.ruleMatchingResults?.ruleScoringResults && Array.isArray(hybridResults.ruleMatchingResults.ruleScoringResults)) {
              logger.info('结果处理', '从规则评分结果中提取推荐');
              
              // 从规则评分结果中提取
              recommendations = hybridResults.ruleMatchingResults.ruleScoringResults.map(rec => ({
                method: rec.methodName,
                suitability: '中',
                reason: rec.recommendationReason || rec.matchingExplanation || "基于规则评分的推荐",
                advantages: [],
                considerations: [],
                implementationSteps: [],
                implementation: '',
                dimensionalScores: rec.dimensionalScores || {
                  taskDimensionMatch: 0,
                  dataDimensionMatch: 0,
                  userDimensionMatch: 0,
                  environmentDimensionMatch: 0
                },
                scores: {
                  ruleScore: rec.totalRuleScore || 0,
                  semanticScore: 0,
                  hybridScore: rec.totalRuleScore || 0
                },
                methodSource: "规则推荐"
              }));
            } else if (hybridResults?.recommendations && Array.isArray(hybridResults.recommendations)) {
              // 处理原始方法推荐格式
              logger.info('结果处理', '从原始推荐格式中提取结果');
              
              recommendations = hybridResults.recommendations.map(rec => ({
                method: rec.method || rec.methodName,
                suitability: rec.suitability || '中',
                reason: rec.reason || '基于分析推荐',
                advantages: rec.advantages || [],
                considerations: rec.considerations || [],
                implementationSteps: typeof rec.implementation === 'string' ? rec.implementation.split('\n') : [],
                implementation: rec.implementation || '请咨询专业人员',
                dimensionalScores: rec.scores ? {
                  taskDimensionMatch: rec.scores.userNeedsMatch || 0,
                  dataDimensionMatch: rec.scores.dataFeatureMatch || 0,
                  userDimensionMatch: rec.scores.overallScore || 0,
                  environmentDimensionMatch: rec.scores.overallScore || 0
                } : {
                  taskDimensionMatch: 0,
                  dataDimensionMatch: 0,
                  userDimensionMatch: 0,
                  environmentDimensionMatch: 0
                },
                scores: {
                  ruleScore: rec.scores?.userNeedsMatch || 0,
                  semanticScore: rec.scores?.dataFeatureMatch || 0,
                  hybridScore: rec.scores?.overallScore || 0
                },
                methodSource: "AI推荐"
              }));
            } else {
              // 真正无法提取任何结果，使用默认推荐
              logger.error('结果处理', '无法从任何位置提取推荐结果，使用默认推荐', {
                hybridResultsType: typeof hybridResults,
                hybridResultsStructure: JSON.stringify(hybridResults).substring(0, 200) + '...'
              });
              recommendations = [];
            }
            
            // 如果仍然没有有效的推荐结果，使用默认推荐
            if (!recommendations || recommendations.length === 0) {
              logger.warn('结果处理', '提取结果为空，使用默认推荐');
              recommendations = methodRecommendation.getFallbackRecommendations();
            }
          }
        } catch (error) {
          logger.error('LLM推荐失败', `混合推荐流程失败: ${error.message}`, {
            errorType: error.constructor.name,
            errorMessage: error.message,
            stackTrace: error.stack?.split('\n').slice(0, 3).join('\n'),
            fallbackStrategy: 'original-recommendation'
          });
          
          // 如果混合推荐失败，回退到原始推荐方法
          try {
            logger.info('Fallback启动', '尝试原始推荐方法作为fallback');
            const startFallbackTime = performance.now();
            
            recommendations = await fallbackToOriginalRecommendation(userNeedsAnalysis, dataFeatures);
            
            const endFallbackTime = performance.now();
            const fallbackDuration = ((endFallbackTime - startFallbackTime)/1000).toFixed(2);
            
            if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
              logger.warn('Fallback失败', '原始推荐方法也返回空结果，使用默认推荐');
              recommendations = methodRecommendation.getFallbackRecommendations();
              logger.dataFlow('Fallback', '默认推荐', { source: 'default-fallback' });
            } else {
              logger.success('Fallback成功', `原始推荐方法成功，耗时: ${fallbackDuration}秒`);
              logger.dataFlow('Fallback', '推荐输出', {
                recommendationsCount: recommendations.length,
                fallbackDuration
              });
            }
          } catch (fallbackError) {
            logger.error('Fallback失败', `原始推荐方法也失败: ${fallbackError.message}`, {
              originalError: error.message,
              fallbackError: fallbackError.message,
              finalFallback: 'default-recommendations'
            });
            recommendations = methodRecommendation.getFallbackRecommendations();
            logger.dataFlow('Fallback', '最终回退', { source: 'default-recommendations' });
          }
        }
      } else {
        // 如果不使用LLM服务，使用模拟数据
        logger.info('模拟模式', '不使用LLM服务，使用模拟推荐数据');
        recommendations = methodRecommendation.getFallbackRecommendations();
        logger.dataFlow('模拟模式', '模拟推荐', {
          recommendationsCount: recommendations.length,
          source: 'mock-data'
        });
        
        // 不使用AI时，直接从规则匹配跳到候选方法语义匹配
        updateAnalysisStage('semanticAnalysis', '正在进行候选方法语义匹配...');
      }
      logger.separator('第五阶段：混合排序');
      
      // 5. 保存结果并更新UI
      logger.separator('第六阶段：结果输出');
      logger.info('结果处理', '开始处理推荐结果并更新UI');
      logger.dataFlow('结果处理', '推荐结果', {
        recommendationsCount: recommendations.length,
        recommendedMethods: recommendations.map(r => r.method),
        avgScore: recommendations.reduce((sum, r) => sum + (r.scores?.hybridScore || 0), 0) / recommendations.length
      });
      
      state.recommendationResults = recommendations;
      
      // 更新分析阶段显示 - 个性化建议生成
      updateAnalysisStage('personalization', '正在生成个性化建议...');
      
      // 隐藏加载状态，显示结果
      state.isLoading = false;
      
      if (loadingResultsElement) loadingResultsElement.style.display = 'none';
      if (resultsContainerElement) resultsContainerElement.style.display = 'block';
      
      logger.debug('UI更新', '更新界面显示推荐结果');
      
      // 展示推荐结果
      uiController.displayRecommendations();
      
      // 更新分析阶段显示 - 最终结果生成
      updateAnalysisStage('finalResult', '生成最终结果...');
      
      logger.success('流程完成', '主推荐流程成功完成');
      logger.separator('主推荐流程结束');
    } catch (error) {
      // 详细日志：主流程失败
      logger.separator('主推荐流程异常处理');
      logger.error('流程失败', `分析和推荐过程失败: ${error.message}`, {
        errorType: error.constructor.name,
        errorMessage: error.message,
        stackTrace: error.stack?.split('\n').slice(0, 5).join('\n'),
        currentStep: state.currentStep,
        currentSection: state.currentSection
      });
      
      showError(`分析失败: ${error.message}`);
      
      // 隐藏加载状态并重置分析状态
      state.isLoading = false;
      state.isAnalyzing = false;
      if (loadingResultsElement) loadingResultsElement.style.display = 'none';
      
      logger.info('错误恢复', '已重置界面状态');
      logger.separator('主推荐流程异常结束');
    }
  },

  /**
   * 显示推荐结果
   */
  displayRecommendations() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    
    if (!state.recommendationResults || !Array.isArray(state.recommendationResults) || state.recommendationResults.length === 0) {
      console.warn("没有推荐结果或结果不是数组，使用默认推荐");
      console.warn("推荐结果详情:", {
        exists: !!state.recommendationResults,
        type: typeof state.recommendationResults,
        isArray: Array.isArray(state.recommendationResults),
        length: state.recommendationResults ? state.recommendationResults.length : 'N/A',
        content: state.recommendationResults
      });
      state.recommendationResults = methodRecommendation.getFallbackRecommendations();
    }
    
    const template = document.getElementById('recommendationTemplate');
    if (!template) {
      console.error("找不到推荐结果模板元素");
      resultsContainer.innerHTML = '<div class="error-message">显示推荐结果时出错，模板不存在</div>';
      return;
    }
    
    state.recommendationResults.forEach(result => {
      try {
        const card = document.importNode(template.content, true);
        
        // 填充卡片内容
        card.querySelector('.method-name').textContent = result.method || "未命名方法";
        
        // 设置方法来源标识
        const methodSourceBadge = card.querySelector('.method-source-badge');
        if (methodSourceBadge) {
          const methodSource = result.methodSource || "数据库方法";
          let sourceText = "";
          let sourceClass = "";
          
          if (methodSource === "数据库方法") {
            sourceText = "数据库方法";
            sourceClass = "database";
          } else if (methodSource === "LLM推荐") {
            sourceText = "AI扩展推荐";
            sourceClass = "llm";
          } else if (methodSource === "混合推荐") {
            sourceText = "混合推荐";
            sourceClass = "hybrid";
          } else if (methodSource === "AI推荐") {
            sourceText = "AI扩展推荐";
            sourceClass = "llm";
          } else if (methodSource === "规则推荐") {
            sourceText = "规则推荐";
            sourceClass = "database";
          } else {
            sourceText = "数据库方法";
            sourceClass = "database";
          }
          
          methodSourceBadge.textContent = sourceText;
          methodSourceBadge.classList.add(sourceClass);
        }
        
        const suitabilityBadge = card.querySelector('.suitability-badge');
        if (suitabilityBadge) {
          suitabilityBadge.textContent = `适合度: ${result.suitability || "未知"}`;
          suitabilityBadge.classList.add(
            result.suitability === '高' ? 'high' : 
            result.suitability === '中' ? 'medium' : 'low'
          );
        }
        
        const reasonElement = card.querySelector('.reason p');
        if (reasonElement) {
          reasonElement.textContent = result.reason || "无推荐理由";
        }
        
        const advantagesList = card.querySelector('.advantages ul');
        if (advantagesList) {
          advantagesList.innerHTML = ''; // 清空默认内容
          if (result.advantages && Array.isArray(result.advantages) && result.advantages.length > 0) {
            result.advantages.forEach(advantage => {
              const li = document.createElement('li');
              li.textContent = advantage;
              advantagesList.appendChild(li);
            });
          } else {
            advantagesList.innerHTML = '<li>无数据</li>';
          }
        }
        
        // 显示考虑事项（新增）
        const considerationsList = card.querySelector('.considerations ul');
        if (considerationsList) {
          considerationsList.innerHTML = ''; // 清空默认内容
          if (result.considerations && Array.isArray(result.considerations) && result.considerations.length > 0) {
            result.considerations.forEach(consideration => {
              const li = document.createElement('li');
              li.textContent = consideration;
              considerationsList.appendChild(li);
            });
          } else {
            considerationsList.innerHTML = '<li>无特别注意事项</li>';
          }
        }
        
        // 显示评分细节（新增）
        if (result.scores) {
          const scoresSection = card.querySelector('.scores-section');
          if (scoresSection) {
            // 创建评分展示
            const ruleScoreEl = document.createElement('div');
            ruleScoreEl.className = 'score-item';
            ruleScoreEl.innerHTML = `<span class="score-label">规则评分:</span> <span class="score-value">${result.scores.ruleScore.toFixed(1)}</span>`;
            
            const semanticScoreEl = document.createElement('div');
            semanticScoreEl.className = 'score-item';
            semanticScoreEl.innerHTML = `<span class="score-label">语义评分:</span> <span class="score-value">${result.scores.semanticScore.toFixed(1)}</span>`;
            
            const hybridScoreEl = document.createElement('div');
            hybridScoreEl.className = 'score-item';
            hybridScoreEl.innerHTML = `<span class="score-label">综合评分:</span> <span class="score-value highlight">${result.scores.hybridScore.toFixed(1)}</span>`;
            
            scoresSection.appendChild(ruleScoreEl);
            scoresSection.appendChild(semanticScoreEl);
            scoresSection.appendChild(hybridScoreEl);
          }
        }
        
        // 填充四维度匹配评分 - 使用规则匹配的维度得分
        if (result.dimensionalScores) {
          // 处理任务维度匹配度
          const taskFitElement = card.querySelector('#taskFit');
          if (taskFitElement) {
            const taskFitScore = result.dimensionalScores.taskDimensionMatch || 0;
            taskFitElement.textContent = taskFitScore.toFixed(1);
            taskFitElement.className = 'dimension-score ' + 
              (taskFitScore >= 8 ? 'high-score' : 
               taskFitScore >= 6 ? 'medium-score' : 'low-score');
          }
          
          // 处理数据维度匹配度
          const dataFitElement = card.querySelector('#dataFit');
          if (dataFitElement) {
            const dataFitScore = result.dimensionalScores.dataDimensionMatch || 0;
            dataFitElement.textContent = dataFitScore.toFixed(1);
            dataFitElement.className = 'dimension-score ' + 
              (dataFitScore >= 8 ? 'high-score' : 
               dataFitScore >= 6 ? 'medium-score' : 'low-score');
          }
          
          // 处理用户维度匹配度
          const userFitElement = card.querySelector('#userFit');
          if (userFitElement) {
            const userFitScore = result.dimensionalScores.userDimensionMatch || 0;
            userFitElement.textContent = userFitScore.toFixed(1);
            userFitElement.className = 'dimension-score ' + 
              (userFitScore >= 8 ? 'high-score' : 
               userFitScore >= 6 ? 'medium-score' : 'low-score');
          }
          
          // 处理环境维度匹配度
          const envFitElement = card.querySelector('#environmentFit');
          if (envFitElement) {
            const envFitScore = result.dimensionalScores.environmentDimensionMatch || 0;
            envFitElement.textContent = envFitScore.toFixed(1);
            envFitElement.className = 'dimension-score ' + 
              (envFitScore >= 8 ? 'high-score' : 
               envFitScore >= 6 ? 'medium-score' : 'low-score');
          }
        } else {
          // 如果没有维度匹配信息，隐藏整个维度评分区域
          const dimensionalScoreSection = card.querySelector('.dimensional-score');
          if (dimensionalScoreSection) {
            dimensionalScoreSection.style.display = 'none';
          }
        }
        
        const implementationElement = card.querySelector('.implementation p');
        if (implementationElement) {
          // 优先显示个性化实施建议
          if (result.personalizedImplementation) {
            implementationElement.innerHTML = result.personalizedImplementation;
            // 添加个性化标识
            const personalizedBadge = document.createElement('span');
            personalizedBadge.className = 'personalized-badge';
            personalizedBadge.textContent = '个性化建议';
            personalizedBadge.style.cssText = 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px;';
            
            const implementationTitle = card.querySelector('.implementation h4');
            if (implementationTitle && !implementationTitle.querySelector('.personalized-badge')) {
              implementationTitle.appendChild(personalizedBadge);
            }
          }
          // 处理实施步骤，可能是字符串或数组
          else if (Array.isArray(result.implementationSteps)) {
            implementationElement.innerHTML = result.implementationSteps.map((step, index) => 
              `${index + 1}. ${step}`
            ).join('<br>');
          } else {
            implementationElement.textContent = result.implementation || "无实施建议";
          }
        }
        
        // 确保LLM方法详情被正确添加到结果对象中
        if (result.methodSource === "LLM推荐" || result.methodSource === "AI扩展推荐" || result.methodSource === "AI推荐") {
          // 检查是否已有LLM方法详情
          if (result.llmMethodDetails) {
            console.log(`✅ 方法 ${result.method} 已有LLM方法详情`);
          } else if (state.hybridRecommendationResults && state.hybridRecommendationResults.llmMethodDetails) {
            // 从混合推荐结果中查找LLM方法详情
            const methodDetail = state.hybridRecommendationResults.llmMethodDetails.find(d => d.methodName === result.method);
            if (methodDetail && methodDetail.detail) {
              console.log(`✅ 从hybridRecommendationResults中找到方法 ${result.method} 的LLM方法详情`);
              result.llmMethodDetails = methodDetail.detail;
            }
          }
        }
        
        // 添加详情按钮事件
        const detailsButton = card.querySelector('.btn-details');
        if (detailsButton) {
          detailsButton.addEventListener('click', () => this.showMethodDetails(result));
        }
        
        resultsContainer.appendChild(card);
      } catch (error) {
        console.error("创建推荐卡片时出错:", error, result);
      }
    });
    
    if (resultsContainer.children.length === 0) {
      resultsContainer.innerHTML = '<div class="empty-message">未找到匹配的权重方法推荐</div>';
    }
    
    // 标记最终阶段完成
          updateAnalysisStage('finalResult', '推荐结果生成完成！');
    
    // 标记所有分析阶段为已完成
    setTimeout(() => {
      document.querySelectorAll('.analysis-stage').forEach(el => {
        el.classList.add('completed');
        el.classList.remove('active');
      });
      
      // 隐藏加载状态
      const loadingResults = document.getElementById('loadingResults');
      if (loadingResults) {
        loadingResults.style.display = 'none';
      }
      
      // 重置分析状态标志（分析完成）
      state.isAnalyzing = false;
      state.isLoading = false;
    }, 1000);
  },

  /**
   * 显示方法详情
   * @param {Object} method - 方法信息
   */
  async showMethodDetails(method) {
    // 查找权重方法库中的详细信息
    const methodDetail = weightMethodsDB.find(m => m.name === method.method);
    const modal = document.getElementById('methodDetails');
    const title = modal.querySelector('.method-detail-title');
    const content = modal.querySelector('.method-detail-content');
    title.textContent = method.method;

    // 优先显示已生成的LLM方法详情
    if (method.llmMethodDetails) {
      console.log('✅ 使用预先生成的LLM方法详情');
      content.innerHTML = renderLLMMethodDetails(method.llmMethodDetails, method);
      
      // 重新渲染MathJax公式
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([content]);
      }
      modal.style.display = 'flex';
      return;
    }
    
    if (methodDetail) {
      // 数据库中的方法，直接显示详情
      content.innerHTML = `
        <!-- 方法概述卡片 -->
        <div class="method-overview-card">
          <div class="method-header">
            <div class="method-type-badge">
              <span class="type-icon">🏷️</span>
              <span class="type-text">${methodDetail.type}</span>
            </div>
            <div class="method-complexity">
              <span class="complexity-label">复杂度：</span>
              <span class="complexity-value">${methodDetail.characteristics?.complexity || '中'}</span>
            </div>
          </div>
          <div class="method-description">
            <p>${methodDetail.detail || '暂无详细说明'}</p>
          </div>
        </div>

        <!-- 特征属性网格 -->
        <div class="characteristics-grid">
          <div class="char-card">
            <div class="char-icon">✅</div>
            <h4>适用条件</h4>
            <ul class="char-list">
              ${methodDetail.suitConditions.map(cond => `<li>${cond}</li>`).join('')}
            </ul>
          </div>
          
          <div class="char-card">
            <div class="char-icon">⭐</div>
            <h4>方法优势</h4>
            <ul class="char-list advantages">
              ${methodDetail.advantages.map(adv => `<li>${adv}</li>`).join('')}
            </ul>
          </div>
          
          <div class="char-card">
            <div class="char-icon">⚠️</div>
            <h4>局限性</h4>
            <ul class="char-list limitations">
              ${methodDetail.limitations.map(limit => `<li>${limit}</li>`).join('')}
            </ul>
          </div>
          
          <div class="char-card">
            <div class="char-icon">🎯</div>
            <h4>适用场景</h4>
            <ul class="char-list scenarios">
              ${methodDetail.suitableScenarios.map(scene => `<li>${scene}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- 实现步骤 -->
        <div class="implementation-section">
          <h4 class="section-title">
            <span class="section-icon">📋</span>
            实现步骤
          </h4>
          <div class="steps-container">
            ${methodDetail.implementationSteps.map((step, index) => `
              <div class="step-item">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">${step.substring(step.indexOf('.')+1).trim()}</div>
              </div>
            `).join('')}
          </div>
        </div>

        ${methodDetail.mathematicalModel ? `
        <!-- 数学模型增强显示 -->
        <div class="math-model-enhanced">
          <h4 class="section-title">数学模型</h4>
          <div class="formula-card">
            ${methodDetail.mathematicalModel}
          </div>
        </div>
        ` : ''}

        ${methodDetail.calculationExample ? `
        <!-- 计算示例增强显示 -->
        <div class="calculation-example-enhanced">
          <h4 class="section-title">计算示例</h4>
          <div class="step-by-step-container">
            ${methodDetail.calculationExample}
          </div>
        </div>
        ` : ''}
      `;
    } else {
      // LLM推荐的方法，需要生成详情
      content.innerHTML = `
        <div class="loading-details">
          <div class="loading-spinner"></div>
          <p>正在生成方法详情...</p>
        </div>
      `;
      
      try {
        // 检查是否有LLM方法详情存储在结果对象中
        if (method.llmMethodDetails) {
          console.log('✅ 使用预先生成的LLM方法详情');
          content.innerHTML = renderLLMMethodDetails(method.llmMethodDetails, method);
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([content]);
          }
          modal.style.display = 'flex';
          return;
        }
        
        // 准备方法信息
        const methodInfo = {
          reason: method.reason,
          advantages: method.advantages,
          implementationSteps: method.implementationSteps,
          suitabilityScore: method.scores?.hybridScore || 7,
          innovationLevel: method.innovationValue > 8 ? '高' : '中'
        };
        
        // 生成LLM方法详情（传递完整参数）
        const llmDetails = await generateLLMMethodDetails(
          method.method, 
          methodInfo, 
          state.userNeedsAnalysis, 
          state.dataAnalysisResult
        );
        
        if (llmDetails) {
          // 保存生成的详情到方法对象中，避免重复生成
          method.llmMethodDetails = llmDetails;
          
          content.innerHTML = renderLLMMethodDetails(llmDetails, method);
          
          // 重新渲染数学公式
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([content]);
          }
        } else {
          throw new Error('生成详情失败');
        }
      } catch (error) {
        console.error('生成LLM方法详情失败:', error);
        content.innerHTML = `
          <p>${method.reason || '暂无详细说明'}</p>
          <h4 class="mt-4">方法优势</h4>
          <ul>
            ${method.advantages.map(adv => `<li>${adv}</li>`).join('')}
          </ul>
          <h4 class="mt-4">实施建议</h4>
          <p>${method.implementation}</p>
          
          <div class="error-notice">
            <small><em>注：无法生成详细信息，显示基本推荐内容</em></small>
          </div>
        `;
      }
    }
    
    modal.style.display = 'flex';
    
    // 重新渲染MathJax公式
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([content]).catch((err) => {
        console.warn('MathJax渲染失败:', err);
      });
    }
  },

  /**
   * 下载报告
   */
  downloadReport() {
    // 创建报告文本
    let reportText = `指标权重方法推荐报告\n`;
    reportText += `生成时间: ${new Date().toLocaleString()}\n\n`;
    
    reportText += `一、用户需求分析\n`;
    reportText += `研究领域: ${state.userQuestionnaireData.domain || state.userQuestionnaireData.taskDimension?.domain || "未指定"}\n`;
    reportText += `研究目的: ${state.userQuestionnaireData.purpose || state.userQuestionnaireData.taskDimension?.purpose || "未指定"}\n`;
    reportText += `专家资源: ${state.userQuestionnaireData.experts || state.userQuestionnaireData.environmentDimension?.experts || "未指定"}\n`;
    reportText += `时间约束: ${state.userQuestionnaireData.timeConstraint || state.userQuestionnaireData.environmentDimension?.timeConstraint || "未指定"}\n`;
    reportText += `精确度要求: ${state.userQuestionnaireData.precision || state.userQuestionnaireData.userDimension?.precision || "未指定"}\n`;
    reportText += `指标体系结构: ${state.userQuestionnaireData.structure || state.userQuestionnaireData.userDimension?.structure || "未指定"}\n`;
    reportText += `指标关系: ${state.userQuestionnaireData.relation || state.userQuestionnaireData.userDimension?.relation || "未指定"}\n\n`;
    
    // 检查用户是否选择了"无已有数据"
    const hasNoData = state.userQuestionnaireData.dataType && 
                      state.userQuestionnaireData.dataType.includes("无已有数据");
    
    // 添加数据特征分析部分（无论是否有实际数据）
    reportText += `二、数据特征分析\n`;
    
    if (hasNoData) {
      // 基于问卷预期显示数据特征
      const { indicatorCount, variableType, dataQualityIssues } = state.userQuestionnaireData.dataDimension || {};
      
      reportText += `【数据状态】: 当前无已有数据，以下基于未来预计的数据特征\n`;
      reportText += `预计指标数量: ${indicatorCount === "少" ? "少量(10个以下)" : 
                                   indicatorCount === "中" ? "中等(10-30个)" : 
                                   indicatorCount === "多" ? "大量(30个以上)" : "未指定"}\n`;
      reportText += `预计变量类型: ${variableType === "定量" ? "主要是定量指标" : 
                                 variableType === "定性" ? "主要是定性指标" : 
                                 variableType === "混合" ? "定量和定性指标混合" : "未指定"}\n`;
      
      if (dataQualityIssues && dataQualityIssues.length > 0) {
        reportText += `预计数据质量问题: ${dataQualityIssues.join(", ")}\n`;
      } else {
        reportText += `预计数据质量: 良好，未指定潜在问题\n`;
      }
      
      reportText += `指标体系结构: ${state.userQuestionnaireData.userDimension?.structure || "未指定"}\n`;
      reportText += `指标关系: ${state.userQuestionnaireData.userDimension?.relation || "未指定"}\n`;
    } else if (state.uploadedFiles.length > 0) {
      // 使用实际数据分析结果
      const dataFeatures = dataAnalysis.getDataFeatures();
      reportText += `【数据状态】: 基于实际上传的数据分析\n`;
      reportText += `样本量: ${dataFeatures.sampleSize}\n`;
      reportText += `指标数量: ${dataFeatures.indicatorCount}\n`;
      reportText += `数据分布: ${dataFeatures.distribution}\n`;
      reportText += `缺失值情况: ${dataFeatures.missingValues}\n`;
      reportText += `异常值情况: ${dataFeatures.outliers}\n`;
      reportText += `指标相关性: ${dataFeatures.correlation}\n`;
    } else {
      // 用户未上传数据，但也未选择"无已有数据"
      reportText += `【数据状态】: 未提供数据信息\n`;
    }
    
    reportText += `\n三、推荐方法\n`;
    
    if (state.recommendationResults && state.recommendationResults.length > 0) {
      state.recommendationResults.forEach((method, index) => {
        reportText += `${index + 1}. ${method.method}\n`;
        reportText += `   适合度: ${method.suitability}\n`;
        reportText += `   推荐理由: ${method.reason}\n`;
        reportText += `   方法优势:\n`;
        if (method.advantages && method.advantages.length > 0) {
          method.advantages.forEach(adv => {
            reportText += `   - ${adv}\n`;
          });
        } else {
          reportText += `   - 无具体优势信息\n`;
        }
        reportText += `   实施建议: ${method.implementation || "无具体实施建议"}\n\n`;
      });
    } else {
      reportText += `暂无推荐方法，请先完成方法推荐分析。\n`;
    }
    
    // 创建下载链接
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '指标权重方法推荐报告.txt';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * 重置应用
   */
  resetApplication() {
    console.log('重置应用...');
    
    // 完全清理分析流程
    this.cleanupAnalysisProcess();
    
    // 重置数据和标志
    state.userQuestionnaireData = {};
    state.uploadedFiles = [];
    state.recommendationResults = [];
    state.dataTypeFiles = {};
    state.currentSection = 1;
    state.isLoading = false;
    state.shouldStopAnalysis = false;
    state.isAnalyzing = false;
    state.analysisTimeoutId = null;
    
    // 重置表单
    const form = document.getElementById('questionnaireForm');
    if (form) {
      form.reset();
      
      // 清除所有错误信息
      const errorMessages = form.querySelectorAll('.error-message');
      errorMessages.forEach(msg => msg.remove());
      
      const formGroups = form.querySelectorAll('.form-group');
      formGroups.forEach(group => group.classList.remove('error'));
    } else {
      console.error('找不到问卷表单元素');
    }
    
    // 清空文件列表
    const fileList = document.getElementById('fileList');
    if (fileList) {
      fileList.innerHTML = '';
    }
    
    // 重置文件上传区域
    const fileNameDisplays = document.querySelectorAll('.file-name-display');
    fileNameDisplays.forEach(display => {
      display.textContent = '未选择文件';
    });
    
    // 隐藏所有上传区域
    const uploadContainers = document.querySelectorAll('.upload-container');
    uploadContainers.forEach(container => {
      container.classList.remove('active');
    });
    
    // 重置预览区域
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    
    // 返回第一步
    this.goToStep(1);
    
    // 重置步骤导航
    stepNavigationController.showSection(1);
    
    console.log('应用已重置');
  },

  /**
   * 处理数据类型选择
   * @param {Event} e - 事件对象
   */
  handleDataTypeSelection(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    const isChecked = checkbox.checked;
    
    console.log('处理数据类型选择:', value, isChecked);
    
    // 获取预计数据特征区域和文件区域元素
    const expectedDataSection = document.getElementById('expectedDataSection');
    const filesSection = document.getElementById('filesSection');
    
    // 处理"无已有数据"选项与其他选项的互斥
    if (value === "无已有数据" && isChecked) {
      // 如果选择了"无已有数据"，取消其他选项
      const dataTypeCheckboxes = document.querySelectorAll('.data-type-checkbox');
      dataTypeCheckboxes.forEach(cb => {
        if (cb.value !== "无已有数据" && cb.checked) {
          cb.checked = false;
          // 隐藏对应的上传区域
          const uploadContainer = document.getElementById(`upload-${cb.value}`);
          if (uploadContainer) {
            console.log(`隐藏上传区域: ${cb.value}`);
            uploadContainer.style.display = 'none';
          }
        }
      });
      
      // 显示预计数据特征区域，隐藏文件区域
      if (expectedDataSection) expectedDataSection.style.display = 'block';
      if (filesSection) filesSection.style.display = 'none';
      
    } else if (isChecked) {
      // 如果选择了其他选项，取消"无已有数据"选项
      const noDataCheckbox = document.querySelector('input[value="无已有数据"]');
      if (noDataCheckbox && noDataCheckbox.checked) {
        noDataCheckbox.checked = false;
      }
      
      // 隐藏预计数据特征区域，显示文件区域
      if (expectedDataSection) expectedDataSection.style.display = 'none';
      if (filesSection) filesSection.style.display = 'block';
    }
    
    // 检查是否有任何数据类型被选中
    const anyDataTypeSelected = Array.from(document.querySelectorAll('.data-type-checkbox')).some(cb => cb.checked);
    
    // 如果没有任何数据类型被选中，隐藏两个区域
    if (!anyDataTypeSelected) {
      if (expectedDataSection) expectedDataSection.style.display = 'none';
      if (filesSection) filesSection.style.display = 'none';
    }
    
    // 显示或隐藏对应的上传区域
    const uploadContainer = document.getElementById(`upload-${value}`);
    if (uploadContainer) {
      if (isChecked && value !== "无已有数据") {
        console.log(`显示上传区域: ${value}`);
        uploadContainer.style.display = 'block';
      } else {
        console.log(`隐藏上传区域: ${value}`);
        uploadContainer.style.display = 'none';
      }
    } else {
      console.warn(`找不到上传区域: upload-${value}`);
    }
  },

  /**
   * 处理数据文件选择
   * @param {Event} e - 事件对象
   */
  handleDataFileSelection(e) {
    const fileInput = e.target;
    const dataType = fileInput.getAttribute('data-type');
    const file = fileInput.files[0];
    
    console.log('处理文件选择:', dataType, file?.name);
    
    if (!dataType) {
      console.error('文件输入缺少data-type属性');
      return;
    }
    
    if (file) {
      // 更新显示的文件名
      const fileNameDisplay = fileInput.closest('.upload-container').querySelector('.file-name-display');
      if (fileNameDisplay) {
        console.log(`更新文件名显示: ${file.name}`);
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.title = file.name;
      } else {
        console.warn('找不到文件名显示元素');
      }
      
      // 保存文件到对应的数据类型
      state.dataTypeFiles[dataType] = file;
      
      // 将文件添加到总的上传文件列表中
      const existingFileIndex = state.uploadedFiles.findIndex(f => f.name === file.name);
      if (existingFileIndex >= 0) {
        // 如果已存在同名文件，替换它
        state.uploadedFiles[existingFileIndex] = file;
      } else {
        state.uploadedFiles.push(file);
      }
      
      // 显示文件在文件列表中
      fileHandler.displayFile(file);
      
      console.log(`已上传 ${dataType} 文件: ${file.name}`);
      console.log('当前上传文件数量:', state.uploadedFiles.length);
    } else {
      console.warn('未选择文件');
    }
  }
};

// 添加showError函数
function showError(message) {
  console.error(message);
  alert(message);
}

// 步骤导航控制器
const stepNavigationController = {
  /**
   * 显示指定的问卷部分
   * @param {number} sectionNumber - 要显示的部分编号
   */
  showSection(sectionNumber) {
    try {
      // 检查sectionNumber是否有效
      if (isNaN(sectionNumber) || sectionNumber < 1 || sectionNumber > state.totalSections) {
        console.error(`无效的部分编号: ${sectionNumber}, 有效范围: 1-${state.totalSections}`);
        sectionNumber = 1; // 默认显示第一部分
      }
      
      // 获取所有问卷部分
      const allSections = document.querySelectorAll('.form-section');
      
      if (allSections.length === 0) {
        console.error('找不到问卷部分元素');
        return;
      }
      
      // 隐藏所有部分
      allSections.forEach((section) => {
        section.style.display = 'none';
        section.classList.remove('active');
      });
      
      // 显示当前部分
      const currentSection = document.getElementById(`section-${sectionNumber}`);
      if (currentSection) {
        currentSection.style.display = 'block';
        currentSection.style.opacity = '1';
        currentSection.style.visibility = 'visible';
        
        setTimeout(() => {
          currentSection.classList.add('active');
        }, 50);
      } else {
        console.error(`找不到目标元素 section-${sectionNumber}`);
        return;
      }
      
      // 滚动到当前问卷部分的标题位置
      const sectionHeader = document.querySelector(`#section-${sectionNumber} .section-header`);
      if (sectionHeader) {
        sectionHeader.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // 回退方案：滚动到问卷区域
        const stepsContainer = document.querySelector('.steps-container');
        if (stepsContainer) {
          stepsContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
      
      // 更新步骤指示器
      this.updateStepIndicator(sectionNumber);
      
      // 更新导航按钮状态
      this.updateNavigationButtons(sectionNumber);
      
      // 更新状态
      state.currentSection = sectionNumber;
    } catch (error) {
      console.error(`显示部分 ${sectionNumber} 时发生错误:`, error);
    }
  },
  
  /**
   * 创建缺失的问卷部分（紧急修复）
   * @param {number} sectionNumber - 要创建的部分编号
   */
  createMissingSection(sectionNumber) {
    console.log(`🔧 尝试创建缺失的部分 section-${sectionNumber}`);
    
    try {
      // 查找问卷表单
      const form = document.getElementById('questionnaireForm');
      if (!form) {
        console.error('❌ 找不到问卷表单元素，无法创建缺失部分');
        return;
      }
      
      // 创建新的部分元素
      const newSection = document.createElement('div');
      newSection.id = `section-${sectionNumber}`;
      newSection.className = 'form-section';
      newSection.style.display = 'none';
      
      // 添加基本内容
      newSection.innerHTML = `
        <div class="section-header">
          <h2>第 ${sectionNumber} 部分</h2>
          <p>此部分是系统自动创建的，因为原始部分丢失。</p>
        </div>
        <div class="section-content">
          <div class="form-group">
            <p>请联系管理员修复问卷结构。</p>
          </div>
        </div>
      `;
      
      // 将新部分添加到表单中
      form.appendChild(newSection);
      
      console.log(`✅ 成功创建缺失的部分 section-${sectionNumber}`);
      
      // 显示新创建的部分
      setTimeout(() => {
        this.showSection(sectionNumber);
      }, 100);
    } catch (error) {
      console.error(`❌ 创建缺失部分时发生错误:`, error);
    }
  },

  /**
   * 更新步骤指示器
   * @param {number} currentSection - 当前部分
   */
  updateStepIndicator(currentSection) {
    // 更新圆形指示器
    for (let i = 1; i <= 5; i++) { // 5个步骤（4个问卷部分 + 1个结果页）
      const bullet = document.querySelector(`.step-bullet[data-step="${i}"]`);
      const label = document.querySelector(`.step-label[data-step="${i}"]`);
      
      if (bullet && label) {
        bullet.classList.remove('active', 'completed');
        label.classList.remove('active', 'completed');
        
        if (i < currentSection) {
          bullet.classList.add('completed');
          label.classList.add('completed');
        } else if (i === currentSection) {
          bullet.classList.add('active');
          label.classList.add('active');
        }
      }
    }
    
    // 更新连接线
    for (let i = 1; i < 5; i++) {
      const line = document.querySelector(`.step-line:nth-of-type(${i * 2})`); // 奇数索引是lines
      if (line) {
        line.classList.remove('completed');
        if (i < currentSection) {
          line.classList.add('completed');
        }
      }
    }
  },

  /**
   * 更新导航按钮状态
   * @param {number} currentSection - 当前部分
   */
  updateNavigationButtons(currentSection) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (prevBtn) {
      prevBtn.style.display = currentSection > 1 ? 'block' : 'none';
    }
    
    if (nextBtn && analyzeBtn) {
      if (currentSection < state.totalSections) {
        nextBtn.style.display = 'block';
        analyzeBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'none';
        analyzeBtn.style.display = 'block';
      }
    }
    
    // 清除未完成页面导航的特殊类名（正常导航时）
    const formNavigation = document.querySelector('.form-navigation');
    if (formNavigation) {
      formNavigation.classList.remove('incomplete-page-navigation');
    }
  },

  /**
   * 转到下一部分
   */
  nextSection() {
    if (state.currentSection < state.totalSections) {
      if (this.validateCurrentSection()) {
        this.showSection(state.currentSection + 1);
      }
    }
  },

  /**
   * 转到上一部分
   */
  prevSection() {
    if (state.currentSection > 1) {
      this.showSection(state.currentSection - 1);
    }
  },

  /**
   * 验证当前部分（可选）
   * @returns {boolean} - 验证是否通过
   */
  validateCurrentSection() {
    // 这里可以添加每个部分的验证逻辑
    // 目前简单返回true，允许用户自由切换
    return true;
  },

  /**
   * 初始化步骤导航
   */
  init() {
    console.log('初始化步骤导航...');
    
    // 显示第一个部分
    this.showSection(1);
    
    // 绑定导航按钮事件
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.prevSection();
      });
    }
    
    if (nextBtn) {
      console.log(`[DEBUG] 绑定nextBtn点击事件，按钮元素:`, nextBtn);
      nextBtn.addEventListener('click', () => {
        console.log(`[DEBUG] nextBtn被点击！`);
        this.nextSection();
      });
    } else {
      console.error(`[ERROR] 找不到nextBtn元素！`);
    }
    
    // 添加步骤指示器点击事件
    for (let i = 1; i <= state.totalSections; i++) {
      const bullet = document.querySelector(`.step-bullet[data-step="${i}"]`);
      const label = document.querySelector(`.step-label[data-step="${i}"]`);
      
      if (bullet) {
        bullet.addEventListener('click', () => {
          this.showSection(i);
        });
        bullet.style.cursor = 'pointer';
      }
      
      if (label) {
        label.addEventListener('click', () => {
          this.showSection(i);
        });
        label.style.cursor = 'pointer';
      }
    }
  }
};

/**
 * 回退到原始推荐方法
 * @param {Object} userNeedsAnalysis - 用户需求分析结果
 * @param {Object} dataFeatures - 数据特征分析结果
 * @returns {Promise<Array>} - 推荐结果
 */
async function fallbackToOriginalRecommendation(userNeedsAnalysis, dataFeatures) {
  console.warn("回退到原始推荐方法");
  try {
    return await processMethodRecommendation({
      questionnaireData: state.userQuestionnaireData,
      userNeeds: userNeedsAnalysis, 
      dataFeatures: dataFeatures, 
      weightMethods: weightMethodsDB
    });
  } catch (error) {
    console.error("原始推荐方法也失败", error);
    return methodRecommendation.getFallbackRecommendations();
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  try {
    // 初始化步骤导航
    if (typeof stepNavigationController !== 'undefined' && stepNavigationController.init) {
      stepNavigationController.init();
    } else {
      console.error('stepNavigationController未定义或缺少init方法');
    }
    
    // 绑定所有事件监听器
    bindEventListeners();
    
    // 初始化数据类型选择和上传区域
    initUploadAreas();
    
    // 为调试目的导出关键函数到全局作用域
    window.parseJsonFromLLMResponse = parseJsonFromLLMResponse;
    window.logger = logger;
    window.API_CONFIG = API_CONFIG;
  
  // 新增：规则匹配测试函数
  window.testRuleMatchingFix = async function() {
    console.log('%c🧪 开始测试修复后的规则匹配功能...', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    
    try {
      // 启用详细日志（原enableMaxVerboseMode函数不存在，已移除）
      console.log('🔍 详细日志模式已启用');
      
      // 模拟测试数据
      const testUserNeeds = {
        taskDimension: { domain: "教育评价", purpose: "综合评价", complexity: "中" },
        dataDimension: { indicatorCount: "中等", variableType: "定量" },
        userDimension: { precision: "高", methodPreference: "客观" },
        environmentDimension: { timeConstraint: "适中", expertiseLevel: "有限" }
      };
      
      const testDataFeatures = {
        dataStructure: { indicatorCount: 15 },
        dataQuality: { completeness: 0.9 }
      };
      
      console.log('📊 测试用户需求:', testUserNeeds);
      console.log('📈 测试数据特征:', testDataFeatures);
      
      // 调用规则匹配
      const result = await performRuleMatching(testUserNeeds, testDataFeatures, weightMethodsDB);
      
      console.log('%c✅ 规则匹配测试完成！', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      console.log('🏆 最终结果:', result);
      
      // 验证结果
      const isDefault = JSON.stringify(result.topCandidates) === JSON.stringify(['层次分析法(AHP)', '熵权法', 'CRITIC法']);
      if (isDefault) {
        console.log('%c⚠️ 警告：仍然返回默认方法！', 'background: #FF5722; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      } else {
        console.log('%c🎉 成功：返回了基于评分的方法！', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
      }
      
      return result;
    } catch (error) {
      console.log('%c❌ 测试失败:', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', error);
      return null;
    }
  };
  
    console.log('✅ 调试函数导出完成');
    console.log('%c🎉 应用初始化完成！', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    console.log('⏱️ 初始化总耗时:', performance.now() - performance.timing.domContentLoadedEventStart, 'ms');
    console.log('已导出调试函数到全局作用域: parseJsonFromLLMResponse, logger, API_CONFIG, testRuleMatchingFix');
    
  } catch (error) {
    console.error('%c❌ 应用初始化过程中发生错误！', 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
    console.error('💥 错误详情:', error);
    console.error('📍 错误堆栈:', error.stack);
    
    // 尝试提供一些有用的调试信息
    console.log('🔍 调试信息:');
    console.log('- stepNavigationController 是否存在:', typeof stepNavigationController !== 'undefined');
    console.log('- bindEventListeners 是否存在:', typeof bindEventListeners !== 'undefined');
    console.log('- initUploadAreas 是否存在:', typeof initUploadAreas !== 'undefined');
    console.log('- 当前DOM状态:', document.readyState);
    
    // 即使初始化失败，也要导出调试函数
    try {
      window.parseJsonFromLLMResponse = parseJsonFromLLMResponse;
      window.logger = logger;
      window.API_CONFIG = API_CONFIG;
      console.log('🔧 调试函数已导出，可用于故障排除');
    } catch (exportError) {
      console.error('❌ 导出调试函数也失败了:', exportError);
    }
  }
});

// 绑定所有事件监听器
function bindEventListeners() {
  console.log('开始绑定事件监听器...');
  
  // 步骤控制按钮
  const analyzeBtn = document.getElementById('analyzeBtn');
  const backToStep1Btn = document.getElementById('backToStep1');
  const startOverBtn = document.getElementById('startOver');
  const downloadReportBtn = document.getElementById('downloadReport');
  
  if (analyzeBtn) {
    console.log('绑定分析按钮事件');
    analyzeBtn.addEventListener('click', function() {
      console.log('分析按钮被点击');
      uiController.validateAndAnalyze();
    });
  } else {
    console.error('找不到分析按钮元素');
  }
  
  if (backToStep1Btn) {
    console.log('绑定返回步骤1按钮事件');
    backToStep1Btn.addEventListener('click', function() {
      console.log('返回步骤1按钮被点击');
      uiController.stopAnalysisAndGoBack();
    });
  }
  
  if (startOverBtn) {
    console.log('绑定重新开始按钮事件');
    startOverBtn.addEventListener('click', function() {
      console.log('重新开始按钮被点击');
      uiController.stopAnalysisAndReset();
    });
  }
  
  if (downloadReportBtn) {
    console.log('绑定下载报告按钮事件');
    downloadReportBtn.addEventListener('click', function() {
      console.log('下载报告按钮被点击');
      uiController.downloadReport();
    });
  }
  
  // 绑定模态框关闭事件
  const methodDetailsModal = document.getElementById('methodDetails');
  const closeModalBtn = document.querySelector('.close-modal');
  
  if (closeModalBtn && methodDetailsModal) {
    console.log('绑定模态框关闭按钮事件');
    closeModalBtn.addEventListener('click', function() {
      console.log('关闭模态框按钮被点击');
      methodDetailsModal.style.display = 'none';
    });
    
    // 点击模态框背景也可以关闭
    methodDetailsModal.addEventListener('click', function(event) {
      if (event.target === methodDetailsModal) {
        console.log('点击模态框背景关闭模态框');
        methodDetailsModal.style.display = 'none';
      }
    });
  } else {
    console.warn('未找到模态框或关闭按钮');
  }
  
  // 数据类型选择事件
  const dataTypeCheckboxes = document.querySelectorAll('.data-type-checkbox');
  if (dataTypeCheckboxes && dataTypeCheckboxes.length > 0) {
    console.log(`找到${dataTypeCheckboxes.length}个数据类型复选框`);
    dataTypeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function(e) {
        console.log('数据类型选择改变:', e.target.value, e.target.checked);
        uiController.handleDataTypeSelection(e);
      });
    });
  } else {
    console.error('找不到数据类型复选框');
  }
  
  // 数据文件上传事件
  const dataFileInputs = document.querySelectorAll('.data-file-input');
  if (dataFileInputs && dataFileInputs.length > 0) {
    console.log(`找到${dataFileInputs.length}个文件上传输入框`);
    dataFileInputs.forEach(input => {
      input.addEventListener('change', function(e) {
        console.log('文件选择改变:', e.target.files[0]?.name);
        uiController.handleDataFileSelection(e);
      });
    });
  } else {
    console.error('找不到文件上传输入框');
  }
  
  // 上传按钮事件
  const uploadBtns = document.querySelectorAll('.upload-btn');
  if (uploadBtns && uploadBtns.length > 0) {
    console.log(`找到${uploadBtns.length}个上传按钮`);
    uploadBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        console.log('上传按钮被点击');
        // 获取关联的文件输入框并触发点击
        const fileInput = btn.closest('.upload-container').querySelector('.data-file-input');
        if (fileInput) {
          fileInput.click();
        }
      });
    });
  }
  
  console.log('事件监听器绑定完成');
}

// 初始化上传区域
function initUploadAreas() {
  console.log('初始化上传区域...');
  
  // 默认隐藏所有上传区域
  const uploadContainers = document.querySelectorAll('.upload-container');
  uploadContainers.forEach(container => {
    container.style.display = 'none';
  });
  
  // 获取预计数据特征区域和文件区域元素
  const expectedDataSection = document.getElementById('expectedDataSection');
  const filesSection = document.getElementById('filesSection');
  
  // 默认隐藏预计数据特征区域和文件区域
  if (expectedDataSection) expectedDataSection.style.display = 'none';
  if (filesSection) filesSection.style.display = 'none';
  
  // 显示已选中数据类型的上传区域
  const checkedDataTypes = document.querySelectorAll('.data-type-checkbox:checked');
  let hasNoData = false;
  
  checkedDataTypes.forEach(checkbox => {
    if (checkbox.value === "无已有数据") {
      hasNoData = true;
    } else {
      const uploadContainer = document.getElementById(`upload-${checkbox.value}`);
      if (uploadContainer) {
        uploadContainer.style.display = 'block';
      }
    }
  });
  
  // 根据选择情况显示相应的区域
  if (hasNoData) {
    // 显示预计数据特征区域，隐藏文件区域
    if (expectedDataSection) expectedDataSection.style.display = 'block';
    if (filesSection) filesSection.style.display = 'none';
  } else if (checkedDataTypes.length > 0) {
    // 显示文件区域，隐藏预计数据特征区域
    if (expectedDataSection) expectedDataSection.style.display = 'none';
    if (filesSection) filesSection.style.display = 'block';
  }
  
  console.log('上传区域初始化完成');
}

// filterMethodsForPrompt函数已移至llmService.js

/**
 * 更新分析阶段显示
 * @param {string} stage - 当前阶段名称
 * @param {string} message - 显示的消息
 */
function updateAnalysisStage(stage, message) {
  console.log(`更新分析阶段: ${stage}, 消息: ${message}`);
  
  // 定义所有阶段及其对应的DOM ID和进度百分比
  const allStages = [
    { id: 'stageUserNeeds', name: 'userNeeds', progress: 10, label: '用户需求特征分析', aiRequired: false },
    { id: 'stageDataFeatures', name: 'dataFeatures', progress: 20, label: '数据特征分析', aiRequired: false },
    { id: 'stageRuleMatching', name: 'ruleMatching', progress: 35, label: '规则匹配', aiRequired: false },
    { id: 'stageLLMCheck', name: 'llmCheck', progress: 45, label: 'AI扩展方法评估', aiRequired: true },
    { id: 'stageLLMRuleMatching', name: 'llmRuleMatching', progress: 55, label: 'AI扩展方法规则匹配', aiRequired: true },
    { id: 'stageLLMDetails', name: 'llmDetails', progress: 65, label: 'AI扩展方法详情生成', aiRequired: true },
    { id: 'stageSemanticAnalysis', name: 'semanticAnalysis', progress: 75, label: '候选方法语义匹配', aiRequired: false },
    { id: 'stagePersonalization', name: 'personalization', progress: 85, label: '个性化建议生成', aiRequired: false },
    { id: 'stageFinalResult', name: 'finalResult', progress: 100, label: '最终结果生成', aiRequired: false }
  ];
  
  // 检查是否使用AI扩展
  const useAI = API_CONFIG.USE_LLM;
  
  // 找到当前阶段
  const currentStageIndex = allStages.findIndex(s => s.name === stage);
  if (currentStageIndex === -1) {
    console.error(`未知的阶段名称: ${stage}`);
    return;
  }
  
  const currentStage = allStages[currentStageIndex];
  
  // 重置所有阶段样式
  document.querySelectorAll('.analysis-stage').forEach(el => {
    el.classList.remove('active');
  });
  
  // 设置当前阶段为激活状态
  const stageElement = document.getElementById(currentStage.id);
  if (stageElement) {
    stageElement.classList.add('active');
    
    // 如果是AI相关阶段，但不使用AI，则隐藏该阶段
    if (currentStage.aiRequired && !useAI) {
      stageElement.style.display = 'none';
    } else {
      stageElement.style.display = '';
    }
  } else {
    console.error(`未找到ID为 ${currentStage.id} 的阶段元素`);
    return;
  }
  
  // 标记之前的阶段为已完成
  let visibleStageIndex = 0;
  for (let i = 0; i < currentStageIndex; i++) {
    const prevStage = allStages[i];
    // 跳过AI相关阶段（如果不使用AI）
    if (prevStage.aiRequired && !useAI) {
      continue;
    }
    
    const prevStageElement = document.getElementById(prevStage.id);
    if (prevStageElement) {
      prevStageElement.classList.add('completed');
      prevStageElement.style.display = '';
      visibleStageIndex++;
    }
  }
  
  // 隐藏AI相关阶段（如果不使用AI）
  if (!useAI) {
    allStages.forEach(stage => {
      if (stage.aiRequired) {
        const stageEl = document.getElementById(stage.id);
        if (stageEl) {
          stageEl.style.display = 'none';
        }
      }
    });
  }
  
  // 计算进度条进度（根据可见阶段）
  let progressPercentage = currentStage.progress;
  if (!useAI && currentStage.aiRequired) {
    // 如果当前是AI阶段但不使用AI，使用规则匹配的进度
    progressPercentage = allStages.find(s => s.name === 'ruleMatching').progress;
  }
  
  // 更新进度条
  const progressBar = document.getElementById('analysisProgressBar');
  if (progressBar) {
    progressBar.style.width = `${progressPercentage}%`;
  }
  
  // 更新加载文本
  const loadingText = document.getElementById('loadingText');
  if (loadingText) {
    loadingText.textContent = message || `正在${currentStage.label}...`;
  }
  
  // 如果是最终阶段，添加额外的完成样式
  if (stage === 'finalResult') {
    if (stageElement) {
      stageElement.classList.add('completed');
    }
  }
}

/**
 * 渲染LLM方法详情
 * @param {Object} llmDetails - LLM方法详情
 * @param {Object} method - 方法基本信息
 * @returns {string} HTML内容
 */
function renderLLMMethodDetails(llmDetails, method) {
  return `
    <div class="llm-method-details">
      <!-- AI生成标识徽章 -->
      <div class="ai-generated-badge">
        AI扩展推荐方法
      </div>
      
      <!-- 方法概述卡片 -->
      <div class="method-overview-card">
        <div class="method-header">
          <div class="method-type-badge">
            <span class="type-icon">🤖</span>
            <span class="type-text">${llmDetails.type || 'AI推荐方法'}</span>
          </div>
          <div class="method-complexity">
            <span class="complexity-label">来源：</span>
            <span class="complexity-value">AI分析</span>
          </div>
        </div>
        <div class="method-description">
          <p>${llmDetails.detail || method.reason || '暂无详细说明'}</p>
        </div>
      </div>

      <!-- 特征属性网格 -->
      <div class="characteristics-grid">
        ${llmDetails.suitConditions && llmDetails.suitConditions.length > 0 ? `
        <div class="char-card">
          <div class="char-icon">✅</div>
          <h4>适用条件</h4>
          <ul class="char-list">
            ${llmDetails.suitConditions.map(cond => `<li>${cond}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${(llmDetails.advantages || method.advantages) && (llmDetails.advantages || method.advantages).length > 0 ? `
        <div class="char-card">
          <div class="char-icon">⭐</div>
          <h4>方法优势</h4>
          <ul class="char-list advantages">
            ${(llmDetails.advantages || method.advantages || []).map(adv => `<li>${adv}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${llmDetails.limitations && llmDetails.limitations.length > 0 ? `
        <div class="char-card">
          <div class="char-icon">⚠️</div>
          <h4>局限性</h4>
          <ul class="char-list limitations">
            ${llmDetails.limitations.map(limit => `<li>${limit}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${llmDetails.suitableScenarios && llmDetails.suitableScenarios.length > 0 ? `
        <div class="char-card">
          <div class="char-icon">🎯</div>
          <h4>适用场景</h4>
          <ul class="char-list scenarios">
            ${llmDetails.suitableScenarios.map(scene => `<li>${scene}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      ${llmDetails.implementationSteps && llmDetails.implementationSteps.length > 0 ? `
      <!-- 实现步骤 -->
      <div class="implementation-section">
        <h4 class="section-title">
          <span class="section-icon">📋</span>
          实现步骤
        </h4>
        <div class="steps-container">
          ${llmDetails.implementationSteps.map((step, index) => `
            <div class="step-item">
              <div class="step-number">${index + 1}</div>
              <div class="step-content">${step.replace(/^\d+\.\s*/, '')}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${llmDetails.mathematicalModel ? `
      <!-- 数学模型增强显示 -->
      <div class="math-model-enhanced">
        <h4 class="section-title">数学模型</h4>
        <div class="formula-card">
          ${llmDetails.mathematicalModel}
        </div>
      </div>
      ` : ''}

      ${llmDetails.calculationExample ? `
      <!-- 计算示例增强显示 -->
      <div class="calculation-example-enhanced">
        <h4 class="section-title">计算示例</h4>
        <div class="step-by-step-container">
          ${llmDetails.calculationExample}
        </div>
      </div>
      ` : ''}
      
      <!-- AI生成声明 -->
      <div class="llm-notice" style="
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #0ea5e9;
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-top: var(--spacing-xl);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        color: #0369a1;
      ">
        <span style="font-size: 1.5rem;">ℹ️</span>
        <div>
          <strong>AI生成内容说明</strong><br>
          <small>此方法详情由人工智能分析生成，内容仅供参考。建议结合实际情况和专业知识进行应用。</small>
        </div>
      </div>
    </div>
  `;
}
    