class TaskRunnerService {

    site;
    onLog;
    onDone;

    shellService = require('../services/shell');
    gitService = require('../services/git');
    sshService = require('../services/ssh');

    tasks = [];

    getTasks() {
        return [];
    }

    onStart() {

    }

    start(options) {
        this.site = options.site;
        this.onLog = options.onLog;
        this.onDone = options.onDone;
        this.tasks = this.getTasks();
        this.onStart(options);
        this.initServices();
        this.runNextTask();
    }

    initServices() {        
        this.shellService.execCallback = (line) => {
            this.log('$ ' + line, 'exec');
        };
        this.shellService.stdoutCallback = (line) => {
            this.log(line, 'stdout');
        };
        this.shellService.stderrCallback = (line) => {
            this.log(line, 'stderr');
        }
        this.sshService.execCallback = (line) => {
            this.log('$ ' + line, 'exec');
        };        
        this.sshService.stdoutCallback = (line) => {
            this.log(line, 'stdout');
        };
        this.sshService.stderrCallback = (line) => {
            this.log(line, 'stderr');
        }        
    }

    log(text, type) {
        type = type || 'step';
        this.onLog({ text, type });
    }

    error(text) {
        this.log(text, 'error');
    }

    hint(text) {
        return this.log(text, 'hint');
    }

    halt(message) {
        this.error(message ? message : 'Выполнение остановлено');
        this.sshService.close();
        this.onDone(false);
    }

    done() {
        this.sshService.close();
        this.onDone(true);        
    }

    runNextTask() {
        if (this.tasks.length == 0) {
            this.done();
            return;
        }
        const taskHandler = this.tasks.shift();
        taskHandler.call(this);
    }

}

module.exports = TaskRunnerService;