const Component = load.class('component');
const FormHandler = load.class('formhandler');
const validatorService = load.service('validator');


class Deployer extends Component {

    deployService = load.service('deploy');

    site;
    credentialsForm;

    $formPanel;
    $logPanel;
    $log;
    $btnDone;
    $terminal;
    $terminalView;

    onInit() {
        this.$formPanel = this.$dom('.form-panel');
        this.$logPanel = this.$dom('.log-panel');
        this.$log = this.$dom('.log');
        this.$btnDone = this.$dom('.btn-done');
        this.$terminal = this.$dom('.terminal');
        this.$terminalView = this.$dom('.terminal-view');

        this.credentialsForm = new FormHandler('#deployer form', (deployConfig, form) => {
            form.startLoading();
            validatorService.validateDeployment(this.site, deployConfig, (isValid, error) => {
                form.endLoading();
                if (!isValid) {
                    app.alert(error, 'warning');
                    return;
                }
                this.deploy(deployConfig);
            });
        });

        this.$dom('.btn-done').click((e) => {
            e.preventDefault();
            app.openSite(this.site);
        })
    }

    onActivation(site) {
        this.site = site;
        this.$btnDone.hide();
        this.$formPanel.show();
        this.$logPanel.hide();
        this.$log.empty();
        this.$terminal.empty().html('');
        this.credentialsForm.setValues(settings.defaultSite.config);
        app.setTitle('Публикация сайта', 'siteview', this.site);
    }

    onDeactivation() {
        this.site = null;
        this.credentialsForm.resetValues();
    }

    deploy(config) {
        this.$formPanel.hide();
        this.$logPanel.show();

        this.site.config = config;
        this.site.config.PHPMYADMIN_INSTALL = 'y';

        if (!config.PHPMYADMIN_PORT) {
            this.site.config.PHPMYADMIN_INSTALL = 'n';
            this.site.config.PHPMYADMIN_PORT = 8080;
        }

        this.deployService.start({
            site: this.site,
            onLog: (logMessage) => {
                this.log(logMessage);
            },
            onDone: (isSuccess) => {
                this.done(isSuccess);
            }
        });
    }

    done(isSuccess) {
        if (isSuccess) {
            this.site.deploy.done = true;
            this.site.deploy.date = Date.now();

            let url = this.site.url;
            if (this.site.config.HTTP_PORT != 80) {
                url += `:${this.site.config.HTTP_PORT}`;
            }
            url += '/';

            this.log({ text: `Готово! Ваш сайт: <a class="shell-link" href="${url}">${url}</a>`, type: 'done' });
        }

        app.saveUpdatedSite(this.site);
        this.$btnDone.show();
    }

    log(message) {
        if (message.type == 'stdout' || message.type == 'stderr' || message.type == 'exec') {
            this.$terminal.append(`<div class="line line-${message.type}">${message.text}</div>`);
            this.$terminalView.scrollTop(this.$terminal.height());
            return;
        }

        let $message = $('<li></li>').addClass('message').addClass(`message-${message.type}`).html(message.text);
        this.$log.append($message);
    }

}

module.exports = new Deployer();
