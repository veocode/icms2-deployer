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
    class: (module) => {
        return require(`./../../renderer/${module}`);
    },
    service: (service) => {
        return global.load.class(`services/${service}`);
    },
    component: (component) => {
        return global.load.class(`components/${component}`);
    }
}

global.app = new (global.load.class('app'))();
global.app.start();
