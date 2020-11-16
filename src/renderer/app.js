const os = require('os');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;

var Config = require('./../../renderer/config');

function componentClass(className) {
    return require(`./../../renderer/components/${className}`);
}

class App {

    config = new Config();

    dom = {
        $title: $('.header .title'),
        $backBtn: $('.nav-back .btn')
    }

    components = {
        sitelist: new (componentClass('sitelist'))('sitelist', this),
        siteform: new (componentClass('siteform'))('siteform', this),
        siteview: new (componentClass('siteview'))('siteview', this),
    }
    defaultComponent = 'sitelist';
    currentComponent = this.defaultComponent;

    back = null;

    start() {
        this.view(this.defaultComponent);
    }

    stepBack() {
        this.view(this.back);
    }

    addSite() {
        const defaultSite = {
            name: '',
            url: '',
            localDir: '',
            gitRepo: 'https://github.com/veocode/testrepo.git',
            gitUser: 'veocode',
            serverHost: '167.99.82.3',
            serverPort: '22',
            serverUser: 'root',
        };
        this.view('siteform', defaultSite, (site) => {
            this.saveAddedSite(site);
        });
    }

    editSite(site) {
        this.view('siteform', site, (updatedSite) => {
            this.saveUpdatedSite(updatedSite);
        });
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
        this.stepBack();
    }

    openSite(site) {
        this.view('siteview', site);
    }

    setTitle(title, back) {
        this.dom.$title.html(title);
        if (back) {
            this.dom.$backBtn.show();
            this.back = back;
        } else {
            this.dom.$backBtn.hide();
            this.back = null;
        }
    }

    view(componentName, params, callback) {
        if (componentName != this.currentComponent) {
            this.components[this.currentComponent].deactivate();
        }
        const component = this.components[componentName];
        component.activate(params);
        if (callback) {
            component.setCallback(callback);
        }
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

}

var app = new App();

$(() => {
    app.start();
});
