const Component = require('../component');
const FormHandler = require('../formhandler');
const Validator = require('../validator');


class Deployer extends Component {

    site;
    $formPanel = this.$dom('.form-panel');
    $logPanel = this.$dom('.log-panel');
    $log = this.$dom('.log');
    $terminal = this.$dom('.terminal');
    $terminalView = this.$dom('.terminal-view');

    deployService = require('../services/deploy');    

    credentialsForm = new FormHandler('#deployer form', (credentials, form) => {
        form.startLoading();
        const validator = new Validator();
        validator.validateCredentials(this.site, credentials, (isValid, error) => {
            form.endLoading();
            if (!isValid) {
                alert(error);
                return;
            }
            this.deploy(credentials);
        });
    });

    onInit() {

    }

    onActivation(site) {
        this.site = site;
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

        this.site.gitPassword = credentials.gitPassword;
        this.site.serverPassword = credentials.serverPassword;

        delete credentials.gitPassword;
        delete credentials.serverPassword;

        this.site.config = credentials;
        this.site.config.PHPMYADMIN_INSTALL = 'y'; 
        
        if (!credentials.PHPMYADMIN_PORT) {
            this.site.config.PHPMYADMIN_INSTALL = 'n'; 
            this.site.config.PHPMYADMIN_PORT = 8080; 
        }

        this.deployService.deploy({
            site: this.site,
            onLog: (logMessage) => {
                this.log(logMessage);
            },
            onDone: (isSuccess) => {
                this.done(isSuccess);
            }
        });
    }

    done(isSuccess){
        if (isSuccess) {
            let url = `http://${this.site.serverHost}`;
            if (this.site.serverPort != 80){
                url += `:${this.site.serverPort}`;
            }
            url += '/';
            this.log({text: `Готово! Ваш сайт: <a href="${url}">${url}</a>`})
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