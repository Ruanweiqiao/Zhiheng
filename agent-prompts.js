/**
 * 指标权重方法推荐系统 - Agent提示词模板
 * 包含用户需求分析Agent、数据解析Agent和方法推荐Agent的提示词模板
 */

/**
 * 用户需求分析Agent提示词模板
 * 输入：用户问卷数据
 * 输出：结构化的用户需求特征
 */
const userNeedsAnalysisPrompt = `
你是一位用户需求分析专家，请分析以下问卷数据，提取关键需求特征。分析过程中请考虑任务维度、数据维度、用户维度和环境维度四个核心维度：

### 问卷数据：
{{questionnaireData}}

### 分析要求：
1. 提取用户的核心需求特征
2. 评估用户对各个维度的要求程度
3. 识别潜在的限制条件
4. 总结用户优先级

### 补充说明处理要求：
如果用户在userDimension.supplementaryText字段提供了补充说明：
1. 仔细分析补充说明中的关键信息
2. 将这些信息映射到四个维度的相应属性中
3. 如果发现无法映射到现有属性的重要信息，添加到userDimension.specialRequirements数组中
4. 提取补充说明中的关键洞察，添加到新的userDimension.supplementaryInsights数组中
5. 确保从补充说明中提取的信息不与问卷中已有的明确回答冲突

### 维度分析指南：
- 任务维度：关注评价领域、目标性质、问题复杂度和应用范围
- 数据维度：关注指标数量、变量类型、数据质量
- 用户维度：关注用户偏好、知识水平、风险承受能力和特殊需求
- 环境维度：关注专家资源、时间约束、计算资源和环境限制

### 输出格式：
{
  "taskDimension": {
    "domain": "评价领域",
    "purpose": "评价目的",
    "evaluationNature": "评价目标性质(描述性/预测性/优化性)",
    "complexity": "问题复杂度(高/中/低)",
    "applicationScope": "结果应用范围",
    "academicRigor": "学术严谨性要求(高/中/低)"
  },
  "dataDimension": {
    "indicatorCount": "指标数量(少量/中等/大量)",
    "variableType": "变量类型(定量/定性/混合)",
    "dataStructure": "数据结构描述",
    "dataQualityIssues": ["数据质量问题1", "数据质量问题2"，"注意无已有数据不算数据质量问题"],
    
    "missingDataSituation": "缺失数据情况(无/少量/大量)"
  },
  "userDimension": {
    "precision": "精确度要求(高/中/低)",
    "structure": "指标体系结构",
    "relation": "指标间关系",
    "methodPreference": "方法偏好(主观/客观/组合)",
    "knowledgeLevel": "知识水平(初级/中级/高级/专家)",
    "riskTolerance": "风险承受能力(低/中/高)",
    "specialRequirements": ["特殊需求1", "特殊需求2", "从补充说明提取的需求..."],
    "interpretabilityNeed": "可解释性需求(高/中/低)",
    "preferredUserType": "用户类型描述",
    "supplementaryInsights": ["从补充说明中提取的洞察1", "洞察2"]
  },
  "environmentDimension": {
    "expertiseLevel": "专家资源情况(充足/有限/无)",
    "timeConstraint": "时间限制(紧迫/适中/充裕)",
    "computingResource": "计算资源限制(有限/充足/高级)",
    "environmentConstraints": ["环境约束1", "环境约束2"],
    "costProfile": "成本约束(严格/适中/宽松)"
  },
  "requirements": {
    "objectivity": "客观性要求(1-10)",
    "interpretability": "可解释性要求(1-10)",
    "efficiency": "效率要求(1-10)",
    "stability": "稳定性要求(1-10)",
    "complexity": "复杂度接受度(1-10)",
    "transparency": "透明度要求(1-10)"
  },
  "constraints": ["限制条件1", "限制条件2"],
  "priorities": ["优先级1", "优先级2"]
}
`;

/**
 * 数据解析Agent提示词模板
 * 输入：数据文件内容
 * 输出：结构化的数据特征描述
 */
