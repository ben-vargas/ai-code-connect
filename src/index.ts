#!/usr/bin/env node

import { Command } from 'commander';
import { AdapterRegistry, ClaudeAdapter, GeminiAdapter } from './adapters/index.js';
import { loadConfig } from './config.js';
import { startSDKSession } from './sdk-session.js';

const program = new Command();

// Initialize adapters
const registry = new AdapterRegistry();
registry.register(new ClaudeAdapter());
registry.register(new GeminiAdapter());

// Load config
const config = loadConfig();

program
  .name('aic')
  .description('AIC² - AI Code Connect\nBridge Claude Code and Gemini CLI')
  .version('1.0.0');

// Tools command - list available tools
program
  .command('tools')
  .description('List available AI tools and their status')
  .action(async () => {
    console.log('Available tools:\n');
    for (const adapter of registry.getAll()) {
      const available = await adapter.isAvailable();
      const status = available ? '✓ available' : '✗ not found';
      console.log(`  ${adapter.name.padEnd(10)} ${adapter.displayName.padEnd(15)} ${status}`);
    }
  });

// Default action - start interactive session
program
  .action(async () => {
    await startSDKSession();
  });

program.parse();
