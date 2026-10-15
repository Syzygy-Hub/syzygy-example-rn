# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [3.0.0] - 2026-10-06

### Added
- All 5 Syzygy layers declared as dependencies at v3.0.0 (Foundation, Core, Services, AI, UI)
- Core DI Container wiring for Logger, NetworkClient, AuthProvider, StorageProvider, StateStore, EventBus, Router, Scheduler, FeatureFlagProvider, ConfigRegistry, AppLifecycleTracker
- SyzygyThemeProvider wrapping the app root
- Hub reusable CI workflow (rn-ci.yml@main)
- ESLint configuration
- syzygy.yml layer manifest

### Changed
- Package name renamed from Boilerplate to SyzygyBase
- Bundle ID renamed from com.aks.boilerplate to com.syzygyhub.base
- Version set to 3.0.0

### Removed
- Inline CI workflow (rn.yml) replaced by Hub reusable workflow
- Local shadow copies of NetworkClient, ApiError, SecureStorage, designSystem files
- Hand-rolled service locator (AppModule.ts) replaced by Core DI Container
