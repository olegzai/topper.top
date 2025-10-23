// tests/utils/logger.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, LogLevel, LogEntry } from '../../public/js/utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear logs before each test
    // @ts-expect-error - accessing private property for testing
    logger.logs = [];

    // Mock console methods to prevent actual console output during tests
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should create a log entry with correct structure', () => {
    const testMessage = 'Test log message';
    const testMeta = { test: 'value' };

    logger.info(testMessage, testMeta);

    // @ts-expect-error - accessing private property for testing
    const logs: LogEntry[] = logger.logs;

    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveProperty('timestamp');
    expect(logs[0]).toHaveProperty('level');
    expect(logs[0]).toHaveProperty('message');
    expect(logs[0]).toHaveProperty('meta');
    expect(logs[0]?.message).toBe(testMessage);
    expect(logs[0]?.level).toBe(LogLevel.INFO);
    expect(logs[0]?.meta).toEqual(testMeta);
  });

  it('should support all log levels', () => {
    const testMessage = 'Test message';

    logger.debug(testMessage);
    logger.info(testMessage);
    logger.warn(testMessage);
    logger.error(testMessage);

    // @ts-expect-error - accessing private property for testing
    const logs: LogEntry[] = logger.logs;

    expect(logs).toHaveLength(4);
    expect(logs[0]?.level).toBe(LogLevel.DEBUG);
    expect(logs[1]?.level).toBe(LogLevel.INFO);
    expect(logs[2]?.level).toBe(LogLevel.WARN);
    expect(logs[3]?.level).toBe(LogLevel.ERROR);
  });

  it('should store logs in memory', () => {
    logger.info('First message');
    logger.warn('Second message');

    const allLogs = logger.getLogs();
    expect(allLogs).toHaveLength(2);
    expect(allLogs[0]?.message).toBe('First message');
    expect(allLogs[1]?.message).toBe('Second message');
  });

  it('should filter logs by level', () => {
    logger.info('Info message');
    logger.warn('Warning message');
    logger.info('Another info message');

    const infoLogs = logger.getLogs(LogLevel.INFO);
    expect(infoLogs).toHaveLength(2);
    expect(infoLogs[0]?.message).toBe('Info message');
    expect(infoLogs[1]?.message).toBe('Another info message');
  });

  it('should clear logs', () => {
    logger.info('Test message');
    expect(logger.getLogs()).toHaveLength(1);

    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });
});
