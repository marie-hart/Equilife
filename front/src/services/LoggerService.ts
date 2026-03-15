type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LoggerService {
  private isProduction = import.meta.env.PROD;

  private log(level: LogLevel, message: string, data?: any) {
    if (this.isProduction && level === 'debug') return;

    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

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

  error(msg: string, err?: any) { this.log('error', msg, err); }
  warn(msg: string, data?: any) { this.log('warn', msg, data); }
  info(msg: string, data?: any) { this.log('info', msg, data); }
  debug(msg: string, data?: any) { this.log('debug', msg, data); }
}

export const logger = new LoggerService();