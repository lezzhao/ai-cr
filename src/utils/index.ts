import { readFileSync, existsSync } from 'fs';

/**
 * 读取文件内容
 */
export function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * 检查文件是否存在
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? (parts[parts.length - 1] || '').toLowerCase() : '';
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 格式化时间
 */
export function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度合并对象
 */
export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 截断字符串
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 转义HTML
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)] || '#000000';
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
}

/**
 * 检查是否为支持的代码文件
 */
export function isCodeFile(filePath: string): boolean {
  const codeExtensions = [
    'js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'h',
    'cs', 'php', 'rb', 'swift', 'kt', 'scala', 'sh', 'bash', 'zsh', 'fish',
    'sql', 'html', 'css', 'scss', 'sass', 'less', 'json', 'yaml', 'yml',
    'xml', 'md', 'rst', 'tex', 'r', 'm', 'pl', 'pm', 'lua', 'dart'
  ];
  
  const extension = getFileExtension(filePath);
  return codeExtensions.includes(extension);
}

/**
 * 获取文件语言类型
 */
export function getFileLanguage(filePath: string): string {
  const extension = getFileExtension(filePath);
  
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'vue': 'vue',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'fish',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'rst': 'rst',
    'tex': 'latex',
    'r': 'r',
    'm': 'matlab',
    'pl': 'perl',
    'pm': 'perl',
    'lua': 'lua',
    'dart': 'dart'
  };
  
  return languageMap[extension] || 'text';
}
