import { ILogger } from './ILogger';
export interface IApplication {
    getName(): string;
    getLogger(): ILogger;
    getFile(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
}
