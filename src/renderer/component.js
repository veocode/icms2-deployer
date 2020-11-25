class Component {

    id;
    $container;
    $templates;
    callback;

    constructor() {
        this.id = this.constructor.name.toLowerCase();
        this.$container = $(`#${this.id}`);
        this.onInit();
        this.initTemplates();
    }

    $dom(selector) {
        return this.$container.find(selector);
    }

    bind(data, $rootElement, prefix) {
        prefix = prefix || '';
        const bindableAttrs = ['href', 'title', 'class', 'value'];
        const component = this;
        if (!$rootElement) {
            $rootElement = this.$container;
        }
        Object.keys(data).forEach((fieldName) => {
            const value = data[fieldName];
            const fieldPath = prefix + fieldName;
            $rootElement.find(`[data-bind="${fieldPath}"]`).html(value);
            bindableAttrs.forEach((attrName) => $rootElement.find(`[data-bind-${attrName}="${fieldPath}"]`).attr(attrName, value));
            if (value) {
                $rootElement.find(`[data-if="${fieldPath}"]`).show();
                $rootElement.find(`[data-not="${fieldPath}"]`).hide();
            }
            if (!value) {
                $rootElement.find(`[data-not="${fieldPath}"]`).show();
                $rootElement.find(`[data-if="${fieldPath}"]`).hide();
            }
            if (typeof value === 'object') {
                this.bind(value, $rootElement, fieldName + '.');
            }
        });
        $rootElement.find(`[data-method]`).each((i, item) => {
            const $item = $(item);
            const methodName = $item.attr('data-method');
            if (component[methodName] && typeof component[methodName] === 'function') {
                $item.html(component[methodName].call(component));
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
        this.onActivation(params);
        if (params) {
            this.bind(params);
        }
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


    //
    // Children Hooks
    //

    onInit() { }
    onActivation(params) { }
    onDeactivation() { }

}

module.exports = Component;