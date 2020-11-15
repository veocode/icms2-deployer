const { TouchBarScrubber } = require("electron");

class Component {

    $container;
    app;

    constructor(containerId, app) {
        this.$container = $(`#${containerId}`);
        this.app = app;
        this.onInit();
    }

    $dom(selector) {
        return this.$container.find(selector);
    }

    activate(params) {
        this.$container.show();
        this.onActivation(params);
    }

    deactivate() {
        this.$container.hide();
        this.onDeactivation();
    }

    onInit() { }
    onActivation(params) { }
    onDeactivation() { }

}

module.exports = Component;