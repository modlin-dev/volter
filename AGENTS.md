# AGENTS.md - Volter Package Guidelines

This file contains guidelines and commands for agentic coding agents working in the Volter package repository.

## Build & Development Commands

### Core Commands
- `bun test` - Run all tests
- `bun build ./src/**.ts --outdir ./dist --target bun --minify && tsc --declarationMap false` - Build the package
- `biome lint ./src --apply` - Lint and auto-fix code issues
- `biome format ./src --write` - Format code according to project style

### Running Single Tests
Currently no test files exist in the project. When tests are added, use:
- `bun test <test-file-name>` - Run specific test file
- `bun test --grep <pattern>` - Run tests matching pattern

## Project Structure

```
volter/
├── src/
│   ├── index.ts      # Main export file
│   ├── utils.ts      # Utility functions and helpers
│   ├── error.ts      # Error handling classes and enums
│   ├── crypto.ts     # Cryptographic functions
│   └── sessions.ts   # Session management and email verification
├── dist/             # Built JavaScript files
├── types/            # TypeScript declaration files
└── package.json      # Package configuration
```

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled
- ESNext target with DOM libraries
- ES modules with bundler resolution
- Declarations emitted to `types/` directory
- No unchecked indexed access

### Import Style
- Use default imports for external packages: `import ansi from "ansi-colors"`
- Use named imports for internal modules: `import { hash } from "./crypto"`
- Keep imports at the top of files
- Group external imports first, then internal imports

### Naming Conventions
- **Classes**: PascalCase (e.g., `Session`, `ServerError`)
- **Functions/Methods**: camelCase (e.g., `createRandom`, `validate`)
- **Variables**: camelCase (e.g., `userId`, `expires`)
- **Constants**: UPPER_SNAKE_CASE for enums and exported constants (e.g., `ErrorCodes`)
- **Interfaces**: PascalCase with descriptive names (e.g., `SessionOptions`, `CipherText`)

### Error Handling
- Use custom `ServerError` class for application errors
- Include error codes from `ErrorCodes` enum
- Provide context with `at` property for stack traces
- Use Zod for validation errors (`ValidationError`)
- Throw errors with descriptive messages

### Function Patterns
- Use async/await for asynchronous operations
- Return promises from async functions
- Use optional parameters with defaults: `createRandom(length = 32)`
- Export utility functions individually
- Use factory functions for object creation

### Type Safety
- Use TypeScript interfaces for object shapes
- Leverage Zod schemas for runtime validation
- Use proper return types for functions
- Import types with `type` keyword when possible: `import type { RedisClient } from "bun"`

### Code Organization
- Keep related functionality in separate files
- Use barrel exports in `index.ts` for public API
- Add JSDoc comments for complex functions
- Use consistent indentation (Biome will handle this)

### Security Best Practices
- Use `crypto.getRandomValues()` for secure random generation
- Implement proper key management in crypto functions
- Hash sensitive data before storage
- Use secure algorithms (AES-GCM, ECDSA, SHA-256)

### Dependencies
- **Runtime**: Bun (JavaScript runtime)
- **Linting/Formatting**: Biome
- **Type Checking**: TypeScript
- **External Libraries**: 
  - `zod` for validation
  - `@paralleldrive/cuid2` for ID generation
  - `ansi-colors` for console output
  - `drizzle-orm` for database operations
  - `resend` for email sending

## Testing Guidelines

When adding tests:
- Use Bun test runner
- Place test files alongside source files or in `test/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies (Redis, email services)

## Build Process

The build process involves:
1. Bun compiles TypeScript to JavaScript in `dist/`
2. TypeScript generates declaration files in `types/`
3. Output is minified for production
4. ES modules are generated for modern bundlers

## Global Declarations

The project extends the global `Request` interface to include:
```typescript
declare global {
  interface Request {
    ip: Bun.SocketAddress
  }
}
```

## Session Management

The `Sessions` class provides:
- Redis-backed session storage
- Token-based authentication
- Session rotation and revocation
- User session listing
- Fallback session cleanup

## Email Verification

The `e1T` class handles:
- PIN-based email verification
- Rate limiting with attempt tracking
- Email sending via Resend
- Customizable email templates