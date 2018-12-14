import { IPlugin } from './IPlugin';
import { IPluginDescription } from './IPluginDescription';
import { ILogger } from './ILogger';
import { IPluginLoader } from './IPluginLoader';
import { IApplication } from './IApplication';
export declare abstract class Plugin implements IPlugin {
    private __isEnabled__;
    private __config__;
    private __loader__;
    private __application__;
    private __pluginDescription__;
    private __path__;
    constructor(loader: IPluginLoader, pluginDescription: IPluginDescription, path: string);
    getName(): string;
    getDescription(): IPluginDescription;
    getLogger(): ILogger;
    getApplication(): IApplication;
    getPluginLoader(): IPluginLoader;
    abstract onLoad(): Promise<void>;
    abstract onEnable(): Promise<void>;
    abstract onDisable(): Promise<void>;
    isEnabled(): boolean;
    getConfig(): object;
    reloadConfig(): Promise<void>;
    getFile(): string;
    toString(): string;
    setEnabled(enabled: boolean): Promise<void>;
}
