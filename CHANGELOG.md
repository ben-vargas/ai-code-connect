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

- [@mickboyle](https://github.com/mickboyle) - Windows compatibility fixes (#2)

---

## [0.3.2] - Previous Release

Initial tracked release. Prior changes were not documented in changelog format.
