const Component = require('../component');
const FormHandler = require('../formhandler');
const Validator = require('../validator');


class Deployer extends Component {

    site;
    siteToDeploy;

    $formPanel = this.$dom('.form-panel');
    $logPanel = this.$dom('.log-panel');
    $log = this.$dom('.log');
    $btnDone = this.$dom('.btn-done');
    $terminal = this.$dom('.terminal');
    $terminalView = this.$dom('.terminal-view');

    deployService = require('../services/deploy');

    credentialsForm = new FormHandler('#deployer form', (credentials, form) => {
        form.startLoading();
        const validator = new Validator();
        validator.validateCredentials(this.site, credentials, (isValid, error) => {
            form.endLoading();
            if (!isValid) {
                this.app.alert(error, 'warning');
                return;
            }
            this.deploy(credentials);
        });
    });

    onInit() {
        this.$dom('.btn-done').click((e) => {
            e.preventDefault();
            this.app.openSite(this.site);
        })
    }

    onActivation(site) {
        this.site = site;
        this.$btnDone.hide();
        this.$formPanel.show();
        this.$logPanel.hide();
        this.$log.empty();
        this.$terminal.empty().html('');
        this.credentialsForm.setValues(this.app.config.get('defaultDeployConfig', {}));
        this.app.setTitle('Публикация сайта', 'siteview', this.site);
    }

    onDeactivation() {
        this.site = null;
        this.credentialsForm.resetValues();
    }

    deploy(credentials) {
        this.$formPanel.hide();
        this.$logPanel.show();

        this.siteToDeploy = { ...this.site };

        this.siteToDeploy.gitPassword = credentials.gitPassword;
        this.siteToDeploy.serverPassword = credentials.serverPassword;

        delete credentials.gitPassword;
        delete credentials.serverPassword;

        this.siteToDeploy.config = credentials;
        this.siteToDeploy.config.PHPMYADMIN_INSTALL = 'y';

        if (!credentials.PHPMYADMIN_PORT) {
            this.siteToDeploy.config.PHPMYADMIN_INSTALL = 'n';
            this.siteToDeploy.config.PHPMYADMIN_PORT = 8080;
        }

        this.deployService.start({
            site: this.siteToDeploy,
            onLog: (logMessage) => {
                this.log(logMessage);
            },
            onDone: (isSuccess) => {
                this.done(isSuccess);
            }
        });
    }

    done(isSuccess) {
        this.$btnDone.show();

        if (isSuccess) {
            this.site.isDeployed = true;
            this.site.deployedAt = Date.now();
            this.app.saveUpdatedSite(this.site);

            let url = `http://${this.site.serverHost}`;
            if (this.siteToDeploy.config.HTTP_PORT != 80) {
                url += `:${this.siteToDeploy.config.HTTP_PORT}`;
            }
            url += '/';
            this.log({ text: `Готово! Ваш сайт: <a class="shell-link" href="${url}">${url}</a>`, type: 'done' });
        }
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

module.exports = Deployer;