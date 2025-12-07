import { ToolAdapter, SendOptions } from './base.js';
import { runCommand, commandExists, stripAnsi } from '../utils.js';

/**
 * Adapter for Gemini CLI
 * 
 * Gemini CLI supports:
 * - Non-interactive mode via positional query argument
 * - Output formats: text, json, stream-json (via -o/--output-format)
 * - Session resume via -r/--resume
 * - YOLO mode via -y/--yolo for auto-approval
 */
export class GeminiAdapter implements ToolAdapter {
  readonly name = 'gemini';
  readonly displayName = 'Gemini CLI';
  readonly color = '\x1b[95m'; // brightMagenta

  // Gemini shows > at start of line when ready for input
  readonly promptPattern = /^>\s*$/m;

  // Fallback: if no output for 1.5 seconds, assume response complete
  readonly idleTimeout = 1500;

  // Gemini is slower to start (~8 seconds for first launch due to auth/loading)
  readonly startupDelay = 8000;

  private hasActiveSession = false;
  
  async isAvailable(): Promise<boolean> {
    return commandExists('gemini');
  }
  
  getCommand(prompt: string, options?: SendOptions): string[] {
    const args: string[] = [];
    
    // Resume previous session if we've already made a call
    const shouldContinue = options?.continueSession !== false && this.hasActiveSession;
    if (shouldContinue) {
      args.push('--resume', 'latest');
    }

    // Note: Don't use --include-directories here because it takes an array and would
    // consume the prompt. The cwd is set when spawning the process.

    // Add the prompt as the last argument (positional)
    args.push(prompt);
    
    return ['gemini', ...args];
  }

  getInteractiveCommand(options?: SendOptions): string[] {
    const args: string[] = [];
    // Resume session if we have one
    if (options?.continueSession !== false && this.hasActiveSession) {
      args.push('--resume', 'latest');
    }
    return ['gemini', ...args];
  }

  getPersistentArgs(): string[] {
    // Resume previous session if we have one from regular mode
    if (this.hasActiveSession) {
      return ['--resume', 'latest'];
    }
    return [];
  }

  cleanResponse(rawOutput: string): string {
    let output = rawOutput;

    // Remove all ANSI escape sequences first
    output = output.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    output = output.replace(/\x1b\[\??\d+[hl]/g, '');
    output = output.replace(/\x1b\[\d* ?q/g, '');
    output = output.replace(/\x1b\][^\x07]*\x07/g, ''); // OSC sequences

    // Remove "Loaded cached credentials." line
    output = output.replace(/Loaded cached credentials\.?\s*/g, '');

    // Remove spinner frames
    output = output.replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, '');

    // Remove box drawing characters and lines made of them
    output = output.replace(/[╭╮╰╯│─┌┐└┘├┤┬┴┼║═╔╗╚╝╠╣╦╩╬]/g, '');

    // Remove Gemini UI-specific lines
    output = output.replace(/^\s*Using:.*MCP servers?\s*$/gm, '');
    output = output.replace(/^\s*~\/.*\(main\*?\).*$/gm, ''); // Directory status line
    output = output.replace(/^\s*no sandbox.*$/gim, '');
    output = output.replace(/^\s*auto\s*$/gm, '');
    output = output.replace(/^\s*Reading.*\(esc to cancel.*\)\s*$/gm, '');
    output = output.replace(/^\s*Type your message or @path.*$/gm, '');
    output = output.replace(/^\s*>\s*Type your message.*$/gm, '');
    output = output.replace(/^\s*\?\s*for shortcuts\s*$/gm, '');
    output = output.replace(/^\s*Try ".*"\s*$/gm, ''); // Suggestion lines

    // Remove tool status lines (✓ ReadFolder, ✓ ReadFile, etc.)
    output = output.replace(/^\s*[✓✗]\s+\w+.*$/gm, '');

    // Remove the prompt character
    output = output.replace(/^>\s*$/gm, '');

    // Extract just the response content - look for ✦ markers (Gemini's response indicator)
    // and extract the text that follows
    const responseBlocks: string[] = [];
    const lines = output.split('\n');
    let inResponse = false;
    let currentBlock: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Start of a response block
      if (trimmed.startsWith('✦')) {
        if (currentBlock.length > 0) {
          responseBlocks.push(currentBlock.join('\n'));
        }
        currentBlock = [trimmed.replace(/^✦\s*/, '')];
        inResponse = true;
      } else if (inResponse && trimmed.length > 0) {
        // Continue capturing response content
        // Skip empty lines and UI garbage
        if (!trimmed.match(/^[\s│─╭╮╰╯]*$/) && trimmed.length > 2) {
          currentBlock.push(line);
        }
      } else if (trimmed.length === 0 && inResponse) {
        // Empty line in response - keep it for formatting
        currentBlock.push('');
      }
    }

    // Don't forget the last block
    if (currentBlock.length > 0) {
      responseBlocks.push(currentBlock.join('\n'));
    }

    // If we found response blocks, use those; otherwise fall back to cleaned output
    if (responseBlocks.length > 0) {
      output = responseBlocks.join('\n\n');
    }

    // Final cleanup
    output = output.replace(/\n{3,}/g, '\n\n');
    output = output.replace(/^\s+$/gm, ''); // Lines with only whitespace

    return output.trim();
  }

  async send(prompt: string, options?: SendOptions): Promise<string> {
    // Use non-interactive runCommand to avoid messing with stdin
    const args = this.getCommand(prompt, options).slice(1); // Remove 'gemini' from start

    const result = await runCommand('gemini', args, {
      cwd: options?.cwd || process.cwd(),
    });

    if (result.exitCode !== 0) {
      const errorMsg = result.stderr.trim() || result.stdout.trim() || 'Unknown error';
      throw new Error(`Gemini CLI exited with code ${result.exitCode}: ${errorMsg}`);
    }

    // Mark that we now have an active session
    this.hasActiveSession = true;

    // Return stdout
    return result.stdout.trim();
  }
  
  resetContext(): void {
    this.hasActiveSession = false;
  }
  
  /** Check if there's an active session */
  hasSession(): boolean {
    return this.hasActiveSession;
  }
  
  /** Mark that a session exists (for loading from persisted state) */
  setHasSession(value: boolean): void {
    this.hasActiveSession = value;
  }
}
