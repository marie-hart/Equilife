type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/** Optional Datadog logger (e.g. datadogLogs.logger from @datadog/browser-logs). Set in main.ts after init for production. */
export interface DatadogLogger {
  error: (message: string, context?: object, error?: Error) => void;
  warn: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
  debug: (message: string, context?: object) => void;
}

class LoggerService {
  private isProduction = import.meta.env.PROD;
  private datadogLogger: DatadogLogger | null = null;

  /** Call in main.ts after initializing @datadog/browser-logs to send production logs to Datadog. */
  setDatadogLogger(dd: DatadogLogger | null) {
    this.datadogLogger = dd;
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (!this.isProduction || level !== 'debug') {
      switch (level) {
        case 'error':
          console.error(formattedMessage, data ?? '');
          break;
        case 'warn':
          console.warn(formattedMessage, data ?? '');
          break;
        case 'debug':
          console.debug(formattedMessage, data ?? '');
          break;
        default:
          console.log(formattedMessage, data ?? '');
          break;
      }
    }

    if (this.isProduction && this.datadogLogger) {
      const context = data != null ? { extra: data } : undefined;
      try {
        switch (level) {
          case 'error':
            this.datadogLogger.error(message, context, data instanceof Error ? data : undefined);
            break;
          case 'warn':
            this.datadogLogger.warn(message, context);
            break;
          case 'info':
            this.datadogLogger.info(message, context);
            break;
          case 'debug':
            this.datadogLogger.debug(message, context);
            break;
        }
      } catch (_) {
        // avoid breaking app if Datadog fails
      }
    }
  }

  error(msg: string, err?: unknown) {
    this.log('error', msg, err);
  }
  warn(msg: string, data?: unknown) {
    this.log('warn', msg, data);
  }
  info(msg: string, data?: unknown) {
    this.log('info', msg, data);
  }
  debug(msg: string, data?: unknown) {
    this.log('debug', msg, data);
  }
}

export const logger = new LoggerService();