# plugin-lib

Plugin engine for application.
You need to implements IApplication and use PluginLoader in order to use it.

```text
|- Application (class implementing IApplication)
|- plugins/
    |- plugin-A
        |- package.json
        |- PluginA.js (class extending Plugin)
    |- plugin-B
        |- package.json
        |- PluginB.js (class extending Plugin)
|
```

plugin-a/package.json

```json
{
    "name": "plugin-a",
    "main": "PluginA.js",
    "plugin-lib$depends": [ "plugin-b" ]
}
```

plugin-a/package.json

```json
{
    "name": "plugin-b",
    "main": "PluginB.js",
    "plugin-lib$depends": []
}
```

plugin-b/PluginB.js

```js
class PluginB extends Plugin {
    onEnable() {
        return new Promise((resolve, reject) => {
            Database.connect((err, db) => {
                if (err) reject(err);
                else {
                    this.db = db;
                    resolve();
                }
            });
        });
    }
    getDatabase() {
        return this.db;
    }
    onDisable() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    onLoad() {}
}
```

plugin-a/PluginA.js

```js
class PluginA extends Plugin {
    onEnable() {
        const pluginB = this.getPluginLoader().getPlugin('plugin-b');
        pluginB.getDatabase().execute('CREATE TABLE IF NOT EXISTS ....');
    }
    onDisable() {}
    onLoad() {}
}
```
