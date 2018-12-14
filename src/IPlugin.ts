import { ILogger } from './ILogger';
import { IPluginDescription } from './IPluginDescription';
import { IPluginLoader } from './IPluginLoader';
import { IApplication } from './IApplication';
export interface IPlugin {
  getName(): string;
  getDescription(): IPluginDescription;
  getFile(): string;
  getLogger(): ILogger;
  getApplication(): IApplication;
  getPluginLoader(): IPluginLoader;
  onLoad() : Promise<void>;
  onEnable(): Promise<void>;
  onDisable(): Promise<void>;
  isEnabled(): boolean;
  getConfig(): object;
  reloadConfig(): Promise<void>;
  setEnabled(enabled: boolean): Promise<void>;
}
