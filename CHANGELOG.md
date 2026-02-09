# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2026-02-09

### Fixed

- **Windows compatibility**: Added `shell: true` option when spawning on Windows to resolve `.cmd` file execution issues (fixes #1)
- **Prompt handling**: Pass prompts via stdin instead of command-line arguments to avoid Windows shell escaping/truncation issues
- **Error handling**: Added EPIPE error handling for stdin when child process exits early

### Contributors

🙏 **Thank you [@mickboyle](https://github.com/mickboyle)** for the Windows compatibility fixes in PR [#2](https://github.com/jacob-bd/ai-code-connect/pull/2)! This contribution makes AIC accessible to the entire Windows developer community.

---

## [0.3.2] - 2026-01-01

### Fixed

- Resolve absolute command path to prevent spawning errors on macOS (esp. Homebrew paths)

---

## [0.3.1] - 2025-12-28

### Added

- MIT LICENSE file

---

## [0.3.0] - 2025-12-13

### Added

- **Ctrl+Q** as alternative toggle key for Terminal.app compatibility
- Quick toggle between tools with **Ctrl+\\**

### Fixed

- Forward response capture now only includes latest response
- PTY session handling and response cleaning improvements

### Changed

- Updated keybindings documentation

---

## [0.2.0] - 2025-12-07

### Added

- `/forwardi` (`/fwdi`) command for interactive forwarding with silent send and status spinner
- Version check display showing Claude and Gemini CLI versions
- Read-only mode for Claude in print mode
- New 8-line ASCII logo design

### Fixed

- Gemini streaming artifacts in `/fwd` and `/fwdi`
- Session isolation when using `/fwd` from interactive mode
- Prompt display immediately after detaching from interactive mode
- Filter terminal DA queries (leak prevention)
- `//command` execution timing for Claude and Gemini
- Session continuity and various UX improvements
- Readline echo prevention in interactive mode

### Changed

- Instant CLI startup by replacing slow version checks with async loading

---

## [0.1.1] - 2025-12-07

### Fixed

- Filter terminal DA queries to prevent character leakage
- Session continuity improvements

---

## [0.1.0] - 2025-12-05

### Added

- **Initial public release** 🎉
- Bridge between Claude Code and Gemini CLI
- `/forward` (`/fwd`) command to send messages to other tools
- `/interactive` (`/i`) command for direct tool interaction
- Persistent PTY sessions (tools stay running in background)
- Markdown rendering for colorful, formatted AI responses
- Connected Tools section showing installed CLI versions
- Rainbow-styled UI with full-width lines
- Testing infrastructure with Vitest

### Fixed

- iTerm2 detach issues and shell stability
- Double echo after detaching from interactive mode
- Duplicate detach messages and garbage characters

### Changed

- Refactored to adapter pattern for interactive mode
- Use print mode for non-interactive tool communication

---

## [Pre-release] - 2025-12-04

Initial development phase:
- Core CLI architecture
- Multi-tool forward support
- Readline integration for history and tab completion
- Modular adapter system for adding new AI tools
