import { IPluginLoader } from './IPluginLoader';
import { Plugin } from './Plugin';
import { IPluginDescription, LoadingTime } from './IPluginDescription';
import { IApplication } from './IApplication';
export declare class PluginLoader implements IPluginLoader {
    private __application__;
    private __plugins__;
    constructor(application: IApplication);
    getApplication(): IApplication;
    getPlugin(name: string): (Plugin | null);
    getPluginDescription(path: string): Promise<IPluginDescription>;
    loadPlugins(path: string): Promise<Plugin[]>;
    loadPlugin(path: string): Promise<void>;
    enablePlugins(loadingTime: LoadingTime): Promise<void>;
    disablePlugins(loadingTime: LoadingTime): Promise<void>;
    enablePlugin(plugin: Plugin): Promise<void>;
    disablePlugin(plugin: Plugin): Promise<void>;
}
