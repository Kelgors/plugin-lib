import { ILogger } from './ILogger';
import { IPluginDescription } from './IPluginDescription';
import { IPluginLoader } from './IPluginLoader';
import { IApplication } from './IApplication';
export interface IPlugin {
    /**
     * Get the name of the plugin
     */
    getName(): string;
    /**
     * Get the plugin description (containing information about plugin)
     */
    getDescription(): IPluginDescription;
    /**
     * Get the path to the plugin
     */
    getFile(): string;
    /**
     * Get the logger of the plugin
     */
    getLogger(): ILogger;
    /**
     * Get the application which run the plugin
     */
    getApplication(): IApplication;
    /**
     * Get the plugin loader
     */
    getPluginLoader(): IPluginLoader;
    onLoad(): Promise<void>;
    onEnable(): Promise<void>;
    onDisable(): Promise<void>;
    /**
     * Check if the loader has loaded the plugin
     */
    isEnabled(): boolean;
    getConfig(): object;
    reloadConfig(): Promise<void>;
    /**
     * Enable/Disable the plugin
     * @param enabled the state to pass
     */
    setEnabled(enabled: boolean): Promise<void>;
}
