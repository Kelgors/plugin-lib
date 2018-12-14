export interface ILogger {
  error(message: string): void;
  error(error: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  trace(message: string): void;
}
