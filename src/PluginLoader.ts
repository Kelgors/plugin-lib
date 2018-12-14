import { IPluginLoader } from './IPluginLoader';
import { Plugin } from './Plugin';
import { IPluginDescription } from './IPluginDescription';
import { IApplication } from './IApplication';

import * as assert from 'assert';
import * as Path from 'path';
import * as fsRoot from 'fs';
const fs = fsRoot.promises;

export class PluginLoader implements IPluginLoader {
  private __application__: IApplication;
  private __plugins__: Map<string, Plugin> = new Map();

  constructor(application: IApplication) {
    assert.notEqual(application, null, 'PluginLoader(application) application cannot be a null or undefined');
    this.__application__ = application;
  }

  getApplication(): IApplication {
    return this.__application__;
  }

  getPlugin(name: string): (Plugin | null) {
    assert.notEqual(name, null, 'PluginLoader#getPlugin(name): name cannot be null or undefined');
    return this.__plugins__.get(name) || null;
  }

  getPluginDescription(path: string): Promise<IPluginDescription> {
    assert.notEqual(path, null, 'PluginLoader.loadPlugin(path): path cannot be null or undefined');
    const configPathName: string = Path.join(path, 'package.json');
    this.getApplication().getLogger().trace(`Load ${configPathName}`);
    return fs.readFile(configPathName)
      .then(function (buffer: Buffer) {
        return JSON.parse(buffer.toString());
      })
      .catch(function (reason: Error) {
        if (reason.message.startsWith('SyntaxError') && /(in|of) JSON/.test(reason.message)) {
          return Promise.reject(new Error(`InvalidPluginDescriptionException: Bad syntax in ${configPathName}`));
        } else if (reason.message.startsWith('ENOENT')) {
          return Promise.reject(new Error(`InvalidPluginDescriptionException: plugin description file missing in ${path}`))
        }
        return Promise.reject(reason);
      });
  }

  async loadPlugins(path: string): Promise<Plugin[]> {
    // https://github.com/Bukkit/Bukkit/blob/master/src/main/java/org/bukkit/plugin/SimplePluginManager.java
    const plugins: string[] = [];
    const pluginFolders: Map<string, string> = new Map();
    const pluginDependencies: Map<string, string[]> = new Map();
    const loadedPlugins: string[] = [];
    const paths: string[] = await fs.readdir(path);

    for (const index in paths) {
      try {
        const pluginFolderName: string = paths[index];
        const description: IPluginDescription = await this.getPluginDescription(Path.join(path, pluginFolderName));
        if (!description.name) throw new Error('InvalidPluginDescriptionException: bad name');

        plugins.push(description.name);
        pluginFolders.set(description.name, Path.join(path, pluginFolderName));
        if (description['plugin-lib$depends'] && description['plugin-lib$depends'].length > 0) {
          pluginDependencies.set(description.name, (description['plugin-lib$depends'] || []).slice(0));
        }
      } catch (ex) {
        this.getApplication().getLogger().error(ex);
      }
    }

    let lastPluginLength = -1;
    while (plugins.length > 0) {
      // loop over plugins with iterator
      // to be able to mutate plugins string[]
      const pluginsIt: Iterator<string> = plugins[Symbol.iterator]();
      let pluginsItResult: IteratorResult<string>;
      while (!(pluginsItResult = pluginsIt.next()).done) {
        const pluginName: string = pluginsItResult.value;
        const dependencies: string[] = pluginDependencies.get(pluginName) || [];
        let missingDependencies: boolean = false;

        for (const depName of dependencies) {
          if (loadedPlugins.indexOf(depName) === -1) {
            // dependency isnt already loaded
            if (plugins.indexOf(depName) === -1) {
              // dependency is not in the plugin folder
              this.getApplication().getLogger().error(new Error(`DependencyResolutionException: Missing plugin ${depName} required by ${pluginName}`));
              plugins.splice(plugins.indexOf(pluginName), 1);
            }
            missingDependencies = true;
            this.getApplication().getLogger().trace(`Dependency ${depName} not yet loaded for plugin ${pluginName}`);
            break;
          }
        }
        // if missing dependencies, go to next plugin
        if (missingDependencies) {
          continue;
        }

        // all good, we can load it
        try {
          this.getApplication().getLogger().trace(`All dependencies loaded for plugin ${pluginName}`);
          plugins.splice(plugins.indexOf(pluginName), 1);

          const pluginFolderPath: string = pluginFolders.get(pluginName);
          await this.loadPlugin(pluginFolderPath);

          loadedPlugins.push(pluginName);
        } catch (ex) {
          this.getApplication().getLogger().error(`Could not load ${pluginName}`);
          this.getApplication().getLogger().error(ex);
        }

      }
    }
    return Promise.resolve([ ...this.__plugins__.values() ]);
  }

  async loadPlugin(path: string): Promise<void> {
    const description = await this.getPluginDescription(path);
    for (const index in description['plugin-lib$depends']) {
      const pluginName = description['plugin-lib$depends'][index];
      if (!this.getPlugin(pluginName)) {
        throw new Error(`UnknownDependencyException(${pluginName})`);
      }
    }

    const pluginMainFilePath: string = Path.join(path, description.main);
    this.getApplication().getLogger().info(`Load plugin ${description.name}`);
    const PluginConstructor = require(pluginMainFilePath);
    const plugin: Plugin = new PluginConstructor(this, description, path);
    this.__plugins__.set(description.name, plugin);
    await plugin.onLoad();
    plugin.getLogger().info(`${description.name} loaded`);
  }

  async enablePlugins(): Promise<void> {
    for (const [ pluginName, plugin ] of this.__plugins__) {
      try {
        await this.enablePlugin(plugin);
      } catch (ex) {
        this.getApplication().getLogger().error(ex);
      }
    }
  }

  enablePlugin(plugin: Plugin): Promise<void> {
    if (plugin.isEnabled()) return Promise.resolve();
    plugin.getLogger().info(`Enabling ${plugin.getName()}`);
    if (!this.__plugins__.has(plugin.getName())) {
      this.__plugins__.set(plugin.getName(), plugin);
    }
    return plugin.setEnabled(true)
      .catch(function (err: Error): void {
        plugin.getLogger().error(`Error occured while enabling ${plugin.getName()}`);
        plugin.getLogger().error(err);
      });
  }

  disablePlugin(plugin: Plugin): Promise<void> {
    if (!plugin.isEnabled()) return Promise.resolve();
    plugin.getLogger().info(`Disabling ${plugin.getName()}`);

    return plugin.setEnabled(false)
      .catch(function (err: Error): void {
        plugin.getLogger().error(`"Error occured while disabling ${plugin.getName()}`);
        plugin.getLogger().error(err);
      })
      .then(() => {
        if (this.__plugins__.has(plugin.getName())) {
          this.__plugins__.delete(plugin.getName());
        }
      });
  }

}
