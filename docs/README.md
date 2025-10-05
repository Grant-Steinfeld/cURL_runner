# cURL Runner Documentation

This directory contains all documentation for the cURL Runner project, organized by topic and purpose.

## 📚 Documentation Index

### **Architecture & Design**
- **[Separation of Concerns](SEPARATION_OF_CONCERNS.md)** - Details about the modular architecture and separation of concerns implementation
- **[Test Mocking Update](TEST_MOCKING_UPDATE.md)** - Comprehensive guide to the test mocking improvements and utility class testing

### **Development History**
- **[Jest Configuration for ES Modules](HowJestNeededToBeConfiguredForESModules.md)** - Historical documentation of the Jest to Node.js test runner migration and ES modules challenges

### **System Requirements**
- **[Node.js Version Requirements](NODE_VERSION_REQUIREMENTS.md)** - Detailed analysis of Node.js version compatibility and feature requirements

## 🏗️ Project Structure

```
cURL_runner/
├── docs/                   # 📚 This documentation directory
│   ├── README.md          # This index file
│   ├── SEPARATION_OF_CONCERNS.md
│   ├── TEST_MOCKING_UPDATE.md
│   └── HowJestNeededToBeConfiguredForESModules.md
├── src/                   # Source code
│   ├── cli/              # CLI handling
│   ├── config/           # Configuration
│   ├── lib/              # Core business logic
│   └── utils/            # Utility classes
├── tests/                # Test files
├── scripts/              # cURL scripts
└── README.md             # Main project README
```

## 🎯 Quick Reference

### **For Developers**
- Start with [Separation of Concerns](SEPARATION_OF_CONCERNS.md) to understand the architecture
- Review [Test Mocking Update](TEST_MOCKING_UPDATE.md) for testing strategies
- Check [Jest Configuration](HowJestNeededToBeConfiguredForESModules.md) for historical context

### **For Contributors**
- All documentation is maintained in this `docs/` directory
- Keep documentation up-to-date with code changes
- Use clear, descriptive filenames for new documentation

## 📝 Adding New Documentation

When adding new documentation:

1. **Place files in this `docs/` directory**
2. **Update this README.md** to include the new file
3. **Use descriptive filenames** (e.g., `FEATURE_NAME.md`)
4. **Follow the existing format** for consistency

## 🔗 Related Links

- [Main Project README](../README.md) - Project overview and usage
- [Package.json](../package.json) - Project configuration and scripts
- [Source Code](../src/) - Application source code
- [Tests](../tests/) - Test files and examples