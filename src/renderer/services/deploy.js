const TaskRunner = load.class('taskrunner');


class DeployService extends TaskRunner {

    getTasks() {
        return [
            this.checkLocalRepository,
            this.initServer,
            this.serverAptUpdate,
            this.serverGitInstall,
            this.serverDockerInstall,
            this.serverCheckoutICMSDocker,
            this.serverCreateEnv,
            this.serverInstallICMS,
        ];
    }

    onStart() {
        this.site.git.dsn = this.gitService.getRepoDSN(this.site.git);
        this.site.serverDir = settings.serverSiteRoot + '/' + this.site.name;
    }

    //
    // Task Handlers
    //

    checkLocalRepository() {

        this.log('Проверяем локальный Git-репозиторий...');

        const cwd = this.site.localDir;

        this.shellService.exec('git remote show origin', cwd, (err) => {
            if (err) {
                this.hint('Локальный репозиторий не найден');

                this.log('Создаем локальный Git-репозиторий...');
                let commands = [
                    'git init',
                    'git add .',
                    'git commit -am "init"',
                    `git remote add origin ${this.site.git.dsn}`,
                    `git push -u origin master`,
                    `git tag v${this.site.version}`,
                    `git push origin v${this.site.version}`
                ];
                this.shellService.execMany(commands, this.site.localDir, (err) => {
                    if (err) {
                        this.halt();
                        return;
                    }
                    this.runNextTask();
                });
                return;
            }
            this.hint('Локальный репозиторий уже существует');
            this.runNextTask();
        });

    }

    initServer() {
        this.log('Подключаемся к серверу...');
        this.sshService.connect(this.site, (isConnected) => {
            if (!isConnected) {
                this.halt('Не удалось подключиться к серверу');
                return;
            }
            this.runNextTask();
        });
    }

    serverAptUpdate() {
        this.log('Обновляем источники APT...');
        this.sshService.exec('apt update -y', settings.serverSiteRoot, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось обновить источники APT');
                return;
            }
            this.runNextTask();
        });
    }

    serverGitInstall() {
        this.log('Устанавливаем Git...');
        this.sshService.exec('apt install git -y', settings.serverSiteRoot, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось установить Git на сервере');
                return;
            }
            this.runNextTask();
        });
    }

    serverDockerInstall() {
        this.log('Устанавливаем Docker...');
        this.sshService.exec('apt install docker.io docker-compose -y', settings.serverSiteRoot, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось установить Docker на сервере');
                return;
            }
            this.runNextTask();
        });
    }

    serverCheckoutICMSDocker() {
        this.log(`Клонируем icms2-docker в папку сайта...`);
        this.sshService.exec(`git clone ${settings.icms2dockerRepoUrl} ${this.site.serverDir}`, settings.serverSiteRoot, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось клонировать icms2-docker');
                return;
            }
            this.runNextTask();
        });
    }

    serverCreateEnv() {
        this.log(`Создаем конфигурацию icms2-docker...`);

        let envLines = [];
        Object.keys(this.site.config).forEach((name) => {
            const value = this.site.config[name];
            envLines.push(`${name}=${value}`);
        });
        envLines.push('');
        const envText = envLines.join('\\n');

        let command = `rm -f .env && touch .env && printf "${envText}" > .env`;

        this.sshService.exec(command, this.site.serverDir, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось создать конфигурацию icms2-docker');
                return;
            }
            this.sshService.exec('cat .env', this.site.serverDir, (isSuccess) => {
                if (!isSuccess) {
                    this.halt('Не удалось вывести конфигурацию');
                    return;
                }
                this.runNextTask();
            });
        });
    }

    serverInstallICMS() {
        this.log(`Инициализируем icms2-docker...`);

        let command = `./init.sh deploy ${this.site.git.dsn} --skip-wizard`;

        if (this.site.config.PHPMYADMIN_PORT) {
            command += ' --with-pma';
        }

        this.sshService.exec(command, this.site.serverDir, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось запустить icms2-docker');
                return;
            }
            this.runNextTask();
        });
    }

}

module.exports = new DeployService();
