<img src="/public/cover.png" alt="Volter" />

# Volter

Secure, lightweight session management and authentication library for modern JavaScript applications. Built with Bun runtime optimization, it provides Redis-backed session storage, email verification, encryption utilities, and structured error handling.

## Features

- **Session Management** - Redis-backed sessions with secure token validation
- **Email Verification** - PIN-based verification with Resend integration
- **Cryptography** - AES-GCM encryption, RSA key pairs, ECDSA signatures
- **Security Utilities** - Secure ID generation, hashing, and validation
- **Error Handling** - Structured error codes and custom error classes
- **TypeScript Support** - Full type definitions included
- **Bun Optimized** - Leverages Bun's built-in Redis and crypto APIs

## Installation

```bash
npm install volter
```
```bash
bun add volter
```

### Required Dependencies

- **Redis Server** - For session storage
- **Resend API Key** - For email verification (optional)
- **Bun Runtime** - Recommended for optimal performance
- **Node.js** - Also supported (v18+)

## Quick Start

```typescript
import { Sessions } from "volter";

// Initialize sessions with Redis
const sessions = new Sessions({
  expiry: 2592000, // 30 days in seconds
});

// Create session for user
const session = await sessions.create("user-123");
console.log("Session token:", session.token);

// Validate session
const userId = await sessions.validate(session.token);
console.log("User ID:", userId); // 'user-123'
```

## API Overview

### Sessions Class

Complete session lifecycle management with Redis backend.

```typescript
import { RedisClient } from "bun"
import { Sessions } from "volter";

const redis = new RedisClient(Bun.env.REDIS_URL)

const sessions = new Sessions({
    store: redis, // Optional, defaults to Bun.redis
    expiry: 2592000, // 30 days in seconds
    createID: crypto.randomUUID, // Optional custom ID generator
});

// Create new session
const session = await sessions.create("user-id");

// Validate session token
const userId = await sessions.validate(token);

// Get session details
const details = await sessions.get(token);

// List all user sessions
const userSessions = await sessions.list("user-id");

// Revoke session
await sessions.revoke(token);
```

### Email Verification (e1T)

PIN-based email verification with Resend integration.

```typescript
import { e1T } from "volter";
import { Resend } from "resend";

const e1t = new e1T({
    resend: new Resend("re_xxxxxxxxx"),
    expiry: 300, // 5 minutes
    attempts: 5, // Max verification attempts
    template: (email, code) => ({
        from: "noreply@app.dev",
        to: email,
        subject: `${code}: is your verification code.`,
        text: `Enter ${code} to verify your email. For your security, do not share.`,
    }),
});

// Send verification code
const result = await e1t.send("user@app.dev");
console.log("Verification code:", result.code);

// Verify code
const isValid = await e1t.verify("user@app.dev", "855 004");
```

### Cryptography Utilities

Secure encryption, signing, and key management.

```typescript
import {
  cipher,
  decipher,
  sign,
  verifySign,
  generateECDSAKeyPair,
  hash,
} from "volter";

// AES-GCM encryption
const encrypted = await cipher("secret data", "encryption-key");
const decrypted = await decipher(encrypted, "encryption-key");

// Digital signatures
const keyPair = await generateECDSAKeyPair();
const signature = await sign("message to sign", keyPair.privateKey);
const isValid = await verifySign(
  "message to sign",
  signature,
  keyPair.publicKey,
);

// Secure hashing
const hashed = hash("password", "salt");
```

### Error Handling

Structured error codes and custom error classes.

```typescript
import { ServerError, ErrorCodes, ValidationError } from "volter";

// Custom server error
throw new ServerError("User not found", {
  code: ErrorCodes.RESOURCE_NOT_FOUND,
  at: ["UserService", "getUserById"],
});

// Validation with Zod
import { z } from "zod";
const schema = z.string().email();
try {
  schema.parse("invalid-email");
} catch (error) {
  throw new ValidationError("Invalid email format");
}
```

## Configuration

### Redis Setup

```typescript
// Using default Bun Redis
const sessions = new Sessions();

// Using custom Redis client
const sessions = new Sessions({
  store: new RedisClient({
    host: "localhost",
    port: 6379,
    password: "your-password",
  }),
});
```

### Resend Email Setup

```typescript
import { Resend } from "resend";

const emailVerify = new e1T({
  resend: new Resend(process.env.RESEND_API_KEY),
  template: (email, code) => ({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Verify your account - Code: ${code}`,
    html: `<h1>Your verification code is: <strong>${code}</strong></h1>`,
  }),
});
```

## Security Best Practices

- Always use HTTPS in production
- Store sensitive keys in environment variables
- Set appropriate session expiry times
- Implement rate limiting for verification attempts
- Use secure, random session tokens
- Regularly rotate encryption keys

## TypeScript Support

Volter includes full TypeScript definitions:

```typescript
import {
  Sessions,
  Session,
  SessionPayload,
  e1T,
  ServerError,
  ErrorCodes,
} from "volter";

// Full type safety and IntelliSense support
const sessions: Sessions = new Sessions();
const session: Session = await sessions.get(token);
```

## Examples

### Web Server Integration

```typescript
import { Sessions } from "volter";

const sessions = new Sessions();

// Middleware for session validation
export async function requireAuth(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token)
    throw new ServerError("No token provided", {
      code: ErrorCodes.AUTHENTICATION_FAILED,
    });

  const userId = await sessions.validate(token);
  if (!userId)
    throw new ServerError("Invalid token", { code: ErrorCodes.INVALID_TOKEN });

  return userId;
}
```

### Complete Auth Flow

```typescript
import { Sessions, e1T } from "volter";

const sessions = new Sessions();
const emailVerify = new e1T();

// 1. Send verification code
await emailVerify.send(email);

// 2. Verify email and create session
const isValid = await emailVerify.verify(email, code);
if (isValid) {
  const session = await sessions.create(userId);
  return { token: session.token };
}
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/volter.git
cd volter

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build
```

## License

The Modlin Distributable License (MDL) © [Modlin](https://modlin.dev) - See [LICENSE](LICENSE) file for details

## Support

- [Documentation](https://modlin.dev/volter/docs)
- [Issue Tracker](https://github.com/modlin-dev/volter/issues)
- [Email Support](mailto:volter@modlin.dev)
