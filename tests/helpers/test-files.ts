import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

export async function createTestFiles(): Promise<void> {
  const testDir = './test-files';
  
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }

  // 创建测试JavaScript文件
  const jsCode = `
// 测试JavaScript文件
function calculateSum(a, b) {
  // 缺少参数验证
  return a + b;
}

function processData(data) {
  console.log("Processing data:", data);
  var result = [];
  
  for (var i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      result.push(data[i] * 2);
    }
  }
  
  return result;
}

// 未使用的变量
var unusedVariable = "This is not used";

// 缺少错误处理
function riskyOperation() {
  return JSON.parse("invalid json");
}
`;

  // 创建测试TypeScript文件
  const tsCode = `
// 测试TypeScript文件
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];

  // 缺少访问修饰符
  addUser(user: User): void {
    this.users.push(user);
  }

  // 缺少返回类型
  findUser(id: number) {
    return this.users.find(user => user.id === id);
  }

  // 缺少错误处理
  deleteUser(id: number): void {
    const index = this.users.findIndex(user => user.id === id);
    this.users.splice(index, 1);
  }
}

// 导出未使用的接口
interface UnusedInterface {
  value: string;
}

export { UserService };
`;

  // 创建测试Python文件
  const pyCode = `
# 测试Python文件
import os
import sys

def calculate_fibonacci(n):
    # 缺少输入验证
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

def process_file(filename):
    # 缺少错误处理
    with open(filename, 'r') as f:
        content = f.read()
    return content.upper()

# 全局变量
GLOBAL_VAR = "This is a global variable"

# 未使用的导入
import json

class DataProcessor:
    def __init__(self):
        self.data = []
    
    def add_data(self, item):
        # 缺少类型提示
        self.data.append(item)
    
    def get_data(self):
        return self.data
`;

  writeFileSync(join(testDir, 'test.js'), jsCode);
  writeFileSync(join(testDir, 'test.ts'), tsCode);
  writeFileSync(join(testDir, 'test.py'), pyCode);
}

export async function cleanupTestFiles(): Promise<void> {
  const testDir = './test-files';
  const testReportsDir = './test-reports';
  
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true });
  }
  
  if (existsSync(testReportsDir)) {
    rmSync(testReportsDir, { recursive: true, force: true });
  }
}
