const path = load.node('path');
const Component = load.class('component');
const FormHandler = load.class('formhandler');
const validatorService = load.service('validator');


class SiteForm extends Component {

    site;
    form;
    mode = 'add';

    onInit() {
        const $inputDir = this.$dom('#input-dir');
        $inputDir.click((e) => {
            this.askSiteDir();
        });

        this.form = new FormHandler('#siteform form', (values, form) => {
            form.startLoading();
            validatorService.validateSite(this.mode, values, (isValid, error) => {
                form.endLoading();
                if (!isValid) {
                    app.alert(error, 'warning');
                    return;
                }
                let site = $.extend(this.site, values);
                site.domain = app.getDomainFromURL(site.url);
                this.result(site);
            });
        });
    }

    askSiteDir() {
        const $inputDir = this.$dom('#input-dir');
        const $inputName = this.$dom('#input-name');
        const $inputURL = this.$dom('#input-url');
        app.openDirectorySelectDialog((dirName) => {
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
        this.mode = site.id ? 'edit' : 'add';
        const title = site.id ? 'Редактировать сайт' : 'Добавить сайт';
        if (this.mode == 'add') {
            site = $.extend(settings.defaultSite, site);
        }
        this.site = site;
        app.setTitle(title, 'sitelist');
        this.form.setValues(site);
        app.setToolbar([{
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
                app.stepBack();
            }
        }]);
    }

    onDeactivation() {
        this.form.resetValues();
    }

}

module.exports = new SiteForm();
