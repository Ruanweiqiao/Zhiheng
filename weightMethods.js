/**
 * 权重方法知识库
 * 包含各种常用权重方法及其特点、适用条件、优缺点等信息
 */
const weightMethodsDB = [
  // 主观赋权法
  {
    name: "层次分析法(AHP)",
    type: "主观赋权法",
    detail: "层次分析法是一种结构化决策方法，将复杂问题分解为层次结构，通过专家对指标两两比较进行判断，构建判断矩阵，计算特征向量得到权重。",
    suitConditions: [
      "有足够的领域专家参与",
      "指标体系具有明确的层次结构",
      "指标数量适中（一般不超过9个同级指标）"
    ],
    advantages: [
      "结构化程度高",
      "具有一致性检验机制",
      "决策过程透明可追溯",
      "考虑层次关系",
      "结合定性判断和定量计算"
    ],
    limitations: [
      "指标数量大时工作量巨大",
      "尺度选择存在主观性",
      "专家判断可能不一致",
      "对专家资源依赖性强"
    ],
    implementationSteps: [
      "1. 构建层次结构模型",
      "2. 构建成对比较判断矩阵",
      "3. 计算权重向量（特征向量法）",
      "4. 进行一致性检验",
      "5. 计算组合权重"
    ],
    suitableScenarios: [
      "复杂多准则决策问题",
      "指标体系层次明确的评价",
      "管理科学、政策分析、工程评价"
    ],
    characteristics: {
      complexity: "高",
      timeCost: "高",
      dataRequirement: "低",
      expertDependency: "高",
      interpretability: "高",
      stability: "中",
      scalability: "低",
      implementationDifficulty: "高",
      cost: "高",
      softwareRequirement: "中"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["管理科学", "政策分析", "工程评价", "环境评价", "社会评价"],
        purpose: ["对多个选项进行排序/筛选", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["中", "高"],
        applicationScope: ["内部管理", "外部报告", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定量", "定性", "混合"],
        dataStructure: "多层次结构",
        dataQualityRequirement: "低",
        requiredDataTypes: ["专家的成对比较判断"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: "多层次",
        relation: "依赖",
        methodPreference: "主观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "充足",
        timeConstraint: ["适中", "长期"],
        computingResource: ["有限", "充足"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 AHP方法的数学模型</h4>

<div class="math-step">
<h5>1. 判断矩阵构造</h5>
<p>设有 $n$ 个评价指标，构造判断矩阵 $\\mathbf{A} = (a_{ij})_{n \\times n}$，其中 $a_{ij}$ 表示第 $i$ 个指标相对于第 $j$ 个指标的重要性比值。</p>

$$\\mathbf{A} = \\begin{pmatrix}
1 & a_{12} & a_{13} & \\cdots & a_{1n} \\\\
\\frac{1}{a_{12}} & 1 & a_{23} & \\cdots & a_{2n} \\\\
\\frac{1}{a_{13}} & \\frac{1}{a_{23}} & 1 & \\cdots & a_{3n} \\\\
\\vdots & \\vdots & \\vdots & \\ddots & \\vdots \\\\
\\frac{1}{a_{1n}} & \\frac{1}{a_{2n}} & \\frac{1}{a_{3n}} & \\cdots & 1
\\end{pmatrix}$$

<p class="math-constraint">约束条件：$a_{ij} > 0$，且 $a_{ii} = 1$，$a_{ji} = \\frac{1}{a_{ij}}$（互反性）</p>
</div>

<div class="math-step">
<h5>2. 特征值求解</h5>
<p>求解矩阵 $\\mathbf{A}$ 的最大特征值 $\\lambda_{\\text{max}}$ 和对应的特征向量 $\\mathbf{W}$：</p>
$$\\mathbf{A}\\mathbf{W} = \\lambda_{\\text{max}} \\mathbf{W}$$
</div>

<div class="math-step">
<h5>3. 权重计算</h5>
<p>对特征向量 $\\mathbf{W}$ 进行归一化处理，得到权重向量：</p>
$$\\mathbf{w} = (w_1, w_2, \\ldots, w_n)^T, \\quad \\text{其中} \\sum_{i=1}^{n} w_i = 1$$
</div>

<div class="math-step">
<h5>4. 一致性检验</h5>
<p>计算一致性指标和一致性比率：</p>
$$CI = \\frac{\\lambda_{\\text{max}} - n}{n - 1}$$
$$CR = \\frac{CI}{RI}$$
<p class="math-constraint">其中 $RI$ 为随机一致性指标，当 $CR < 0.1$ 时，认为判断矩阵的一致性可接受。</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 AHP方法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>假设有3个指标：<strong>经济效益(A)</strong>、<strong>社会效益(B)</strong>、<strong>环境效益(C)</strong>，专家判断得到判断矩阵：</p>

$$\\mathbf{A} = \\begin{pmatrix}
1 & 2 & 5 \\\\
\\frac{1}{2} & 1 & 3 \\\\
\\frac{1}{5} & \\frac{1}{3} & 1
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤1: 计算每列和</h5>
<p>计算判断矩阵每一列的和：</p>
<ul class="calculation-list">
<li>第1列：$1 + \\frac{1}{2} + \\frac{1}{5} = 1.7$</li>
<li>第2列：$2 + 1 + \\frac{1}{3} = 3.33$</li>
<li>第3列：$5 + 3 + 1 = 9$</li>
</ul>
</div>

<div class="example-step">
<h5>步骤2: 矩阵归一化</h5>
<p>将每个元素除以对应列的和，得到归一化矩阵：</p>
$$\\mathbf{B} = \\begin{pmatrix}
0.588 & 0.600 & 0.556 \\\\
0.294 & 0.300 & 0.333 \\\\
0.118 & 0.100 & 0.111
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤3: 计算权重向量</h5>
<p>计算每行的平均值，得到权重向量：</p>
<ul class="calculation-list">
<li>$w_1 = \\frac{0.588 + 0.600 + 0.556}{3} = 0.581$</li>
<li>$w_2 = \\frac{0.294 + 0.300 + 0.333}{3} = 0.309$</li>
<li>$w_3 = \\frac{0.118 + 0.100 + 0.111}{3} = 0.110$</li>
</ul>
</div>

<div class="example-step">
<h5>步骤4: 一致性检验</h5>
<p>计算最大特征值：$\\lambda_{\\text{max}} = 3.01$</p>
<p>计算一致性指标：</p>
$$CI = \\frac{\\lambda_{\\text{max}} - n}{n - 1} = \\frac{3.01 - 3}{3 - 1} = 0.005$$
<p>计算一致性比率：</p>
$$CR = \\frac{CI}{RI} = \\frac{0.005}{0.58} = 0.009 < 0.1$$
<p class="result-highlight">✅ 判断矩阵具有满意的一致性</p>
</div>

<div class="example-result">
<h5>🎯 最终结果</h5>
<p>权重向量为：$\\mathbf{w} = (0.581, 0.309, 0.110)^T$</p>
<div class="weight-visualization">
<div class="weight-item">
<span class="weight-label">经济效益</span>
<span class="weight-value">58.1%</span>
<div class="weight-bar" style="width: 58.1%"></div>
</div>
<div class="weight-item">
<span class="weight-label">社会效益</span>
<span class="weight-value">30.9%</span>
<div class="weight-bar" style="width: 30.9%"></div>
</div>
<div class="weight-item">
<span class="weight-label">环境效益</span>
<span class="weight-value">11.0%</span>
<div class="weight-bar" style="width: 11.0%"></div>
</div>
</div>
</div>
</div>`
  },
  {
    name: "德尔菲法",
    type: "主观赋权法",
    detail: "德尔菲法是一种通过多轮专家匿名反馈来达成共识的方法，通过反复征询专家意见，逐步收敛得到最终权重。",
    suitConditions: [
      "有足够的专家资源",
      "需要达成专家共识",
      "问题具有不确定性"
    ],
    advantages: [
      "避免面对面交流的偏见",
      "多轮反馈促进共识形成",
      "减少从众心理影响",
      "专家意见独立性强"
    ],
    limitations: [
      "耗时较长",
      "专家流失可能影响结果",
      "结果受专家选择影响大",
      "成本较高"
    ],
    implementationSteps: [
      "1. 选择专家组成员",
      "2. 设计第一轮问卷",
      "3. 收集并分析专家意见",
      "4. 反馈结果并再次征询",
      "5. 重复直到达成共识"
    ],
    suitableScenarios: [
      "缺乏历史数据的新兴领域",
      "需要专家共识的复杂评价",
      "技术预测、政策制定、风险评估"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "高",
      dataRequirement: "低",
      expertDependency: "高",
      interpretability: "高",
      stability: "中",
      scalability: "中",
      implementationDifficulty: "中",
      cost: "高",
      softwareRequirement: "低"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["政策分析", "技术预测", "风险评估", "战略规划"],
        purpose: ["对多个选项进行排序/筛选", "建立预警或监测体系"],
        evaluationNature: ["描述性", "预测性"],
        complexity: ["中", "高"],
        applicationScope: ["内部管理", "外部报告", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定性", "混合"],
        dataStructure: "单层或多层次均可",
        dataQualityRequirement: "低",
        requiredDataTypes: ["专家对指标重要性的评分"]
      },
      userDimension: {
        precision: ["中"],
        structure: ["单层", "多层次"],
        relation: ["依赖", "独立"],
        methodPreference: "主观",
        knowledgeLevel: ["初级", "中级", "高级"],
        riskTolerance: ["中"],
        specialRequirements: ["高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "充足",
        timeConstraint: "长期",
        computingResource: ["有限", "充足"],
        environmentConstraints: ["人力资源不足"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 德尔菲法的数学模型</h4>

<div class="math-step">
<h5>1. 计算专家评分的均值</h5>
<p>对第 $j$ 个指标，计算所有专家评分的均值：</p>
$$M_j = \\frac{1}{n}\\sum_{i=1}^{n} w_{ij}$$
<p class="math-constraint">其中 $w_{ij}$ 为第 $i$ 位专家对第 $j$ 个指标的评分，$n$ 为专家数量</p>
</div>

<div class="math-step">
<h5>2. 计算标准差</h5>
<p>计算第 $j$ 个指标评分的标准差，用于衡量专家意见的一致性：</p>
$$\\sigma_j = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(w_{ij} - M_j)^2}$$
</div>

<div class="math-step">
<h5>3. 计算变异系数</h5>
<p>计算变异系数来判断专家意见是否收敛：</p>
$$CV_j = \\frac{\\sigma_j}{M_j}$$
<p class="math-constraint">通常当所有指标的 $CV$ 值都小于阈值（如0.2）时，认为专家意见达成一致</p>
</div>

<div class="math-step">
<h5>4. 确定专家权重（可选）</h5>
<p>根据专家的专业水平确定权重：</p>
$$\\alpha_i = \\frac{E_i}{\\sum_{k=1}^{n} E_k}$$
<p class="math-constraint">其中 $E_i$ 为第 $i$ 位专家的专业水平评分</p>
</div>

<div class="math-step">
<h5>5. 计算加权平均值（可选）</h5>
<p>考虑专家权重后的指标评分：</p>
$$M_j^* = \\sum_{i=1}^{n} \\alpha_i \\times w_{ij}$$
</div>

<div class="math-step">
<h5>6. 计算最终权重</h5>
<p>对评分进行归一化得到最终权重：</p>
$$W_j = \\frac{M_j}{\\sum_{k=1}^{m} M_k} \\quad \\text{或} \\quad W_j = \\frac{M_j^*}{\\sum_{k=1}^{m} M_k^*}$$
<p class="math-constraint">其中 $m$ 为指标总数，$W_j$ 为第 $j$ 个指标的最终权重</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>💡 德尔菲法计算示例</h4>

<div class="example-step">
<h5>初始数据</h5>
<p>假设有5位专家对4个指标进行评分，评分范围为1-10分</p>

<div class="calculation-step">
<strong>第一轮评分结果：</strong>
$$\\mathbf{X}^{(1)} = \\begin{pmatrix}
8 & 6 & 9 & 5 \\\\
7 & 5 & 8 & 6 \\\\
9 & 7 & 7 & 4 \\\\
6 & 6 & 9 & 7 \\\\
8 & 5 & 8 & 5
\\end{pmatrix}$$
</div>
</div>

<div class="example-step">
<h5>第一轮统计分析</h5>

<div class="calculation-step">
<strong>计算各指标平均分：</strong>
$$M_1 = \\frac{8+7+9+6+8}{5} = 7.6$$
$$M_2 = \\frac{6+5+7+6+5}{5} = 5.8$$
$$M_3 = \\frac{9+8+7+9+8}{5} = 8.2$$
$$M_4 = \\frac{5+6+4+7+5}{5} = 5.4$$
</div>

<div class="calculation-step">
<strong>计算标准差：</strong>
$$\\sigma_1 = \\sqrt{\\frac{\\sum_{i=1}^{5}(x_{i1}-M_1)^2}{5}} = 1.14$$
$$\\sigma_2 = 0.84, \\quad \\sigma_3 = 0.84, \\quad \\sigma_4 = 1.14$$
</div>

<div class="calculation-step">
<strong>计算变异系数：</strong>
$$CV_j = \\frac{\\sigma_j}{M_j}$$
$$CV_1 = \\frac{1.14}{7.6} = 0.15, \\quad CV_2 = 0.14, \\quad CV_3 = 0.10, \\quad CV_4 = 0.21$$
</div>

<div class="step-result">
由于 $CV_4 = 0.21 > 0.2$，需要进行第二轮评分
</div>
</div>

<div class="example-step">
<h5>第二轮评分与分析</h5>

<div class="calculation-step">
<strong>第二轮评分结果：</strong>
$$\\mathbf{X}^{(2)} = \\begin{pmatrix}
8 & 6 & 9 & 6 \\\\
7 & 6 & 8 & 5 \\\\
8 & 7 & 8 & 5 \\\\
7 & 6 & 9 & 6 \\\\
8 & 6 & 8 & 5
\\end{pmatrix}$$
</div>

<div class="calculation-step">
<strong>第二轮变异系数：</strong>
$$CV_1 = 0.07, \\quad CV_2 = 0.07, \\quad CV_3 = 0.07, \\quad CV_4 = 0.10$$
<p>所有 $CV_j < 0.2$，意见趋于一致</p>
</div>
</div>

<div class="example-step">
<h5>最终权重计算</h5>

<div class="calculation-step">
<strong>最终平均分：</strong>
$$M_1 = 7.6, \\quad M_2 = 6.2, \\quad M_3 = 8.4, \\quad M_4 = 5.4$$
</div>

<div class="calculation-step">
<strong>归一化权重：</strong>
$$w_j = \\frac{M_j}{\\sum_{k=1}^{4} M_k}$$

$$w_1 = \\frac{7.6}{27.6} = 0.275 \\quad (27.5\\%)$$
$$w_2 = \\frac{6.2}{27.6} = 0.225 \\quad (22.5\\%)$$
$$w_3 = \\frac{8.4}{27.6} = 0.304 \\quad (30.4\\%)$$
$$w_4 = \\frac{5.4}{27.6} = 0.196 \\quad (19.6\\%)$$
</div>

<div class="step-result">
最终权重向量：$\\mathbf{w} = (0.275, 0.225, 0.304, 0.196)^T$
</div>
</div>
</div>`
  },
  {
    name: "专家评估法",
    type: "主观赋权法",
    detail: "专家评估法是一种直接由专家根据经验对指标重要性进行打分的方法，简单直接但主观性较强。",
    suitConditions: [
      "有领域专家参与",
      "定性指标较多",
      "缺乏客观数据"
    ],
    advantages: [
      "操作简单直接",
      "充分利用专家经验",
      "实施成本较低",
      "决策速度快"
    ],
    limitations: [
      "主观性强",
      "难以量化专家认知差异",
      "缺乏理论基础",
      "结果可能不稳定"
    ],
    implementationSteps: [
      "1. 选择评估专家",
      "2. 设计评分标准",
      "3. 专家独立评分",
      "4. 汇总分析结果",
      "5. 确定最终权重"
    ],
    suitableScenarios: [
      "定性指标较多的评价体系",
      "缺乏客观数据的情况",
      "社会科学、管理决策、安全评价"
    ],
    mathematicalModel: `
<div class="math-section">
<h4>🔢 专家评估法的数学模型</h4>

<div class="math-step">
<h5>1. 专家评分</h5>
<p>第 $k$ 个专家对第 $j$ 个指标给出评分 $s_{kj}$</p>
</div>

<div class="math-step">
<h5>2. 权重计算</h5>
<p>单专家情况，权重归一化：</p>
$$w_j = \\frac{s_j}{\\sum_{i=1}^{n} s_i}$$

<p>多专家情况，先求均值再归一化：</p>
$$\\bar{s}_j = \\frac{1}{m} \\sum_{k=1}^{m} s_{kj}$$
$$w_j = \\frac{\\bar{s}_j}{\\sum_{i=1}^{n} \\bar{s}_i}$$

<p class="math-constraint">其中：$n$ 为指标数量，$m$ 为专家数量</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 专家评估法计算示例</h4>

<p>3个专家对4个指标进行重要性评分（1-10分）：</p>

<table class="data-table">
<tr><th>指标</th><th>专家1</th><th>专家2</th><th>专家3</th><th>均值</th><th>权重</th></tr>
<tr><td>服务质量</td><td>9</td><td>8</td><td>9</td><td>8.67</td><td>0.361</td></tr>
<tr><td>价格水平</td><td>7</td><td>6</td><td>7</td><td>6.67</td><td>0.278</td></tr>
<tr><td>便利性</td><td>6</td><td>7</td><td>6</td><td>6.33</td><td>0.264</td></tr>
<tr><td>品牌声誉</td><td>3</td><td>2</td><td>3</td><td>2.33</td><td>0.097</td></tr>
</table>

<p>计算过程：</p>
$$w_1 = \\frac{8.67}{8.67+6.67+6.33+2.33} = 0.361$$
</div>
`
  },
  {
    name: "直接赋权法",
    type: "主观赋权法",
    detail: "直接赋权法是一种由决策者直接给出各指标权重的方法，简单直观但缺乏理论支撑。",
    suitConditions: [
      "决策者经验丰富",
      "问题相对简单",
      "时间紧迫"
    ],
    advantages: [
      "简单易实施",
      "决策速度快",
      "概念直观",
      "操作成本低"
    ],
    limitations: [
      "缺乏理论支撑",
      "主观随意性大",
      "难以处理复杂问题",
      "结果可重复性差"
    ],
    implementationSteps: [
      "1. 确定评价指标",
      "2. 决策者直接赋权",
      "3. 归一化处理",
      "4. 验证权重合理性"
    ],
    suitableScenarios: [
      "简单评价问题",
      "紧急决策情境",
      "初步筛选阶段"
    ],
    mathematicalModel: `
<div class="math-section">
<h4>🔢 直接赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 直接赋权</h5>
<p>决策者直接给出各指标的权重值 $w_j'$</p>
</div>

<div class="math-step">
<h5>2. 归一化处理</h5>
<p>确保权重和为1：</p>
$$w_j = \\frac{w_j'}{\\sum_{i=1}^{n} w_i'}$$

<p class="math-constraint">约束条件：$\\sum_{j=1}^{n} w_j = 1$，$w_j \\geq 0$</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 直接赋权法计算示例</h4>

<p>决策者对投资决策的4个指标直接赋权：</p>

<table class="data-table">
<tr><th>指标</th><th>初始权重</th><th>归一化权重</th></tr>
<tr><td>预期收益</td><td>5</td><td>0.417</td></tr>
<tr><td>投资风险</td><td>3</td><td>0.250</td></tr>
<tr><td>流动性</td><td>2</td><td>0.167</td></tr>
<tr><td>投资期限</td><td>2</td><td>0.167</td></tr>
<tr><td><strong>总计</strong></td><td><strong>12</strong></td><td><strong>1.000</strong></td></tr>
</table>

<p>归一化计算：</p>
$$w_1 = \\frac{5}{5+3+2+2} = \\frac{5}{12} = 0.417$$
</div>
`
  },
  {
    name: "等权重法",
    type: "主观赋权法",
    detail: "等权重法是一种将所有指标赋予相同权重的方法，适用于指标重要性难以区分的情况。",
    suitConditions: [
      "指标重要性相近",
      "缺乏区分依据",
      "初步研究阶段"
    ],
    advantages: [
      "操作最简单",
      "无需复杂计算",
      "避免主观偏见",
      "结果稳定"
    ],
    limitations: [
      "忽略指标重要性差异",
      "可能导致不合理结果",
      "信息利用不充分",
      "适用场景有限"
    ],
    implementationSteps: [
      "1. 确定评价指标",
      "2. 赋予相同权重",
      "3. 计算综合得分"
    ],
    suitableScenarios: [
      "指标重要性难以区分时",
      "初步研究阶段",
      "指标数量少且相似性高的情况"
    ],
    mathematicalModel: `
<div class="math-section">
<h4>🔢 等权重法的数学模型</h4>

<div class="math-step">
<h5>1. 等权重分配</h5>
<p>对于 $n$ 个指标，每个指标的权重为：</p>
$$w_j = \\frac{1}{n}, \\quad j = 1, 2, \\ldots, n$$
</div>

<div class="math-step">
<h5>2. 验证约束</h5>
<p>权重满足归一化条件：</p>
$$\\sum_{j=1}^{n} w_j = \\sum_{j=1}^{n} \\frac{1}{n} = 1$$
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 等权重法计算示例</h4>

<p>评价城市发展水平的5个指标采用等权重：</p>

<table class="data-table">
<tr><th>指标</th><th>权重</th></tr>
<tr><td>经济发展水平</td><td>0.200</td></tr>
<tr><td>社会发展水平</td><td>0.200</td></tr>
<tr><td>环境质量</td><td>0.200</td></tr>
<tr><td>基础设施</td><td>0.200</td></tr>
<tr><td>创新能力</td><td>0.200</td></tr>
<tr><td><strong>总计</strong></td><td><strong>1.000</strong></td></tr>
</table>

<p>计算公式：</p>
$$w_j = \\frac{1}{5} = 0.200$$
</div>
`
  },
  // 客观赋权法
  {
    name: "熵权法",
    type: "客观赋权法",
    detail: "熵权法基于信息熵理论，通过计算指标的信息熵来确定权重，信息量大（变异程度高）的指标获得较高权重。",
    suitConditions: [
      "有完整的指标评价数据",
      "指标间差异显著",
      "需要完全客观的权重"
    ],
    advantages: [
      "完全客观，无人为干预",
      "计算简便",
      "适用于多指标评价",
      "消除量纲影响"
    ],
    limitations: [
      "完全依赖数据分布",
      "忽略指标实际重要性",
      "可能与实际不符",
      "对异常值敏感"
    ],
    implementationSteps: [
      "1. 数据标准化",
      "2. 计算指标比重",
      "3. 计算信息熵",
      "4. 计算信息效用值",
      "5. 计算权重"
    ],
    suitableScenarios: [
      "需要客观评价的场景",
      "数据完整可靠",
      "经济评价、环境评价"
    ],
    characteristics: {
      complexity: "低",
      timeCost: "低",
      dataRequirement: "高",
      expertDependency: "无",
      interpretability: "中",
      stability: "中",
      scalability: "高",
      implementationDifficulty: "低",
      cost: "低",
      softwareRequirement: "低"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济评价", "环境评价", "性能评估", "效率分析"],
        purpose: ["评估单一对象的综合表现", "对多个选项进行排序/筛选"],
        evaluationNature: ["描述性"],
        complexity: ["低", "中"],
        applicationScope: ["学术研究", "内部管理"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量"],
        dataStructure: "单层结构",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: "单层",
        relation: "独立",
        methodPreference: "客观",
        knowledgeLevel: ["初级", "中级"],
        riskTolerance: ["低", "中"],
        specialRequirements: ["避免主观干预"]
      },
      environmentDimension: {
        expertiseLevel: "无需专家",
        timeConstraint: ["短期", "适中"],
        computingResource: ["有限", "充足"],
        environmentConstraints: ["缺乏专家资源"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 熵权法的数学模型</h4>

<div class="math-step">
<h5>1. 数据标准化</h5>
<p>对于效益型指标（值越大越好）：</p>
$$r_{ij} = \\frac{x_{ij} - \\min(x_j)}{\\max(x_j) - \\min(x_j)}$$
<p>对于成本型指标（值越小越好）：</p>
$$r_{ij} = \\frac{\\max(x_j) - x_{ij}}{\\max(x_j) - \\min(x_j)}$$
<p class="math-constraint">其中 $x_{ij}$ 为第 $i$ 个评价对象第 $j$ 个指标的原始值，$r_{ij}$ 为标准化后的值，范围为[0,1]</p>
</div>

<div class="math-step">
<h5>2. 计算指标比重</h5>
<p>计算每个对象在每个指标上的比重：</p>
$$p_{ij} = \\frac{r_{ij}}{\\sum_{i=1}^{n} r_{ij}}$$
<p class="math-constraint">其中 $n$ 为评价对象数量</p>
</div>

<div class="math-step">
<h5>3. 计算信息熵</h5>
<p>计算第 $j$ 个指标的信息熵：</p>
$$e_j = -k \\sum_{i=1}^{n} p_{ij} \\ln(p_{ij})$$
<p class="math-constraint">其中 $k = \\frac{1}{\\ln(n)}$，当 $p_{ij} = 0$ 时，定义 $p_{ij} \\ln(p_{ij}) = 0$</p>
</div>

<div class="math-step">
<h5>4. 计算信息效用值</h5>
<p>计算第 $j$ 个指标的信息效用值：</p>
$$d_j = 1 - e_j$$
<p class="math-constraint">$d_j$ 越大，表示该指标的信息量越大</p>
</div>

<div class="math-step">
<h5>5. 计算权重</h5>
<p>对信息效用值进行归一化得到最终权重：</p>
$$w_j = \\frac{d_j}{\\sum_{k=1}^{m} d_k}$$
<p class="math-constraint">其中 $m$ 为指标数量，$w_j$ 为第 $j$ 个指标的权重</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>💡 熵权法计算示例</h4>

<p>假设有3个评价对象，4个评价指标的原始数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵 $\\mathbf{X}$：</strong>
$$\\mathbf{X} = \\begin{pmatrix}
0.4 & 0.3 & 0.5 & 0.7 \\\\
0.6 & 0.2 & 0.4 & 0.5 \\\\
0.8 & 0.4 & 0.6 & 0.3
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：数据标准化（效益型指标）</strong>
<p>使用标准化公式：$r_{ij} = \\frac{x_{ij} - \\min(x_j)}{\\max(x_j) - \\min(x_j)}$</p>

$$\\mathbf{R} = \\begin{pmatrix}
0.0 & 0.5 & 0.5 & 1.0 \\\\
0.5 & 0.0 & 0.0 & 0.5 \\\\
1.0 & 1.0 & 1.0 & 0.0
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：计算指标比重</strong>
<p>计算公式：$p_{ij} = \\frac{r_{ij}}{\\sum_{i=1}^{n} r_{ij}}$</p>

$$\\mathbf{P} = \\begin{pmatrix}
0.00 & 0.33 & 0.33 & 0.67 \\\\
0.33 & 0.00 & 0.00 & 0.33 \\\\
0.67 & 0.67 & 0.67 & 0.00
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算信息熵</strong>
<p>计算常数：$k = \\frac{1}{\\ln(3)} = 0.91$</p>
<p>信息熵公式：$e_j = -k \\sum_{i=1}^{n} p_{ij} \\ln(p_{ij})$</p>

$$e_1 = -0.91 \\times [0 + 0.33\\ln(0.33) + 0.67\\ln(0.67)] = 0.63$$
$$e_2 = e_3 = e_4 = 0.63$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算信息效用值</strong>
<p>效用值公式：$d_j = 1 - e_j$</p>

$$d_1 = d_2 = d_3 = d_4 = 1 - 0.63 = 0.37$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤5：计算最终权重</strong>
<p>权重公式：$w_j = \\frac{d_j}{\\sum_{k=1}^{m} d_k}$</p>

$$\\sum d_j = 0.37 \\times 4 = 1.48$$

$$w_1 = w_2 = w_3 = w_4 = \\frac{0.37}{1.48} = 0.25$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.25, 0.25, 0.25, 0.25)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>在此例中，由于各指标的信息熵相同，所以各指标获得了相同的权重。
在实际应用中，不同指标的信息熵通常会有差异，导致权重不同。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "变异系数法",
    type: "客观赋权法",
    detail: "变异系数法基于统计学中的变异系数（标准差与均值的比值）来确定权重，变异系数越大表示指标区分能力越强，权重越大。",
    suitConditions: [
      "有完整的指标评价数据",
      "指标间差异显著",
      "需要考虑指标的区分能力"
    ],
    advantages: [
      "计算简单",
      "消除量纲影响",
      "客观反映指标区分能力",
      "不需要专家判断"
    ],
    limitations: [
      "仅适用于定量指标",
      "对异常值敏感",
      "忽略指标间相关性",
      "完全依赖数据分布"
    ],
    implementationSteps: [
      "1. 计算各指标的标准差",
      "2. 计算各指标的均值",
      "3. 计算变异系数",
      "4. 归一化得到权重"
    ],
    suitableScenarios: [
      "定量指标评价",
      "对指标区分能力要求高的情况",
      "经济统计、社会调查分析"
    ],
    characteristics: {
      complexity: "低",
      timeCost: "低",
      dataRequirement: "中",
      expertDependency: "低",
      interpretability: "高",
      stability: "中",
      scalability: "高",
      implementationDifficulty: "低",
      cost: "低",
      softwareRequirement: "低"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济统计", "社会调查", "性能评估", "质量控制"],
        purpose: ["对多个选项进行排序/筛选", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "比较性"],
        complexity: ["低", "中"],
        applicationScope: ["学术研究", "内部管理"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定量"],
        dataStructure: "单层结构",
        dataQualityRequirement: "中",
        requiredDataTypes: ["原始指标数据"]
      },
      userDimension: {
        precision: ["中"],
        structure: "单层",
        relation: "独立",
        methodPreference: "客观",
        knowledgeLevel: ["初级", "中级"],
        riskTolerance: ["中"],
        specialRequirements: ["强调指标区分能力"]
      },
      environmentDimension: {
        expertiseLevel: "无需专家",
        timeConstraint: ["短期", "适中"],
        computingResource: ["有限", "充足"],
        environmentConstraints: ["缺乏专家资源"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 变异系数法的数学模型</h4>

<div class="math-step">
<h5>1. 计算均值</h5>
<p>计算第 $j$ 个指标的样本均值：</p>
$$\\bar{x}_j = \\frac{1}{n}\\sum_{i=1}^{n} x_{ij}$$
<p class="math-constraint">其中 $x_{ij}$ 为第 $i$ 个样本的第 $j$ 个指标值，$n$ 为样本数量</p>
</div>

<div class="math-step">
<h5>2. 计算标准差</h5>
<p>计算第 $j$ 个指标的样本标准差：</p>
$$\\sigma_j = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_{ij} - \\bar{x}_j)^2}$$
</div>

<div class="math-step">
<h5>3. 计算变异系数</h5>
<p>计算第 $j$ 个指标的变异系数：</p>
$$V_j = \\frac{\\sigma_j}{\\bar{x}_j}$$
<p class="math-constraint">变异系数越大，表示该指标的区分能力越强</p>
</div>

<div class="math-step">
<h5>4. 计算权重</h5>
<p>对变异系数进行归一化得到最终权重：</p>
$$w_j = \\frac{V_j}{\\sum_{k=1}^{m} V_k}$$
<p class="math-constraint">其中 $m$ 为指标数量，$w_j$ 为第 $j$ 个指标的权重</p>
</div>
</div>`,    calculationExample: `
<div class="example-section">
<h4>💡 变异系数法计算示例</h4>

<p>假设有5个区域的3个经济指标数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵：</strong>
<table class="data-table">
<tr><th>地区</th><th>GDP(亿元)</th><th>人均收入(万元)</th><th>就业率(%)</th></tr>
<tr><td>A</td><td>1200</td><td>5.6</td><td>92</td></tr>
<tr><td>B</td><td>980</td><td>4.8</td><td>88</td></tr>
<tr><td>C</td><td>1500</td><td>6.2</td><td>95</td></tr>
<tr><td>D</td><td>800</td><td>4.2</td><td>87</td></tr>
<tr><td>E</td><td>1350</td><td>5.8</td><td>91</td></tr>
</table>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：计算各指标的均值</strong>
$$\\bar{x}_1 = \\frac{1200+980+1500+800+1350}{5} = 1166$$
$$\\bar{x}_2 = \\frac{5.6+4.8+6.2+4.2+5.8}{5} = 5.32$$
$$\\bar{x}_3 = \\frac{92+88+95+87+91}{5} = 90.6$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：计算各指标的标准差</strong>
$$\\sigma_1 = \\sqrt{\\frac{\\sum_{i=1}^{5}(x_{i1} - \\bar{x}_1)^2}{5}} = \\sqrt{\\frac{384880}{5}} ≈ 277.32$$

$$\\sigma_2 = \\sqrt{\\frac{\\sum_{i=1}^{5}(x_{i2} - \\bar{x}_2)^2}{5}} = \\sqrt{\\frac{3.04}{5}} ≈ 0.78$$

$$\\sigma_3 = \\sqrt{\\frac{\\sum_{i=1}^{5}(x_{i3} - \\bar{x}_3)^2}{5}} = \\sqrt{\\frac{46.4}{5}} ≈ 3.05$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算各指标的变异系数</strong>
$$V_1 = \\frac{\\sigma_1}{\\bar{x}_1} = \\frac{277.32}{1166} = 0.238$$
$$V_2 = \\frac{\\sigma_2}{\\bar{x}_2} = \\frac{0.78}{5.32} = 0.147$$
$$V_3 = \\frac{\\sigma_3}{\\bar{x}_3} = \\frac{3.05}{90.6} = 0.034$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算最终权重</strong>
$$\\sum V_j = 0.238 + 0.147 + 0.034 = 0.419$$

$$w_1 = \\frac{0.238}{0.419} = 0.568 \\quad (56.8\\%)$$
$$w_2 = \\frac{0.147}{0.419} = 0.351 \\quad (35.1\\%)$$
$$w_3 = \\frac{0.034}{0.419} = 0.081 \\quad (8.1\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.568, 0.351, 0.081)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>根据变异系数法，三个指标的权重分别为56.8%、35.1%和8.1%。<br>
GDP的变异系数最大，说明各地区在这一指标上差异最显著，因此获得最高权重。<br>
就业率的变异系数最小，说明各地区在这一指标上较为接近，因此获得最低权重。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "CRITIC法",
    type: "客观赋权法",
    detail: "CRITIC(CRiteria Importance Through Intercriteria Correlation)方法通过同时考虑指标的变异性和相关性来确定权重，避免了信息重叠。",
    suitConditions: [
      "有完整的指标评价数据",
      "指标间存在相关性",
      "需要考虑指标提供的独立信息量"
    ],
    advantages: [
      "同时考虑指标的标准差和相关系数",
      "避免信息重叠计算",
      "适合处理指标间有相关性的场景",
      "结果客观可重复"
    ],
    limitations: [
      "计算过程相对复杂",
      "完全依赖数据，忽略实际语义重要性",
      "对数据质量要求高",
      "结果解释性不强"
    ],
    implementationSteps: [
      "1. 对原始数据进行标准化处理",
      "2. 计算各指标的标准差",
      "3. 计算指标间的相关系数矩阵",
      "4. 计算各指标的冲突度",
      "5. 计算各指标的信息量",
      "6. 归一化得到权重"
    ],
    suitableScenarios: [
      "指标间存在明显相关性的评价系统",
      "需要避免信息重叠计算",
      "数据完整可靠的客观评价"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "中",
      dataRequirement: "高",
      expertDependency: "低",
      interpretability: "中",
      stability: "高",
      scalability: "高",
      implementationDifficulty: "中",
      cost: "低",
      softwareRequirement: "中"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济评价", "金融分析", "性能评估", "多指标决策"],
        purpose: ["对多个选项进行排序/筛选", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "分析性"],
        complexity: ["中", "高"],
        applicationScope: ["学术研究", "企业决策", "内部管理"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量"],
        dataStructure: "单层或多层次均可",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据", "相关性数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: ["单层", "多层次"],
        relation: "相关",
        methodPreference: "客观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中"],
        specialRequirements: ["处理高度相关指标"]
      },
      environmentDimension: {
        expertiseLevel: "低",
        timeConstraint: ["适中"],
        computingResource: ["充足"],
        environmentConstraints: ["数据质量要求高"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 CRITIC方法的数学模型</h4>

<div class="math-step">
<h5>1. 数据标准化</h5>
<p>对于效益型指标（值越大越好）：</p>
$$z_{ij} = \\frac{x_{ij} - \\min(x_j)}{\\max(x_j) - \\min(x_j)}$$

<p>对于成本型指标（值越小越好）：</p>
$$z_{ij} = \\frac{\\max(x_j) - x_{ij}}{\\max(x_j) - \\min(x_j)}$$

<p>其中，$x_{ij}$ 为第 $i$ 个评价对象第 $j$ 个指标的原始值，$z_{ij}$ 为标准化后的值，范围为 $[0,1]$。</p>
</div>

<div class="math-step">
<h5>2. 计算标准差</h5>
$$\\sigma_j = \\sqrt{\\frac{\\sum_{i=1}^n (z_{ij} - \\bar{z}_j)^2}{n}}$$

<p>其中，$\\bar{z}_j$ 为标准化后第 $j$ 个指标的均值。</p>
</div>

<div class="math-step">
<h5>3. 计算相关系数矩阵</h5>
$$\\mathbf{R} = [r_{jk}]_{m \\times m}$$

<p>其中，$r_{jk}$ 为指标 $j$ 与指标 $k$ 的相关系数：</p>
$$r_{jk} = \\frac{\\sum_{i=1}^n (z_{ij} - \\bar{z}_j)(z_{ik} - \\bar{z}_k)}{\\sqrt{\\sum_{i=1}^n (z_{ij} - \\bar{z}_j)^2 \\cdot \\sum_{i=1}^n (z_{ik} - \\bar{z}_k)^2}}$$
</div>

<div class="math-step">
<h5>4. 计算冲突度</h5>
$$C_j = \\sum_{k=1}^m (1 - r_{jk})$$

<p>其中，$C_j$ 为第 $j$ 个指标与其他指标的冲突度总和。</p>
</div>

<div class="math-step">
<h5>5. 计算信息量</h5>
$$INF_j = \\sigma_j \\times C_j$$

<p>其中，$INF_j$ 为第 $j$ 个指标的信息量。</p>
</div>

<div class="math-step">
<h5>6. 计算权重</h5>
$$w_j = \\frac{INF_j}{\\sum_{j=1}^m INF_j}$$

<p>其中，$w_j$ 为第 $j$ 个指标的权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 CRITIC法计算示例</h4>

<p>假设有4个企业的3个财务指标数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵：</strong>
<table class="data-table">
<tr><th>企业</th><th>利润率(%)</th><th>资产周转率</th><th>负债率(%)</th></tr>
<tr><td>A</td><td>15</td><td>1.2</td><td>45</td></tr>
<tr><td>B</td><td>12</td><td>0.9</td><td>60</td></tr>
<tr><td>C</td><td>18</td><td>1.5</td><td>35</td></tr>
<tr><td>D</td><td>10</td><td>0.8</td><td>55</td></tr>
</table>
<p><em>注：利润率和资产周转率为效益型指标，负债率为成本型指标。</em></p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：数据标准化</strong>
<p>标准化后的矩阵 $\\mathbf{Z}$：</p>
$$\\mathbf{Z} = \\begin{pmatrix}
0.625 & 0.571 & 0.600 \\\\
0.250 & 0.143 & 0.000 \\\\
1.000 & 1.000 & 1.000 \\\\
0.000 & 0.000 & 0.200
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：计算各指标标准差</strong>
$$\\sigma_1 = 0.429, \\quad \\sigma_2 = 0.437, \\quad \\sigma_3 = 0.436$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算相关系数矩阵</strong>
$$\\mathbf{R} = \\begin{pmatrix}
1.000 & 0.997 & 0.763 \\\\
0.997 & 1.000 & 0.790 \\\\
0.763 & 0.790 & 1.000
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算冲突度</strong>
$$C_1 = (1-1.000) + (1-0.997) + (1-0.763) = 0.240$$
$$C_2 = (1-0.997) + (1-1.000) + (1-0.790) = 0.213$$
$$C_3 = (1-0.763) + (1-0.790) + (1-1.000) = 0.447$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤5：计算信息量</strong>
$$INF_1 = \\sigma_1 \\times C_1 = 0.429 \\times 0.240 = 0.103$$
$$INF_2 = \\sigma_2 \\times C_2 = 0.437 \\times 0.213 = 0.093$$
$$INF_3 = \\sigma_3 \\times C_3 = 0.436 \\times 0.447 = 0.195$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤6：计算最终权重</strong>
$$\\sum INF_j = 0.103 + 0.093 + 0.195 = 0.391$$

$$w_1 = \\frac{0.103}{0.391} = 0.264 \\quad (26.4\\%)$$
$$w_2 = \\frac{0.093}{0.391} = 0.238 \\quad (23.8\\%)$$
$$w_3 = \\frac{0.195}{0.391} = 0.499 \\quad (49.9\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.264, 0.238, 0.499)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>负债率获得了最高权重，这是因为它与其他指标的相关性较低（冲突度高），
提供了更多的独立信息。而利润率和资产周转率由于高度相关，信息有一定重叠，
因此权重相对较低。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "主成分分析法",
    type: "客观赋权法",
    detail: "主成分分析法通过降维技术，将多个相关指标转化为少数几个不相关的主成分，用主成分的贡献率作为权重。",
    suitConditions: [
      "指标间存在相关性",
      "样本量充足",
      "需要降维处理"
    ],
    advantages: [
      "可处理多重共线性",
      "降维保留主要信息",
      "减少冗余",
      "结果客观"
    ],
    limitations: [
      "主成分物理意义不明确",
      "计算较复杂",
      "对数据分布有要求",
      "需要专业知识解释"
    ],
    implementationSteps: [
      "1. 数据标准化",
      "2. 计算相关系数矩阵",
      "3. 计算特征值和特征向量",
      "4. 确定主成分个数",
      "5. 计算主成分得分",
      "6. 计算权重"
    ],
    suitableScenarios: [
      "高维数据分析",
      "指标间高度相关",
      "需要降维的复杂评价"
    ],
    characteristics: {
      complexity: "高",
      timeCost: "中",
      dataRequirement: "高",
      expertDependency: "低",
      interpretability: "低",
      stability: "高",
      scalability: "高",
      implementationDifficulty: "高",
      cost: "中",
      softwareRequirement: "高"
    },
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济评价", "社会发展", "科技创新", "多维度评估"],
        purpose: ["降维分析", "消除指标冗余", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "分析性"],
        complexity: ["中", "高"],
        applicationScope: ["学术研究", "政府决策", "企业管理"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量"],
        dataStructure: "高维数据结构",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据", "相关性数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: ["多层次", "复杂"],
        relation: "高度相关",
        methodPreference: "客观",
        knowledgeLevel: ["高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["处理高维数据", "消除多重共线性"]
      },
      environmentDimension: {
        expertiseLevel: "中等",
        timeConstraint: ["适中"],
        computingResource: ["充足", "高级"],
        environmentConstraints: ["需要统计软件支持"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 主成分分析法的数学模型</h4>

<div class="math-step">
<h5>1. 数据标准化</h5>
$$z_{ij} = \\frac{x_{ij} - \\bar{x}_j}{s_j}$$

<p>其中，$x_{ij}$ 为第 $i$ 个样本第 $j$ 个指标的原始值，$\\bar{x}_j$ 为第 $j$ 个指标的均值，$s_j$ 为第 $j$ 个指标的标准差。</p>
</div>

<div class="math-step">
<h5>2. 计算相关系数矩阵</h5>
$$\\mathbf{R} = [r_{jk}]_{m \\times m}$$

<p>其中，$r_{jk}$ 为指标 $j$ 与指标 $k$ 的相关系数。</p>
</div>

<div class="math-step">
<h5>3. 求解特征方程</h5>
$$|\\mathbf{R} - \\lambda \\mathbf{I}| = 0$$

<p>求解特征值 $\\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\geq \\lambda_m \\geq 0$ 及对应的特征向量 $\\mathbf{u}_1, \\mathbf{u}_2, \\ldots, \\mathbf{u}_m$。</p>
</div>

<div class="math-step">
<h5>4. 构造主成分</h5>
$$F_i = u_{i1}z_1 + u_{i2}z_2 + \\cdots + u_{im}z_m, \\quad i=1,2,\\ldots,m$$

<p>其中，$F_i$ 为第 $i$ 个主成分，$u_{ij}$ 为第 $i$ 个特征向量的第 $j$ 个分量。</p>
</div>

<div class="math-step">
<h5>5. 计算贡献率</h5>
$$\\eta_i = \\frac{\\lambda_i}{\\sum_{j=1}^m \\lambda_j}$$

<p>$\\eta_i$ 为第 $i$ 个主成分的贡献率。</p>
</div>

<div class="math-step">
<h5>6. 确定主成分个数</h5>
<p>选择使累积贡献率达到预设阈值（如85%）的前 $p$ 个主成分：</p>
$$\\sum_{i=1}^p \\eta_i \\geq 85\\%$$
</div>

<div class="math-step">
<h5>7. 计算各指标权重</h5>
$$w_j = \\frac{\\sum_{i=1}^p |u_{ij}| \\times \\lambda_i}{\\sum_{i=1}^p \\lambda_i}$$

<p>其中，$w_j$ 为第 $j$ 个指标的权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 主成分分析法计算示例</h4>

<p>假设有5个城市，用4个经济指标进行评价，原始数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵：</strong>
<table class="data-table">
<tr><th>城市</th><th>GDP(亿元)</th><th>财政收入(亿元)</th><th>固定资产投资(亿元)</th><th>社会消费品零售总额(亿元)</th></tr>
<tr><td>A</td><td>1200</td><td>180</td><td>650</td><td>430</td></tr>
<tr><td>B</td><td>850</td><td>120</td><td>480</td><td>320</td></tr>
<tr><td>C</td><td>1500</td><td>230</td><td>820</td><td>560</td></tr>
<tr><td>D</td><td>980</td><td>150</td><td>520</td><td>370</td></tr>
<tr><td>E</td><td>1100</td><td>160</td><td>600</td><td>400</td></tr>
</table>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：数据标准化</strong>
<p>计算各指标的均值和标准差：</p>
$$\\bar{x}_1 = 1126, \\quad s_1 = 240.9$$
$$\\bar{x}_2 = 168, \\quad s_2 = 41.5$$
$$\\bar{x}_3 = 614, \\quad s_3 = 131.0$$
$$\\bar{x}_4 = 416, \\quad s_4 = 90.4$$

<p>标准化后的数据矩阵 $\\mathbf{Z}$：</p>
$$\\mathbf{Z} = \\begin{pmatrix}
0.31 & 0.29 & 0.27 & 0.15 \\\\
-1.15 & -1.16 & -1.02 & -1.06 \\\\
1.55 & 1.49 & 1.57 & 1.59 \\\\
-0.60 & -0.43 & -0.72 & -0.51 \\\\
-0.11 & -0.19 & -0.11 & -0.18
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：计算相关系数矩阵</strong>
$$\\mathbf{R} = \\begin{pmatrix}
1.00 & 0.99 & 0.99 & 0.99 \\\\
0.99 & 1.00 & 0.99 & 0.99 \\\\
0.99 & 0.99 & 1.00 & 0.99 \\\\
0.99 & 0.99 & 0.99 & 1.00
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算特征值和特征向量</strong>
<p>特征值：</p>
$$\\lambda_1 = 3.960, \\quad \\lambda_2 = 0.020, \\quad \\lambda_3 = 0.016, \\quad \\lambda_4 = 0.004$$

<p>对应的特征向量：</p>
$$\\mathbf{u}_1 = (0.500, 0.500, 0.500, 0.500)^T$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算贡献率</strong>
$$\\eta_1 = \\frac{\\lambda_1}{\\sum \\lambda_i} = \\frac{3.960}{4} = 0.990 \\quad (99.0\\%)$$
$$\\eta_2 = \\frac{0.020}{4} = 0.005 \\quad (0.5\\%)$$
$$\\eta_3 = \\frac{0.016}{4} = 0.004 \\quad (0.4\\%)$$
$$\\eta_4 = \\frac{0.004}{4} = 0.001 \\quad (0.1\\%)$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤5：确定主成分个数</strong>
<p>由于第一个主成分的贡献率已达99.0%，超过85%阈值，因此只选择第一个主成分。</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤6：计算各指标权重</strong>
<p>使用第一个主成分特征向量的绝对值作为权重：</p>
$$\\sum |u_{1j}| = |0.500| + |0.500| + |0.500| + |0.500| = 2.000$$

$$w_1 = w_2 = w_3 = w_4 = \\frac{0.500}{2.000} = 0.250 \\quad (25.0\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.250, 0.250, 0.250, 0.250)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>在本例中，四个经济指标的权重均为25%。这是因为这些指标高度相关（相关系数接近1），
主成分分析认为它们提供的信息量相近，因此应分配相等权重。<br>
在实际应用中，指标间相关性通常不会如此高，权重分配会更加差异化。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "因子分析法",
    type: "客观赋权法",
    detail: "因子分析法通过分析变量间的相关关系，将众多变量归结为少数几个不可观测的潜在因子，并基于因子载荷确定权重。",
    suitConditions: [
      "指标间存在相关性",
      "样本量充足",
      "存在潜在因素"
    ],
    advantages: [
      "揭示潜在因素结构",
      "减少指标数量",
      "考虑指标相关性",
      "结果客观"
    ],
    limitations: [
      "因子解释有主观性",
      "计算复杂",
      "需要专业知识",
      "模型假设较强"
    ],
    implementationSteps: [
      "1. 数据标准化",
      "2. 计算相关系数矩阵",
      "3. 提取因子",
      "4. 因子旋转",
      "5. 计算因子得分",
      "6. 确定权重"
    ],
    suitableScenarios: [
      "指标系统复杂的评价",
      "存在潜在结构的数据分析",
      "心理测量、市场研究、社会调查"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["心理测量", "市场研究", "社会调查", "多维度评估"],
        purpose: ["揭示潜在结构", "降维分析", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "解释性", "分析性"],
        complexity: ["中", "高"],
        applicationScope: ["学术研究", "企业决策", "社会科学"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量", "定序"],
        dataStructure: "潜在结构",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据", "相关性数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: ["多层次", "潜在结构"],
        relation: "高度相关",
        methodPreference: "客观",
        knowledgeLevel: ["高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["揭示潜在结构", "解释复杂关系"]
      },
      environmentDimension: {
        expertiseLevel: "高",
        timeConstraint: ["适中", "长期"],
        computingResource: ["充足", "高级"],
        environmentConstraints: ["需要专业统计软件", "需要专业知识解释"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 因子分析法的数学模型</h4>

<div class="math-step">
<h5>1. 标准化原始数据</h5>
$$\\mathbf{Z} = \\frac{\\mathbf{X} - \\boldsymbol{\\mu}}{\\boldsymbol{\\sigma}}$$

<p>其中，$\\mathbf{X}$ 为原始数据矩阵，$\\boldsymbol{\\mu}$ 为均值向量，$\\boldsymbol{\\sigma}$ 为标准差向量。</p>
</div>

<div class="math-step">
<h5>2. 建立因子模型</h5>
$$\\mathbf{Z} = \\mathbf{A}\\mathbf{F} + \\boldsymbol{\\varepsilon}$$

<p>其中，$\\mathbf{Z}$ 是标准化后的观测变量向量，$\\mathbf{A}$ 是因子载荷矩阵，$\\mathbf{F}$ 是共同因子向量，$\\boldsymbol{\\varepsilon}$ 是特殊因子向量。</p>
</div>

<div class="math-step">
<h5>3. 计算相关系数矩阵</h5>
$$\\mathbf{R} = \\frac{1}{n} \\mathbf{Z}^T \\mathbf{Z}$$

<p>其中，$n$ 为样本数量，$\\mathbf{Z}^T$ 为 $\\mathbf{Z}$ 的转置矩阵。</p>
</div>

<div class="math-step">
<h5>4. 求解特征方程</h5>
$$|\\mathbf{R} - \\lambda \\mathbf{I}| = 0$$

<p>计算特征值 $\\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\geq \\lambda_p$ 和对应的特征向量。</p>
</div>

<div class="math-step">
<h5>5. 确定因子数量</h5>
<p>基于以下准则之一选择 $m$ 个因子：</p>
<ul>
<li>特征值大于1的因子</li>
<li>累积贡献率达到指定阈值（如85%）的因子</li>
<li>碎石图观察</li>
</ul>
</div>

<div class="math-step">
<h5>6. 计算因子载荷矩阵</h5>
$$\\mathbf{A} = [\\mathbf{a}_1, \\mathbf{a}_2, \\ldots, \\mathbf{a}_m]$$

<p>其中，$\\mathbf{a}_i = \\sqrt{\\lambda_i} \\cdot \\mathbf{v}_i$，$\\mathbf{v}_i$ 为对应特征值 $\\lambda_i$ 的单位特征向量。</p>
</div>

<div class="math-step">
<h5>7. 因子旋转（可选）</h5>
<p>通过旋转获得更易解释的因子结构，常用方法有：</p>
<ul>
<li>正交旋转（如Varimax）</li>
<li>斜交旋转（如Promax）</li>
</ul>
</div>

<div class="math-step">
<h5>8. 计算权重</h5>
$$w_j = \\sum_{i=1}^m \\frac{|a_{ij}| \\cdot \\lambda_i}{\\sum_{k=1}^m \\lambda_k}$$

<p>其中，$a_{ij}$ 为第 $j$ 个变量在第 $i$ 个因子上的载荷，$\\lambda_i$ 为第 $i$ 个因子的特征值，$w_j$ 为第 $j$ 个指标的权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 因子分析法计算示例</h4>

<p>假设有6个评价指标，10个评价对象的标准化数据，计算相关系数矩阵：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>相关系数矩阵 $\\mathbf{R}$：</strong>
$$\\mathbf{R} = \\begin{pmatrix}
1.00 & 0.75 & 0.68 & 0.12 & 0.23 & 0.15 \\\\
0.75 & 1.00 & 0.72 & 0.18 & 0.26 & 0.20 \\\\
0.68 & 0.72 & 1.00 & 0.21 & 0.24 & 0.22 \\\\
0.12 & 0.18 & 0.21 & 1.00 & 0.65 & 0.58 \\\\
0.23 & 0.26 & 0.24 & 0.65 & 1.00 & 0.62 \\\\
0.15 & 0.20 & 0.22 & 0.58 & 0.62 & 1.00
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：求解特征值和特征向量</strong>
<p>特征值：</p>
$$\\lambda_1 = 2.62, \\quad \\lambda_2 = 1.88, \\quad \\lambda_3 = 0.56$$
$$\\lambda_4 = 0.42, \\quad \\lambda_5 = 0.31, \\quad \\lambda_6 = 0.21$$

<p>特征值贡献率：</p>
$$\\eta_1 = \\frac{2.62}{6} = 0.437 \\quad (43.7\\%)$$
$$\\eta_2 = \\frac{1.88}{6} = 0.313 \\quad (31.3\\%)$$
$$\\text{累积贡献率} = 43.7\\% + 31.3\\% = 75.0\\%$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：确定因子数量</strong>
<p>根据特征值>1的标准，选择2个因子，累积方差贡献率为75.0%</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算初始因子载荷矩阵</strong>
$$\\mathbf{A} = \\begin{pmatrix}
 & \\text{因子1} & \\text{因子2} \\\\
\\text{指标1} & 0.84 & 0.19 \\\\
\\text{指标2} & 0.86 & 0.25 \\\\
\\text{指标3} & 0.82 & 0.27 \\\\
\\text{指标4} & 0.26 & 0.78 \\\\
\\text{指标5} & 0.35 & 0.81 \\\\
\\text{指标6} & 0.30 & 0.76
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：Varimax旋转后的因子载荷矩阵</strong>
$$\\mathbf{A}^* = \\begin{pmatrix}
 & \\text{因子1} & \\text{因子2} \\\\
\\text{指标1} & 0.86 & 0.06 \\\\
\\text{指标2} & 0.89 & 0.12 \\\\
\\text{指标3} & 0.85 & 0.15 \\\\
\\text{指标4} & 0.10 & 0.82 \\\\
\\text{指标5} & 0.18 & 0.87 \\\\
\\text{指标6} & 0.14 & 0.81
\\end{pmatrix}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤5：计算各指标权重</strong>
<p>使用权重公式：$w_j = \\sum_{i=1}^m \\frac{|a_{ij}| \\cdot \\lambda_i}{\\sum_{k=1}^m \\lambda_k}$</p>

$$w_1 = \\frac{|0.86| \\times 2.62 + |0.06| \\times 1.88}{2.62+1.88} = 0.57$$
$$w_2 = \\frac{|0.89| \\times 2.62 + |0.12| \\times 1.88}{2.62+1.88} = 0.62$$
$$w_3 = \\frac{|0.85| \\times 2.62 + |0.15| \\times 1.88}{2.62+1.88} = 0.60$$
$$w_4 = \\frac{|0.10| \\times 2.62 + |0.82| \\times 1.88}{2.62+1.88} = 0.34$$
$$w_5 = \\frac{|0.18| \\times 2.62 + |0.87| \\times 1.88}{2.62+1.88} = 0.42$$
$$w_6 = \\frac{|0.14| \\times 2.62 + |0.81| \\times 1.88}{2.62+1.88} = 0.37$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤6：归一化处理</strong>
$$\\sum w_j = 0.57+0.62+0.60+0.34+0.42+0.37 = 2.92$$

<p>最终权重：</p>
$$w_1 = \\frac{0.57}{2.92} = 0.195 \\quad (19.5\\%)$$
$$w_2 = \\frac{0.62}{2.92} = 0.212 \\quad (21.2\\%)$$
$$w_3 = \\frac{0.60}{2.92} = 0.205 \\quad (20.5\\%)$$
$$w_4 = \\frac{0.34}{2.92} = 0.116 \\quad (11.6\\%)$$
$$w_5 = \\frac{0.42}{2.92} = 0.144 \\quad (14.4\\%)$$
$$w_6 = \\frac{0.37}{2.92} = 0.127 \\quad (12.7\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.195, 0.212, 0.205, 0.116, 0.144, 0.127)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>指标1、2、3的权重较高，它们主要被因子1解释；
指标4、5、6的权重较低，它们主要被因子2解释。
这反映了两组指标分别代表不同的潜在维度。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "灰色关联分析法",
    type: "客观赋权法",
    detail: "灰色关联分析法通过计算各指标与参考序列的关联度来确定权重，适用于小样本和不确定系统。",
    suitConditions: [
      "样本量小",
      "数据不完整",
      "系统具有不确定性"
    ],
    advantages: [
      "适用于小样本",
      "对数据分布无严格要求",
      "计算相对简便",
      "结果直观"
    ],
    limitations: [
      "参考序列选择有主观性",
      "关联度受尺度影响",
      "理论深度不足",
      "结果可能不稳定"
    ],
    implementationSteps: [
      "1. 确定参考序列",
      "2. 数据标准化",
      "3. 计算关联系数",
      "4. 计算关联度",
      "5. 确定权重"
    ],
    suitableScenarios: [
      "数据不完整的系统",
      "样本量小的情况",
      "工程评价、环境质量评价"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["工程评价", "环境质量评价", "系统分析", "预测决策"],
        purpose: ["处理不确定性", "小样本分析", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "预测性"],
        complexity: ["中", "高"],
        applicationScope: ["工程应用", "环境监测", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定量", "混合"],
        dataStructure: "序列数据",
        dataQualityRequirement: "低",
        requiredDataTypes: ["时间序列数据", "不完整数据"]
      },
      userDimension: {
        precision: ["低", "中"],
        structure: ["单层", "多层次"],
        relation: "不确定",
        methodPreference: "客观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["高"],
        specialRequirements: ["处理不确定性", "小样本分析"]
      },
      environmentDimension: {
        expertiseLevel: "中等",
        timeConstraint: ["短期", "适中"],
        computingResource: ["有限", "充足"],
        environmentConstraints: ["数据不完整", "信息不充分"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 灰色关联分析法的数学模型</h4>

<div class="math-step">
<h5>1. 确定参考序列和比较序列</h5>
<p>参考序列：</p>
$$X_0 = \\{x_0(1), x_0(2), \\ldots, x_0(n)\\}$$

<p>比较序列：</p>
$$X_i = \\{x_i(1), x_i(2), \\ldots, x_i(n)\\}, \\quad i=1,2,\\ldots,m$$

<p>其中，$n$ 为指标数量，$m$ 为样本数量。</p>
</div>

<div class="math-step">
<h5>2. 数据标准化</h5>
<p>对于效益型指标（值越大越好）：</p>
$$y_i(j) = \\frac{x_i(j) - \\min x_i(j)}{\\max x_i(j) - \\min x_i(j)}$$

<p>对于成本型指标（值越小越好）：</p>
$$y_i(j) = \\frac{\\max x_i(j) - x_i(j)}{\\max x_i(j) - \\min x_i(j)}$$

<p>其中，$y_i(j)$ 为标准化后的值。</p>
</div>

<div class="math-step">
<h5>3. 计算关联系数</h5>
$$\\xi_i(j) = \\frac{\\Delta_{\\min} + \\rho \\Delta_{\\max}}{\\Delta_i(j) + \\rho \\Delta_{\\max}}$$

<p>其中：</p>
$$\\Delta_i(j) = |y_0(j) - y_i(j)|$$
$$\\Delta_{\\min} = \\min_i \\min_j |y_0(j) - y_i(j)|$$
$$\\Delta_{\\max} = \\max_i \\max_j |y_0(j) - y_i(j)|$$

<p>$\\rho$ 为分辨系数，通常取0.5。</p>
</div>

<div class="math-step">
<h5>4. 计算关联度</h5>
$$r_i = \\frac{1}{n} \\sum_{j=1}^n \\xi_i(j)$$

<p>$r_i$ 为第 $i$ 个比较序列与参考序列的关联度。</p>
</div>

<div class="math-step">
<h5>5. 计算权重</h5>
$$w_i = \\frac{r_i}{\\sum_{k=1}^m r_k}$$

<p>$w_i$ 为第 $i$ 个指标的权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 灰色关联分析法计算示例</h4>

<p>假设有3个企业，评价指标包括利润率、市场份额和研发投入，原始数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵：</strong>
<table class="data-table">
<tr><th>企业</th><th>利润率(%)</th><th>市场份额(%)</th><th>研发投入(万元)</th></tr>
<tr><td>A</td><td>12</td><td>25</td><td>800</td></tr>
<tr><td>B</td><td>15</td><td>18</td><td>600</td></tr>
<tr><td>C</td><td>10</td><td>30</td><td>900</td></tr>
</table>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：确定参考序列</strong>
<p>采用最优值作为参考序列，对于三个指标（都为效益型）：</p>
$$\\mathbf{X}_0 = \\{15, 30, 900\\}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：数据标准化</strong>
<p>标准化后的数据矩阵：</p>
$$\\mathbf{Y} = \\begin{pmatrix}
\\text{企业A} & 0.4 & 0.583 & 0.667 \\\\
\\text{企业B} & 1.0 & 0.0 & 0.0 \\\\
\\text{企业C} & 0.0 & 1.0 & 1.0
\\end{pmatrix}$$
<p>参考序列：$\\mathbf{Y}_0 = \\{1.0, 1.0, 1.0\\}$</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算关联系数（$\\rho = 0.5$）</strong>
<p>参数计算：$\\Delta_{\\min} = 0.0$，$\\Delta_{\\max} = 1.0$</p>

<p><strong>企业A：</strong></p>
$$\\Delta_A(1) = |1.0 - 0.4| = 0.6$$
$$\\Delta_A(2) = |1.0 - 0.583| = 0.417$$
$$\\Delta_A(3) = |1.0 - 0.667| = 0.333$$

$$\\xi_A(1) = \\frac{0.0 + 0.5 \\times 1.0}{0.6 + 0.5 \\times 1.0} = 0.455$$
$$\\xi_A(2) = \\frac{0.0 + 0.5 \\times 1.0}{0.417 + 0.5 \\times 1.0} = 0.545$$
$$\\xi_A(3) = \\frac{0.0 + 0.5 \\times 1.0}{0.333 + 0.5 \\times 1.0} = 0.600$$

<p><strong>企业B：</strong>$\\xi_B = \\{1.000, 0.333, 0.333\\}$</p>
<p><strong>企业C：</strong>$\\xi_C = \\{0.333, 1.000, 1.000\\}$</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算关联度</strong>
$$r_A = \\frac{0.455 + 0.545 + 0.600}{3} = 0.533$$
$$r_B = \\frac{1.000 + 0.333 + 0.333}{3} = 0.555$$
$$r_C = \\frac{0.333 + 1.000 + 1.000}{3} = 0.778$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤5：计算权重</strong>
$$\\sum r_i = 0.533 + 0.555 + 0.778 = 1.866$$

$$w_A = \\frac{0.533}{1.866} = 0.286 \\quad (28.6\\%)$$
$$w_B = \\frac{0.555}{1.866} = 0.297 \\quad (29.7\\%)$$
$$w_C = \\frac{0.778}{1.866} = 0.417 \\quad (41.7\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.286, 0.297, 0.417)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>根据灰色关联分析法，三个指标的权重分别为28.6%、29.7%和41.7%。
研发投入指标获得最高权重，说明该指标对评价结果影响最大。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "DEA法",
    type: "客观赋权法",
    detail: "数据包络分析(DEA)通过线性规划为每个决策单元寻找最优权重，适用于多输入多输出系统的效率评价。",
    suitConditions: [
      "多输入多输出系统",
      "需要评价效率",
      "决策单元数量适中"
    ],
    advantages: [
      "无需预先确定权重",
      "为每个评价单元寻找最有利权重",
      "适用于多输入多输出",
      "结果客观"
    ],
    limitations: [
      "对极端值敏感",
      "难以进行横向比较",
      "决策单元数量限制",
      "计算复杂"
    ],
    implementationSteps: [
      "1. 确定输入输出指标",
      "2. 选择DEA模型",
      "3. 构建线性规划模型",
      "4. 求解最优权重",
      "5. 计算效率值"
    ],
    suitableScenarios: [
      "效率评价",
      "多投入多产出系统",
      "公共部门绩效、银行效率评价"
    ],
    mathematicalModel: `
<div class="math-section">
<h4>🔢 DEA法的数学模型</h4>

<div class="math-step">
<h5>1. 基本CCR模型</h5>
<p>假设有 $n$ 个决策单元（DMU），每个DMU有 $m$ 个输入和 $s$ 个输出。</p>
<p>对于第 $j$ 个DMU，其输入向量为：</p>
$$\\mathbf{X}_j = (x_{1j}, x_{2j}, \\ldots, x_{mj})^T$$

<p>输出向量为：</p>
$$\\mathbf{Y}_j = (y_{1j}, y_{2j}, \\ldots, y_{sj})^T$$
</div>

<div class="math-step">
<h5>2. 效率评价模型</h5>
<p>对于第 $k$ 个DMU的效率评价：</p>
$$\\max h_k = \\frac{\\sum_{r=1}^s u_r y_{rk}}{\\sum_{i=1}^m v_i x_{ik}}$$

<p>约束条件：</p>
$$\\text{s.t.} \\quad \\frac{\\sum_{r=1}^s u_r y_{rj}}{\\sum_{i=1}^m v_i x_{ij}} \\leq 1, \\quad j=1,2,\\ldots,n$$
$$u_r \\geq 0, \\quad r=1,2,\\ldots,s$$
$$v_i \\geq 0, \\quad i=1,2,\\ldots,m$$

<p>其中，$u_r$ 和 $v_i$ 分别为输出和输入的权重。</p>
</div>

<div class="math-step">
<h5>3. 线性化转换</h5>
<p>通过Charnes-Cooper变换将分数规划转换为线性规划：</p>
$$\\max h_k = \\sum_{r=1}^s \\mu_r y_{rk}$$

<p>约束条件：</p>
$$\\text{s.t.} \\quad \\sum_{i=1}^m \\omega_i x_{ik} = 1$$
$$\\sum_{r=1}^s \\mu_r y_{rj} - \\sum_{i=1}^m \\omega_i x_{ij} \\leq 0, \\quad j=1,2,\\ldots,n$$
$$\\mu_r \\geq 0, \\quad r=1,2,\\ldots,s$$
$$\\omega_i \\geq 0, \\quad i=1,2,\\ldots,m$$

<p>其中，$\\mu_r = tu_r$，$\\omega_i = tv_i$，$t = 1 / \\sum_{i=1}^m v_i x_{ik}$。</p>
</div>

<div class="math-step">
<h5>4. 权重计算</h5>
<p>解线性规划得到最优解 $\\mu_r^*$ 和 $\\omega_i^*$，可计算第 $k$ 个DMU的各输入输出指标权重：</p>

<p>输出权重：</p>
$$w_r = \\frac{\\mu_r^*}{\\sum_{r=1}^s \\mu_r^*}$$

<p>输入权重：</p>
$$w_i = \\frac{\\omega_i^*}{\\sum_{i=1}^m \\omega_i^*}$$
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 DEA法计算示例</h4>

<p>假设有4个决策单元(DMU)，每个DMU有2个输入$(x_1, x_2)$和2个输出$(y_1, y_2)$，数据如下：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始数据矩阵：</strong>
<table class="data-table">
<tr><th>DMU</th><th>$x_1$</th><th>$x_2$</th><th>$y_1$</th><th>$y_2$</th></tr>
<tr><td>A</td><td>2</td><td>3</td><td>3</td><td>2</td></tr>
<tr><td>B</td><td>3</td><td>2</td><td>4</td><td>1</td></tr>
<tr><td>C</td><td>4</td><td>3</td><td>2</td><td>4</td></tr>
<tr><td>D</td><td>3</td><td>5</td><td>3</td><td>2</td></tr>
</table>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：构建DMU A的线性规划模型</strong>
<p>目标函数：</p>
$$\\max h_A = \\mu_1 y_{1A} + \\mu_2 y_{2A} = 3\\mu_1 + 2\\mu_2$$

<p>约束条件：</p>
$$\\omega_1 x_{1A} + \\omega_2 x_{2A} = 2\\omega_1 + 3\\omega_2 = 1$$

$$\\begin{cases}
3\\mu_1 + 2\\mu_2 - 2\\omega_1 - 3\\omega_2 \\leq 0 \\quad (\\text{DMU A}) \\\\
4\\mu_1 + 1\\mu_2 - 3\\omega_1 - 2\\omega_2 \\leq 0 \\quad (\\text{DMU B}) \\\\
2\\mu_1 + 4\\mu_2 - 4\\omega_1 - 3\\omega_2 \\leq 0 \\quad (\\text{DMU C}) \\\\
3\\mu_1 + 2\\mu_2 - 3\\omega_1 - 5\\omega_2 \\leq 0 \\quad (\\text{DMU D}) \\\\
\\mu_1, \\mu_2, \\omega_1, \\omega_2 \\geq 0
\\end{cases}$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：求解最优解</strong>
<p>线性规划最优解：</p>
$$\\mu_1^* = 0.333, \\quad \\mu_2^* = 0.000$$
$$\\omega_1^* = 0.500, \\quad \\omega_2^* = 0.000$$

<p>DMU A的效率值：</p>
$$h_A = 3 \\times 0.333 + 2 \\times 0.000 = 1.000$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：计算指标权重</strong>
<p>输出权重：</p>
$$w_{y1} = \\frac{0.333}{0.333 + 0.000} = 1.000 \\quad (100\\%)$$
$$w_{y2} = \\frac{0.000}{0.333 + 0.000} = 0.000 \\quad (0\\%)$$

<p>输入权重：</p>
$$w_{x1} = \\frac{0.500}{0.500 + 0.000} = 1.000 \\quad (100\\%)$$
$$w_{x2} = \\frac{0.000}{0.500 + 0.000} = 0.000 \\quad (0\\%)$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：计算综合权重</strong>
<p>假设所有DMU都在效率前沿$(h=1)$，综合权重由各DMU权重的平均值得到：</p>

<p>输出综合权重：</p>
$$\\bar{w}_{y1} = \\frac{1.000 + 0.833 + 0.400 + 0.750}{4} = 0.746 \\quad (74.6\\%)$$
$$\\bar{w}_{y2} = \\frac{0.000 + 0.167 + 0.600 + 0.250}{4} = 0.254 \\quad (25.4\\%)$$

<p>输入综合权重：</p>
$$\\bar{w}_{x1} = \\frac{1.000 + 0.875 + 0.625 + 0.700}{4} = 0.800 \\quad (80.0\\%)$$
$$\\bar{w}_{x2} = \\frac{0.000 + 0.125 + 0.375 + 0.300}{4} = 0.200 \\quad (20.0\\%)$$
</div>

<div class="step-result">
<strong>最终权重向量：</strong>
<br>输出权重：$\\mathbf{w}_y = (0.746, 0.254)^T$
<br>输入权重：$\\mathbf{w}_x = (0.800, 0.200)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>注：</strong>在实际应用中，通常需使用专业软件求解线性规划问题。
DEA方法为每个决策单元找到最有利的权重组合。
</p>
</div>
</div>
</div>
`
  },
  // 组合赋权法
  {
    name: "加法组合赋权法",
    type: "组合赋权法",
    detail: "加法组合赋权法通过线性加权的方式组合主观权重和客观权重，得到综合权重。",
    suitConditions: [
      "同时具有主客观权重",
      "需要平衡多种方法",
      "权重差异不大"
    ],
    advantages: [
      "操作简单",
      "计算方便",
      "综合主客观信息",
      "结果稳定"
    ],
    limitations: [
      "组合系数确定有难度",
      "可能淡化权重差异",
      "理论基础相对薄弱",
      "可能忽略极端情况"
    ],
    implementationSteps: [
      "1. 获取主观权重",
      "2. 获取客观权重",
      "3. 确定组合系数",
      "4. 线性加权组合",
      "5. 归一化处理"
    ],
    suitableScenarios: [
      "需平衡主客观因素的评价",
      "一般性综合评价问题",
      "社会经济评价、可持续发展评价"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["社会经济评价", "可持续发展评价", "综合决策", "多准则评价"],
        purpose: ["平衡多种因素", "综合主客观信息", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "综合性"],
        complexity: ["中"],
        applicationScope: ["政府决策", "企业管理", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量", "混合"],
        dataStructure: "多源数据",
        dataQualityRequirement: "中",
        requiredDataTypes: ["主观评价数据", "客观指标数据"]
      },
      userDimension: {
        precision: ["中"],
        structure: ["多层次"],
        relation: "混合",
        methodPreference: "平衡",
        knowledgeLevel: ["中级"],
        riskTolerance: ["中"],
        specialRequirements: ["平衡主客观因素", "稳定性"]
      },
      environmentDimension: {
        expertiseLevel: "中等",
        timeConstraint: ["适中"],
        computingResource: ["充足"],
        environmentConstraints: ["需要多种数据源"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 加法组合赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 基本模型</h5>
<p>假设有 $m$ 个指标，得到 $k$ 种不同权重确定方法的权重向量：</p>
$$\\mathbf{W}_1 = (w_{11}, w_{12}, \\ldots, w_{1m})$$
$$\\mathbf{W}_2 = (w_{21}, w_{22}, \\ldots, w_{2m})$$
$$\\vdots$$
$$\\mathbf{W}_k = (w_{k1}, w_{k2}, \\ldots, w_{km})$$

<p>则加法组合权重 $\\mathbf{W} = (w_1, w_2, \\ldots, w_m)$ 可表示为：</p>
$$\\mathbf{W} = \\alpha_1 \\mathbf{W}_1 + \\alpha_2 \\mathbf{W}_2 + \\cdots + \\alpha_k \\mathbf{W}_k$$

<p>其中，$\\alpha_i$ 为第 $i$ 种权重方法的组合系数，且满足：</p>
$$\\sum_{i=1}^k \\alpha_i = 1, \\quad \\alpha_i \\geq 0$$
</div>

<div class="math-step">
<h5>2. 主客观权重组合</h5>
<p>最常见的是主观权重 $\\mathbf{W}_s$ 与客观权重 $\\mathbf{W}_o$ 的组合：</p>
$$\\mathbf{W} = \\alpha \\mathbf{W}_s + (1-\\alpha) \\mathbf{W}_o$$

<p>其中，$\\alpha \\in [0,1]$ 为主观权重的组合系数，$(1-\\alpha)$ 为客观权重的组合系数。</p>
</div>

<div class="math-step">
<h5>3. 组合系数的确定方法</h5>

<p><strong>(1) 专家确定法</strong></p>
<p>由专家直接给定组合系数 $\\alpha_1, \\alpha_2, \\ldots, \\alpha_k$。</p>

<p><strong>(2) 最小离差平方和法</strong></p>
<p>使得组合权重与各单一权重的离差平方和最小：</p>
$$\\min F(\\boldsymbol{\\alpha}) = \\sum_{i=1}^k \\sum_{j=1}^m [w_j - w_{ij}]^2$$

<p>约束条件：</p>
$$\\text{s.t.} \\quad \\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad i=1,2,\\ldots,k$$

<p><strong>(3) 信息熵法</strong></p>
<p>根据各权重方法的信息熵确定组合系数：</p>
$$\\alpha_i = \\frac{1 - H_i}{\\sum_{j=1}^k (1 - H_j)}$$

<p>其中，$H_i$ 为第 $i$ 种权重方法的信息熵。</p>
</div>
</div>
`,
    calculationExample: `
      <div class="example-section">
        <h4>加法组合赋权法计算示例</h4>
        
        <div class="example-step">
          <p>假设对5个指标分别采用了主观赋权法(AHP)和客观赋权法(熵权法)得到两组权重：</p>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>指标</th>
                <th>AHP权重($W_s$)</th>
                <th>熵权法权重($W_o$)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>$X_1$</td><td>0.35</td><td>0.15</td></tr>
              <tr><td>$X_2$</td><td>0.25</td><td>0.30</td></tr>
              <tr><td>$X_3$</td><td>0.20</td><td>0.25</td></tr>
              <tr><td>$X_4$</td><td>0.15</td><td>0.20</td></tr>
              <tr><td>$X_5$</td><td>0.05</td><td>0.10</td></tr>
            </tbody>
          </table>
        </div>
        
        <div class="example-step">
          <h5>步骤1: 确定组合系数</h5>
          <p>采用最小离差平方和法，构建优化模型：</p>
          
          $$\\min F(\\alpha) = \\sum_{j=1}^{n}[\\alpha \\cdot w_{sj} + (1-\\alpha) \\cdot w_{oj} - w_{sj}]^2 + \\sum_{j=1}^{n}[\\alpha \\cdot w_{sj} + (1-\\alpha) \\cdot w_{oj} - w_{oj}]^2$$
          
          <p>化简得：</p>
          $$F(\\alpha) = (1-\\alpha)^2 \\cdot \\sum_{j=1}^{n}(w_{sj} - w_{oj})^2 + \\alpha^2 \\cdot \\sum_{j=1}^{n}(w_{sj} - w_{oj})^2$$
          
          $$= (\\alpha^2 + (1-\\alpha)^2) \\cdot \\sum_{j=1}^{n}(w_{sj} - w_{oj})^2$$
          
          <p>求导并令导数为0：</p>
          $$F'(\\alpha) = (2\\alpha - 2(1-\\alpha)) \\cdot \\sum_{j=1}^{n}(w_{sj} - w_{oj})^2 = 0$$
          
          <p>解得：</p>
          $$\\alpha = 0.5$$
        </div>
        
        <div class="example-step">
          <h5>步骤2: 计算组合权重</h5>
          
          $$\\mathbf{W} = 0.5 \\cdot \\mathbf{W}_s + 0.5 \\cdot \\mathbf{W}_o$$
          
          <div class="calculation-details">
            <p>$w_1 = 0.5 \\times 0.35 + 0.5 \\times 0.15 = 0.25$</p>
            <p>$w_2 = 0.5 \\times 0.25 + 0.5 \\times 0.30 = 0.275$</p>
            <p>$w_3 = 0.5 \\times 0.20 + 0.5 \\times 0.25 = 0.225$</p>
            <p>$w_4 = 0.5 \\times 0.15 + 0.5 \\times 0.20 = 0.175$</p>
            <p>$w_5 = 0.5 \\times 0.05 + 0.5 \\times 0.10 = 0.075$</p>
          </div>
          
          <p><strong>检验：</strong></p>
          $$w_1 + w_2 + w_3 + w_4 + w_5 = 0.25 + 0.275 + 0.225 + 0.175 + 0.075 = 1.000$$
        </div>
        
        <div class="example-step">
          <h5>步骤3: 结果分析</h5>
          <p>组合后的权重既考虑了专家主观判断的AHP权重，又结合了数据特征反映的熵权法权重，实现了主客观信息的综合平衡。</p>
          
          <div class="note-box">
            <p><strong>注：</strong>在实际应用中，组合系数$\\alpha$的取值可能不是0.5，而是根据特定问题的需求和数据特征确定。例如，当主观专家判断更重要时，可能会令$\\alpha > 0.5$；当客观数据分析更重要时，可能会令$\\alpha < 0.5$。</p>
          </div>
        </div>
      </div>
`
  },
  {
    name: "乘法组合赋权法",
    type: "组合赋权法",
    detail: "乘法组合赋权法通过乘法方式组合不同方法得到的权重，能更好地突出重要指标。",
    suitConditions: [
      "需要突出重要指标",
      "权重差异明显",
      "各方法结果可靠"
    ],
    advantages: [
      "能放大权重差异",
      "突出重要指标",
      "综合效果较好",
      "结果更具区分度"
    ],
    limitations: [
      "可能过度强化权重差异",
      "当权重为0时计算困难",
      "组合比例确定困难",
      "对异常值敏感"
    ],
    implementationSteps: [
      "1. 获取各方法权重",
      "2. 确定组合系数",
      "3. 乘法组合",
      "4. 归一化处理"
    ],
    suitableScenarios: [
      "需要突出关键因素的评价",
      "指标重要性差异明显的情况",
      "风险评估、重大决策分析"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["风险评估", "重大决策分析", "关键指标评价", "优先级排序"],
        purpose: ["突出关键因素", "强化权重差异", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "区分性"],
        complexity: ["中", "高"],
        applicationScope: ["企业战略决策", "项目筛选", "资源分配"]
      },
      dataDimension: {
        indicatorCount: ["中"],
        variableType: ["定量", "混合"],
        dataStructure: "多源数据",
        dataQualityRequirement: "高",
        requiredDataTypes: ["主观评价数据", "客观指标数据"]
      },
      userDimension: {
        precision: ["高"],
        structure: "多层次",
        relation: "差异明显",
        methodPreference: "综合",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["突出关键指标", "强化差异"]
      },
      environmentDimension: {
        expertiseLevel: "中等",
        timeConstraint: ["适中"],
        computingResource: ["充足"],
        environmentConstraints: ["需要多种数据源", "需要高质量数据"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 乘法组合赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 基本模型</h5>
<p>假设有 $m$ 个指标，得到 $k$ 种不同权重确定方法的权重向量：</p>
$$\\mathbf{W}_1 = (w_{11}, w_{12}, \\ldots, w_{1m})$$
$$\\mathbf{W}_2 = (w_{21}, w_{22}, \\ldots, w_{2m})$$
$$\\vdots$$
$$\\mathbf{W}_k = (w_{k1}, w_{k2}, \\ldots, w_{km})$$

<p>则乘法组合的未归一化权重 $\\mathbf{u} = (u_1, u_2, \\ldots, u_m)$ 可表示为：</p>
$$u_j = (w_{1j})^{\\alpha_1} \\times (w_{2j})^{\\alpha_2} \\times \\cdots \\times (w_{kj})^{\\alpha_k}$$

<p>其中，$\\alpha_i$ 为第 $i$ 种权重方法的组合系数，且满足：</p>
$$\\sum_{i=1}^k \\alpha_i = 1, \\quad \\alpha_i \\geq 0$$
</div>

<div class="math-step">
<h5>2. 归一化处理</h5>
$$w_j = \\frac{u_j}{\\sum_{j=1}^m u_j}, \\quad j=1,2,\\ldots,m$$

<p>其中，$w_j$ 为归一化后的第 $j$ 个指标的组合权重。</p>
</div>

<div class="math-step">
<h5>3. 主客观权重组合</h5>
<p>最常见的是主观权重 $\\mathbf{W}_s$ 与客观权重 $\\mathbf{W}_o$ 的组合：</p>
$$u_j = (w_{sj})^\\alpha \\times (w_{oj})^{1-\\alpha}$$

<p>其中，$\\alpha \\in [0,1]$ 为主观权重的组合系数，$(1-\\alpha)$ 为客观权重的组合系数。</p>
</div>

<div class="math-step">
<h5>4. 权重为0的处理方法</h5>
<p>当某种方法得到的某指标权重为0时，有两种常用处理方法：</p>

<p><strong>(1) 添加小常数：</strong></p>
$$w'_{ij} = w_{ij} + \\varepsilon$$
<p>其中 $\\varepsilon$ 为一个很小的正数。</p>

<p><strong>(2) 对数转换：</strong></p>
$$u_j = \\exp\\left(\\sum_{i=1}^k \\alpha_i \\ln(w_{ij} + \\varepsilon)\\right)$$
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>💡 乘法组合赋权法计算示例</h4>

<p>假设对5个指标分别采用了层次分析法(AHP)和熵权法得到两组权重：</p>

<div class="step-by-step-container">
<div class="calculation-step-enhanced">
<strong>原始权重数据：</strong>
<table class="data-table">
<tr><th>指标</th><th>AHP权重($W_s$)</th><th>熵权法权重($W_o$)</th></tr>
<tr><td>$X_1$</td><td>0.35</td><td>0.15</td></tr>
<tr><td>$X_2$</td><td>0.25</td><td>0.30</td></tr>
<tr><td>$X_3$</td><td>0.20</td><td>0.25</td></tr>
<tr><td>$X_4$</td><td>0.15</td><td>0.20</td></tr>
<tr><td>$X_5$</td><td>0.05</td><td>0.10</td></tr>
</table>
</div>

<div class="calculation-step-enhanced">
<strong>步骤1：确定组合系数</strong>
<p>假设AHP权重和熵权法权重同等重要，则：$\\alpha = 0.5$</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤2：计算乘法组合的未归一化权重</strong>
<p>使用公式：$u_j = (w_{sj})^\\alpha \\times (w_{oj})^{1-\\alpha}$</p>

$$u_1 = (0.35)^{0.5} \\times (0.15)^{0.5} = \\sqrt{0.35 \\times 0.15} = 0.229$$
$$u_2 = (0.25)^{0.5} \\times (0.30)^{0.5} = \\sqrt{0.25 \\times 0.30} = 0.274$$
$$u_3 = (0.20)^{0.5} \\times (0.25)^{0.5} = \\sqrt{0.20 \\times 0.25} = 0.224$$
$$u_4 = (0.15)^{0.5} \\times (0.20)^{0.5} = \\sqrt{0.15 \\times 0.20} = 0.173$$
$$u_5 = (0.05)^{0.5} \\times (0.10)^{0.5} = \\sqrt{0.05 \\times 0.10} = 0.071$$
</div>

<div class="calculation-step-enhanced">
<strong>步骤3：归一化处理</strong>
$$\\sum u_j = 0.229 + 0.274 + 0.224 + 0.173 + 0.071 = 0.971$$

<p>最终权重计算：</p>
$$w_1 = \\frac{0.229}{0.971} = 0.236 \\quad (23.6\\%)$$
$$w_2 = \\frac{0.274}{0.971} = 0.282 \\quad (28.2\\%)$$
$$w_3 = \\frac{0.224}{0.971} = 0.231 \\quad (23.1\\%)$$
$$w_4 = \\frac{0.173}{0.971} = 0.178 \\quad (17.8\\%)$$
$$w_5 = \\frac{0.071}{0.971} = 0.073 \\quad (7.3\\%)$$

<p>检验：$\\sum w_j = 0.236 + 0.282 + 0.231 + 0.178 + 0.073 = 1.000$ ✓</p>
</div>

<div class="calculation-step-enhanced">
<strong>步骤4：对比分析</strong>
<p>比较乘法组合权重与加法组合权重（假设加法组合系数也为0.5）：</p>
<table class="data-table">
<tr><th>指标</th><th>AHP权重</th><th>熵权法权重</th><th>加法组合权重</th><th>乘法组合权重</th></tr>
<tr><td>$X_1$</td><td>0.35</td><td>0.15</td><td>0.250</td><td>0.236</td></tr>
<tr><td>$X_2$</td><td>0.25</td><td>0.30</td><td>0.275</td><td>0.282</td></tr>
<tr><td>$X_3$</td><td>0.20</td><td>0.25</td><td>0.225</td><td>0.231</td></tr>
<tr><td>$X_4$</td><td>0.15</td><td>0.20</td><td>0.175</td><td>0.178</td></tr>
<tr><td>$X_5$</td><td>0.05</td><td>0.10</td><td>0.075</td><td>0.073</td></tr>
</table>
</div>

<div class="step-result">
<strong>最终权重向量：</strong>$\\mathbf{w} = (0.236, 0.282, 0.231, 0.178, 0.073)^T$

<p style="margin-top: 10px; font-style: italic;">
<strong>结论：</strong>乘法组合权重相比加法组合权重略微放大了$X_2$和$X_3$的权重差异，
对于同时被两种方法认为重要的指标（如$X_2$），乘法组合更能突出其重要性；
而对于某一方法认为重要但另一方法认为不重要的指标（如$X_1$），
乘法组合会相对降低其权重。
</p>
</div>
</div>
</div>
`
  },
  {
    name: "最优组合赋权法",
    type: "组合赋权法",
    detail: "最优组合赋权法通过数学优化方法确定最优组合系数，使组合权重与各单一方法权重的偏差最小。",
    suitConditions: [
      "有多个权重结果",
      "需要最优组合",
      "数据质量好"
    ],
    advantages: [
      "基于数学优化",
      "结果更具客观性",
      "降低单一方法局限性",
      "理论基础扎实"
    ],
    limitations: [
      "计算复杂",
      "优化目标设定困难",
      "对数据质量要求高",
      "可能陷入局部最优"
    ],
    implementationSteps: [
      "1. 获取各方法权重",
      "2. 构建优化目标函数",
      "3. 设定约束条件",
      "4. 求解最优组合系数",
      "5. 计算组合权重"
    ],
    suitableScenarios: [
      "高精度要求的评价问题",
      "数据较为充分的情况",
      "金融投资、资源配置优化"
    ],
    mathematicalModel: `
<div class="math-section">
<h4>🔢 最优组合赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 基本模型</h5>
<p>假设有 $m$ 个指标，得到 $k$ 种不同权重确定方法的权重向量：</p>
$$W_1 = (w_{11}, w_{12}, \\ldots, w_{1m})$$
$$W_2 = (w_{21}, w_{22}, \\ldots, w_{2m})$$
$$\\vdots$$
$$W_k = (w_{k1}, w_{k2}, \\ldots, w_{km})$$

<p>则组合权重 $W = (w_1, w_2, \\ldots, w_m)$ 可表示为：</p>
$$W = \\alpha_1 W_1 + \\alpha_2 W_2 + \\cdots + \\alpha_k W_k$$

<p>其中，$\\alpha_i$ 为第 $i$ 种权重方法的组合系数，且满足：</p>
<p class="math-constraint">约束条件：$\\sum_{i=1}^k \\alpha_i = 1$，$\\alpha_i \\geq 0$</p>
</div>

<div class="math-step">
<h5>2. 最小偏差平方和模型</h5>
<p>希望组合权重 $W$ 与各单一权重 $W_i$ 的偏差平方和最小：</p>
$$\\min F(\\alpha) = \\sum_{i=1}^k \\sum_{j=1}^m (w_j - w_{ij})^2$$

<p class="math-constraint">约束条件：</p>
$$\\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad i=1,2,\\ldots,k$$

<p>其中，$w_j = \\sum_{i=1}^k \\alpha_i w_{ij}$</p>
</div>

<div class="math-step">
<h5>3. 最小相对熵模型</h5>
<p>基于信息论的相对熵最小化：</p>
$$\\min G(\\alpha) = \\sum_{i=1}^k \\sum_{j=1}^m w_{ij} \\ln\\left(\\frac{w_{ij}}{w_j}\\right)$$

<p class="math-constraint">约束条件：</p>
$$\\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad i=1,2,\\ldots,k$$

<p>其中，$w_j = \\sum_{i=1}^k \\alpha_i w_{ij}$</p>
</div>

<div class="math-step">
<h5>4. 最小最大偏差模型</h5>
<p>使得组合权重与各单一权重的最大偏差最小：</p>
$$\\min H(\\alpha) = \\max_{i,j} |w_j - w_{ij}|$$

<p class="math-constraint">约束条件：</p>
$$\\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad i=1,2,\\ldots,k$$

<p>其中，$w_j = \\sum_{i=1}^k \\alpha_i w_{ij}$</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 最优组合赋权法计算示例</h4>

<p>假设对5个指标采用了3种不同方法得到的权重如下：</p>

<table class="data-table">
<tr><th>指标</th><th>AHP($W_1$)</th><th>熵权法($W_2$)</th><th>变异系数法($W_3$)</th></tr>
<tr><td>$X_1$</td><td>0.35</td><td>0.15</td><td>0.25</td></tr>
<tr><td>$X_2$</td><td>0.25</td><td>0.30</td><td>0.20</td></tr>
<tr><td>$X_3$</td><td>0.20</td><td>0.25</td><td>0.30</td></tr>
<tr><td>$X_4$</td><td>0.15</td><td>0.20</td><td>0.15</td></tr>
<tr><td>$X_5$</td><td>0.05</td><td>0.10</td><td>0.10</td></tr>
</table>

<div class="calculation-step">
<h5>步骤1: 构建最小偏差平方和模型</h5>
<p>组合权重：$w_j = \\alpha_1 w_{1j} + \\alpha_2 w_{2j} + \\alpha_3 w_{3j}$</p>

<p>目标函数：</p>
$$\\min F(\\alpha) = \\sum_{i=1}^3 \\sum_{j=1}^5 (\\alpha_1 w_{1j} + \\alpha_2 w_{2j} + \\alpha_3 w_{3j} - w_{ij})^2$$

<p>约束条件：</p>
$$\\alpha_1 + \\alpha_2 + \\alpha_3 = 1$$
$$\\alpha_1, \\alpha_2, \\alpha_3 \\geq 0$$
</div>

<div class="calculation-step">
<h5>步骤2: 求解优化问题</h5>
<p>展开目标函数并利用拉格朗日乘数法求解得：</p>
$$\\alpha_1 = 0.333, \\quad \\alpha_2 = 0.333, \\quad \\alpha_3 = 0.333$$
<p>这表明三种方法在最小偏差平方和准则下应赋予相同权重。</p>
<p><em>注：实际问题中，最优解可能不是均匀分布的</em></p>
</div>

<div class="calculation-step">
<h5>步骤3: 计算组合权重</h5>
$$w_1 = 0.333 \\times 0.35 + 0.333 \\times 0.15 + 0.333 \\times 0.25 = 0.250$$
$$w_2 = 0.333 \\times 0.25 + 0.333 \\times 0.30 + 0.333 \\times 0.20 = 0.250$$
$$w_3 = 0.333 \\times 0.20 + 0.333 \\times 0.25 + 0.333 \\times 0.30 = 0.250$$
$$w_4 = 0.333 \\times 0.15 + 0.333 \\times 0.20 + 0.333 \\times 0.15 = 0.167$$
$$w_5 = 0.333 \\times 0.05 + 0.333 \\times 0.10 + 0.333 \\times 0.10 = 0.083$$
</div>

<div class="calculation-step">
<h5>步骤4: 计算组合权重与各方法权重的偏差</h5>
<p>对于 $W_1$：</p>
$$|w_1-w_{11}| = |0.250-0.35| = 0.100$$
$$|w_2-w_{12}| = |0.250-0.25| = 0.000$$
$$|w_3-w_{13}| = |0.250-0.20| = 0.050$$
$$|w_4-w_{14}| = |0.167-0.15| = 0.017$$
$$|w_5-w_{15}| = |0.083-0.05| = 0.033$$

<p>对于 $W_2$ 和 $W_3$ 的偏差计算类似...</p>
<p>最大偏差为0.100，总偏差平方和为0.041</p>
</div>

<div class="calculation-step">
<h5>步骤5: 比较不同组合方法的结果</h5>
<table class="result-table">
<tr><th>指标</th><th>AHP</th><th>熵权法</th><th>变异系数法</th><th>最优组合权重</th></tr>
<tr><td>$X_1$</td><td>0.35</td><td>0.15</td><td>0.25</td><td>0.250</td></tr>
<tr><td>$X_2$</td><td>0.25</td><td>0.30</td><td>0.20</td><td>0.250</td></tr>
<tr><td>$X_3$</td><td>0.20</td><td>0.25</td><td>0.30</td><td>0.250</td></tr>
<tr><td>$X_4$</td><td>0.15</td><td>0.20</td><td>0.15</td><td>0.167</td></tr>
<tr><td>$X_5$</td><td>0.05</td><td>0.10</td><td>0.10</td><td>0.083</td></tr>
</table>

<p>可以看出，最优组合权重是三种方法权重的折中结果，在整体上最大程度减小了与各单一方法权重的偏差。</p>
</div>
</div>
`
  },
  {
    name: "博弈论组合赋权法",
    type: "组合赋权法",
    detail: "博弈论组合赋权法将不同赋权方法视为博弈参与者，通过博弈论方法确定最优组合权重。",
    suitConditions: [
      "存在多方利益博弈",
      "需要平衡多种方法",
      "系统复杂"
    ],
    advantages: [
      "平衡主观偏好和客观数据",
      "理论基础扎实",
      "结果更具合理性",
      "考虑多方利益"
    ],
    limitations: [
      "理论假设较强",
      "计算相对复杂",
      "需要专业知识支持",
      "结果可能不稳定"
    ],
    implementationSteps: [
      "1. 确定博弈参与者",
      "2. 构建收益矩阵",
      "3. 求解纳什均衡",
      "4. 确定组合权重"
    ],
    suitableScenarios: [
      "存在多方利益博弈的决策",
      "复杂系统评价",
      "公共政策评估、资源分配决策"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["公共政策评估", "资源分配", "复杂系统评价", "多方博弈决策"],
        purpose: ["平衡多方利益", "寻求最优均衡", "评估单一对象的综合表现"],
        evaluationNature: ["博弈性", "均衡性", "综合性"],
        complexity: ["高"],
        applicationScope: ["政府决策", "公共管理", "复杂系统"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量", "混合"],
        dataStructure: "多源数据",
        dataQualityRequirement: "高",
        requiredDataTypes: ["多方评价数据", "博弈信息"]
      },
      userDimension: {
        precision: ["高"],
        structure: ["多层次", "网络结构"],
        relation: "博弈",
        methodPreference: "均衡",
        knowledgeLevel: ["高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["利益平衡", "博弈均衡"]
      },
      environmentDimension: {
        expertiseLevel: "高",
        timeConstraint: ["适中", "长期"],
        computingResource: ["充足", "高级"],
        environmentConstraints: ["需要专业知识", "多方参与"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 博弈论组合赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 基本思想</h5>
<p>将不同的权重确定方法视为博弈中的"参与者"，每种方法根据自身原则确定的权重视为其"策略"，通过求解博弈均衡得到最优组合权重。</p>
</div>

<div class="math-step">
<h5>2. 合作博弈模型</h5>
<p>假设有 $m$ 个指标，$k$ 种不同权重确定方法的权重矩阵：</p>

$$\\mathbf{W} = \\begin{pmatrix}
w_{11} & w_{12} & \\cdots & w_{1m} \\\\
w_{21} & w_{22} & \\cdots & w_{2m} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
w_{k1} & w_{k2} & \\cdots & w_{km}
\\end{pmatrix}$$

<p>其中，$w_{ij}$ 表示第 $i$ 种方法对第 $j$ 个指标的权重值。</p>

<p><strong>(1) 特征函数定义：</strong></p>
<p>对于任意联盟 $S \\subseteq \\{1,2,\\ldots,k\\}$，定义特征函数 $v(S)$ 为：</p>
$$v(S) = \\sum_{i \\in S} \\sum_{j=1}^m w_{ij} \\times \\ln(w_{ij})$$

<p><strong>(2) Shapley值计算：</strong></p>
<p>第 $i$ 个参与者（权重方法）的Shapley值为：</p>
$$\\phi_i = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(k-|S|-1)!}{k!} [v(S \\cup \\{i\\}) - v(S)]$$

<p><strong>(3) 组合系数确定：</strong></p>
<p>将归一化的Shapley值作为组合系数：</p>
$$\\alpha_i = \\frac{\\phi_i}{\\sum_{j=1}^k \\phi_j}, \\quad i=1,2,\\ldots,k$$
</div>

<div class="math-step">
<h5>3. 非合作博弈模型（Nash均衡）</h5>

<p><strong>(1) 构建收益矩阵：</strong></p>
$$A_{ij} = \\sum_{l=1}^m w_{il} \\times w_{jl}, \\quad i,j=1,2,\\ldots,k$$

<p><strong>(2) 不动点方程：</strong></p>
<p>令 $\\boldsymbol{\\alpha} = (\\alpha_1, \\alpha_2, \\ldots, \\alpha_k)$ 为各方法的组合系数向量，则Nash均衡满足：</p>
$$\\alpha_i = \\frac{\\alpha_i \\times \\sum_{j=1}^k \\alpha_j A_{ij}}{\\sum_{j=1}^k \\alpha_j \\sum_{l=1}^k \\alpha_l A_{jl}}, \\quad i=1,2,\\ldots,k$$

<p><strong>(3) 迭代求解：</strong></p>
<p>通过迭代法求解不动点方程，得到Nash均衡解 $\\boldsymbol{\\alpha}^*$。</p>
</div>

<div class="math-step">
<h5>4. 组合权重计算</h5>
<p>最终组合权重：</p>
$$w_j = \\sum_{i=1}^k \\alpha_i \\times w_{ij}, \\quad j=1,2,\\ldots,m$$
<p>其中，$w_j$ 为第 $j$ 个指标的组合权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 博弈论组合赋权法计算示例</h4>

<p>假设有4个指标，采用3种不同方法得到的权重矩阵：</p>

$$\\mathbf{W} = \\begin{pmatrix}
0.40 & 0.30 & 0.20 & 0.10 \\\\
0.25 & 0.35 & 0.25 & 0.15 \\\\
0.20 & 0.25 & 0.40 & 0.15
\\end{pmatrix} \\begin{pmatrix}
\\text{AHP权重} \\\\
\\text{熵权法权重} \\\\
\\text{变异系数法权重}
\\end{pmatrix}$$

<div class="calculation-step">
<h5>步骤1: 构建收益矩阵A</h5>
$$A_{11} = 0.40 \\times 0.40 + 0.30 \\times 0.30 + 0.20 \\times 0.20 + 0.10 \\times 0.10 = 0.300$$
$$A_{12} = 0.40 \\times 0.25 + 0.30 \\times 0.35 + 0.20 \\times 0.25 + 0.10 \\times 0.15 = 0.295$$
$$A_{13} = 0.40 \\times 0.20 + 0.30 \\times 0.25 + 0.20 \\times 0.40 + 0.10 \\times 0.15 = 0.255$$

<p>同样计算其他元素，得到收益矩阵：</p>
$$\\mathbf{A} = \\begin{pmatrix}
0.300 & 0.295 & 0.255 \\\\
0.295 & 0.273 & 0.255 \\\\
0.255 & 0.255 & 0.275
\\end{pmatrix}$$
</div>

<div class="calculation-step">
<h5>步骤2: 求解Nash均衡</h5>
<p>使用迭代法求解，初始值：$\\boldsymbol{\\alpha}^0 = (1/3, 1/3, 1/3)$</p>

<p><strong>第1次迭代：</strong></p>
<p>分子计算：</p>
$$\\alpha_1^1(\\text{分子}) = \\frac{1}{3} \\times (0.300 \\times \\frac{1}{3} + 0.295 \\times \\frac{1}{3} + 0.255 \\times \\frac{1}{3}) = 0.094$$

<p>归一化后：</p>
$$\\boldsymbol{\\alpha}^1 = (0.345, 0.334, 0.320)$$

<p>继续迭代直至收敛，得到均衡解：</p>
$$\\boldsymbol{\\alpha}^* = (0.350, 0.335, 0.315)$$
</div>

<div class="calculation-step">
<h5>步骤3: 计算组合权重</h5>
$$w_1 = 0.350 \\times 0.40 + 0.335 \\times 0.25 + 0.315 \\times 0.20 = 0.290$$
$$w_2 = 0.350 \\times 0.30 + 0.335 \\times 0.35 + 0.315 \\times 0.25 = 0.302$$
$$w_3 = 0.350 \\times 0.20 + 0.335 \\times 0.25 + 0.315 \\times 0.40 = 0.278$$
$$w_4 = 0.350 \\times 0.10 + 0.335 \\times 0.15 + 0.315 \\times 0.15 = 0.131$$
</div>

<div class="calculation-step">
<h5>步骤4: 验证</h5>
$$\\sum_{j=1}^4 w_j = 0.290 + 0.302 + 0.278 + 0.131 = 1.001 \\approx 1.000$$
</div>

<div class="calculation-step">
<h5>步骤5: 结果分析</h5>
<p>博弈论组合权重考虑了3种方法之间的相互影响，AHP方法获得最高的组合系数(0.350)，这表明在博弈过程中，AHP方法的"策略"与其他方法的协同效应最强。最终的组合权重在三种单一方法权重的基础上，实现了各方法之间的均衡，得到了一个更为合理的折中方案。</p>
</div>
</div>
`
  },
  {
    name: "多目标规划组合赋权法",
    type: "组合赋权法",
    detail: "多目标规划组合赋权法通过多目标规划方法，同时优化多个目标来确定最优组合权重。",
    suitConditions: [
      "存在多个优化目标",
      "目标间存在冲突",
      "系统复杂"
    ],
    advantages: [
      "同时优化多个目标",
      "综合考虑多种因素",
      "结果全面合理",
      "理论基础扎实"
    ],
    limitations: [
      "建模复杂",
      "求解困难",
      "目标函数确定有挑战",
      "计算量大"
    ],
    implementationSteps: [
      "1. 确定优化目标",
      "2. 构建多目标规划模型",
      "3. 选择求解方法",
      "4. 求解最优解",
      "5. 确定组合权重"
    ],
    suitableScenarios: [
      "多目标冲突的决策问题",
      "复杂系统优化",
      "可持续发展评价、综合规划"
    ],
    // 新增四个维度属性
    dimensionalAttributes: {
      taskDimension: {
        domain: ["可持续发展评价", "综合规划", "复杂系统优化", "多目标决策"],
        purpose: ["同时优化多目标", "平衡冲突目标", "评估单一对象的综合表现"],
        evaluationNature: ["优化性", "综合性"],
        complexity: ["高"],
        applicationScope: ["政府规划", "企业战略", "复杂系统管理"]
      },
      dataDimension: {
        indicatorCount: ["中", "大"],
        variableType: ["定量", "混合"],
        dataStructure: "多维数据",
        dataQualityRequirement: "高",
        requiredDataTypes: ["多目标数据", "约束条件数据"]
      },
      userDimension: {
        precision: ["高"],
        structure: ["多层次", "复杂"],
        relation: "冲突",
        methodPreference: "优化",
        knowledgeLevel: ["高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["多目标优化", "冲突平衡"]
      },
      environmentDimension: {
        expertiseLevel: "高",
        timeConstraint: ["适中", "长期"],
        computingResource: ["充足", "高级"],
        environmentConstraints: ["需要专业优化软件", "需要专业知识"]
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 多目标规划组合赋权法的数学模型</h4>

<div class="math-step">
<h5>1. 基本思想</h5>
<p>通过构建多目标规划模型，同时优化多个目标函数，求解得到最优组合权重。</p>
</div>

<div class="math-step">
<h5>2. 一般模型</h5>
<p>假设有 $m$ 个指标，$k$ 种不同权重确定方法的权重矩阵：</p>

$$\\mathbf{W} = \\begin{pmatrix}
w_{11} & w_{12} & \\cdots & w_{1m} \\\\
w_{21} & w_{22} & \\cdots & w_{2m} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
w_{k1} & w_{k2} & \\cdots & w_{km}
\\end{pmatrix}$$

<p>其中，$w_{ij}$ 表示第 $i$ 种方法对第 $j$ 个指标的权重值。</p>

<p>多目标规划模型：</p>
$$\\min F_1(\\boldsymbol{\\alpha}) = \\sum_{i=1}^k \\sum_{j=1}^m [\\alpha_i w_{ij} - w_{ij}]^2$$
$$\\min F_2(\\boldsymbol{\\alpha}) = \\sum_{i=1}^k \\sum_{j=1}^m [\\alpha_i w_{ij} - w_j^*]^2$$

<p>其中，$w_j^*$ 为第 $j$ 个指标的理想权重（如专家共识值）</p>

<p class="math-constraint">约束条件：</p>
$$\\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad i=1,2,\\ldots,k$$
</div>

<div class="math-step">
<h5>3. 求解方法</h5>

<p><strong>(1) 线性加权法</strong></p>
<p>将多个目标函数转化为单一目标函数：</p>
$$\\min F(\\boldsymbol{\\alpha}) = \\sum_{i=1}^p \\beta_i F_i(\\boldsymbol{\\alpha})$$
<p>其中，$\\beta_i$ 为第 $i$ 个目标函数的权重，且 $\\sum_{i=1}^p \\beta_i = 1$</p>

<p><strong>(2) $\\varepsilon$-约束法</strong></p>
<p>选择一个主要目标函数进行优化，其他目标函数作为约束：</p>
$$\\min F_1(\\boldsymbol{\\alpha})$$

<p class="math-constraint">约束条件：</p>
$$F_2(\\boldsymbol{\\alpha}) \\leq \\varepsilon_2$$
$$F_3(\\boldsymbol{\\alpha}) \\leq \\varepsilon_3$$
$$\\vdots$$
$$F_p(\\boldsymbol{\\alpha}) \\leq \\varepsilon_p$$
$$\\sum_{i=1}^k \\alpha_i = 1, \\quad \\alpha_i \\geq 0$$

<p><strong>(3) 目标规划法</strong></p>
<p>引入正负偏差变量，最小化偏差：</p>
$$\\min \\sum_{i=1}^p (w_i^+ d_i^+ + w_i^- d_i^-)$$

<p class="math-constraint">约束条件：</p>
$$F_i(\\boldsymbol{\\alpha}) + d_i^+ - d_i^- = T_i, \\quad i=1,2,\\ldots,p$$
$$\\sum_{i=1}^k \\alpha_i = 1$$
$$\\alpha_i \\geq 0, \\quad d_i^+, d_i^- \\geq 0$$

<p>其中，$T_i$ 为第 $i$ 个目标的目标值，$d_i^+$ 和 $d_i^-$ 分别为正偏差和负偏差变量。</p>
</div>

<div class="math-step">
<h5>4. 组合权重计算</h5>
<p>求解多目标规划模型得到最优组合系数 $\\boldsymbol{\\alpha}^*$，计算组合权重：</p>
$$w_j = \\sum_{i=1}^k \\alpha_i^* \\times w_{ij}, \\quad j=1,2,\\ldots,m$$
<p>其中，$w_j$ 为第 $j$ 个指标的组合权重。</p>
</div>
</div>
`,
    calculationExample: `
<div class="example-section">
<h4>📊 多目标规划组合赋权法计算示例</h4>

<p>假设有4个指标，采用3种不同方法得到的权重矩阵：</p>

$$\\mathbf{W} = \\begin{pmatrix}
0.40 & 0.30 & 0.20 & 0.10 \\\\
0.25 & 0.35 & 0.25 & 0.15 \\\\
0.20 & 0.25 & 0.40 & 0.15
\\end{pmatrix} \\begin{pmatrix}
\\text{AHP权重} \\\\
\\text{熵权法权重} \\\\
\\text{变异系数法权重}
\\end{pmatrix}$$

<div class="calculation-step">
<h5>步骤1: 构建多目标规划模型</h5>
<p>设定两个目标函数：</p>

<p><strong>(1) 最小化组合权重与各单一方法权重的离差平方和：</strong></p>
$$F_1(\\boldsymbol{\\alpha}) = \\sum_{i=1}^3 \\sum_{j=1}^4 [\\alpha_i w_{ij} - w_{ij}]^2$$

<p><strong>(2) 最小化组合权重的信息熵：</strong></p>
$$F_2(\\boldsymbol{\\alpha}) = -\\sum_{j=1}^4 w_j \\ln(w_j)$$

<p>其中，$w_j = \\alpha_1 w_{1j} + \\alpha_2 w_{2j} + \\alpha_3 w_{3j}$</p>

<p class="math-constraint">约束条件：</p>
$$\\alpha_1 + \\alpha_2 + \\alpha_3 = 1$$
$$\\alpha_1, \\alpha_2, \\alpha_3 \\geq 0$$
</div>

<div class="calculation-step">
<h5>步骤2: 采用线性加权法</h5>
<p>设定目标函数权重 $\\beta_1 = 0.6$, $\\beta_2 = 0.4$，构建综合目标函数：</p>
$$F(\\boldsymbol{\\alpha}) = 0.6 F_1(\\boldsymbol{\\alpha}) + 0.4 F_2(\\boldsymbol{\\alpha})$$
</div>

<div class="calculation-step">
<h5>步骤3: 求解优化模型</h5>
<p>使用数值优化方法求解，得到最优解：</p>
$$\\boldsymbol{\\alpha}^* = (0.35, 0.40, 0.25)$$
</div>

<div class="calculation-step">
<h5>步骤4: 计算组合权重</h5>
$$w_1 = 0.35 \\times 0.40 + 0.40 \\times 0.25 + 0.25 \\times 0.20 = 0.290$$
$$w_2 = 0.35 \\times 0.30 + 0.40 \\times 0.35 + 0.25 \\times 0.25 = 0.308$$
$$w_3 = 0.35 \\times 0.20 + 0.40 \\times 0.25 + 0.25 \\times 0.40 = 0.270$$
$$w_4 = 0.35 \\times 0.10 + 0.40 \\times 0.15 + 0.25 \\times 0.15 = 0.133$$
</div>

<div class="calculation-step">
<h5>步骤5: 验证</h5>
$$\\sum_{j=1}^4 w_j = 0.290 + 0.308 + 0.270 + 0.133 = 1.001 \\approx 1.000$$
</div>

<div class="calculation-step">
<h5>步骤6: 结果分析</h5>
<p>多目标规划组合赋权法同时考虑了最小化离差和最小化信息熵两个目标，熵权法获得最高的组合系数(0.40)，这表明在多目标优化过程中，熵权法对实现设定的目标贡献最大。最终的组合权重在三种单一方法权重的基础上，实现了多个目标的综合优化，得到了一个更为全面合理的折中方案。</p>
</div>
</div>
`
  },

  // TOPSIS-熵权法组合
  {
    name: "TOPSIS-熵权法",
    type: "组合赋权法",
    detail: "TOPSIS-熵权法是将熵权法与TOPSIS评价方法相结合的组合权重方法。首先利用熵权法根据数据的信息量确定指标的客观权重，然后运用TOPSIS方法进行综合评价和排序。",
    suitConditions: [
      "有充足的原始指标数据",
      "指标间变异程度差异明显",
      "需要进行方案排序或评价",
      "要求客观性和科学性"
    ],
    advantages: [
      "结合熵权法客观性和TOPSIS评价优势",
      "能够充分利用数据信息",
      "排序结果稳定可靠",
      "计算过程标准化",
      "适用于多方案比较"
    ],
    limitations: [
      "对数据质量要求高",
      "不能体现决策者主观偏好",
      "指标数据为零时处理复杂",
      "需要较大样本量"
    ],
    implementationSteps: [
      "1. 构建原始数据矩阵",
      "2. 数据标准化处理",
      "3. 利用熵权法计算指标权重",
      "4. 构建TOPSIS加权规范化矩阵",
      "5. 确定正负理想解",
      "6. 计算各方案到理想解距离",
      "7. 计算相对贴近度并排序"
    ],
    suitableScenarios: [
      "企业绩效评价",
      "供应商选择",
      "投资项目评估",
      "区域发展水平评价"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "中",
      dataRequirement: "高",
      expertDependency: "低",
      interpretability: "中",
      stability: "高",
      scalability: "高",
      implementationDifficulty: "中",
      cost: "中",
      softwareRequirement: "中"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济/金融", "产品/技术评估", "政策/决策支持"],
        purpose: ["对多个选项进行排序/筛选"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["中", "高"],
        applicationScope: ["内部管理", "外部报告", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["中", "多"],
        variableType: ["定量", "混合"],
        dataStructure: "单层平行结构",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: "单层",
        relation: "独立",
        methodPreference: "客观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中", "高"],
        specialRequirements: ["结果可视化"]
      },
      environmentDimension: {
        expertiseLevel: "无",
        timeConstraint: ["适中"],
        computingResource: ["专业"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 TOPSIS-熵权法数学模型</h4>

<div class="math-step">
<h5>1. 熵权法计算权重</h5>
<p>对于指标矩阵 $\\mathbf{X} = (x_{ij})_{m \\times n}$，首先标准化：</p>
$$y_{ij} = \\frac{x_{ij}}{\\sum_{i=1}^{m} x_{ij}}$$

<p>计算第 $j$ 个指标的信息熵：</p>
$$E_j = -\\frac{1}{\\ln m} \\sum_{i=1}^{m} y_{ij} \\ln y_{ij}$$

<p>指标权重：</p>
$$w_j = \\frac{1-E_j}{\\sum_{j=1}^{n}(1-E_j)}$$
</div>

<div class="math-step">
<h5>2. TOPSIS加权标准化</h5>
<p>构建加权标准化矩阵：</p>
$$v_{ij} = w_j \\cdot \\frac{x_{ij}}{\\sqrt{\\sum_{i=1}^{m} x_{ij}^2}}$$
</div>

<div class="math-step">
<h5>3. 确定理想解</h5>
<p>正理想解：$\\mathbf{A}^+ = (v_1^+, v_2^+, ..., v_n^+)$</p>
<p>负理想解：$\\mathbf{A}^- = (v_1^-, v_2^-, ..., v_n^-)$</p>
</div>

<div class="math-step">
<h5>4. 计算相对贴近度</h5>
<p>到正理想解距离：$D_i^+ = \\sqrt{\\sum_{j=1}^{n}(v_{ij} - v_j^+)^2}$</p>
<p>到负理想解距离：$D_i^- = \\sqrt{\\sum_{j=1}^{n}(v_{ij} - v_j^-)^2}$</p>
<p>相对贴近度：$C_i = \\frac{D_i^-}{D_i^+ + D_i^-}$</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 TOPSIS-熵权法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价3个企业在4个指标上的表现：营收增长率(A1)、利润率(A2)、资产周转率(A3)、研发投入比(A4)</p>

<table class="data-table">
<tr><th>企业</th><th>A1(%)</th><th>A2(%)</th><th>A3</th><th>A4(%)</th></tr>
<tr><td>企业1</td><td>15</td><td>8</td><td>1.2</td><td>3.5</td></tr>
<tr><td>企业2</td><td>12</td><td>12</td><td>1.5</td><td>4.2</td></tr>
<tr><td>企业3</td><td>18</td><td>6</td><td>1.0</td><td>5.1</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤1: 熵权法计算权重</h5>
<p>标准化后计算信息熵：</p>
<ul class="calculation-list">
<li>E₁ = 0.998, w₁ = 0.002/0.047 = 0.043</li>
<li>E₂ = 0.950, w₂ = 0.050/0.047 = 1.064</li>
<li>E₃ = 0.985, w₃ = 0.015/0.047 = 0.319</li>
<li>E₄ = 0.980, w₄ = 0.020/0.047 = 0.426</li>
</ul>
<p>归一化权重：w₁=0.021, w₂=0.521, w₃=0.156, w₄=0.208</p>
</div>

<div class="example-step">
<h5>步骤2: TOPSIS评价</h5>
<p>加权标准化后确定理想解：</p>
<ul class="calculation-list">
<li>正理想解：A⁺ = (0.018, 0.345, 0.128, 0.146)</li>
<li>负理想解：A⁻ = (0.013, 0.172, 0.085, 0.101)</li>
</ul>
</div>

<div class="example-step">
<h5>步骤3: 计算贴近度</h5>
<p>各企业到理想解的距离和贴近度：</p>
<ul class="calculation-list">
<li>企业1：D₁⁺=0.173, D₁⁻=0.086, C₁=0.332</li>
<li>企业2：D₂⁺=0.000, D₂⁻=0.259, C₂=1.000</li>
<li>企业3：D₃⁺=0.218, D₃⁻=0.051, C₃=0.189</li>
</ul>
<p><strong>排序结果：企业2 > 企业1 > 企业3</strong></p>
</div>
</div>`
  },

  // 模糊层次分析法
  {
    name: "模糊层次分析法(FAHP)",
    type: "主观赋权法",
    detail: "模糊层次分析法是在层次分析法基础上引入模糊数学理论的权重确定方法。使用模糊数表示专家判断的不确定性，通过模糊运算处理判断矩阵，能够更好地处理决策中的主观不确定性。",
    suitConditions: [
      "专家判断存在不确定性",
      "决策环境复杂模糊",
      "指标间关系不够明确",
      "需要考虑判断的模糊性"
    ],
    advantages: [
      "能处理判断的不确定性",
      "减少主观偏见影响",
      "结果更加稳健",
      "适应复杂决策环境",
      "保留AHP层次化优势"
    ],
    limitations: [
      "计算复杂度较高",
      "模糊数选择有主观性",
      "结果解释相对困难",
      "对专家要求更高"
    ],
    implementationSteps: [
      "1. 构建层次结构模型",
      "2. 构建模糊判断矩阵",
      "3. 模糊数一致性检验",
      "4. 计算模糊权重",
      "5. 模糊权重去模糊化",
      "6. 权重归一化处理"
    ],
    suitableScenarios: [
      "复杂多准则决策",
      "不确定环境下的评价",
      "群体决策问题",
      "风险评估"
    ],
    characteristics: {
      complexity: "高",
      timeCost: "高",
      dataRequirement: "中",
      expertDependency: "高",
      interpretability: "中",
      stability: "高",
      scalability: "中",
      implementationDifficulty: "高",
      cost: "高",
      softwareRequirement: "高"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["政策/决策支持", "社会/民生", "环境/可持续发展"],
        purpose: ["评估单一对象的综合表现", "对多个选项进行排序/筛选"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["高"],
        applicationScope: ["学术研究", "外部报告"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定性", "混合"],
        dataStructure: "多层次结构",
        dataQualityRequirement: "中",
        requiredDataTypes: ["专家的成对比较判断"]
      },
      userDimension: {
        precision: ["中"],
        structure: "多层次",
        relation: "依赖",
        methodPreference: "主观",
        knowledgeLevel: ["高级", "专家"],
        riskTolerance: ["高"],
        specialRequirements: ["高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "充足",
        timeConstraint: ["充裕"],
        computingResource: ["高级"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 模糊层次分析法数学模型</h4>

<div class="math-step">
<h5>1. 模糊判断矩阵</h5>
<p>使用三角模糊数 $\\tilde{a}_{ij} = (l_{ij}, m_{ij}, u_{ij})$ 表示判断：</p>
$$\\tilde{\\mathbf{A}} = (\\tilde{a}_{ij})_{n \\times n}$$

<p class="math-constraint">其中 $l_{ij} \\leq m_{ij} \\leq u_{ij}$，分别表示最悲观、最可能、最乐观的判断值</p>
</div>

<div class="math-step">
<h5>2. 模糊权重计算</h5>
<p>计算各行模糊几何平均：</p>
$$\\tilde{r}_i = \\left(\\prod_{j=1}^{n} l_{ij}\\right)^{1/n}, \\left(\\prod_{j=1}^{n} m_{ij}\\right)^{1/n}, \\left(\\prod_{j=1}^{n} u_{ij}\\right)^{1/n}$$

<p>模糊权重向量：</p>
$$\\tilde{w}_i = \\tilde{r}_i \\otimes \\left(\\sum_{k=1}^{n} \\tilde{r}_k\\right)^{-1}$$
</div>

<div class="math-step">
<h5>3. 去模糊化</h5>
<p>使用重心法将模糊权重转换为确定权重：</p>
$$w_i = \\frac{l_i + m_i + u_i}{3}$$

<p>归一化：</p>
$$w_i' = \\frac{w_i}{\\sum_{j=1}^{n} w_j}$$
</div>

<div class="math-step">
<h5>4. 模糊一致性检验</h5>
<p>计算模糊一致性指标：</p>
$$\\tilde{CI} = \\frac{\\tilde{\\lambda}_{max} - n}{n - 1}$$
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 模糊层次分析法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价供应商选择的3个准则：质量(A)、价格(B)、服务(C)，专家给出模糊判断：</p>

<table class="data-table">
<tr><th>比较</th><th>模糊判断</th><th>三角模糊数</th></tr>
<tr><td>A vs B</td><td>稍微重要</td><td>(1, 2, 3)</td></tr>
<tr><td>A vs C</td><td>明显重要</td><td>(3, 4, 5)</td></tr>
<tr><td>B vs C</td><td>同等重要偏重要</td><td>(1, 1.5, 2)</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤1: 构建模糊判断矩阵</h5>
<p>模糊判断矩阵 $\\tilde{\\mathbf{A}}$：</p>

$$\\tilde{\\mathbf{A}} = \\begin{pmatrix}
(1,1,1) & (1,2,3) & (3,4,5) \\\\
(1/3,1/2,1) & (1,1,1) & (1,1.5,2) \\\\
(1/5,1/4,1/3) & (1/2,2/3,1) & (1,1,1)
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤2: 计算模糊权重</h5>
<p>计算各行模糊几何平均：</p>
<ul class="calculation-list">
<li>$\\tilde{r}_1 = (1×1×3)^{1/3}, (1×2×4)^{1/3}, (1×3×5)^{1/3} = (1.44, 2.00, 2.47)$</li>
<li>$\\tilde{r}_2 = (0.69, 0.91, 1.26)$</li>
<li>$\\tilde{r}_3 = (0.37, 0.45, 0.55)$</li>
</ul>

<p>模糊权重：</p>
<ul class="calculation-list">
<li>$\\tilde{w}_1 = (0.46, 0.60, 0.74)$</li>
<li>$\\tilde{w}_2 = (0.22, 0.27, 0.38)$</li>
<li>$\\tilde{w}_3 = (0.12, 0.13, 0.16)$</li>
</ul>
</div>

<div class="example-step">
<h5>步骤3: 去模糊化</h5>
<p>使用重心法计算确定权重：</p>
<ul class="calculation-list">
<li>w₁ = (0.46 + 0.60 + 0.74)/3 = 0.600</li>
<li>w₂ = (0.22 + 0.27 + 0.38)/3 = 0.290</li>
<li>w₃ = (0.12 + 0.13 + 0.16)/3 = 0.137</li>
</ul>

<p>归一化权重：w₁=0.583, w₂=0.282, w₃=0.133</p>
<p><strong>结果：质量最重要(58.3%)，其次是价格(28.2%)，服务占13.3%</strong></p>
</div>
</div>`
  },

  // 网络分析法
  {
    name: "网络分析法(ANP)",
    type: "主观赋权法", 
    detail: "网络分析法是层次分析法的推广，允许元素间存在相互依赖和反馈关系。通过构建网络结构模型，考虑指标间的复杂相互影响，适用于处理具有内部依赖关系的复杂决策问题。",
    suitConditions: [
      "指标间存在相互依赖关系",
      "决策问题具有网络结构特征",
      "需要考虑反馈效应",
      "有经验丰富的专家团队"
    ],
    advantages: [
      "能处理复杂的相互依赖关系",
      "更接近现实决策环境",
      "考虑反馈和循环影响",
      "结果更加全面准确",
      "适用于复杂系统分析"
    ],
    limitations: [
      "建模复杂度极高",
      "需要大量专家判断",
      "计算过程繁琐",
      "对软件依赖性强",
      "结果解释困难"
    ],
    implementationSteps: [
      "1. 构建网络结构模型",
      "2. 识别元素间依赖关系",
      "3. 构建超矩阵",
      "4. 成对比较判断",
      "5. 计算未加权超矩阵",
      "6. 计算加权超矩阵",
      "7. 计算极限超矩阵",
      "8. 获得最终权重"
    ],
    suitableScenarios: [
      "战略规划与决策",
      "供应链管理",
      "技术创新评价",
      "复杂系统优化"
    ],
    characteristics: {
      complexity: "极高",
      timeCost: "极高",
      dataRequirement: "中",
      expertDependency: "极高",
      interpretability: "低",
      stability: "中",
      scalability: "低",
      implementationDifficulty: "极高",
      cost: "极高",
      softwareRequirement: "高"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["政策/决策支持", "产品/技术评估", "经济/金融"],
        purpose: ["评估单一对象的综合表现"],
        evaluationNature: ["优化性"],
        complexity: ["高"],
        applicationScope: ["学术研究", "外部报告"]
      },
      dataDimension: {
        indicatorCount: ["中"],
        variableType: ["定性", "混合"],
        dataStructure: "网络结构",
        dataQualityRequirement: "中",
        requiredDataTypes: ["专家的成对比较判断"]
      },
      userDimension: {
        precision: ["高"],
        structure: "多层次",
        relation: "依赖",
        methodPreference: "主观",
        knowledgeLevel: ["专家"],
        riskTolerance: ["高"],
        specialRequirements: ["高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "充足",
        timeConstraint: ["充裕"],
        computingResource: ["高级"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 网络分析法数学模型</h4>

<div class="math-step">
<h5>1. 超矩阵构建</h5>
<p>设有 $N$ 个元素组，构建超矩阵 $\\mathbf{W}$：</p>
$$\\mathbf{W} = \\begin{pmatrix}
\\mathbf{W}_{11} & \\mathbf{W}_{12} & \\cdots & \\mathbf{W}_{1N} \\\\
\\mathbf{W}_{21} & \\mathbf{W}_{22} & \\cdots & \\mathbf{W}_{2N} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
\\mathbf{W}_{N1} & \\mathbf{W}_{N2} & \\cdots & \\mathbf{W}_{NN}
\\end{pmatrix}$$

<p class="math-constraint">其中 $\\mathbf{W}_{ij}$ 表示第 $j$ 组元素对第 $i$ 组元素的影响权重矩阵</p>
</div>

<div class="math-step">
<h5>2. 加权超矩阵</h5>
<p>对未加权超矩阵进行列标准化得到加权超矩阵 $\\overline{\\mathbf{W}}$：</p>
$$\\overline{w}_{ij} = \\frac{w_{ij}}{\\sum_{k=1}^{n} w_{kj}}$$

<p class="math-constraint">加权超矩阵的每列和为1</p>
</div>

<div class="math-step">
<h5>3. 极限超矩阵</h5>
<p>计算加权超矩阵的幂次收敛：</p>
$$\\lim_{k \\to \\infty} \\overline{\\mathbf{W}}^k = \\mathbf{W}^*$$

<p>当极限存在时，$\\mathbf{W}^*$ 的每一列即为最终权重向量</p>
</div>

<div class="math-step">
<h5>4. 权重计算</h5>
<p>从极限超矩阵中提取各元素的权重：</p>
$$w_i = W^*_{i} \\quad (i = 1, 2, \\ldots, n)$$
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 网络分析法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价企业竞争力，考虑3个准则：财务能力(F)、创新能力(I)、市场能力(M)，它们之间存在相互影响关系：</p>

<ul class="dependency-list">
<li>财务能力影响创新能力和市场能力</li>
<li>创新能力影响财务能力和市场能力</li>
<li>市场能力影响财务能力</li>
</ul>
</div>

<div class="example-step">
<h5>步骤1: 构建未加权超矩阵</h5>
<p>基于专家判断构建未加权超矩阵：</p>

$$\\mathbf{W} = \\begin{pmatrix}
0 & 0.25 & 0.4 \\\\
0.6 & 0 & 0.3 \\\\
0.4 & 0.75 & 0
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤2: 列归一化得加权超矩阵</h5>
<p>对每列进行归一化：</p>

$$\\overline{\\mathbf{W}} = \\begin{pmatrix}
0 & 0.25 & 0.571 \\\\
0.6 & 0 & 0.429 \\\\
0.4 & 0.75 & 0
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤3: 计算极限超矩阵</h5>
<p>计算 $\\overline{\\mathbf{W}}$ 的幂次收敛：</p>

<ul class="calculation-list">
<li>$\\overline{\\mathbf{W}}^2$、$\\overline{\\mathbf{W}}^3$、...、$\\overline{\\mathbf{W}}^{20}$</li>
<li>当 $k \\geq 15$ 时矩阵收敛</li>
</ul>

$$\\mathbf{W}^* = \\begin{pmatrix}
0.324 & 0.324 & 0.324 \\\\
0.392 & 0.392 & 0.392 \\\\
0.284 & 0.284 & 0.284
\\end{pmatrix}$$
</div>

<div class="example-step">
<h5>步骤4: 最终权重</h5>
<p>从极限超矩阵的任一列提取权重：</p>
<ul class="calculation-list">
<li>财务能力权重：w₁ = 0.324</li>
<li>创新能力权重：w₂ = 0.392</li>  
<li>市场能力权重：w₃ = 0.284</li>
</ul>

<p><strong>结果：创新能力最重要(39.2%)，考虑相互影响后比单纯AHP结果更合理</strong></p>
</div>
</div>`
  },

  // 灰色关联权重法
  {
    name: "灰色关联权重法",
    type: "客观赋权法",
    detail: "灰色关联权重法基于灰色系统理论，通过计算各指标与参考序列的关联度来确定权重。该方法能够在信息不完全、数据不确定的情况下挖掘指标间的关联关系，适用于小样本、贫信息的决策问题。",
    suitConditions: [
      "数据样本量较小",
      "信息不完全或不确定",
      "指标数据序列较短",
      "需要分析关联性"
    ],
    advantages: [
      "对样本量要求不高",
      "能处理不确定信息",
      "计算相对简单",
      "适用于动态分析",
      "无需特定分布假设"
    ],
    limitations: [
      "权重解释性相对较弱",
      "参考序列选择有主观性",
      "对极值较敏感",
      "理论基础相对薄弱"
    ],
    implementationSteps: [
      "1. 确定参考序列",
      "2. 数据无量纲化处理",
      "3. 计算绝对差值序列",
      "4. 求两级最大最小差",
      "5. 计算关联系数",
      "6. 计算关联度",
      "7. 确定权重"
    ],
    suitableScenarios: [
      "小样本决策问题",
      "时序数据分析",
      "不确定环境评价",
      "系统关联分析"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "低",
      dataRequirement: "低",
      expertDependency: "低",
      interpretability: "中",
      stability: "中",
      scalability: "高",
      implementationDifficulty: "低",
      cost: "低",
      softwareRequirement: "低"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["环境/可持续发展", "社会/民生", "经济/金融"],
        purpose: ["评估单一对象的综合表现"],
        evaluationNature: ["描述性", "预测性"],
        complexity: ["低", "中"],
        applicationScope: ["学术研究", "内部管理"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定量", "混合"],
        dataStructure: "单层平行结构",
        dataQualityRequirement: "低",
        requiredDataTypes: ["原始指标数据"]
      },
      userDimension: {
        precision: ["中"],
        structure: "单层",
        relation: "独立",
        methodPreference: "客观",
        knowledgeLevel: ["初级", "中级"],
        riskTolerance: ["中"],
        specialRequirements: ["易于实现"]
      },
      environmentDimension: {
        expertiseLevel: "无",
        timeConstraint: ["紧迫", "适中"],
        computingResource: ["基础", "专业"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 灰色关联权重法数学模型</h4>

<div class="math-step">
<h5>1. 参考序列确定</h5>
<p>选择理想的参考序列 $X_0 = \\{x_0(k) | k = 1, 2, \\ldots, n\\}$</p>
<p>通常取各指标的最优值：$x_0(k) = \\max_i\\{x_i(k)\\}$ 或 $\\min_i\\{x_i(k)\\}$</p>
</div>

<div class="math-step">
<h5>2. 数据预处理</h5>
<p>对原始数据进行初值化处理：</p>
$$x_i'(k) = \\frac{x_i(k)}{x_i(1)} \\quad (i = 1, 2, \\ldots, m; k = 1, 2, \\ldots, n)$$
</div>

<div class="math-step">
<h5>3. 计算绝对差值</h5>
<p>计算比较序列与参考序列的绝对差值：</p>
$$\\Delta_{0i}(k) = |x_0'(k) - x_i'(k)|$$
</div>

<div class="math-step">
<h5>4. 计算关联系数</h5>
<p>计算各点的关联系数：</p>
$$\\xi_{0i}(k) = \\frac{\\Delta_{\\min} + \\rho \\Delta_{\\max}}{\\Delta_{0i}(k) + \\rho \\Delta_{\\max}}$$

<p class="math-constraint">其中：$\\Delta_{\\min} = \\min_i \\min_k \\Delta_{0i}(k)$，$\\Delta_{\\max} = \\max_i \\max_k \\Delta_{0i}(k)$，$\\rho \\in (0,1)$ 为分辨系数，通常取0.5</p>
</div>

<div class="math-step">
<h5>5. 计算关联度</h5>
<p>计算各指标的关联度：</p>
$$r_{0i} = \\frac{1}{n} \\sum_{k=1}^{n} \\xi_{0i}(k)$$
</div>

<div class="math-step">
<h5>6. 确定权重</h5>
<p>基于关联度确定权重：</p>
$$w_i = \\frac{r_{0i}}{\\sum_{j=1}^{m} r_{0j}}$$
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 灰色关联权重法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价3个地区在4个发展指标上的表现：GDP增长率(A1)、人均收入(A2)、环境质量(A3)、教育水平(A4)</p>

<table class="data-table">
<tr><th>地区</th><th>A1(%)</th><th>A2(万元)</th><th>A3(分)</th><th>A4(分)</th></tr>
<tr><td>地区1</td><td>8.5</td><td>3.2</td><td>85</td><td>78</td></tr>
<tr><td>地区2</td><td>7.2</td><td>4.1</td><td>90</td><td>82</td></tr>
<tr><td>地区3</td><td>9.1</td><td>2.8</td><td>75</td><td>75</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤1: 确定参考序列</h5>
<p>选择各指标最优值作为参考序列：</p>
<p>$X_0 = \\{9.1, 4.1, 90, 82\\}$</p>
</div>

<div class="example-step">
<h5>步骤2: 初值化处理</h5>
<p>以第一个数据为基准进行初值化：</p>

<table class="data-table">
<tr><th>序列</th><th>A1</th><th>A2</th><th>A3</th><th>A4</th></tr>
<tr><td>X₀</td><td>1.000</td><td>1.000</td><td>1.000</td><td>1.000</td></tr>
<tr><td>X₁</td><td>1.000</td><td>1.000</td><td>1.000</td><td>1.000</td></tr>
<tr><td>X₂</td><td>0.847</td><td>1.281</td><td>1.059</td><td>1.051</td></tr>
<tr><td>X₃</td><td>1.071</td><td>0.875</td><td>0.882</td><td>0.962</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤3: 计算关联系数</h5>
<p>计算绝对差值，Δmin=0, Δmax=0.281，ρ=0.5：</p>

<table class="data-table">
<tr><th>指标</th><th>ξ₁</th><th>ξ₂</th><th>ξ₃</th><th>平均关联度</th></tr>
<tr><td>A1</td><td>1.000</td><td>0.479</td><td>0.664</td><td>0.714</td></tr>
<tr><td>A2</td><td>1.000</td><td>0.333</td><td>0.529</td><td>0.621</td></tr>
<tr><td>A3</td><td>1.000</td><td>0.704</td><td>0.544</td><td>0.749</td></tr>
<tr><td>A4</td><td>1.000</td><td>0.847</td><td>0.787</td><td>0.878</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤4: 确定权重</h5>
<p>基于关联度计算权重：</p>
<ul class="calculation-list">
<li>w₁ = 0.714/2.962 = 0.241</li>
<li>w₂ = 0.621/2.962 = 0.210</li>
<li>w₃ = 0.749/2.962 = 0.253</li>
<li>w₄ = 0.878/2.962 = 0.296</li>
</ul>

<p><strong>结果：教育水平权重最高(29.6%)，其次是环境质量(25.3%)</strong></p>
</div>
</div>`
  },

  // SWARA法
  {
    name: "SWARA法",
    type: "主观赋权法",
    detail: "SWARA法(Step-wise Weight Assessment Ratio Analysis)是一种基于专家判断的权重确定方法。专家对指标的重要性进行排序，并给出相邻指标间的相对重要性比值，通过逐步计算得到最终权重。",
    suitConditions: [
      "有领域专家参与",
      "指标重要性差异明显",
      "需要快速确定权重",
      "专家对指标排序有共识"
    ],
    advantages: [
      "操作简单易懂",
      "专家负担较轻",
      "计算过程透明",
      "结果易于解释",
      "适用性强"
    ],
    limitations: [
      "完全依赖专家主观判断",
      "缺乏一致性检验",
      "排序结果影响权重",
      "对专家经验要求高"
    ],
    implementationSteps: [
      "1. 专家对指标重要性排序",
      "2. 确定相邻指标相对重要性",
      "3. 计算系数kⱼ",
      "4. 计算权重qⱼ",
      "5. 归一化得到最终权重"
    ],
    suitableScenarios: [
      "快速决策支持",
      "初步权重估计",
      "专家经验丰富的领域",
      "中小规模指标体系"
    ],
    characteristics: {
      complexity: "低",
      timeCost: "低",
      dataRequirement: "低",
      expertDependency: "高",
      interpretability: "高",
      stability: "中",
      scalability: "高",
      implementationDifficulty: "低",
      cost: "低",
      softwareRequirement: "低"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["管理科学", "政策/决策支持", "产品/技术评估"],
        purpose: ["对多个选项进行排序/筛选", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["低", "中"],
        applicationScope: ["内部管理", "外部报告"]
      },
      dataDimension: {
        indicatorCount: ["少", "中"],
        variableType: ["定性", "混合"],
        dataStructure: "单层平行结构",
        dataQualityRequirement: "低",
        requiredDataTypes: ["专家对指标重要性的评分"]
      },
      userDimension: {
        precision: ["中"],
        structure: "单层",
        relation: "独立",
        methodPreference: "主观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中"],
        specialRequirements: ["易于实现", "高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "有限",
        timeConstraint: ["紧迫", "适中"],
        computingResource: ["基础"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 SWARA法数学模型</h4>

<div class="math-step">
<h5>1. 指标排序</h5>
<p>专家按重要性对指标进行降序排列：$C_1 \\succ C_2 \\succ \\cdots \\succ C_n$</p>
</div>

<div class="math-step">
<h5>2. 相对重要性评定</h5>
<p>专家给出相邻指标的相对重要性比值 $s_j$：</p>
$$s_j = \\frac{\\text{第}j-1\\text{个指标的重要性} - \\text{第}j\\text{个指标的重要性}}{\\text{第}j\\text{个指标的重要性}}$$
<p class="math-constraint">其中 $j = 2, 3, \\ldots, n$，$s_1 = 0$</p>
</div>

<div class="math-step">
<h5>3. 计算系数</h5>
<p>计算系数 $k_j$：</p>
$$k_j = \\begin{cases}
1 & \\text{如果} \\; j = 1 \\\\
s_j + 1 & \\text{如果} \\; j > 1
\\end{cases}$$
</div>

<div class="math-step">
<h5>4. 计算权重</h5>
<p>计算初始权重 $q_j$：</p>
$$q_j = \\begin{cases}
1 & \\text{如果} \\; j = 1 \\\\
\\frac{q_{j-1}}{k_j} & \\text{如果} \\; j > 1
\\end{cases}$$
</div>

<div class="math-step">
<h5>5. 归一化</h5>
<p>计算最终权重：</p>
$$w_j = \\frac{q_j}{\\sum_{i=1}^{n} q_i}$$
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 SWARA法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价员工绩效的5个指标，专家按重要性排序：工作质量(C1) > 团队合作(C2) > 创新能力(C3) > 学习能力(C4) > 出勤率(C5)</p>
</div>

<div class="example-step">
<h5>步骤1: 确定相对重要性</h5>
<p>专家给出相邻指标的相对重要性比值：</p>

<table class="data-table">
<tr><th>指标</th><th>相对重要性sⱼ</th><th>系数kⱼ</th></tr>
<tr><td>工作质量(C1)</td><td>0</td><td>1.00</td></tr>
<tr><td>团队合作(C2)</td><td>0.10</td><td>1.10</td></tr>
<tr><td>创新能力(C3)</td><td>0.15</td><td>1.15</td></tr>
<tr><td>学习能力(C4)</td><td>0.20</td><td>1.20</td></tr>
<tr><td>出勤率(C5)</td><td>0.25</td><td>1.25</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤2: 计算初始权重qⱼ</h5>
<p>逐步计算各指标的初始权重：</p>

<ul class="calculation-list">
<li>q₁ = 1.000</li>
<li>q₂ = q₁/k₂ = 1.000/1.10 = 0.909</li>
<li>q₃ = q₂/k₃ = 0.909/1.15 = 0.790</li>
<li>q₄ = q₃/k₄ = 0.790/1.20 = 0.658</li>
<li>q₅ = q₄/k₅ = 0.658/1.25 = 0.527</li>
</ul>

<p>初始权重和：Σqⱼ = 3.884</p>
</div>

<div class="example-step">
<h5>步骤3: 计算最终权重</h5>
<p>归一化得到最终权重：</p>

<ul class="calculation-list">
<li>w₁ = 1.000/3.884 = 0.257</li>
<li>w₂ = 0.909/3.884 = 0.234</li>
<li>w₃ = 0.790/3.884 = 0.203</li>
<li>w₄ = 0.658/3.884 = 0.169</li>
<li>w₅ = 0.527/3.884 = 0.136</li>
</ul>

<p><strong>结果：工作质量权重最高(25.7%)，权重随排序递减</strong></p>
</div>
</div>`
  },

  // Best-Worst法
  {
    name: "Best-Worst法(BWM)",
    type: "主观赋权法",
    detail: "Best-Worst法是一种基于成对比较的权重确定方法。专家只需要选择最重要和最不重要的指标，并分别与其他指标进行比较，大大减少了比较次数，同时保持了较高的一致性。",
    suitConditions: [
      "有领域专家参与",
      "希望减少比较次数",
      "对一致性要求较高",
      "指标数量较多"
    ],
    advantages: [
      "比较次数少(2n-3次)",
      "一致性较好",
      "计算相对简单",
      "专家负担轻",
      "结果可靠性高"
    ],
    limitations: [
      "仍然依赖专家主观判断",
      "最优最劣指标选择的主观性",
      "对专家经验要求高",
      "缺乏群体决策机制"
    ],
    implementationSteps: [
      "1. 确定最重要指标(Best)",
      "2. 确定最不重要指标(Worst)",
      "3. 最重要指标与其他指标比较",
      "4. 其他指标与最不重要指标比较",
      "5. 建立优化模型",
      "6. 求解得到权重"
    ],
    suitableScenarios: [
      "指标较多的决策问题",
      "要求高一致性的评价",
      "专家时间有限的情况",
      "群体决策前的个体权重确定"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "低",
      dataRequirement: "低",
      expertDependency: "高",
      interpretability: "高",
      stability: "高",
      scalability: "高",
      implementationDifficulty: "中",
      cost: "低",
      softwareRequirement: "中"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["管理科学", "产品/技术评估", "政策/决策支持"],
        purpose: ["对多个选项进行排序/筛选", "评估单一对象的综合表现"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["中", "高"],
        applicationScope: ["内部管理", "外部报告", "学术研究"]
      },
      dataDimension: {
        indicatorCount: ["中", "多"],
        variableType: ["定性", "混合"],
        dataStructure: "单层平行结构",
        dataQualityRequirement: "低",
        requiredDataTypes: ["专家的成对比较判断"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: "单层",
        relation: "独立",
        methodPreference: "主观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中"],
        specialRequirements: ["高可解释性"]
      },
      environmentDimension: {
        expertiseLevel: "有限",
        timeConstraint: ["紧迫", "适中"],
        computingResource: ["专业"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 Best-Worst法数学模型</h4>

<div class="math-step">
<h5>1. 最重要指标比较向量</h5>
<p>设最重要指标为 $B$，构建比较向量：</p>
$$\\mathbf{A}_B = (a_{B1}, a_{B2}, \\ldots, a_{Bn})$$
<p class="math-constraint">其中 $a_{Bj}$ 表示最重要指标 $B$ 相对于指标 $j$ 的重要性</p>
</div>

<div class="math-step">
<h5>2. 最不重要指标比较向量</h5>
<p>设最不重要指标为 $W$，构建比较向量：</p>
$$\\mathbf{A}_W = (a_{1W}, a_{2W}, \\ldots, a_{nW})^T$$
<p class="math-constraint">其中 $a_{jW}$ 表示指标 $j$ 相对于最不重要指标 $W$ 的重要性</p>
</div>

<div class="math-step">
<h5>3. 优化模型</h5>
<p>建立线性规划模型求解权重：</p>
$$\\min \\xi$$

<p>约束条件：</p>
$$\\left|\\frac{w_B}{w_j} - a_{Bj}\\right| \\leq \\xi, \\quad \\forall j$$
$$\\left|\\frac{w_j}{w_W} - a_{jW}\\right| \\leq \\xi, \\quad \\forall j$$
$$\\sum_{j=1}^{n} w_j = 1$$
$$w_j \\geq 0, \\quad \\forall j$$
</div>

<div class="math-step">
<h5>4. 一致性检验</h5>
<p>一致性比率计算：</p>
$$CR = \\frac{\\xi^*}{CI}$$
<p class="math-constraint">其中 $\\xi^*$ 为最优目标值，$CI$ 为一致性指标</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 Best-Worst法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>选择智能手机的5个评价准则：性能(C1)、价格(C2)、外观(C3)、品牌(C4)、续航(C5)</p>
<p>专家认为：性能(C1)最重要，外观(C3)最不重要</p>
</div>

<div class="example-step">
<h5>步骤1: 最重要指标比较</h5>
<p>性能(C1)与其他指标的比较：</p>

<table class="data-table">
<tr><th>比较</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th></tr>
<tr><td>A_B</td><td>1</td><td>2</td><td>5</td><td>3</td><td>2</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤2: 最不重要指标比较</h5>
<p>其他指标与外观(C3)的比较：</p>

<table class="data-table">
<tr><th>比较</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>C5</th></tr>
<tr><td>A_W</td><td>5</td><td>3</td><td>1</td><td>2</td><td>3</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤3: 建立优化模型</h5>
<p>线性规划模型：</p>

$$\\min \\xi$$

<p>约束条件：</p>
<ul class="constraint-list">
<li>$|w_1/w_2 - 2| \\leq \\xi$</li>
<li>$|w_1/w_3 - 5| \\leq \\xi$</li>
<li>$|w_1/w_4 - 3| \\leq \\xi$</li>
<li>$|w_1/w_5 - 2| \\leq \\xi$</li>
<li>$|w_2/w_3 - 3| \\leq \\xi$</li>
<li>$|w_4/w_3 - 2| \\leq \\xi$</li>
<li>$|w_5/w_3 - 3| \\leq \\xi$</li>
<li>$w_1 + w_2 + w_3 + w_4 + w_5 = 1$</li>
</ul>
</div>

<div class="example-step">
<h5>步骤4: 求解结果</h5>
<p>求解得到最优权重：</p>

<ul class="calculation-list">
<li>w₁ = 0.387 (性能)</li>
<li>w₂ = 0.194 (价格)</li>
<li>w₃ = 0.077 (外观)</li>
<li>w₄ = 0.129 (品牌)</li>
<li>w₅ = 0.194 (续航)</li>
</ul>

<p>一致性比率：CR = 0.000 (完全一致)</p>
<p><strong>结果：性能最重要(38.7%)，价格和续航并列第二(19.4%)</strong></p>
</div>
</div>`
  },

  // MULTIMOORA法
  {
    name: "MULTIMOORA法",
    type: "客观赋权法",
    detail: "MULTIMOORA法是MOORA法的扩展版本，结合了比率系统、参考点法和完全乘法形式三种排序方法。该方法通过多种排序结果的综合来提高决策的稳健性和可靠性。",
    suitConditions: [
      "需要稳健的排序结果",
      "有充足的定量数据",
      "要求多角度验证",
      "决策结果影响重大"
    ],
    advantages: [
      "结果稳健性高",
      "计算相对简单",
      "多角度验证排序",
      "适用性广",
      "对极值不敏感"
    ],
    limitations: [
      "需要确定参考点",
      "权重确定仍需专家判断",
      "三种方法结果可能不一致",
      "理论基础相对薄弱"
    ],
    implementationSteps: [
      "1. 构建决策矩阵",
      "2. 数据标准化处理",
      "3. 比率系统排序",
      "4. 参考点法排序",
      "5. 完全乘法形式排序",
      "6. 综合排序结果",
      "7. 确定最终排序"
    ],
    suitableScenarios: [
      "供应商选择",
      "投资项目评估",
      "绩效评价",
      "产品选择"
    ],
    characteristics: {
      complexity: "中",
      timeCost: "中",
      dataRequirement: "高",
      expertDependency: "中",
      interpretability: "中",
      stability: "高",
      scalability: "高",
      implementationDifficulty: "中",
      cost: "中",
      softwareRequirement: "中"
    },
    dimensionalAttributes: {
      taskDimension: {
        domain: ["经济/金融", "产品/技术评估", "管理科学"],
        purpose: ["对多个选项进行排序/筛选"],
        evaluationNature: ["描述性", "优化性"],
        complexity: ["中", "高"],
        applicationScope: ["内部管理", "外部报告"]
      },
      dataDimension: {
        indicatorCount: ["中", "多"],
        variableType: ["定量", "混合"],
        dataStructure: "单层平行结构",
        dataQualityRequirement: "高",
        requiredDataTypes: ["原始指标数据"]
      },
      userDimension: {
        precision: ["中", "高"],
        structure: "单层",
        relation: "独立",
        methodPreference: "客观",
        knowledgeLevel: ["中级", "高级"],
        riskTolerance: ["中"],
        specialRequirements: ["结果可视化"]
      },
      environmentDimension: {
        expertiseLevel: "有限",
        timeConstraint: ["适中"],
        computingResource: ["专业"],
        environmentConstraints: []
      }
    },
    mathematicalModel: `
<div class="math-section">
<h4>🔢 MULTIMOORA法数学模型</h4>

<div class="math-step">
<h5>1. 比率系统法</h5>
<p>标准化决策矩阵：</p>
$$x_{ij}^* = \\frac{x_{ij}}{\\sqrt{\\sum_{i=1}^{m} x_{ij}^2}}$$

<p>计算效用值：</p>
$$y_i = \\sum_{j=1}^{g} w_j x_{ij}^* - \\sum_{j=g+1}^{n} w_j x_{ij}^*$$
<p class="math-constraint">其中前 $g$ 个指标为效益型，后 $n-g$ 个为成本型</p>
</div>

<div class="math-step">
<h5>2. 参考点法</h5>
<p>确定参考点：</p>
$$r_j = \\max_i x_{ij}^* \\text{（效益型）}, \\quad r_j = \\min_i x_{ij}^* \\text{（成本型）}$$

<p>计算距离：</p>
$$d_i = \\max_j \\{w_j |r_j - x_{ij}^*|\\}$$
</div>

<div class="math-step">
<h5>3. 完全乘法形式</h5>
<p>计算总体效用：</p>
$$U_i = \\frac{\\prod_{j=1}^{g} x_{ij}}{\\prod_{j=g+1}^{n} x_{ij}}$$
</div>

<div class="math-step">
<h5>4. 综合排序</h5>
<p>基于三种方法的排序结果，使用支配理论确定最终排序：</p>
<p>方案 $A$ 支配方案 $B$ 当且仅当 $A$ 在至少两种方法中优于 $B$</p>
</div>
</div>`,
    calculationExample: `
<div class="example-section">
<h4>🧮 MULTIMOORA法计算示例</h4>

<div class="example-problem">
<h5>问题设定</h5>
<p>评价3个投资项目在4个指标上的表现：预期收益率(B1,效益型)、投资风险(C1,成本型)、流动性(B2,效益型)、投资期限(C2,成本型)</p>

<table class="data-table">
<tr><th>项目</th><th>B1(%)</th><th>C1</th><th>B2</th><th>C2(年)</th></tr>
<tr><td>项目A</td><td>12</td><td>0.3</td><td>0.8</td><td>2</td></tr>
<tr><td>项目B</td><td>15</td><td>0.5</td><td>0.6</td><td>3</td></tr>
<tr><td>项目C</td><td>10</td><td>0.2</td><td>0.9</td><td>1</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤1: 比率系统法</h5>
<p>标准化后计算效用值(假设权重相等w=0.25)：</p>

<table class="data-table">
<tr><th>项目</th><th>y值</th><th>排序</th></tr>
<tr><td>项目A</td><td>0.089</td><td>2</td></tr>
<tr><td>项目B</td><td>0.041</td><td>3</td></tr>
<tr><td>项目C</td><td>0.156</td><td>1</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤2: 参考点法</h5>
<p>参考点为(0.714, 0.196, 0.692, 0.385)，计算切比雪夫距离：</p>

<table class="data-table">
<tr><th>项目</th><th>距离d</th><th>排序</th></tr>
<tr><td>项目A</td><td>0.173</td><td>2</td></tr>
<tr><td>项目B</td><td>0.250</td><td>3</td></tr>
<tr><td>项目C</td><td>0.134</td><td>1</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤3: 完全乘法形式</h5>
<p>计算效用值：</p>

<table class="data-table">
<tr><th>项目</th><th>U值</th><th>排序</th></tr>
<tr><td>项目A</td><td>1.60</td><td>2</td></tr>
<tr><td>项目B</td><td>0.60</td><td>3</td></tr>
<tr><td>项目C</td><td>4.50</td><td>1</td></tr>
</table>
</div>

<div class="example-step">
<h5>步骤4: 综合排序</h5>
<p>三种方法排序结果：</p>
<ul class="calculation-list">
<li>比率系统法：C > A > B</li>
<li>参考点法：C > A > B</li>
<li>完全乘法形式：C > A > B</li>
</ul>

<p><strong>最终排序：项目C > 项目A > 项目B</strong></p>
<p>三种方法结果完全一致，说明排序结果非常稳健。</p>
</div>
</div>`
  }
];

/**
 * 获取方法基本信息
 * @returns {Array} 返回简化的方法信息列表
 */
function getMethodsBasicInfo() {
  return weightMethodsDB.map(method => ({
    name: method.name,
    type: method.type,
    advantages: method.advantages.slice(0, 3),
    suitableScenarios: method.suitableScenarios
  }));
}

/**
 * 获取方法详细信息（包含数学模型和计算示例）
 * @param {string} methodName 方法名称
 * @returns {Object|null} 返回方法详细信息或null
 */
function getMethodDetail(methodName) {
  return weightMethodsDB.find(method => method.name === methodName) || null;
}

/**
 * 获取方法详细信息（不包含数学模型和计算示例）
 * @param {string} methodName 方法名称
 * @returns {Object|null} 返回不含数学模型和计算示例的方法详细信息或null
 */
function getMethodDetailForAgent(methodName) {
  const method = weightMethodsDB.find(method => method.name === methodName);
  if (!method) return null;
  
  // 创建一个不包含数学模型和计算示例的方法副本
  const { mathematicalModel, calculationExample, ...methodInfo } = method;
  return methodInfo;
}

/**
 * 根据条件筛选方法
 * @param {Object} criteria 筛选条件
 * @returns {Array} 返回满足条件的方法列表
 */
function filterMethods(criteria) {
  return weightMethodsDB.filter(method => {
    // 根据类型筛选
    if (criteria.type && method.type !== criteria.type) {
      return false;
    }
    
    // 根据适用条件筛选
    if (criteria.conditions && criteria.conditions.length > 0) {
      const matchCondition = criteria.conditions.some(condition => 
        method.suitConditions.some(sc => sc.includes(condition))
      );
      if (!matchCondition) return false;
    }
    
    // 根据场景筛选
    if (criteria.scenario && !method.suitableScenarios.includes(criteria.scenario)) {
      return false;
    }
    
    return true;
  });
}

/**
 * 筛选方法并返回适合推荐agent的结果（不包含数学模型和计算示例）
 * @param {Object} criteria 筛选条件
 * @returns {Array} 返回没有数学模型和计算示例的满足条件的方法列表
 */
function filterMethodsForAgent(criteria) {
  const methods = filterMethods(criteria);
  return methods.map(method => {
    const { mathematicalModel, calculationExample, ...methodInfo } = method;
    return methodInfo;
  });
}

// 导出方法库和筛选函数
export { weightMethodsDB, filterMethods, getMethodDetail, getMethodDetailForAgent, getMethodsBasicInfo, filterMethodsForAgent }; 