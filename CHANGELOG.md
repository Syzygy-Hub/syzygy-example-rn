# Changelog

All notable changes to `syzygy-example-rn` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-10-18

### Added
- Release workflow `.github/workflows/release.yml` from the Hub's app release template. It fires on strict bare-semver tags and calls `app-release.yml@main`.
- Library compatibility table in the README.
- The demo login is documented as shipping in all build types, including release builds.

### Changed
- CI caller aligned with the Hub's React Native app CI template. Node 22 is set in CI. Triggers are push-only with tags excluded.
- Removed unused dependencies `@react-native/new-app-screen`, `axios` and `react-native-keychain`, together with the keychain patch file.
- Declared the ESLint plugins used by the Hub's `.eslintrc.json` as devDependencies.
- README rewritten to the v3.0.0 facts. The one-time rename steps are removed.
- `version` 3.0.0 in `package.json` and `package-lock.json`.

## [1.0.0] - 2026-10-16

### Added
- Home screen showing the signed-in user, with buttons to open Features and to log out
- Features screen demonstrating each layer with public APIs and no keys: Foundation (`SyzygyID`), Core (`ConfigRegistry`, `FeatureFlag`), Services (`InMemoryStorageProvider`), AI (`LLMProvider` with an offline provider written in the app) and UI (`PrimaryButton`, `CardView`, `ProgressBar`)
- Offline `LLMProvider` implementation in the app (`OfflineLLMProvider`)

### Changed
- Syzygy packages pinned to exactly 3.0.0 in `package.json` and `package-lock.json` (Foundation, Core, Services, AI, UI)
- App renamed from SyzygyBase to Syzygy Example (package `syzygy-example`, bundle and application ID `com.syzygyhub.example`)

