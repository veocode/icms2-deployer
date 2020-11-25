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
        return require(`./../../renderer/${name}`);
    },
    class: (name) => {
        return load.module(`classes/${name}`);
    },
    service: (name) => {
        return load.module(`services/${name}`);
    },
    component: (name) => {
        return load.module(`components/${name}`);
    },
    instance: (name) => {
        return new (load.class(name))();
    }
}

//
// Load and Start App when browser is ready
//
$(() => {
    global.app = load.instance('app');
    global.app.start();
});
