// AI服务提供商类型
export type AIProvider = 'deepseek' | 'openai' | 'moonshot' | 'mock';

// 代码分析结果类型
export interface CodeAnalysisResult {
  filePath: string;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  summary: AnalysisSummary;
}

// 代码问题类型
export interface CodeIssue {
  id: string;
  type: IssueType;
  severity: Severity;
  line?: number;
  column?: number;
  message: string;
  description: string;
  suggestion?: string;
  rule?: string;
}

// 代码建议类型
export interface CodeSuggestion {
  id: string;
  type: SuggestionType;
  priority: Priority;
  line?: number;
  column?: number;
  title: string;
  description: string;
  code?: string;
  before?: string;
  after?: string;
}

// 分析摘要
export interface AnalysisSummary {
  totalFiles: number;
  totalIssues: number;
  totalSuggestions: number;
  severityCounts: Record<Severity, number>;
  categoryCounts: Record<IssueType, number>;
  qualityScore: number;
  processingTime: number;
}

// 问题类型
export type IssueType =
  | 'bug'
  | 'security'
  | 'performance'
  | 'style'
  | 'maintainability'
  | 'accessibility'
  | 'best-practice';

// 建议类型
export type SuggestionType =
  | 'refactor'
  | 'optimization'
  | 'enhancement'
  | 'documentation'
  | 'test-coverage';

// 严重程度
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// 优先级
export type Priority = 'high' | 'medium' | 'low';

// 文件变更信息
export interface FileChange {
  filePath: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  diff?: string;
  content?: string;
  size: number;
}

// Git提交信息
export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: FileChange[];
}

// 配置选项
export interface Config {
  ai: AIConfig;
  analysis: AnalysisConfig;
  output: OutputConfig;
  web: WebConfig;
}

// AI配置
export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

// 分析配置
export interface AnalysisConfig {
  maxFileSize: number;
  maxFilesPerAnalysis: number;
  timeout: number;
  includePatterns: string[];
  excludePatterns: string[];
  customRules: CustomRule[];
}

// 输出配置
export interface OutputConfig {
  format: OutputFormat;
  directory: string;
  filename?: string;
  includeSummary: boolean;
  includeDetails: boolean;
  groupByFile: boolean;
}

// Web配置
export interface WebConfig {
  host: string;
  port: number;
  debug: boolean;
  cors: boolean;
}

// 自定义规则
export interface CustomRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: Severity;
  enabled: boolean;
}

// 输出格式
export type OutputFormat = 'markdown' | 'console' | 'json' | 'html';

// 分析请求
export interface AnalysisRequest {
  files: FileChange[];
  config: Config;
  commitInfo?: CommitInfo;
}

// 分析响应
export interface AnalysisResponse {
  results: CodeAnalysisResult[];
  summary: AnalysisSummary;
  metadata: {
    timestamp: Date;
    version: string;
    provider: AIProvider;
    processingTime: number;
  };
}

// Web API响应
export interface WebAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 实时分析状态
export interface AnalysisStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentFile?: string;
  results?: AnalysisResponse;
  error?: string;
  startTime: Date;
  endTime?: Date;
}
