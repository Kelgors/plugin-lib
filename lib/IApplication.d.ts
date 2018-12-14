import { ILogger } from './ILogger';
/**
 * Represents the application which use pluginloader
 */
export interface IApplication {
    getName(): string;
    getLogger(): ILogger;
    getFile(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
}
