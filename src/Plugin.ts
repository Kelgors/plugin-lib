import { IPlugin } from './IPlugin';
import { IPluginDescription } from './IPluginDescription';
import { ILogger } from './ILogger';
import { IPluginLoader } from './IPluginLoader';
import { IApplication } from './IApplication';

import * as assert from 'assert';

export abstract class Plugin implements IPlugin {
  private __isEnabled__: boolean;
  private __config__: object;
  private __loader__: IPluginLoader;
  private __application__: IApplication;
  private __pluginDescription__: IPluginDescription;
  private __path__: string;

  constructor(loader: IPluginLoader, pluginDescription: IPluginDescription, path: string) {
    assert.notEqual(loader, null, 'Plugin(loader, pluginDescription, path): loader cannot be null or undefined');
    assert.notEqual(pluginDescription, null, 'Plugin(loader, pluginDescription, path): pluginDescription cannot be null or undefined');
    assert.notEqual(path, null, 'Plugin(loader, pluginDescription, path): path cannot be null or undefined');
    this.__isEnabled__ = false;
    this.__loader__ = loader;
    this.__application__ = this.__loader__.getApplication();
    this.__pluginDescription__ = pluginDescription;
    this.__path__ = path;
    this.__config__ = {};
  }

  getName(): string {
    return this.getDescription().name;
  }

  getDescription(): IPluginDescription {
    return this.__pluginDescription__;
  }

  getLogger(): ILogger {
    return this.__application__.getLogger();
  }

  getApplication(): IApplication {
    return this.__application__;
  }

  getPluginLoader(): IPluginLoader {
    return this.__loader__;
  }
  abstract onLoad(): Promise<void>;
  abstract onEnable(): Promise<void>;
  abstract onDisable(): Promise<void>;

  isEnabled(): boolean {
    return this.__isEnabled__;
  }

  getConfig(): object {
    return this.__config__;
  }

  reloadConfig(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getFile(): string {
    return this.__path__;
  }

  toString() {
    return `${this.getName()}<enabled: ${this.isEnabled()}>`
  }

  setEnabled(enabled: boolean): Promise<void> {
    assert.notEqual(enabled, null, 'Plugin#setEnabled(enabled): enabled must be a boolean');
    return (enabled ? this.onEnable() : this.onDisable())
      .then((): void => {
        this.__isEnabled__ = enabled;
      });
  }

}
