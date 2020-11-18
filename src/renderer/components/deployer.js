const Component = require('../component');
const FormHandler = require('../formhandler');
const Validator = require('../validator');


class Deployer extends Component {

    site;
    $formPanel = this.$dom('.form-panel');
    $logPanel = this.$dom('.log-panel');
    $log = this.$dom('.log');
    $terminal = this.$dom('.terminal');

    deployService = require('../services/deploy');

    passwordsForm = new FormHandler('#deployer form', (passwords, form) => {
        form.startLoading();
        const validator = new Validator();
        validator.validatePasswords(this.site, passwords, (isValid, error) => {
            console.error('Validated', isValid);
            form.endLoading();
            if (!isValid) {
                alert(error);
                return;
            }
            this.deploy(passwords);
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
        this.app.setTitle('Публикация сайта', 'siteview', this.site);
    }

    onDeactivation() {
        this.site = null;
        this.passwordsForm.resetValues();
    }

    deploy(passwords) {

        this.$formPanel.hide();
        this.$logPanel.show();

        this.site = $.extend(this.site, passwords);

        this.deployService.deploy({
            site: this.site,
            onLog: (logMessage) => {
                this.log(logMessage);
            },
            onDone: (isSuccess) => {
                if (isSuccess) {
                    alert('DONE!');
                }
            }
        });

    }

    log(message) {

        if (message.type == 'stdout' || message.type == 'stderr') {
            this.$terminal.append(`<div class="line line-${message.type}">${message.text}</div>`);
            return;
        }

        let $message = $('<li></li>').addClass('message').html(message.text);
        this.$log.append($message);
    }

}

module.exports = Deployer;