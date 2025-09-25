// 示例TypeScript文件 - 用于测试AI代码审查
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

  // 潜在的内存泄漏
  private listeners: Array<() => void> = [];
  
  addListener(callback: () => void): void {
    this.listeners.push(callback);
    // 缺少移除监听器的方法
  }
}

// 导出未使用的接口
interface UnusedInterface {
  value: string;
}

// 使用any类型
function processAnyData(data: any): any {
  return data.someProperty;
}

// 缺少null检查
function unsafeAccess(user: User | null): string {
  return user.name; // 可能为null
}

// 硬编码的魔法数字
function calculateTax(amount: number): number {
  return amount * 0.2; // 应该使用常量
}

export { UserService };
