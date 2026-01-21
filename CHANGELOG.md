# Changelog

All notable changes to Volter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release preparation

## [1.0.0] - 2025-01-12

**Note**: This release marks the transition from version 0.0.174 to stable 1.0.0 with API stability guarantees.

### Added
- **Core Features**
  - Secure session management with Redis backend
  - Email verification with PIN-based system
  - Cryptographic utilities (AES-GCM encryption, ECDSA signatures)
  - Structured error handling with custom `ServerError` class
  - Secure random token and ID generation

- **Session Management**
  - Redis-backed session storage with configurable TTL
  - Session rotation for security
  - Session revocation and cleanup
  - User session listing functionality
  - Fallback session cleanup mechanisms

- **Email Verification**
  - PIN-based email verification system
  - Rate limiting and attempt tracking
  - Configurable PIN expiration
  - Email sending via Resend service
  - Customizable email templates

- **Security Features**
  - AES-GCM encryption for sensitive data
  - ECDSA digital signatures
  - SHA-256 hashing utilities
  - Secure random generation using Web Crypto API
  - Input validation with Zod schemas

- **Developer Experience**
  - TypeScript support with strict mode
  - Comprehensive error codes
  - Detailed documentation and examples
  - Built-in logging and debugging support
  - Biome for code formatting and linting

- **Integrations**
  - Redis client with connection pooling
  - Drizzle ORM for database operations
  - Resend for email delivery
  - CUID2 for secure ID generation

### Dependencies
- Bun runtime (JavaScript engine)
- zod for schema validation
- @paralleldrive/cuid2 for ID generation
- ansi-colors for console output
- drizzle-orm for database operations
- resend for email sending

### Documentation
- Comprehensive README with installation and usage guides
- API documentation with examples
- Security best practices
- Contributing guidelines
- Code of conduct

## [0.9.0] - 2025-01-05 (Beta)

### Added
- Beta release of core session management
- Basic Redis integration
- Initial email verification system
- Crypto utilities implementation

### Known Issues
- Limited error handling
- Beta performance optimizations needed
- Documentation incomplete

---

## Version Legend

- **Major** (X.0.0) - Breaking changes, major new features
- **Minor** (0.X.0) - New features, improvements
- **Patch** (0.0.X) - Bug fixes, security patches, documentation updates

## Migration Guides

### From 0.9.x to 1.0.0

No breaking changes from beta to stable release. Simply update:

```bash
bun update volter@latest
```

### Breaking Changes

As this is the initial stable release, there are no breaking changes from previous versions. Future breaking changes will be clearly documented with migration guides.

## Security Updates

Security updates will be released as patch versions and marked clearly in the changelog. Always upgrade to the latest patch version for security fixes.

## Support End of Life

- **0.9.x** - Support ended 2025-02-01
- **1.0.x** - Current stable version

For support and upgrade assistance, see our [Support Policy](./SUPPORT.md).