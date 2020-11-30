const TaskRunner = load.class('taskrunner');


class CertMakeService extends TaskRunner {

    getTasks() {
        return [
            this.connectToServer,
            this.serverMakeCert,
        ];
    }

    //
    // Task Handlers
    //

    connectToServer() {
        this.log('Подключаемся к серверу...');
        this.sshService.connect(this.site, (isConnected) => {
            if (!isConnected) {
                this.halt('Не удалось подключиться к серверу');
                return;
            }
            this.runNextTask();
        });
    }

    serverMakeCert() {
        this.log(`Создаём SSL-сертификат...`);

        let command = `./init.sh makecert ${this.site.cert.email} ${this.site.cert.domain}`;

        if (this.site.cert.isForceHTTPS) {
            command += ' --force-https';
        }

        this.sshService.exec(command, this.site.server.dir, (isSuccess) => {
            if (!isSuccess) {
                this.halt('Не удалось выпустить сертификат');
                return;
            }
            this.runNextTask();
        });
    }

}

module.exports = new CertMakeService();
