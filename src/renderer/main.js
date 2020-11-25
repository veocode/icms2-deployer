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
    module: (module) => {
        return require(`./../../renderer/${module}`);
    },
    service: (service) => {
        return global.load.module(`services/${service}`);
    },
    component: (component) => {
        return global.load.module(`components/${component}`);
    }
}

global.app = global.load.module('app');
global.app.start();
