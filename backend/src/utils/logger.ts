import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

class Logger {
  private logFile: string;

  constructor() {
    this.logFile = join(logsDir, 'app.log');
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}\n`;
  }

  info(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage('INFO', message, meta);
    console.log(formattedMessage.trim());
    
    // Write to file
    try {
      createWriteStream(this.logFile, { flags: 'a' })
        .write(formattedMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message: string, error?: any): void {
    const formattedMessage = this.formatMessage('ERROR', message, error);
    console.error(formattedMessage.trim());
    
    // Write to file
    try {
      createWriteStream(this.logFile, { flags: 'a' })
        .write(formattedMessage);
    } catch (logError) {
      console.error('Failed to write to log file:', logError);
    }
  }

  warn(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage('WARN', message, meta);
    console.warn(formattedMessage.trim());
    
    // Write to file
    try {
      createWriteStream(this.logFile, { flags: 'a' })
        .write(formattedMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(formattedMessage.trim());
      
      // Write to file in development
      try {
        createWriteStream(this.logFile, { flags: 'a' })
          .write(formattedMessage);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }
}

export default new Logger();