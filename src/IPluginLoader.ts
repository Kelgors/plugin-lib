import { IPlugin } from './IPlugin';
import { IPluginDescription } from './IPluginDescription';
import { IApplication } from './IApplication';
export interface IPluginLoader {
  getApplication(): IApplication;
  getPlugin(name: string) : IPlugin;
  getPluginDescription(path: string): Promise<IPluginDescription>;

  loadPlugins(path: string): Promise<IPlugin[]>;
  loadPlugin(path: string): Promise<void>;

  enablePlugin(plugin: IPlugin): Promise<void>;
  disablePlugin(plugin: IPlugin): Promise<void>;
}