const dataAnalysisPrompt = `
你是一位数据分析专家，请分析以下数据特征，并对数据的结构、质量和特性进行全面评估：

### 数据特征：
{{dataFeatures}}

### 分析要求：
1. 全面评估数据质量和完整性
2. 识别数据结构和变量特点
3. 分析数据分布和相关性
4. 识别数据限制和潜在问题
5. 评估数据对不同权重方法的适用性

### 维度分析指南：
- 关注指标数量范围(少量/中等/大量)
- 明确变量类型分布(定量/定性/混合)
- 评估数据质量要求(高/中/低)
- 分析缺失值容忍度(高/中/低)

### 输出格式：
{
  "dataStructure": {
    "indicatorCount": "指标数量",
    "indicatorTypes": ["指标类型1", "指标类型2"],
    "indicatorRelations": "指标间关系描述",
    "hierarchyLevels": "层次结构描述",
    "variableTypes": "变量类型分布(定量/定性/混合)",
    "indicatorCountRange": "指标数量范围描述(少量/中等/大量)"
  },
  "dataQuality": {
    "completeness": "完整性评分(1-10)",
    "reliability": "可靠性评分(1-10)",
    "consistency": "一致性评分(1-10)",
    "missingValuePattern": "缺失值分布模式",
    "outlierSituation": "异常值情况",
    "dataQualityRequirement": "数据质量要求(高/中/低)",
    "missingDataTolerance": "缺失数据容忍度(高/中/低)"
  },
  "distributionFeatures": {
    "sampleSize": "样本量特征",
    "distribution": "分布特征(正态/偏态/多峰等)",
    "variability": "变异性描述",
    "normalityTest": "正态性评估"
  },
  "correlationFeatures": {
    "overallCorrelation": "总体相关性评估",
    "multicollinearityIssues": "多重共线性问题",
    "significantCorrelations": ["显著相关的指标对"]
  },
  "limitations": ["限制1", "限制2"],
  "dataRequirements": {
    "sampleSizeRequirement": "样本量需求",
    "distributionRequirement": "分布要求",
    "qualityThreshold": "质量阈值要求"
  },
  "methodSuitability": {
    "objectiveMethodSuitability": "适合客观方法程度(1-10)",
    "subjectiveMethodSuitability": "适合主观方法程度(1-10)",
    "hybridMethodSuitability": "适合混合方法程度(1-10)"
  }
}
`;

/**
 * 规则匹配Agent提示词模板 - 新增
 * 输入：用户需求特征、数据特征和权重方法库
 * 输出：基于规则匹配的候选方法列表（前N个）
 */
