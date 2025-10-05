# Separation of Concerns Architecture

## Overview

This document outlines the separation of concerns architecture implemented in the cURL Runner application. The codebase has been restructured to separate core application logic from testing logic, improving maintainability, testability, and code organization.

## Directory Structure

```
cURL_runner/
├── src/                          # Core application logic
│   ├── lib/                      # Core business logic
│   │   └── CurlRunner.js         # Main application class
│   ├── cli/                      # CLI interface logic
│   │   ├── commands.js           # Commander.js command definitions
│   │   └── handler.js            # CLI execution handler
│   ├── utils/                    # Utility functions
│   │   ├── logger.js             # Logging utilities
│   │   ├── parser.js             # cURL output parsing
│   │   └── fileSystem.js         # File system operations
│   └── config/                   # Configuration management
│       └── defaults.js           # Default configuration values
├── tests/                        # Testing logic
│   ├── unit/                     # Unit tests
│   │   ├── lib/                  # Tests for core business logic
│   │   └── utils/                # Tests for utility functions
│   ├── integration/              # Integration tests
│   │   └── cli/                  # Tests for CLI integration
│   └── e2e/                      # End-to-end tests
│       └── App.test.js           # Full application tests
├── index.js                      # Simple entry point
└── package.json                  # Updated with granular test scripts
```

## Key Principles

### 1. Single Responsibility Principle
Each module has a single, well-defined responsibility:
- **CurlRunner**: Core business logic for script execution
- **Logger**: Logging operations and file management
- **CurlParser**: cURL output parsing and analysis
- **FileSystem**: File system operations and directory management
- **CLI Commands**: Command-line interface definitions
- **Configuration**: Centralized configuration management

### 2. Dependency Injection
The CurlRunner class now uses dependency injection through utility classes:
```javascript
export class CurlRunner {
  constructor(scriptsDir = DEFAULT_CONFIG.SCRIPTS_DIR, logsDir = DEFAULT_CONFIG.LOGS_DIR) {
    this.scriptsDir = scriptsDir;
    this.logsDir = logsDir;
    this.logger = new Logger(logsDir);  // Dependency injection
    this.ensureLogsDirectory();
  }
}
```

### 3. Separation of Concerns
- **Core Logic**: Isolated in `src/lib/`
- **CLI Interface**: Separated into `src/cli/`
- **Utilities**: Reusable functions in `src/utils/`
- **Configuration**: Centralized in `src/config/`
- **Testing**: Organized by test type in `tests/`

## Benefits

### 1. Improved Maintainability
- Clear separation between different concerns
- Easier to locate and modify specific functionality
- Reduced coupling between modules

### 2. Enhanced Testability
- Unit tests can focus on individual modules
- Integration tests can test module interactions
- E2E tests can verify complete workflows
- Granular test scripts for different test types

### 3. Better Code Organization
- Logical grouping of related functionality
- Clear module boundaries
- Easier to understand codebase structure

### 4. Reusability
- Utility functions can be reused across modules
- Configuration can be shared and centralized
- CLI commands can be easily extended

## Test Structure

### Unit Tests (`tests/unit/`)
- **lib/**: Tests for core business logic (CurlRunner)
- **utils/**: Tests for utility functions (Logger, Parser, FileSystem)

### Integration Tests (`tests/integration/`)
- **cli/**: Tests for CLI command integration

### End-to-End Tests (`tests/e2e/`)
- **App.test.js**: Full application workflow tests

## Test Scripts

```json
{
  "test": "node --test tests/**/*.test.js",
  "test:unit": "node --test tests/unit/**/*.test.js",
  "test:integration": "node --test tests/integration/**/*.test.js",
  "test:e2e": "node --test tests/e2e/**/*.test.js",
  "test:watch": "node --test --watch tests/**/*.test.js",
  "test:coverage": "c8 node --test tests/**/*.test.js"
}
```

## Configuration Management

All configuration is centralized in `src/config/defaults.js`:
- Directory paths
- Log file names
- Application settings
- HTTP status codes
- File patterns
- CLI options

## Backward Compatibility

The public API remains unchanged:
- `index.js` still exports the CurlRunner class
- CLI commands work exactly the same
- All existing functionality is preserved

## Future Enhancements

This architecture enables:
- Easy addition of new CLI commands
- Simple extension of utility functions
- Straightforward configuration changes
- Modular testing strategies
- Clean separation of concerns for new features

## Migration Notes

- All imports have been updated to use the new module structure
- Tests have been reorganized but maintain the same functionality
- The main entry point (`index.js`) is now a simple delegator
- Core functionality remains unchanged for end users