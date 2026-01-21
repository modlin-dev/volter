# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Volter team and community take all security vulnerabilities seriously. Thank you for improving the security of our project.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues, discussions, or other public channels.**

Instead, please send an email to: **security@modlin.dev**

When reporting a vulnerability, please include:
- A clear description of the vulnerability
- Steps to reproduce the vulnerability
- Any potential impact or exploit scenarios
- Your name (optional - we give credit for responsible disclosure)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Detailed Response**: Within 7 days
- **Patch Release**: Within 30 days (depending on severity)
- **Public Disclosure**: After patch is released (with your permission, we'll credit you)

### Security Best Practices

We recommend following these security best practices when using Volter:

1. **Keep dependencies updated** - Regularly update to the latest version
2. **Use secure session storage** - Ensure Redis is properly secured with authentication
3. **Environment variables** - Store sensitive data in environment variables, not in code
4. **HTTPS only** - Always use HTTPS in production environments
5. **Session rotation** - Enable session rotation to prevent session fixation attacks
6. **Rate limiting** - Implement rate limiting for authentication endpoints

### Security Features

Volter includes several built-in security features:

- **AES-GCM encryption** for sensitive data
- **Secure random token generation** using `crypto.getRandomValues()`
- **Session rotation** to prevent session hijacking
- **PIN-based email verification** with rate limiting
- **Input validation** using Zod schemas
- **Structured error handling** to prevent information leakage

### Dependency Security

We regularly audit and update dependencies. To check for security vulnerabilities in your dependencies:

```bash
bun audit
```

For more information about our security practices, see our [README](./README.md#security).