const ruleBasedMatchingPrompt = `
你是一位权重方法规则匹配专家。

🚨 关键要求：必须输出严格的JSON格式，不能有任何解释文字，直接以{开始，以}结束。

### 用户需求特征:
{{userNeeds}}

### 数据特征:
{{dataFeatures}}

### 权重方法库:
{{weightMethods}}

### 匹配任务:
请对每个权重方法进行评分，评估其与用户需求和数据特征的匹配程度。你需要:
1. 遍历用户需求和数据特征中的每个属性
2. 寻找权重方法描述中与该属性相关的信息
3. 评估匹配程度并给出1-10分的评分
4. 计算各维度平均分和总分
5. 选出总分最高的前3个方法作为推荐

##重要说明：
1. 你必须对输入的所有权重方法进行评分，不能遗漏任何方法
2. ruleScoringResults数组必须包含所有输入方法的评分结果
3. 如果因为上下文限制无法处理所有方法，请至少处理前24个方法
4. 确保返回的methodName与输入的方法名称完全一致

### 匹配示例:

## 示例1: 评价领域匹配
用户特征: taskDimension.domain = "经济学"
方法特征: dimensionalAttributes.taskDimension.domains = ["经济学", "管理学"]
分析: 用户领域完全包含在方法适用领域中
评分: 9分 (高匹配)

## 示例2: 专家资源匹配
用户特征: environmentDimension.expertiseLevel = "无"
方法特征: dimensionalAttributes.environmentDimension.expertRequirement = "高"
分析: 方法需要高水平专家资源，但用户没有专家资源
评分: 1分 (严重不匹配，必要条件不满足)

## 示例3: 指标数量匹配
用户特征: dataDimension.indicatorCount = "中等(10-30个)"
方法特征: dimensionalAttributes.dataDimension.indicatorCountRange = "5-50个"
分析: 用户指标数量在方法适用范围内
评分: 9分 (高匹配)

## 示例4: 方法偏好匹配
用户特征: userDimension.methodPreference = "客观"
方法特征: dimensionalAttributes.userDimension.preferredUserType = "偏好客观方法的用户"
分析: 用户偏好与方法特性高度一致
评分: 10分 (完全匹配)

## 示例5: 复杂度匹配
用户特征: taskDimension.complexity = "高"
方法特征: dimensionalAttributes.taskDimension.complexity = "中"
分析: 方法复杂度低于用户问题复杂度，可能无法充分处理
评分: 4分 (低匹配)

## 示例6: 时间约束匹配
用户特征: environmentDimension.timeConstraint = "紧"
方法特征: dimensionalAttributes.environmentDimension.timeRequirement = "高"
分析: 方法需要大量时间，但用户时间紧张
评分: 2分 (严重不匹配，必要条件不满足)

### 匹配原则:
1. 完全匹配或超出用户需求: 8-10分
2. 部分匹配或基本满足: 5-7分
3. 轻微不匹配: 3-4分
4. 严重不匹配: 0-2分
5. 补充说明匹配规则：
   - 如果用户提供了supplementaryInsights，分析每条洞察与方法特性的契合度
   - 方法特性能满足用户的supplementaryInsights = 高匹配度(+2分)
   - 方法特性部分满足补充需求 = 中匹配度(+1分)
   - 方法特性与补充需求冲突 = 低匹配度(-2分)

### 必要条件检查:
以下情况应直接降低方法总分至3分以下:
- 方法需要高水平专家资源，但用户没有专家资源
- 方法需要大量时间，但用户时间紧张
- 方法需要高质量数据，但用户数据质量差

### 维度权重指导:
- 任务维度: 25%
- 数据维度: 25%
- 用户维度: 25%
- 环境维度: 25%
(可根据具体情况适当调整权重)

### 输出格式:
{
  "ruleScoringResults": [
    {
      "methodName": "方法名称",
      "dimensionalScores": {
        "taskDimensionMatch": 7.5,
        "dataDimensionMatch": 8.2,
        "userDimensionMatch": 6.8,
        "environmentDimensionMatch": 7.0
      },
      "totalRuleScore": 7.4,
      "matchingExplanation": "简要匹配分析",
      "recommendationReason": "简要推荐理由"
    }
  ],
  "dimensionalAnalysis": {
    "taskDimensionKey": "任务维度关键发现",
    "dataDimensionKey": "数据维度关键发现",
    "userDimensionKey": "用户维度关键发现",
    "environmentDimensionKey": "环境维度关键发现"
  },
  "topCandidates": ["方法1", "方法2", "方法3"]
}
`;


/**
 * 语义分析提示词模板 - 新增
 * 输入：问题画像和候选方法
 * 输出：语义匹配分析结果
 */
