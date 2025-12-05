import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface ToolConfig {
  command?: string;
  defaultFlags?: string[];
}

export interface Config {
  defaultTool: string;
  tools: {
    [name: string]: ToolConfig;
  };
}

const DEFAULT_CONFIG: Config = {
  defaultTool: 'claude',
  tools: {
    claude: {
      command: 'claude',
      defaultFlags: ['-p', '--output-format', 'text'],
    },
    gemini: {
      command: 'gemini',
      defaultFlags: ['-o', 'text'],
    },
  },
};

/**
 * Get the config directory path
 */
export function getConfigDir(): string {
  return join(homedir(), '.aic');
}

/**
 * Get the config file path
 */
export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

/**
 * Ensure the config directory exists
 */
export function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Load configuration from disk, or return defaults
 */
export function loadConfig(): Config {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8');
    const loaded = JSON.parse(content) as Partial<Config>;
    return {
      ...DEFAULT_CONFIG,
      ...loaded,
      tools: {
        ...DEFAULT_CONFIG.tools,
        ...loaded.tools,
      },
    };
  } catch {
    console.warn('Failed to load config, using defaults');
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration to disk
 */
export function saveConfig(config: Config): void {
  ensureConfigDir();
  const configPath = getConfigPath();
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get the default tool (checks env var first, then config)
 */
export function getDefaultTool(): string {
  // Environment variable takes priority
  const envTool = process.env.AIC_DEFAULT_TOOL;
  if (envTool && ['claude', 'gemini'].includes(envTool.toLowerCase())) {
    return envTool.toLowerCase();
  }
  
  // Fall back to config file
  const config = loadConfig();
  return config.defaultTool || 'claude';
}

/**
 * Set the default tool and save to config
 */
export function setDefaultTool(tool: string): { success: boolean; message: string } {
  const validTools = ['claude', 'gemini'];
  const normalizedTool = tool.toLowerCase();
  
  if (!validTools.includes(normalizedTool)) {
    return { 
      success: false, 
      message: `Invalid tool "${tool}". Valid options: ${validTools.join(', ')}` 
    };
  }
  
  const config = loadConfig();
  config.defaultTool = normalizedTool;
  saveConfig(config);
  
  return { 
    success: true, 
    message: `Default tool set to "${normalizedTool}". Will be used on next launch.` 
  };
}

