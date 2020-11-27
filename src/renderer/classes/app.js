const { remote, shell, clipboard } = load.node('electron');
const { URL } = load.node('url');
const Config = load.class('config');
const encryptService = load.service('encrypt');


class App {

    //
    // Application Properties
    //

    title = "InstantCMS 2 - Мастер публикации";

    components = [
        'sitelist',
        'siteform',
        'siteview',
        'deployer'
    ];
    defaultComponent = 'sitelist';

    //
    // Framework Properties
    //

    dom = {
        $title: $('#app-title'),
        $toolbar: $('#app-toolbar'),
        $backBtn: $('#app-btn-back'),
        $workspace: $('#app-workspace'),
        $components: $('#app-components')
    }

    config;

    componentInstances = {};
    currentComponent = this.defaultComponent;
    previousComponent = null;
    previousComponentParams = null;

    //
    // Framework Logic
    //

    init() {
        encryptService.init(() => {
            this.start();
        })
    }

    start() {
        this.config = new Config();
        this.initComponents();
        this.initControls();
        this.view(this.defaultComponent);
    }

    stepBack() {
        this.view(this.previousComponent, this.previousComponentParams);
    }

    initComponents() {
        this.components.forEach((componentName) => {
            this.componentInstances[componentName] = this.makeComponent(componentName);
        });
    }

    makeComponent(componentName) {
        const component = load.component(componentName);
        const html = load.view(componentName);
        if (html) {
            const $view = $(`<div class="component" id="${componentName}"></div>`);
            $view.html(html).appendTo(this.dom.$components);
            component.setContainer($view);
        }
        component.init();
        return component;
    }

    initControls() {
        $('title').text(this.title);

        this.dom.$workspace.scrollbar();

        this.dom.$workspace.on('click', 'a.shell-link', (e) => {
            e.preventDefault();
            const $link = $(e.target);
            shell.openExternal($link.attr('href'));
        });
        this.dom.$workspace.on('click', 'a.shell-path', (e) => {
            e.preventDefault();
            const $link = $(e.target);
            shell.openPath($link.attr('href'));
        });

        $('.click-to-copy').on('click', (e) => {
            const text = $(e.target).text();
            clipboard.writeText(text);
            this.toast({
                message: `Скопировано: ${text}`,
                timeout: 1,
                dismissible: false
            });
        });
    }

    toast(options) {
        bootoast.toast(options);
    }

    initDynamicControls() {
        $('.click-to-copy').attr('title', 'Нажмите, чтобы скопировать');
    }

    setTitle(title, previousComponent, previousComponentParams) {
        this.dom.$title.html(title);
        if (previousComponent) {
            this.dom.$backBtn.show();
            this.previousComponent = previousComponent;
            this.previousComponentParams = previousComponentParams;
        } else {
            this.dom.$backBtn.hide();
            this.previousComponent = null;
            this.previousComponentParams = null;
        }
    }

    setToolbar(buttons) {
        this.resetToolbar();
        buttons.forEach((button) => {
            if (button === '-') {
                $('<span class="spacer"></span>').appendTo(this.dom.$toolbar);
                return;
            }

            let $button = $('<button class="btn"></button>').appendTo(this.dom.$toolbar);
            $button.addClass(`btn-${button.class}`);
            if (button.hint) {
                $button.attr('title', button.hint);
            }
            if (button.icon) {
                let icons = typeof button.icon == 'object' ? button.icon : [button.icon];
                console.log('icons', icons);
                icons.forEach((icon) => {
                    let $icon = $('<i class="fa"></i>').appendTo($button);
                    $icon.addClass(`fa-${icon}`);
                });
            }
            if (button.title) {
                let $title = $('<span></span>').appendTo($button);
                $title.text(button.title);
            }
            $button.click((e) => {
                e.preventDefault();
                button.click();
            });
        });
    }

    resetToolbar() {
        this.dom.$toolbar.empty();
    }