const semanticAnalysisPrompt = `
你是一位权重方法推荐专家。请分析以下问题画像与候选方法的匹配情况：

### 问题画像:
任务维度: 
- 评价领域: {{P.taskDimension.domain}}
- 评价目标性质: {{P.taskDimension.evaluationNature}}
- 问题复杂度: {{P.taskDimension.complexity}}
- 应用范围: {{P.taskDimension.applicationScope}}

数据维度: 
- 指标数量: {{P.dataDimension.indicatorCount}}
- 变量类型: {{P.dataDimension.variableType}}
- 数据质量问题: {{P.dataDimension.dataQualityIssues}}


用户维度: 
- 精确度要求: {{P.userDimension.precision}}
- 指标结构: {{P.userDimension.structure}}
- 指标关系: {{P.userDimension.relation}}
- 方法偏好: {{P.userDimension.methodPreference}}
- 知识水平: {{P.userDimension.knowledgeLevel}}
- 风险承受能力: {{P.userDimension.riskTolerance}}
- 特殊需求: {{P.userDimension.specialRequirements}}
- 补充说明洞察: {{P.userDimension.supplementaryInsights}}
- 补充说明洞察: {{P.userDimension.supplementaryInsights}}

环境维度: 
- 专家资源: {{P.environmentDimension.expertiseLevel}}
- 时间约束: {{P.environmentDimension.timeConstraint}}
- 计算资源: {{P.environmentDimension.computingResource}}
- 环境约束: {{P.environmentDimension.environmentConstraints}}

### 候选方法:
- 方法名称: {{M.name}}
- 方法类别: {{M.type}}
- 数学原理简述: {{M.detail}}
- 适用条件: {{M.suitConditions}}
- 优点: {{M.advantages}}
- 局限性: {{M.limitations}}
- 实施步骤: {{M.implementationSteps}}

### 分析要求:
1. 分析此方法与问题画像的语义匹配程度
2. 评估方法对问题的适用性
3. 说明方法的优势和潜在风险
4. 提供实施建议和注意事项

### 分析指南:
- 考虑方法特性与问题需求的本质契合度，而不仅是表面匹配
- 特别关注用户的补充说明洞察，这些是用户亲自表达的重要需求
- 权衡方法优势与局限性在当前情境下的实际影响
- 评估实施此方法可能遇到的实际挑战
- 考虑用户背景和环境限制对方法适用性的影响

### 输出格式:
请输出一个JSON对象，包含以下字段:
{
  "semanticMatchScore": 1-10分(数字),
  "matchExplanation": "详细解释方法与问题的匹配程度",
  "advantages": ["在此问题情境下的优势1", "优势2", ...],
  "risks": ["潜在风险1", "风险2", ...],
  "implementationAdvice": ["实施建议1", "建议2", ...],
  "suitabilityLevel": "高/中/低",
  "supplementaryImpact": ["补充说明对匹配度的影响1", "影响2", ...]
}
`;


/**
 * LLM创新方法推荐提示词模板
 * 输入：用户需求特征、数据特征、数据库方法名称列表
 * 输出：推荐数据库外的创新权重方法
 */
const methodRecommendationPrompt = `
你是一位权重方法创新专家，拥有广泛的统计学和机器学习知识。

**严格约束条件**：
- 您只能推荐数据库中不存在的创新权重确定方法
- 禁止推荐任何与数据库方法列表中相同或相似的方法
- 必须确保推荐的方法名称与数据库方法完全不同

### 数据库已有方法（严禁推荐）：
{{weightMethodNames}}

### 用户需求特征：
{{userNeeds}}

### 数据特征：
{{dataFeatures}}

### 创新推荐范围和分类要求：
您的推荐必须属于以下四大类别之一：

**A. 主观赋权法类**（基于专家判断和经验）：
- 模糊综合评价法、网络分析法、专家评议法等

**B. 客观赋权法类**（基于数据驱动）：
- 随机森林特征重要性、XGBoost特征重要性、SHAP值权重法
- 信息熔权重法、时间序列权重分析法等

**C. 组合赋权法类**（主客观结合）：
- 多目标权重优化、自适应动态权重调整、集成学习权重组合等

**D. 机器学习方法类**（智能算法）：
- 深度学习注意力权重、神经网络自动权重学习
- 遗传算法权重优化、粒子群权重优化
- 贝叶斯权重推断、强化学习权重分配等

##请只推荐两个方法，不要推荐太多

### 验证检查：
在推荐前，请确保您推荐的每个方法都：
- 不在上述数据库方法列表中
- 属于机器学习、深度学习或优化算法范畴
- 具有明确的创新性和实用性

### 输出格式：
{
  "recommendations": [
    {
      "method": "创新方法名称（必须与数据库方法不同）",
      "type": "主观赋权法/客观赋权法/组合赋权法/机器学习方法",
      "detail": "方法的简要原理和核心思想",
      "suitConditions": ["适用条件1", "适用条件2", "适用条件3"],
      "advantages": ["主要优势1", "主要优势2", "主要优势3"],
      "limitations": ["主要局限性1", "主要局限性2"],
      "implementationSteps": ["步骤1: 详细步骤", "步骤2: 详细步骤", "步骤3: 详细步骤"],
      "suitability": "高/中/低", 
      "reason": "详细推荐理由（说明为何选择此创新方法）",
      "characteristics": {
        "complexity": "高/中/低",
        "dataRequirement": "高/中/低",
        "expertDependency": "高/中/低",
        "interpretability": "高/中/低"
      },
      "scores": {
        "userNeedsMatch": 8,
        "dataFeatureMatch": 7,
        "overallScore": 7.5
      }
    }
  ],
  "rationale": "创新推荐逻辑说明",
  "verification": "已确认所有推荐方法均不在数据库方法列表中且已正确分类"
}
`;




