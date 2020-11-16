class Component {

    $container;
    $templates;
    app;
    callback;

    constructor(containerId, app) {
        this.$container = $(`#${containerId}`);
        this.app = app;
        this.onInit();
        this.initTemplates();
    }

    $dom(selector) {
        return this.$container.find(selector);
    }

    bind(data, $rootElement) {
        if (!$rootElement) {
            $rootElement = this.$container;
        }
        Object.keys(data).forEach((fieldName) => {
            const value = data[fieldName];
            $rootElement.find(`[data-bind=${fieldName}]`).html(value);
            if (value) {
                $rootElement.find(`[data-if=${fieldName}]`).show();
                $rootElement.find(`[data-not=${fieldName}]`).hide();
            }
            if (!value) {
                $rootElement.find(`[data-not=${fieldName}]`).show();
                $rootElement.find(`[data-if=${fieldName}]`).hide();
            }
        });
    }

    render(templateName, data) {
        const $template = this.$templates[templateName].clone();
        this.bind(data, $template);
        return $template;
    }

    renderTo(parentSelector, templateName, data) {
        this.$dom(parentSelector).append(this.render(templateName, data));
    }

    initTemplates() {
        this.$templates = {};
        this.$dom('[data-template]').each((i, template) => {
            const $template = $(template);
            const name = $template.attr('data-template');
            $template.removeAttr('data-template');
            $template.remove();
            this.$templates[name] = $template;
        });
    }

    activate(params) {
        this.$container.show();
        this.setCallback(null);
        if (params) {
            this.bind(params);
        }
        this.onActivation(params);
    }

    deactivate() {
        this.$container.hide();
        this.onDeactivation();
    }

    result(result) {
        if (!this.callback) { return; }
        this.callback(result);
    }

    setCallback(callback) {
        this.callback = callback;
    }

    onInit() { }
    onActivation(params) { }
    onDeactivation() { }

}

module.exports = Component;