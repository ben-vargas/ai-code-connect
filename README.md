# AIC² - AI Code Connect

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/jacobbd)

```
 █████╗ ██╗ ██████╗ ██████╗
██╔══██╗██║██╔════╝ ╚════██╗
██║  ██║██║██║       █████╔╝
███████║██║██║      ██╔═══╝
██╔══██║██║██║      ███████╗
██║  ██║██║██║      ╚══════╝
██║  ██║██║╚██████╗
╚═╝  ╚═╝╚═╝ ╚═════╝
```

A CLI tool that connects **Claude Code** and **Gemini CLI**, eliminating manual copy-paste between AI coding assistants.

**AIC²** = **A**I **C**ode **C**onnect (the two C's = ²)

## The Problem

When working with multiple AI coding tools:
1. Ask Gemini for a proposal
2. Copy the response
3. Paste into Claude for review
4. Copy Claude's feedback
5. Paste back to Gemini...

This is tedious and breaks your flow.

## The Solution

<p align="center">
  <a href="https://www.youtube.com/watch?v=CNsMhvaSuAs">
    <img src="https://img.youtube.com/vi/CNsMhvaSuAs/maxresdefault.jpg" alt="AIC² Demo Video" width="70%">
  </a>
  <br>
  (10 min overview/demo video)
</p>

`aic` bridges both tools in a single interactive session with:
- **Persistent sessions** - Both tools remember context
- **One-command forwarding** - Send responses between tools instantly
- **Interactive mode** - Full access to slash commands and approvals
- **Detach/reattach** - Keep tools running in background

## Installation

```bash
npm install -g ai-code-connect
```

That's it! The `aic` command is now available globally.

### Alternative: Install from Source

```bash
git clone https://github.com/jacob-bd/ai-code-connect.git
cd ai-code-connect
npm install
npm run build
npm link
```

## Prerequisites

Install both AI CLI tools:

- **Claude Code**: `npm install -g @anthropic-ai/claude-code`
- **Gemini CLI**: `npm install -g @google/gemini-cli`

Verify:
```bash
aic tools
# Should show both as "✓ available"
```

## Quick Start

```bash
aic
```

That's it! This launches the interactive session.

## Usage

### Basic Commands

| Command | Description |
|---------|-------------|
| `/claude` | Switch to Claude Code |
| `/claude -i` | Switch to Claude Code and enter interactive mode |
| `/gemini` | Switch to Gemini CLI |
| `/gemini -i` | Switch to Gemini CLI and enter interactive mode |
| `/i` | Enter interactive mode (full tool access) |
| `/forward` | Forward last response to other tool (auto-selects if 2 tools) |
| `/forward [tool]` | Forward to specific tool (required if 3+ tools) |
| `/forward [tool] [msg]` | Forward with additional context |
| `/forward -i [tool]` | Forward and stay in interactive mode |
| `/forwardi [tool]` | Same as `/forward -i` (alias: `/fwdi`) |
| `/history` | Show conversation history |
| `/status` | Show running processes |
| `/clear` | Clear sessions and history |
| `/quit` or `/cya` | Exit |

#### Forward Message Format

When forwarding a response, AIC² wraps it with context so the receiving tool understands the source:

```
Another AI assistant (Claude Code) provided this response. Please review and share your thoughts:

---
[The forwarded response content]
---

Additional context: [your message here, if provided]
```

### Tool Slash Commands

Use double slash (`//`) to run tool-specific slash commands:

| Input | What Happens |
|-------|--------------|
| `//cost` | Opens interactive mode, runs `/cost`, you see output |
| `//status` | Opens interactive mode, runs `/status`, you can interact |
| `//config` | Opens interactive mode, runs `/config`, full control |

When you type `//command`:
1. AIC enters interactive mode with the tool
2. Sends the `/command` for you
3. You see the full output and can interact
4. Press `Ctrl+]` or `Ctrl+\` when done to return to AIC

This approach ensures you can fully view and interact with commands like `/status` that show interactive UIs.

### Command Menu

Type `/` to see a command menu. Use ↓ arrow to select, or keep typing.

### Example Session

```
❯ claude → How should I implement caching for this API?

⠹ Claude is thinking...
I suggest implementing a Redis-based caching layer...

❯ claude → /forward What do you think of this approach?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↗ Forwarding from Claude Code → Gemini CLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gemini CLI responds:

The Redis approach is solid. I'd also consider...

❯ gemini → /claude
● Switched to Claude Code

❯ claude → Can you implement that?
```

### Interactive Mode

For full tool access (approvals, multi-turn interactions, etc.):

```bash
❯ claude → /i

▶ Starting Claude Code interactive mode...
Press Ctrl+] or Ctrl+\ to detach • /exit to terminate

> (interact with Claude directly)
> (press Ctrl+] or Ctrl+\) # Detach back to aic

⏸ Detached from Claude Code (still running)
Use /i to re-attach

❯ claude → /i              # Re-attach to same session
↩ Re-attaching to Claude Code...
```

**Key bindings in interactive mode:**
- `Ctrl+]` or `Ctrl+\` - Detach (tool keeps running)
- `Ctrl+6` or `Ctrl+Q` - Quick toggle to the other tool (Ctrl+6 for iTerm2, Ctrl+Q for Terminal.app)
- `/exit` - Terminate the tool session

> **Tip:** Use `//status` or `//cost` to quickly run tool commands—AIC will enter interactive mode, run the command, and you press `Ctrl+]` or `Ctrl+\` when done.