/**
 * LLM方法规则评分提示词模板
 * 输入：LLM推荐方法、用户需求、数据特征
 * 输出：基于规则的方法评分结果
 */
const llmMethodRuleScoringPrompt = `
你是一位权重方法评估专家，请对以下LLM推荐的权重方法进行规则评分。评分需要基于用户需求和数据特征，评估每个方法的适用性。

### LLM推荐方法：
{{llmMethods}}

### 用户需求特征：
{{userNeeds}}

### 数据特征：
{{dataFeatures}}

### 评分维度：
请从以下四个维度对每个LLM推荐方法进行评分（1-10分）：

1. **任务维度匹配度**：
   - 方法是否适合用户的评价领域和目标性质
   - 方法复杂度是否与问题复杂度匹配
   - 方法是否满足应用范围要求

2. **数据维度匹配度**：
   - 方法对数据量和数据质量的要求是否合理
   - 方法是否适合当前的变量类型和数据结构
   - 方法是否能处理数据质量问题

3. **用户维度匹配度**：
   - 方法是否符合用户的知识水平和技术能力
   - 方法的精确度是否满足用户要求
   - 方法是否符合用户的方法偏好

4. **环境维度匹配度**：
   - 方法实施是否符合时间和资源约束
   - 方法是否满足计算资源要求
   - 方法是否适合应用环境的特殊需求

### 评分标准：
- 9-10分：高度匹配，强烈推荐
- 7-8分：较好匹配，推荐使用
- 5-6分：一般匹配，可以考虑
- 3-4分：匹配度较低，谨慎使用
- 1-2分：不匹配，不推荐

### 输出格式（必须严格遵循）：
{
  "ruleScoringResults": [
    {
      "methodName": "方法名称",
      "dimensionalScores": {
        "taskDimensionMatch": 8.5,
        "dataDimensionMatch": 7.2,
        "userDimensionMatch": 9.0,
        "environmentDimensionMatch": 6.8
      },
      "totalRuleScore": 7.9,
      "matchingExplanation": "简要评分理由",
      "recommendationReason": "推荐原因"
    }
  ]
}
`;

/**
 * LLM方法详情生成提示词模板
 * 输入：方法信息、用户需求、数据特征
 * 输出：详细的方法描述和实施指导
 */
const llmMethodDetailGenerationPrompt = `
你是一位权重方法专家，请为以下LLM推荐的权重方法生成详细的方法描述和实施指导。

### 方法基本信息：
{{methodInfo}}

### 用户需求特征：
{{userNeeds}}

### 数据特征：
{{dataFeatures}}

### 任务要求：
请为该方法生成完整的详细信息，包括：
1. 方法的数学原理和理论基础
2. 详细的实施步骤和操作指南
3. 适用条件和使用场景
4. 方法的优势和局限性
5. 实施过程中的注意事项
6. 结果解释和验证方法
7. 数学模型（使用LaTeX格式）
8. 计算示例（使用LaTeX格式）

### 输出格式：
{
  "methodDetails": {
    "name": "方法名称",
    "category": "方法类别",
    "theoreticalFoundation": {
      "basicPrinciple": "方法的基本原理",
      
      "theoreticalAdvantages": "理论优势",
      "mathematicalModel": "使用LaTeX格式的数学模型，例如：$$W_i = \\frac{1-E_i}{n-\\sum_{i=1}^{n}E_i}$$，其中$E_i$表示第i个指标的熵值，$W_i$表示第i个指标的权重"
    },
    "detailedImplementation": {
      "preparationSteps": ["准备步骤1", "准备步骤2"],
      "calculationSteps": ["计算步骤1", "计算步骤2"],
      "validationSteps": ["验证步骤1", "验证步骤2"],
      "calculationExample": "使用LaTeX格式的计算示例，包括具体的数值计算过程和结果解释"
    },
    "applicabilityAnalysis": {
      "suitableConditions": ["适用条件1", "适用条件2"],
      "dataRequirements": "数据要求",
      "skillRequirements": "技能要求",
      "resourceRequirements": "资源要求"
    },
    "methodCharacteristics": {
      "keyAdvantages": ["主要优势1", "主要优势2"],
      "limitations": ["局限性1", "局限性2"],
      "comparisonWithTraditionalMethods": "与传统方法的比较"
    },
    "implementationGuidance": {
      "practicalTips": ["实践技巧1", "实践技巧2"],
      "commonPitfalls": ["常见陷阱1", "常见陷阱2"],
      "troubleshooting": ["问题解决方案1", "问题解决方案2"]
    },
    "resultInterpretation": {
      "outputFormat": "结果输出格式",
      "interpretationGuidance": "结果解释指导",
      "validationMethods": ["验证方法1", "验证方法2"]
    }
  }
}`;

