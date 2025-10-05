# Node.js Version Requirements

This document outlines the Node.js version requirements for the cURL Runner project.

## Current Status

- **Current Node.js Version**: v22.18.0
- **Package.json engines**: `>=14.0.0` (outdated)
- **Actual minimum required**: Node.js 18.0.0+

## Feature Analysis

### ✅ **ES Modules Support**
- **Minimum Version**: Node.js 12.0.0
- **Stable Support**: Node.js 14.0.0+
- **Current Usage**: `"type": "module"` in package.json
- **Features Used**: `import`/`export` syntax, ES module file extensions

### ✅ **Built-in Test Runner (`node:test`)**
- **Minimum Version**: Node.js 18.0.0
- **Stable Support**: Node.js 18.0.0+
- **Current Usage**: All test files use `import { describe, it, beforeEach, mock } from 'node:test'`
- **Features Used**: `describe`, `it`, `beforeEach`, `mock` functions

### ✅ **Built-in Assert Module (`node:assert`)**
- **Minimum Version**: Node.js 18.0.0
- **Stable Support**: Node.js 18.0.0+
- **Current Usage**: All test files use `import assert from 'node:assert'`
- **Features Used**: `assert.strictEqual`, `assert.deepStrictEqual`, `assert.ok`

### ✅ **Core Node.js APIs**
- **fs module**: Available since Node.js 0.1.0
- **path module**: Available since Node.js 0.1.0
- **child_process module**: Available since Node.js 0.1.0
- **process object**: Available since Node.js 0.1.0

### ✅ **Dependencies**
- **chalk**: ^5.3.0 (requires Node.js 16.0.0+)
- **commander**: ^11.1.0 (requires Node.js 16.0.0+)
- **c8**: ^10.1.3 (requires Node.js 16.0.0+)

## Version Requirements Summary

### **Minimum Supported Version: Node.js 18.0.0**

**Why Node.js 18.0.0 is the minimum:**
1. **Built-in Test Runner**: `node:test` was introduced in Node.js 18.0.0
2. **Built-in Assert Module**: `node:assert` was introduced in Node.js 18.0.0
3. **Dependencies**: chalk v5+ and commander v11+ require Node.js 16.0.0+, but we need 18.0.0+ for testing

### **Recommended Version: Node.js 18.0.0+ (LTS)**

**Why Node.js 18.0.0+ is recommended:**
1. **LTS Support**: Node.js 18.x is the current LTS version
2. **Stable Features**: All features are stable and well-tested
3. **Security**: Regular security updates and patches
4. **Performance**: Better performance and optimizations

### **Latest Compatible Version: Node.js 22.x (Current)**

**Why Node.js 22.x is fully compatible:**
1. **All Features Work**: Built-in test runner, ES modules, all dependencies
2. **Latest Performance**: Best performance and latest optimizations
3. **Future-Proof**: Latest features and improvements
4. **Active Development**: Regular updates and new features

## Testing Matrix

| Node.js Version | ES Modules | Built-in Test | Built-in Assert | Dependencies | Status |
|----------------|------------|---------------|-----------------|--------------|--------|
| 16.x           | ✅         | ❌            | ❌              | ✅           | ❌     |
| 17.x           | ✅         | ❌            | ❌              | ✅           | ❌     |
| 18.x           | ✅         | ✅            | ✅              | ✅           | ✅     |
| 19.x           | ✅         | ✅            | ✅              | ✅           | ✅     |
| 20.x           | ✅         | ✅            | ✅              | ✅           | ✅     |
| 21.x           | ✅         | ✅            | ✅              | ✅           | ✅     |
| 22.x           | ✅         | ✅            | ✅              | ✅           | ✅     |

## Package.json Update

The current `package.json` should be updated to reflect the actual requirements:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Installation Commands

### **Install Node.js 18.x (LTS)**
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Using official installer
# Download from https://nodejs.org/
```

### **Install Node.js 22.x (Latest)**
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Using official installer
# Download from https://nodejs.org/
```

## Verification

To verify your Node.js version supports all features:

```bash
# Check Node.js version
node --version

# Should output: v18.0.0 or higher
```

## Migration Notes

### **From Node.js 16.x or lower:**
1. **Upgrade Node.js** to 18.0.0 or higher
2. **Update package.json** engines field
3. **Test all functionality** to ensure compatibility

### **From Node.js 17.x:**
1. **Upgrade Node.js** to 18.0.0 or higher (17.x is not LTS)
2. **Update package.json** engines field
3. **Test all functionality** to ensure compatibility

## Conclusion

- **Minimum Version**: Node.js 18.0.0
- **Recommended Version**: Node.js 18.0.0+ (LTS)
- **Latest Compatible**: Node.js 22.x (Current)
- **Update Required**: package.json engines field needs updating

The project is designed to work with modern Node.js versions and takes advantage of the built-in test runner and ES modules support introduced in Node.js 18.0.0.