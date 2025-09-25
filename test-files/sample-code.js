// 示例代码文件 - 用于测试AI代码审查
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

// 使用var而不是let/const
var globalVar = "should use const";

// 缺少JSDoc注释
function undocumentedFunction(param) {
  return param * 2;
}

// 潜在的安全问题
function unsafeEval(code) {
  return eval(code);
}

// 性能问题 - 在循环中创建函数
function createFunctions() {
  var functions = [];
  for (var i = 0; i < 1000; i++) {
    functions.push(function() {
      return i; // 闭包问题
    });
  }
  return functions;
}
