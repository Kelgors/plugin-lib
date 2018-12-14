"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPluginDescription_1 = require("./IPluginDescription");
const assert = require("assert");
const Path = require("path");
const fsRoot = require("fs");
const fs = fsRoot.promises;
class PluginLoader {
    constructor(application) {
        this.__plugins__ = new Map();
        assert.notEqual(application, null, 'PluginLoader(application) application cannot be a null or undefined');
        this.__application__ = application;
    }
    getApplication() {
        return this.__application__;
    }
    getPlugin(name) {
        assert.notEqual(name, null, 'PluginLoader#getPlugin(name): name cannot be null or undefined');
        return this.__plugins__.get(name) || null;
    }
    getPluginDescription(path) {
        assert.notEqual(path, null, 'PluginLoader.loadPlugin(path): path cannot be null or undefined');
        const configPathName = Path.join(path, 'package.json');
        this.getApplication().getLogger().trace(`Load ${configPathName}`);
        return fs.readFile(configPathName)
            .then(function (buffer) {
            return JSON.parse(buffer.toString());
        })
            .catch(function (reason) {
            if (reason.message.startsWith('SyntaxError') && /(in|of) JSON/.test(reason.message)) {
                return Promise.reject(new Error(`InvalidPluginDescriptionException: Bad syntax in ${configPathName}`));
            }
            else if (reason.message.startsWith('ENOENT')) {
                return Promise.reject(new Error(`InvalidPluginDescriptionException: plugin description file missing in ${path}`));
            }
            return Promise.reject(reason);
        });
    }
    async loadPlugins(path) {
        // https://github.com/Bukkit/Bukkit/blob/master/src/main/java/org/bukkit/plugin/SimplePluginManager.java
        const plugins = [];
        const pluginFolders = new Map();
        const pluginDependencies = new Map();
        const loadedPlugins = [];
        const paths = await fs.readdir(path);
        const logger = this.getApplication().getLogger();
        for (const index in paths) {
            try {
                const pluginFolderName = paths[index];
                const description = await this.getPluginDescription(Path.join(path, pluginFolderName));
                if (!description.name)
                    throw new Error('InvalidPluginDescriptionException: bad name');
                plugins.push(description.name);
                pluginFolders.set(description.name, Path.join(path, pluginFolderName));
                if (description['plugin-lib$depends'] && description['plugin-lib$depends'].length > 0) {
                    pluginDependencies.set(description.name, (description['plugin-lib$depends'] || []).slice(0));
                }
            }
            catch (ex) {
                logger.error(ex);
            }
        }
        let lastPluginLength = -1;
        while (plugins.length > 0) {
            // loop over plugins with iterator
            // to be able to mutate plugins string[]
            const pluginsIt = plugins[Symbol.iterator]();
            let pluginsItResult;
            while (!(pluginsItResult = pluginsIt.next()).done) {
                const pluginName = pluginsItResult.value;
                const dependencies = pluginDependencies.get(pluginName) || [];
                let missingDependencies = false;
                for (const depName of dependencies) {
                    if (loadedPlugins.indexOf(depName) === -1) {
                        // dependency isnt already loaded
                        if (plugins.indexOf(depName) === -1) {
                            // dependency is not in the plugin folder
                            logger.error(new Error(`DependencyResolutionException: Missing plugin ${depName} required by ${pluginName}`));
                            plugins.splice(plugins.indexOf(pluginName), 1);
                        }
                        missingDependencies = true;
                        logger.trace(`Dependency ${depName} not yet loaded for plugin ${pluginName}`);
                        break;
                    }
                }
                // if missing dependencies, go to next plugin
                if (missingDependencies) {
                    continue;
                }
                // all good, we can load it
                try {
                    logger.trace(`All dependencies loaded for plugin ${pluginName}`);
                    plugins.splice(plugins.indexOf(pluginName), 1);
                    const pluginFolderPath = pluginFolders.get(pluginName);
                    await this.loadPlugin(pluginFolderPath);
                    loadedPlugins.push(pluginName);
                }
                catch (ex) {
                    logger.error(`Could not load ${pluginName}`);
                    logger.error(ex);
                }
            }
        }
        return Promise.resolve([...this.__plugins__.values()]);
    }
    async loadPlugin(path) {
        const description = await this.getPluginDescription(path);
        for (const index in description['plugin-lib$depends']) {
            const pluginName = description['plugin-lib$depends'][index];
            if (!this.getPlugin(pluginName)) {
                throw new Error(`UnknownDependencyException(${pluginName})`);
            }
        }
        const pluginMainFilePath = Path.join(path, description.main);
        this.getApplication().getLogger().info(`Load plugin ${description.name}`);
        const PluginConstructor = require(pluginMainFilePath);
        const plugin = new PluginConstructor(this, description, path);
        this.__plugins__.set(description.name, plugin);
        await plugin.onLoad();
        plugin.getLogger().info(`${description.name} loaded`);
    }
    async enablePlugins(loadingTime) {
        for (const [pluginName, plugin] of this.__plugins__) {
            try {
                const pluginLoadingTime = plugin.getDescription()['plugin-lib$load'] || IPluginDescription_1.LoadingTime.STARTUP;
                if (pluginLoadingTime != loadingTime)
                    continue;
                await this.enablePlugin(plugin);
            }
            catch (ex) {
                this.getApplication().getLogger().error(ex);
            }
        }
    }
    async disablePlugins(loadingTime) {
        for (const [pluginName, plugin] of this.__plugins__) {
            try {
                const pluginLoadingTime = plugin.getDescription()['plugin-lib$load'] || IPluginDescription_1.LoadingTime.STARTUP;
                if (pluginLoadingTime != loadingTime)
                    continue;
                await this.disablePlugin(plugin);
            }
            catch (ex) {
                this.getApplication().getLogger().error(ex);
            }
        }
    }
    enablePlugin(plugin) {
        if (plugin.isEnabled())
            return Promise.resolve();
        plugin.getLogger().info(`Enabling ${plugin.getName()}`);
        if (!this.__plugins__.has(plugin.getName())) {
            this.__plugins__.set(plugin.getName(), plugin);
        }
        return plugin.setEnabled(true)
            .catch(function (err) {
            plugin.getLogger().error(`Error occured while enabling ${plugin.getName()}`);
            plugin.getLogger().error(err);
        });
    }
    disablePlugin(plugin) {
        if (!plugin.isEnabled())
            return Promise.resolve();
        plugin.getLogger().info(`Disabling ${plugin.getName()}`);
        return plugin.setEnabled(false)
            .catch(function (err) {
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
exports.PluginLoader = PluginLoader;
