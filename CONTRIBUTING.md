# Code Style Guidelines for Modlin

## Purpose & Scope

This document defines the official code style guidelines for this project. Its goal is to ensure consistency, readability, maintainability, and long-term sustainability of the codebase.

These guidelines apply to all contributors and all code written for this repository unless explicitly stated otherwise. When existing code conflicts with this guide, follow the guide for new code and refactor old code only when touching it.

## Principles

The following principles override individual rules:
- Readability is more important than cleverness
- Consistency is more important than personal preference
- Explicit code is preferred over implicit behavior
- Maintainability is prioritized over micro-optimizations
- Tooling should enforce style wherever possible

## Project & File Structure

## Naming (Naming Conventions)

Names must be only ASCII letters, digits, underscores, and the `$` sign. Don't use `-`.

- **Variables:** snake_case
    - Try using a single lowercase word e.g. `index`, `data`, `error`, and `result`.
- **Constants:** UPPER_SNAKE_CASE
    - Use only when something is not defined during runtime e.g. `TOKEN`, `PORT`, `DATABASE_URL`, and `VERSION`.
- **Functions:** snake_case
    - Try keeping it one worded that just describes what it does e.g. `hash` is used for hashing `string` to `SHA-256`.
- **Classes:** PascalCase
    - Preferably branded (`Resend`, `Volter`).
- **Methods:** camelCase
    - Keep it one word unless for events (`onError()`), checks (`isEnabled()`), or operations (`getUser()`).
    - When you experince a situation where the function checks if a string is an HTTP URL then do `isHTTP_URL()` instead of `isHTTPURL()`.
- **Types / Interfaces / Namespaces**: PascalCase
    - With clear names.
- **Comments:** Any
    - Only for documentation, not for explaining code.
