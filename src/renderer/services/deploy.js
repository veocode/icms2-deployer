class DeployService {

    site;
    onLog;
    onDone;

    shellService = require('../services/shell');

    tasks = [
        this.checkLocalRepository,
        this.initLocalRepository,
        this.initServer,
    ];

    constructor() {
        this.shellService.stdoutCallback = (line) => {
            this.log(line, 'stdout');
        };

        this.shellService.stderrCallback = (line) => {
            this.log(line, 'stderr');
        }
    }

    deploy(options) {
        this.halted = false;
        this.site = options.site;
        this.onLog = options.onLog;
        this.onDone = options.onDone;
        this.runNextTask();
    }

    log(text, type) {
        type = type || 'step';
        this.onLog({ text, type });
    }

    halt() {
        this.log('Публикация остановлена', 'error');
        this.onDone(false);
    }

    runNextTask() {
        if (this.tasks.length == 0) {
            this.onDone(true);
            return;
        }
        const taskHandler = this.tasks.shift();
        taskHandler.call(this);
    }

    //
    // Task Handlers
    //

    checkLocalRepository() {

        this.log('Проверяем локальный Git-репозиторий...');

        let commands = [
            'git remote show origin',
        ];

        this.shellService.execMany(commands, this.site.localDir, (err) => {
            if (err) {
                this.halt();
                return;
            }
            this.runNextTask();
        });

    }

    initLocalRepository() {
        this.log('Создаем локальный Git-репозиторий...');
        setTimeout(() => {
            this.runNextTask();
        }, 2000);
    }

    initServer() {
        this.log('Подключаемся к серверу...');
        setTimeout(() => {
            this.runNextTask();
        }, 2000);
    }

}

module.exports = new DeployService();