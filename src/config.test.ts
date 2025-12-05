import { vi, beforeEach, afterEach } from 'vitest';
import { join } from 'path';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// Mock os module
vi.mock('os', () => ({
  homedir: vi.fn(() => '/mock/home'),
}));

// Import after mocks are set up
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import {
  getConfigDir,
  getConfigPath,
  ensureConfigDir,
  loadConfig,
  saveConfig,
  getDefaultTool,
  setDefaultTool,
} from './config.js';

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    delete process.env.AIC_DEFAULT_TOOL;
  });

  afterEach(() => {
    delete process.env.AIC_DEFAULT_TOOL;
  });

  describe('getConfigDir', () => {
    it('should return path under home directory', () => {
      const result = getConfigDir();
      expect(result).toBe(join('/mock/home', '.aic'));
    });
  });

  describe('getConfigPath', () => {
    it('should return config.json path under config directory', () => {
      const result = getConfigPath();
      expect(result).toBe(join('/mock/home', '.aic', 'config.json'));
    });
  });

  describe('ensureConfigDir', () => {
    it('should create directory if it does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      ensureConfigDir();

      expect(mkdirSync).toHaveBeenCalledWith(
        join('/mock/home', '.aic'),
        { recursive: true }
      );
    });

    it('should not create directory if it already exists', () => {
      vi.mocked(existsSync).mockReturnValue(true);

      ensureConfigDir();

      expect(mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('loadConfig', () => {
    it('should return default config if file does not exist', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const config = loadConfig();

      expect(config.defaultTool).toBe('claude');
      expect(config.tools.claude).toBeDefined();
      expect(config.tools.gemini).toBeDefined();
    });

    it('should load and merge config from file', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ defaultTool: 'gemini' })
      );

      const config = loadConfig();

      expect(config.defaultTool).toBe('gemini');
      // Should still have default tools merged in
      expect(config.tools.claude).toBeDefined();
      expect(config.tools.gemini).toBeDefined();
    });

    it('should return defaults if file parsing fails', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json {{{');

      // Suppress console.warn for this test
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = loadConfig();

      expect(config.defaultTool).toBe('claude');
      expect(warnSpy).toHaveBeenCalledWith('Failed to load config, using defaults');

      warnSpy.mockRestore();
    });
  });

  describe('saveConfig', () => {
    it('should ensure directory exists and write config', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const config = {
        defaultTool: 'gemini',
        tools: {
          claude: { command: 'claude' },
          gemini: { command: 'gemini' },
        },
      };

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalledWith(
        join('/mock/home', '.aic', 'config.json'),
        JSON.stringify(config, null, 2)
      );
    });
  });

  describe('getDefaultTool', () => {
    it('should return claude by default', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const tool = getDefaultTool();

      expect(tool).toBe('claude');
    });

    it('should return env var if set to claude', () => {
      process.env.AIC_DEFAULT_TOOL = 'claude';

      const tool = getDefaultTool();

      expect(tool).toBe('claude');
    });

    it('should return env var if set to gemini', () => {
      process.env.AIC_DEFAULT_TOOL = 'gemini';

      const tool = getDefaultTool();

      expect(tool).toBe('gemini');
    });

    it('should ignore invalid env var values', () => {
      process.env.AIC_DEFAULT_TOOL = 'invalid';
      vi.mocked(existsSync).mockReturnValue(false);

      const tool = getDefaultTool();

      expect(tool).toBe('claude');
    });

    it('should return config value if no env var', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ defaultTool: 'gemini' })
      );

      const tool = getDefaultTool();

      expect(tool).toBe('gemini');
    });

    it('should prioritize env var over config file', () => {
      process.env.AIC_DEFAULT_TOOL = 'claude';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({ defaultTool: 'gemini' })
      );

      const tool = getDefaultTool();

      expect(tool).toBe('claude');
    });
  });

  describe('setDefaultTool', () => {
    it('should set valid tool and save config', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = setDefaultTool('gemini');

      expect(result.success).toBe(true);
      expect(result.message).toContain('gemini');
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should accept claude as valid tool', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = setDefaultTool('claude');

      expect(result.success).toBe(true);
    });

    it('should reject invalid tool names', () => {
      const result = setDefaultTool('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid tool');
      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it('should be case insensitive', () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const result = setDefaultTool('GEMINI');

      expect(result.success).toBe(true);
    });
  });
});
