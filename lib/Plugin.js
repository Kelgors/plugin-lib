"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
class Plugin {
    constructor(loader, pluginDescription, path) {
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
    getName() {
        return this.getDescription().name;
    }
    getDescription() {
        return this.__pluginDescription__;
    }
    getLogger() {
        return this.__application__.getLogger();
    }
    getApplication() {
        return this.__application__;
    }
    getPluginLoader() {
        return this.__loader__;
    }
    isEnabled() {
        return this.__isEnabled__;
    }
    getConfig() {
        return this.__config__;
    }
    reloadConfig() {
        throw new Error("Method not implemented.");
    }
    getFile() {
        return this.__path__;
    }
    toString() {
        return `${this.getName()}<enabled: ${this.isEnabled()}>`;
    }
    setEnabled(enabled) {
        assert.notEqual(enabled, null, 'Plugin#setEnabled(enabled): enabled must be a boolean');
        return (enabled ? this.onEnable() : this.onDisable())
            .then(() => {
            this.__isEnabled__ = enabled;
        });
    }
}
exports.Plugin = Plugin;
