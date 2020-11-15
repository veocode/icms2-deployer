const Component = require('../component');

class SiteAdd extends Component {

    inputDir;

    onInit() {
        this.$inputDir = this.$dom('#input-dir');
        this.$inputDir.click((e) => {
            this.askSiteDir();
        });
    }

    askSiteDir() {
        this.app.openDirectorySelectDialog((dirName) => {
            this.$inputDir.val(dirName);
        })
    }

    onActivation() {
        this.app.setTitle('Добавить сайт', 'sitelist');
    }

    onDeactivation() {
    }

}

module.exports = SiteAdd;