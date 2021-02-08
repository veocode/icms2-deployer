const moment = load.node('moment');
const fs = load.node('fs');
const glob = load.node('glob');

const LogFile = load.class('logfile');
const Timer = load.class('timer');
const Component = load.class('component');
const FormHandler = load.class('formhandler');
const validatorService = load.service('validator');


class Deployer extends Component {

    deployService = load.service('deploy');

    site;
    configForm;
    timer;
    logfile;

    $formPanel;
    $logPanel;
    $log;
    $btnDone;
    $btnShowLog;
    $terminal;
    $terminalView;

    onInit() {
        this.$formPanel = this.$dom('.form-panel');
        this.$logPanel = this.$dom('.log-panel');
        this.$log = this.$dom('.log');
        this.$btnDone = this.$dom('.btn-done');
        this.$btnShowLog = this.$dom('.btn-show-log');
        this.$terminal = this.$dom('.terminal');
        this.$terminalView = this.$dom('.terminal-view');
        this.timer = new Timer();

        this.configForm = new FormHandler('#deployer-form', (deployConfig, form) => {
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
        });

        this.$dom('.btn-show-log').click((e) => {
            e.preventDefault();
            this.logfile.view();
        });
    }

    onActivation(site) {
        this.site = site;
        this.$btnDone.hide();
        this.$btnShowLog.hide();
        this.$formPanel.show();
        this.$logPanel.hide();
        this.$log.empty();
        this.$terminal.empty().html('');
        this.configForm.setValues(settings.defaultSite.config);
        this.logfile = new LogFile();
        app.setTitle('Публикация сайта', 'siteview', this.site);
        this.bind($.extend(this.site, {
            'isDumpFound': this.isSiteContainsDump()
        }));
    }

    onDeactivation() {
        this.site = null;
        this.configForm.resetValues();
        this.logfile.delete();
    }

    deploy(config) {
        this.$formPanel.hide();
        this.$logPanel.show();

        if (config.makeProdConfig) {
            this.makeProdConfig(config);
        }

        app.setToolbar([this.timer]);
        this.timer.start();

        delete config.makeProdConfig;

        config.PHPMYADMIN_INSTALL = config.PHPMYADMIN_INSTALL ? 'y' : 'n';
        config.HTTP_HOST = this.site.domain;

        this.site.config = config;

        this.initLog();

        app.saveUpdatedSite(this.site);

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
        this.timer.stop();
        this.logfile.close();

        if (isSuccess) {
            this.site.deploy.done = true;
            this.site.deploy.date = Date.now();

            let url = this.site.url;
            if (this.site.config.HTTP_PORT != 80) {
                url += `:${this.site.config.HTTP_PORT}`;
            }

            this.log({ text: `Готово! Ваш сайт: <a class="shell-link" href="${url}">${url}</a>`, type: 'done' });
        }

        app.saveUpdatedSite(this.site);
        this.$btnDone.show();
        this.$btnShowLog.show();
    }

    initLog() {
        this.logfile.write('Начало лога: ' + moment().locale('ru').format('LLL'));
        this.logfile.write('Параметры публикации: ')
        $.each(this.site.config, (param, value) => {
            this.logfile.write(`    ${param} = ${value}`);
        });
        this.logfile.write('');
        this.logfile.write('Лог публикации:');
    }

    log(message) {
        const logMessageTime = this.timer.getTimeString();
        const logMessageType = message.type.padEnd(6);
        const logMessageText = message.text;
        this.logfile.write(`[${logMessageTime}][${logMessageType}] ${logMessageText}`);

        if (message.type == 'stdout' || message.type == 'stderr' || message.type == 'exec') {
            this.$terminal.append(`<div class="line line-${message.type}">${message.text}</div>`);
            this.$terminalView.scrollTop(this.$terminal.height());
            return;
        }

        let $message = $('<li></li>').addClass('message').addClass(`message-${message.type}`).html(message.text);
        this.$log.append($message);
    }

    isSiteContainsDump() {
        return glob.sync('*.sql', { cwd: this.site.localDir }).length > 0;
    }

    makeProdConfig(config) {
        const baseConfigFile = `${this.site.localDir}/system/config/config.php`;
        const prodConfigFile = `${this.site.localDir}/system/config/config.prod.php`;

        let baseConfig = fs.readFileSync(baseConfigFile, { encoding: 'utf8' });

        let values = {
            host: this.site.url,
            db_host: 'mysql',
            db_base: config.MYSQL_DATABASE,
            db_user: config.MYSQL_USER,
            db_pass: config.MYSQL_PASSWORD,
        }

        Object.keys(values).forEach((key) => {
            const value = values[key];
            const regExp = new RegExp(`('${key}'\\t*\\s*=>\\t*\\s*')(.*)(',)`);
            baseConfig = baseConfig.replace(regExp, `$1${value}$3`);
        });

        fs.writeFileSync(prodConfigFile, baseConfig);
    }

}

module.exports = new Deployer();
