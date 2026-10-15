[![React Native](https://img.shields.io/badge/React%20Native-TypeScript-7F77DD?style=flat)](https://reactnative.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-1D9E75?logo=typescript&logoColor=white&style=flat)](https://typescriptlang.org) [![CI](https://img.shields.io/github/actions/workflow/status/Syzygy-Hub/syzygy-base-rn/ci.yml?label=ci&style=flat)](https://github.com/Syzygy-Hub/syzygy-base-rn/actions/workflows/ci.yml) [![Version](https://img.shields.io/badge/version-3.0.0-D85A30?style=flat)](https://github.com/Syzygy-Hub/syzygy-base-rn/releases) [![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-dark-1200.png">
  <img src="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-light-1200.png" alt="Syzygy" width="600">
</picture>

# syzygy-base-rn

A template React Native app (TypeScript) that wires all 5 Syzygy layers via the Core DI Container.

## About

syzygy-base-rn is a cross-platform iOS and Android React Native template written in TypeScript. It pre-wires all five Syzygy layers — Foundation, Core, Services, AI, and UI — through the Core DI Container so teams can clone the repo, run `setup.sh` to rename the project, and immediately start building features on top of a fully configured stack.

## Platforms

| Platform | Min Version | Package Manager | Status |
|----------|-------------|-----------------|--------|
| iOS | 16.0+ | npm / React Native | ✅ Supported |
| Android | 8.0+ | npm / React Native | ✅ Supported |

## Requirements

- Node.js 20+
- React Native 0.76+
- iOS 16.0+ / Android 8.0+
- Xcode 16+ (iOS builds)
- Android Studio (Android builds)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Syzygy-Hub/syzygy-base-rn.git
   ```
2. Rename the project (PascalCase, no spaces):
   ```sh
   ./setup.sh YourAppName com.your.bundle
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Install iOS pods:
   ```sh
   cd ios && pod install
   ```
5. Run the app:
   ```sh
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   ```

## Architecture

The app depends on all five Syzygy layers via npm:

| Layer | Package | Version |
|-------|---------|---------|
| Foundation | `@syzygy-hub/foundation-rn` | 3.0.0 |
| Core | `@syzygy-hub/core-rn` | 3.0.0 |
| Services | `@syzygy-hub/services-rn` | 3.0.0 |
| AI | `@syzygy-hub/ai-rn` | 3.0.0 |
| UI | `@syzygy-hub/ui-rn` | 3.0.0 |

DI wiring lives in `src/di/`. Entry point is `index.js` → `App.tsx`. Navigation is handled by React Navigation in `src/navigation/`.

## Contents

The `src/` directory contains nine folders:

| Folder | Purpose |
|--------|---------|
| `core` | App-level core utilities and constants |
| `designSystem` | Local design tokens extending Syzygy UI |
| `di` | DI container setup and module registrations |
| `features` | Feature modules (screens, view-models, repositories) |
| `navigation` | React Navigation stack and tab configuration |
| `network` | Network client configuration and interceptors |
| `storage` | Storage provider setup |
| `theme` | Theme overrides and SyzygyThemeProvider wiring |
| `utils` | Shared utility helpers |

## Usage

### Resolving a DI dependency

```typescript
import { AppContainer, DI_KEYS } from './src/di/AppModule';

const logger = AppContainer.resolve(DI_KEYS.logger);
```

### Wrapping with SyzygyThemeProvider

```tsx
import { SyzygyThemeProvider } from '@syzygy-hub/ui-rn';

export default function App() {
  return (
    <SyzygyThemeProvider>
      {/* your navigation and screens */}
    </SyzygyThemeProvider>
  );
}
```

## Contributing

1. Fork the repository and create a feature branch.
2. Make changes following the existing code style (ESLint + Prettier are configured).
3. Ensure `npm run lint`, `npm run typecheck`, and `npm test` all pass.
4. Open a pull request against `main`.

## Releases

Releases follow semantic versioning. See [CHANGELOG.md](CHANGELOG.md) for the full history. The current release is [v3.0.0](https://github.com/Syzygy-Hub/syzygy-base-rn/releases/tag/v3.0.0).

## License

[MIT](LICENSE)
