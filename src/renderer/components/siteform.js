const path = load.node('path');
const Component = load.module('component');
const FormHandler = load.module('formhandler');
const Validator = load.module('validator');


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
        this.app.setToolbar([{
            hint: 'Сохранить',
            icon: 'check',
            class: 'success',
            click: () => {
                this.form.submit();
            }
        }, {
            hint: 'Отменить',
            icon: 'times',
            class: 'danger',
            click: () => {
                this.app.stepBack();
            }
        }]);
    }

    onDeactivation() {
        this.form.resetValues();
    }

}

module.exports = SiteForm;