    view(componentName, params, callback) {
        if (!(componentName in this.componentInstances)) {
            console.error(`Component not found: ${componentName}`);
            return;
        }
        if (this.currentComponent) {
            this.componentInstances[this.currentComponent].deactivate();
            this.resetToolbar();
        }
        const component = this.componentInstances[componentName];
        component.activate(params);
        if (callback) {
            component.setCallback(callback);
        }
        this.initDynamicControls();
        this.currentComponent = componentName;
    }

    openDirectorySelectDialog(callback) {
        remote.dialog.showOpenDialog({
            title: 'Выбрать папку с сайтом...',
            properties: ['openDirectory']
        }).then((result) => {
            if (!result.canceled && result.filePaths[0]) {
                callback(result.filePaths[0]);
            }
        });
    }

    alert(message, type, title) {
        type = type || "info";
        title = title || this.title;
        if (typeof message == 'object') {
            message = message.join('\n');
        }
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: type,
            title: title,
            message: message,
            buttons: ["Ok"]
        });
    }

    confirm(message, callback) {
        remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: 'question',
            title: 'Требуется подтверждение',
            message: message,
            buttons: ["Да", "Нет"],
            defaultId: 1,
        }).then((result) => {
            if (result.response === 0) {
                callback();
            }
        });
    }

    //
    // Application Logic
    //

    addSite() {
        this.view('siteform', settings.defaultSite, (site) => {
            this.saveAddedSite(site);
            this.toast({
                type: 'success',
                message: `Сайт успешно добавлен`,
                timeout: 1.5,
            });
        });
    }

    editSite(site) {
        this.view('siteform', site, (updatedSite) => {
            this.saveUpdatedSite(updatedSite);
            this.stepBack();
            this.toast({
                type: 'success',
                message: `Изменения сохранены`,
                timeout: 1.5,
            });
        });
    }

    openSite(site) {
        this.view('siteview', site);
    }

    deploySite(site) {
        this.view('deployer', site);
    }

    certMakeForSite(site) {
        if (!site.deploy.done) {
            const domain = this.getDomainFromURL(site.url);
            const text = [
                'Перед созданием SSL-сертификата необходимо: ',
                '1) Опубликовать сайт на сервере; ',
                `2) Привязать домен ${domain} к серверу ${site.server.host};`,
                '',
                `Повторите попытку после того, как сайт будет опубликован и станет доступен по адресу http://${domain}/`
            ];
            this.alert(text, 'info');
            return;
        }

        this.view('certmaker', site);
    }

    saveAddedSite(site) {
        let sites = this.config.get('sites', {});
        site.id = Object.keys(sites).length + 1;
        sites[site.id] = site;
        this.config.set('sites', sites);
        this.stepBack();
    }

    saveUpdatedSite(site) {
        let sites = this.config.get('sites', {});
        if (site.id in sites) {
            sites[site.id] = site;
            this.config.set('sites', sites);
        }
    }

    deleteSite(site) {
        let sites = this.config.get('sites', {});
        if (site.id in sites) {
            delete sites[site.id];
            this.config.set('sites', sites);
        }
    }

    getSite(id) {
        const sites = this.config.get('sites', {});
        return id in sites ? sites[id] : null;
    }

    getSiteByField(fieldName, value) {
        const sites = this.config.get('sites', {});
        let foundSite = null;
        Object.keys(sites).forEach((id) => {
            if (foundSite) { return; }
            const storedSite = sites[id];
            if (storedSite[fieldName] == value) {
                foundSite = storedSite;
            }
        });
        return foundSite;
    }

    isSiteExists(fieldName, value) {
        if (fieldName == 'id') {
            let sites = this.config.get('sites', {});
            return value in sites;
        }
        return this.getSiteByField(fieldName, value) !== null;
    }

    getDomainFromURL(url) {
        let parsedURL = new URL(url);
        return parsedURL.host;
    }

}

module.exports = App;
