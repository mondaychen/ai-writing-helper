# AI Writing Helper

A powerful Chrome/Firefox extension that helps you write better with AI assistance.

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![](https://img.shields.io/badge/Chrome%20Extension-MV3-yellow?style=flat-square&logo=googlechrome)
![](https://img.shields.io/badge/Firefox-Compatible-orange?style=flat-square&logo=firefox)

## Features

- ✨ **AI-Powered Writing Assistance** - Get intelligent suggestions to improve your writing (with LLM of your choice)
- 📝 **Real-time Enhancement** - Works on any website with text input
- 🌐 **Cross-browser Support** - Compatible with Chrome and Firefox
- 🔧 **Flexible UX** - Side panel or dialog mode, with customizable settings

## Installation

### From Chrome Web Store
*Coming soon - extension is currently in development*

### Manual Installation (Development)

1. Clone this repository: `git clone https://github.com/mondaychen/ai-writing-helper.git`
2. Install dependencies: `pnpm install` (install pnpm first if needed: `npm install -g pnpm`)
3. Build the extension: `pnpm build`
4. Open Chrome and go to `chrome://extensions`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder

#### For Firefox:

1. Follow steps 1-2 above
2. Build for Firefox: `pnpm build:firefox`
3. Open Firefox and go to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from the `dist` folder

> **Note:** Firefox extensions loaded this way are temporary and will be removed when you close the browser.

## Development

### Prerequisites

- Node.js >= 22.15.1
- pnpm >= 10.11.0

### Getting Started

```bash
# Clone the repository
git clone https://github.com/mondaychen/ai-writing-helper.git
cd ai-writing-helper

# Install dependencies
pnpm install

# Start development server for Chrome
pnpm dev

# Start development server for Firefox
pnpm dev:firefox
```

### Available Scripts

- `pnpm dev` - Start development server for Chrome
- `pnpm dev:firefox` - Start development server for Firefox  
- `pnpm build` - Build for production (Chrome)
- `pnpm build:firefox` - Build for production (Firefox)
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run linting
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm zip` - Build and package extension for distribution

## Project Architecture

Built using a modern monorepo structure with [Turborepo](https://turbo.build/) for efficient builds and development.

### Technologies

- **React 19** - Modern UI framework with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Turborepo** - Monorepo build orchestration
- **pnpm** - Fast, disk space efficient package manager

### Extension Structure

- **Popup** - Main interface accessible from the browser toolbar
- **Side Panel** - Extended UI panel for Chrome users
- **Content Scripts** - Injected functionality for web pages
- **Background Script** - Service worker for extension logic
- **Options Page** - Configuration and settings interface

### Notable Packages

- `packages/shared/` - Common utilities, hooks, and components
- `packages/storage/` - Chrome extension storage helpers with React hooks
- `packages/ui/` - Shared UI components with Tailwind integration

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### Development Guidelines

1. Follow the existing code style and conventions
2. Run `pnpm format`, `pnpm lint`, and `pnpm type-check` before committing
3. Write clear commit messages
4. Test your changes thoroughly

## Troubleshooting

### Hot Module Reload Issues

If the development server stops auto-reloading:

1. Restart the dev server: `Ctrl+C` then `pnpm dev`
2. Refresh the extension in Chrome: Go to `chrome://extensions` and click the refresh button (You always need to do this after making changes to background script)

### Build Issues

- Ensure Node.js version >= 22.15.1
- Clear build cache: `pnpm clean`
- Reinstall dependencies: `pnpm clean:install`

## Support

If you have any suggestions or questions, please feel free to open an issue.

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 💰 Sponsoring the author
