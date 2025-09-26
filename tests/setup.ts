// Jest setup file
import 'dotenv/config';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables for testing
process.env['DEEPSEEK_API_KEY'] = 'test-deepseek-key';
process.env['OPENAI_API_KEY'] = 'test-openai-key';
process.env['MOONSHOT_API_KEY'] = 'test-moonshot-key';
process.env['DEFAULT_AI_PROVIDER'] = 'mock';
