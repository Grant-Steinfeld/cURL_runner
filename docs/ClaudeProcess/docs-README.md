# Documentation

This directory contains comprehensive documentation for the cURL Runner project.

## 📚 Available Documentation

### Core Documentation
- **[Separation of Concerns](SEPARATION_OF_CONCERNS.md)** - Modular architecture implementation
- **[Test Mocking Update](TEST_MOCKING_UPDATE.md)** - Testing strategies and utility class testing
- **[Node.js Compatibility Analysis](NODE_COMPATIBILITY_ANALYSIS.md)** - Visual analysis with Mermaid diagrams
- **[Jest Migration History](HowJestNeededToBeConfiguredForESModules.md)** - Historical context of the Jest to Node.js test runner migration

### AI-Assisted Development Process
- **[ClaudeProcess/](ClaudeProcess/)** - Documentation created during AI-assisted development with Cursor and Claude Sonnet 4
  - `lib-README.md` - Original library documentation
  - `lib-examples-README.md` - Comprehensive examples documentation
  - `docs-README.md` - This documentation index

## 🎯 Project Overview

The cURL Runner is a Node.js application that executes cURL scripts from standalone `.sh` files with advanced parallel execution capabilities. The project demonstrates:

- **Modern JavaScript**: ES modules with Node.js built-in test runner
- **AI-Assisted Development**: Created with Cursor and Claude Sonnet 4 LLM
- **Parallel Execution**: 86.3% performance improvement over sequential execution
- **Zero Dependencies**: Maximum security and reliability
- **Comprehensive Testing**: Full test coverage with edge case handling
- **Production Ready**: NPM package with TypeScript support

## 🚀 Key Features

- **Sequential Execution**: Original reliable execution method
- **Parallel Execution**: Unlimited concurrency for maximum speed
- **Controlled Concurrency**: Batch processing with configurable limits
- **Custom Concurrency**: Fine-tuned control over specific scenarios
- **Comprehensive Logging**: Detailed execution logs and monitoring
- **Error Handling**: HTTP error detection and categorization
- **CLI Interface**: Command-line tools for all execution methods
- **NPM Package**: `curl-runner-core` available for programmatic use

## 📖 Getting Started

1. **Installation**: `npm install` (for CLI) or `npm install curl-runner-core` (for library)
2. **Basic Usage**: `npm start` or `node index.js run`
3. **Parallel Execution**: `node index.js run-parallel`
4. **Documentation**: Explore the files in this directory for detailed information

## 🔗 Related Resources

- **GitHub Repository**: https://github.com/Grant-Steinfeld/cURL_runner
- **NPM Package**: https://www.npmjs.com/package/curl-runner-core
- **Main README**: [../README.md](../README.md)

This documentation provides comprehensive information about the project's architecture, development process, and usage patterns.
