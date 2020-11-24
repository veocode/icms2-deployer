const path = require('path');
const Component = require('../component');
const FormHandler = require('../formhandler');
const Validator = require('../validator');

class SiteForm extends Component {

    form = new FormHandler('#siteform form', (values, form) => {
        form.startLoading();
        const validator = new Validator();
        validator.validateSite(values, (isValid, error) => {
            form.endLoading();
            if (!isValid) {
                this.app.alert(error, 'warning');
                return;
            }
            this.result(values);
        });
    });

    onInit() {
        const $inputDir = this.$dom('#input-dir');
        $inputDir.click((e) => {
            this.askSiteDir();
        });
    }

    askSiteDir() {
        const $inputDir = this.$dom('#input-dir');
        const $inputName = this.$dom('#input-name');
        const $inputURL = this.$dom('#input-url');
        this.app.openDirectorySelectDialog((dirName) => {
            $inputDir.val(dirName);
            const baseName = path.basename(dirName);
            if (!$inputName.val()) {
                $inputName.val(baseName);
            }
            if (!$inputURL.val()) {
                $inputURL.val(`http://${baseName}/`);
            }
        })
    }

    onActivation(site) {
        const title = site.id ? 'Редактировать сайт' : 'Добавить сайт';
        this.app.setTitle(title, 'sitelist');
        this.form.setValues(site);
    }

    onDeactivation() {
        this.form.resetValues();
    }

}

module.exports = SiteForm;