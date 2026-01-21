# Support

## Getting Help

We're here to help you succeed with Volter. Here are the best ways to get support:

### 📚 Documentation

- **[Main Documentation](./README.md)** - Features, installation, and basic usage
- **[API Reference](./AGENTS.md)** - For developers contributing to Volter
- **[Examples](./examples/)** - Practical implementation examples (coming soon)

### 🤝 Community Support

#### GitHub Discussions
- **[Questions & General Discussion](https://github.com/modlin-org/volter/discussions/categories/q-a)** - Ask questions, share your experiences
- **[Show & Tell](https://github.com/modlin-org/volter/discussions/categories/show-and-tell)** - Share what you've built with Volter
- **[Ideas & Feature Requests](https://github.com/modlin-org/volter/discussions/categories/ideas)** - Suggest new features or improvements

#### GitHub Issues
- **[Bug Reports](https://github.com/modlin-org/volter/issues/new?template=bug_report.yml)** - Report bugs or unexpected behavior
- **[Feature Requests](https://github.com/modlin-org/volter/issues/new?template=feature_request.yml)** - Request new features
- **[Security Issues](./SECURITY.md)** - Report security vulnerabilities (private)

### 💬 Professional Support

For enterprise users requiring priority support:

- **Email**: support@modlin.dev
- **Response Time**: Within 24 hours during business days
- **Services**: Bug fixes, feature prioritization, architectural guidance

### 🐛 Troubleshooting Common Issues

#### Installation Problems
```bash
# Clear cache and reinstall
bun cache clear
bun install
```

#### Redis Connection Issues
- Ensure Redis is running: `redis-server`
- Check connection string format: `redis://localhost:6379`
- Verify network connectivity to Redis server

#### Session Issues
- Check session expiration settings
- Verify Redis key persistence
- Ensure session middleware is properly configured

### 📈 Contributing

Want to contribute? See our [Contributing Guide](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Pull request process
- Testing requirements

### 📋 Bug Report Template

When filing a bug report, please include:

1. **Volter version**
2. **Node/Bun version**
3. **Operating system**
4. **Steps to reproduce**
5. **Expected behavior**
6. **Actual behavior**
7. **Error messages/stack traces**
8. **Minimal reproduction case** (if possible)

### 🔄 Release Schedule

- **Major releases**: Every 3-4 months
- **Minor releases**: Every 4-6 weeks
- **Patch releases**: As needed for bug fixes
- **Security patches**: Immediately as needed

Follow our [Changelog](./CHANGELOG.md) for release announcements and details.

### 📞 Contact

- **General Inquiries**: hello@modlin.dev
- **Security Issues**: security@modlin.dev
- **Business/Enterprise**: business@modlin.dev
- **Website**: [modlin.dev](https://modlin.dev)

---

**Note**: Community support is provided on a best-effort basis by volunteers. For guaranteed response times and SLAs, consider professional support options.