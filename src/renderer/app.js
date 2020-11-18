const os = require('os');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
var Config = require('./../../renderer/config');


class App {

    config = new Config();

    //
    // Application Properties
    //

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
        $backBtn: $('.nav-back .btn')
    }

    componentInstances = {};
    currentComponent = this.defaultComponent;
    previousComponent = null;
    previousComponentParams = null;

    //
    // Framework Logic
    //

    start() {
        this.initComponents();
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

    view(componentName, params, callback) {
        if (this.currentComponent) {
            this.componentInstances[this.currentComponent].deactivate();
        }
        const component = this.componentInstances[componentName];
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

    //
    // Application Logic
    //

    addSite() {
        const defaultSite = this.config.get('defaultSite', {});
        this.view('siteform', defaultSite, (site) => {
            this.saveAddedSite(site);
        });
    }

    editSite(site) {
        this.view('siteform', site, (updatedSite) => {
            this.saveUpdatedSite(updatedSite);
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
        this.stepBack();
    }

}


var app = new App();

$(() => {
    app.start();
});
