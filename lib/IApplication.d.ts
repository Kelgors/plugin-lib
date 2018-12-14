import { ILogger } from './ILogger';
/**
 * Represents the application which use pluginloader
 */
export interface IApplication {
    /**
     * Get the name of the application
     */
    getName(): string;
    /**
     * Get the logger of the application
     */
    getLogger(): ILogger;
    /**
     * Get the application directory
     */
    getFile(): string;
    /**
     * Start the application
     */
    start(): Promise<void>;
    /**
     * Stop the application
     */
    stop(): Promise<void>;
}
