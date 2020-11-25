const os = require('os');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const shell = require('electron').shell;
const clipboard = require('electron').clipboard;

const Config = require('./../../renderer/config');
const encryptService = require('./../../renderer/services/encrypt');


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
        $title: $('.header .title'),
        $toolbar: $('.header .toolbar'),
        $backBtn: $('.nav-back .btn'),
        $workspace: $('.workspace')
    }

    config;
    fingerPrint;

    componentInstances = {};
    currentComponent = this.defaultComponent;
    previousComponent = null;
    previousComponentParams = null;

    //
    // Framework Logic
    //

    start(fingerPrint) {
        this.fingerPrint = fingerPrint;
        this.config = new Config(fingerPrint);
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

    makeComponent(componentName) {
        const componentClass = require(`./../../renderer/components/${componentName}`);
        return new (componentClass)(componentName, this);
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
                let $icon = $('<i class="fa"></i>').appendTo($button);
                $icon.addClass(`fa-${button.icon}`);
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
        const defaultSite = this.config.get('defaultSite', {});
        this.view('siteform', defaultSite, (site) => {
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

    saveAddedSite(site) {
        let sites = this.config.get('sites', []);
        site.isDeployed = false;
        site.id = sites.length + 1;
        sites.push(site);
        this.config.set('sites', sites);
        this.stepBack();
    }

    saveUpdatedSite(site) {
        let sites = this.config.get('sites', []);
        sites.forEach((storedSite, i) => {
            if (storedSite.id == site.id) {
                sites[i] = site;
            }
        });
        this.config.set('sites', sites);
    }

    deleteSite(site) {
        let sites = this.config.get('sites', []);
        let updatedSites = [];
        sites.forEach((storedSite, i) => {
            if (storedSite.id != site.id) {
                updatedSites.push(storedSite);
            }
        });
        this.config.set('sites', updatedSites);
    }

    getSiteByField(fieldName, value) {
        console.log('getSiteByField', fieldName, value);
        let sites = this.config.get('sites', []);
        let foundSite = null;
        sites.forEach((storedSite, i) => {
            if (foundSite) { return; }
            if (storedSite[fieldName] == value) {
                console.log('found site', foundSite);
                foundSite = storedSite;
            }
        });
        return foundSite;
    }

    isSiteExists(fieldName, value) {
        return this.getSiteByField(fieldName, value) !== null;
    }

}

window.app = new App();

$(() => {
    encryptService.init(() => {
        window.app.start();
    })
});
