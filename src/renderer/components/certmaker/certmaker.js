const Component = load.class('component');
const FormHandler = load.class('formhandler');
const validatorService = load.service('validator');


class CertMaker extends Component {

    certMakeService = load.service('certmake');

    site;
    configForm;

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

        this.configForm = new FormHandler('#certmaker-form', (certConfig, form) => {
            this.makeCert(certConfig);
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
        this.configForm.setValues(settings.defaultSite.config);
        app.setTitle('Публикация сайта', 'siteview', this.site);
    }

    onDeactivation() {
        this.site = null;
        this.configForm.resetValues();
    }

    makeCert(config) {
        this.$formPanel.hide();
        this.$logPanel.show();

        this.site.cert.domain = config.domain;
        this.site.cert.email = config.email;

        this.certMakeService.start({
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
            this.site.cert.done = true;
            this.site.cert.date = Date.now();
            this.log({ text: `Готово!`, type: 'done' });
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

module.exports = new CertMaker();