/**
 * 个性化实施建议提示词模板
 * 输入：方法名称、数据特征、用户画像
 * 输出：个性化的实施建议和指导
 */
const personalizedImplementationPrompt = `
你是一位权重方法实施顾问，请根据用户的具体情况为以下权重方法提供个性化的实施建议。

### 权重方法：
{{methodName}}

### 数据特征：
{{dataFeatures}}

### 用户画像：
- 知识水平：{{knowledgeLevel}}
- 技术偏好：{{methodPreference}}
- 精确度要求：{{precision}}
- 风险承受能力：{{riskTolerance}}
- 时间约束：{{timeConstraint}}
- 计算资源：{{computingResource}}
- 专家资源：{{expertiseLevel}}
- 特殊需求：{{specialRequirements}}
- 补充洞察：{{supplementaryInsights}}

### 任务要求：
根据用户的具体情况和限制条件，提供个性化的实施建议，包括：
1. 针对用户知识水平的实施指导
2. 基于数据特征的优化建议
3. 考虑资源约束的实施方案
4. 风险控制和质量保证措施
5. 分阶段实施计划
6. 针对用户特殊需求的定制化建议
7. 基于补充洞察的深度优化方案

### 输出格式：
{
  "personalizedGuidance": {
    "implementationStrategy": {
      "recommendedApproach": "推荐的实施方案",
      "adaptationReason": "方案调整的原因",
      "difficultyAssessment": "实施难度评估"
    },
    "stepByStepPlan": {
      "phases": [
        {
          "phaseName": "阶段名称",
          "duration": "预计耗时",
          "tasks": ["任务1", "任务2"],
          "deliverables": ["交付物1", "交付物2"],
          "skillsNeeded": ["所需技能1", "所需技能2"]
        }
      ],
      "totalEstimatedTime": "总预计时间",
      "criticalPath": "关键路径"
    },
    "resourceOptimization": {
      "dataPreparation": "数据准备建议",
      "toolRecommendations": ["推荐工具1", "推荐工具2"],
      "expertConsultation": "专家咨询建议",
      "learningResources": ["学习资源1", "学习资源2"]
    },
    "riskMitigation": {
      "potentialRisks": ["潜在风险1", "潜在风险2"],
      "preventiveMeasures": ["预防措施1", "预防措施2"],
      "contingencyPlans": ["应急计划1", "应急计划2"]
    },
    "qualityAssurance": {
      "validationCheckpoints": ["验证点1", "验证点2"],
      "successCriteria": ["成功标准1", "成功标准2"],
      "qualityMetrics": ["质量指标1", "质量指标2"]
    },
    "customizations": {
      "methodAdjustments": "方法调整建议",
      "parameterTuning": "参数调优建议",
      "outputFormatting": "输出格式定制",
      "specialRequirementsHandling": "特殊需求处理方案"
    }
  }
}
`;



// 统一导出所有提示词模板
export {
  userNeedsAnalysisPrompt,
  dataAnalysisPrompt,
  methodRecommendationPrompt,
  ruleBasedMatchingPrompt,
  semanticAnalysisPrompt,
  llmMethodRuleScoringPrompt,
  llmMethodDetailGenerationPrompt,
  personalizedImplementationPrompt
}; 