> **Note:** Messages exchanged while in interactive mode (after `/i`) are not captured for forwarding. Use regular mode for conversations you want to forward between tools.

### Interactive Forwarding

When forwarding a message that might trigger permissions or require interaction (e.g., code edits, file changes), use `/forwardi` or `/forward -i` to stay in interactive mode:

```bash
❯ claude → /forwardi gemini

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↗ Forwarding from Claude Code → Gemini CLI (interactive)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gemini CLI responds:

> I'll implement those changes. Allow me to edit src/api.ts? [y/n]: y
> (you can respond to prompts)
> (press Ctrl+] or Ctrl+\ when done to return to aic)
```

This is useful when:
- The AI might request permission to modify files
- You need to approve or deny actions
- The response requires multi-turn interaction

### Session Persistence

Sessions persist automatically within an AIC² session:
- **Claude**: Uses unique session IDs (`--session-id` / `--resume`) isolated from other Claude instances
- **Gemini**: Uses `--resume latest` flag

Your conversation context is maintained across messages within the same AIC² session.

## CLI Options

```bash
aic                         # Launch interactive session
aic tools                   # List available AI tools
aic config default          # Show current default tool
aic config default gemini   # Set Gemini as default tool
aic --version               # Show version
aic --help                  # Show help
```

## Version Check

AIC² automatically checks for updates when you start a session. If a newer version is available, you'll see a notification:

![Version Check](assets/version_check.png)

To update, simply run:
```bash
npm update -g ai-code-connect
```

## Configuration

### Default Tool

Set which tool loads by default when you start AIC²:

**Option 1: CLI command**
```bash
aic config default gemini
```

**Option 2: Inside AIC²**
```
❯ claude → /default gemini
✓ Default tool set to "gemini". Will be used on next launch.
```

**Option 3: Environment variable (temporary override)**
```bash
AIC_DEFAULT_TOOL=gemini aic
```

Configuration is stored in `~/.aic/config.json`.

## Architecture

```
src/
├── adapters/
│   ├── base.ts              # ToolAdapter interface & registry
│   ├── claude.ts            # Claude Code adapter
│   ├── gemini.ts            # Gemini CLI adapter
│   ├── index.ts             # Exports all adapters
│   └── template.ts.example  # Template for new adapters
├── sdk-session.ts           # Interactive session & command handling
├── persistent-pty.ts        # Persistent PTY management for tools
├── index.ts                 # CLI entry point
├── config.ts                # Configuration management (~/.aic/)
├── utils.ts                 # Utilities (command execution, etc.)
└── version.ts               # Version from package.json
```

## Adding New Tools

AIC² is modular. To add a new AI CLI (e.g., OpenAI Codex):

1. Copy the template: `cp src/adapters/template.ts.example src/adapters/codex.ts`
2. Implement the `ToolAdapter` interface
3. Register in `src/adapters/index.ts` and `src/index.ts`
4. Add to `src/sdk-session.ts`

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## Features

- ✅ **Colorful UI** - ASCII banner, colored prompts, status indicators
- ✅ **Rainbow animations** - Animated rainbow effect on slash commands
- ✅ **Spinner** - Visual feedback while waiting for responses
- ✅ **Session persistence** - Context maintained across messages
- ✅ **Interactive mode** - Full tool access with detach/reattach
- ✅ **Command menu** - Type `/` for autocomplete suggestions
- ✅ **Forward responses** - One command to send between tools
- ✅ **Modular adapters** - Easy to add new AI tools
- ✅ **Cross-platform** - Works on macOS, Linux, and Windows
- ✅ **Request locking** - Prevents concurrent request issues
- ✅ **Memory safe** - Conversation history limits prevent memory leaks

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Run
aic
```

## Testing

AIC² uses [Vitest](https://vitest.dev/) for testing.

```bash
# Run tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

### What's Tested

| File | Tests | Description |
|------|-------|-------------|
| `src/utils.test.ts` | 17 | Pure utility functions: `stripAnsi`, `truncate`, `formatResponse` |
| `src/config.test.ts` | 18 | Config loading, saving, defaults, environment variable handling |

### Adding Tests

Test files live alongside source files with a `.test.ts` suffix:
- `src/utils.ts` → `src/utils.test.ts`
- `src/config.ts` → `src/config.test.ts`

Tests are excluded from the build output (`dist/`) but are committed to git.

## Vibe Coding Alert

Full transparency: this project was built by a non-developer using AI coding assistants (yes, the very tools this project connects). If you're an experienced developer or architect, you might look at this codebase and wince. That's okay.

The goal here was to scratch an itch and learn along the way. The code works, but it's likely missing patterns, optimizations, or elegance that only years of experience can provide.

**This is where you come in.** If you see something that makes you cringe, please consider contributing rather than just closing the tab. This is open source specifically because human expertise is irreplaceable. Whether it's refactoring, performance improvements, better error handling, or architectural guidance - PRs and issues are welcome.

Think of it as a chance to mentor an AI-assisted developer through code review. We all benefit when experienced developers share their knowledge.

## License

MIT
