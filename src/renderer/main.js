const path = require('path');
const fs = require('fs');

//
// Define Environment
//
global.rootDir = require('path').resolve(__dirname, '../../renderer');

//
// Define Import Helpers
//
global.load = {
    node: function (module) {
        if (arguments.length == 1) {
            return require(module);
        }
        if (arguments.length == 2) {
            return require(module)[arguments[1]];
        }
        const full = require(module);
        let result = {};
        for (i = 1; i < arguments.length; i++) {
            const name = arguments[i];
            result[name] = full[name];
        }
        return result;
    },
    module: (name) => {
        return require(`${rootDir}/${name}`);
    },
    class: (name) => {
        return load.module(`classes/${name}`);
    },
    service: (name) => {
        return load.module(`services/${name}`);
    },
    component: (name) => {
        return load.module(`components/${name}/${name}`);
    },
    instance: (name) => {
        return new (load.class(name))();
    },
    view: (componentName, viewName) => {
        viewName = viewName || componentName;
        const filePath = `${rootDir}/components/${componentName}/${viewName}.html`;
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, { encoding: 'utf8' });
    }

}


//
// Load App Settings
//
global.settings = load.module('settings');


//
// Load and Start App when browser is ready
//
$(() => {
    global.app = load.instance('app');
    global.app.start();
});
