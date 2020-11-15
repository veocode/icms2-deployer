const os = require('os');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
console.log(remote);

var Config = require('./../../renderer/config');

function componentClass(className) {
    return require(`./../../renderer/components/${className}`);
}

class App {

    config = new Config();

    dom = {
        $title: $('.nav-title'),
        $backBtn: $('.nav-back .btn')
    }

    components = {
        sitelist: new (componentClass('sitelist'))('sitelist', this),
        siteadd: new (componentClass('siteadd'))('siteadd', this),
        deployer: new (componentClass('deployer'))('deployer', this),
    }
    defaultComponent = 'sitelist';
    currentComponent = this.defaultComponent;

    back = null;

    start() {
        this.setTitle("Мои сайты");
        this.view(this.defaultComponent);
    }

    stepBack() {
        this.view(this.back);
    }

    addSite() {
        this.view('siteadd');
    }

    deploySite(site) {

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

    view(componentName, params) {
        if (componentName != this.currentComponent) {
            this.components[this.currentComponent].deactivate();
        }
        this.components[componentName].activate(params);
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

