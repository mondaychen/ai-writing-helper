# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome/Firefox extension boilerplate built with React, TypeScript, Vite, and Turborepo. The project uses a monorepo structure with multiple packages and pages for different extension components.

## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server for Chrome
- `pnpm dev:firefox` - Start development server for Firefox  
- `pnpm build` - Build for production (Chrome)
- `pnpm build:firefox` - Build for production (Firefox)
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run Lint
- `pnpm lint:fix` - Fix Lint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm e2e` - Run end-to-end tests
- `pnpm zip` - Build and package extension for distribution

**Package Management:**
- `pnpm i <package> -w` - Install dependency at root level
- `pnpm i <package> -F <module-name>` - Install dependency for specific module

## Project Architecture

### Monorepo Structure
- **Root:** Main package.json with build orchestration via Turborepo
- **chrome-extension/:** Extension manifest and background scripts
- **pages/:** Extension UI components (popup, options, content scripts, etc.)
- **packages/:** Shared utilities and configurations
- **tests/:** End-to-end testing setup with WebdriverIO

### Key Pages
- `pages/popup/` - Extension popup UI
- `pages/options/` - Extension options page
- `pages/content/` - Content scripts for page injection
- `pages/content-ui/` - React components injected into pages
- `pages/content-runtime/` - Runtime content scripts
- `pages/side-panel/` - Chrome side panel

### Key Packages
- `packages/shared/` - Common utilities, hooks, HOCs, and types
- `packages/storage/` - Chrome extension storage helpers
- `packages/i18n/` - Internationalization utilities
- `packages/ui/` - Shared UI components with Tailwind integration
- `packages/hmr/` - Hot module reload for development
- `packages/env/` - Environment variable management

### Extension Architecture
- **Manifest V3** with service worker background script
- **Content Scripts:** Injected into web pages with multiple match patterns
- **Storage:** Chrome extension storage API with React hooks
- **Permissions:** Configured for `<all_urls>` with storage, scripting, tabs, notifications, and sidePanel
- **I18n Support:** Built-in internationalization with message files

## Development Workflow

**After making changes, ALWAYS run:**
1. `pnpm format` - Format code with Prettier
2. `pnpm lint` - Check for linting issues
3. `pnpm type-check` - Verify TypeScript types

**Before committing:**
- All three commands above must pass without errors
- Use `pnpm lint:fix` to automatically fix linting issues when possible
- If the user asks to test your changes, run `pnpm build`

## Development Notes

- Uses **pnpm** as package manager with workspaces
- **Turborepo** orchestrates builds across all packages
- **Vite** for fast development and building
- **TypeScript** with strict configuration
- **TailwindCSS** for styling with shared config
- **OxLint + Prettier** for code quality with lint-staged pre-commit hooks
- Environment variables prefixed with `CEB_*` or `CLI_CEB_*`
- Hot module reload works in development mode
