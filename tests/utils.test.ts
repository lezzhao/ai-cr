import {
  formatFileSize,
  formatTime,
  generateId,
  isCodeFile,
  getFileLanguage,
  truncateString
} from '../src/utils';

describe('Utils', () => {
  test('formatFileSize should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(500)).toBe('500.0 B');
  });

  test('formatTime should format milliseconds correctly', () => {
    expect(formatTime(500)).toBe('500ms');
    expect(formatTime(1500)).toBe('1.5s');
    expect(formatTime(65000)).toBe('1m 5s');
  });

  test('generateId should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^\d+_[a-z0-9]+$/);
  });

  test('isCodeFile should identify code files correctly', () => {
    expect(isCodeFile('test.js')).toBe(true);
    expect(isCodeFile('test.ts')).toBe(true);
    expect(isCodeFile('test.py')).toBe(true);
    expect(isCodeFile('test.txt')).toBe(false);
    expect(isCodeFile('test.jpg')).toBe(false);
  });

  test('getFileLanguage should return correct language', () => {
    expect(getFileLanguage('test.js')).toBe('javascript');
    expect(getFileLanguage('test.ts')).toBe('typescript');
    expect(getFileLanguage('test.py')).toBe('python');
    expect(getFileLanguage('test.txt')).toBe('text');
  });

  test('truncateString should truncate long strings', () => {
    const longString = 'This is a very long string that should be truncated';
    const truncated = truncateString(longString, 20);
    
    expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    expect(truncated).toEndWith('...');
  });
});
