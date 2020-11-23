var fs = require('fs');
var path = require('path');

class Validator {

    validateSite(values, callback) {

        let isEmptyFields = false;

        Object.keys(values).forEach((fieldName) => {
            if (['id', 'isDeployed'].indexOf(fieldName) >= 0) {
                return;
            }
            if (values[fieldName] === '') { isEmptyFields = true; }
        });

        if (isEmptyFields) {
            callback(false, 'Заполните все поля');
            return;
        }

        if (!this.isFolderContainsICMS2(values.localDir)) {
            callback(false, `InstantCMS 2 не найдена в указанной папке:\n${values.localDir}`);
            return;
        }

        callback(true);

    }

    validateCredentials(site, credentials, callback) {

        let isEmptyFields = false;

        Object.keys(credentials).forEach((fieldName) => {
            if (['PHPMYADMIN_PORT'].indexOf(fieldName) >= 0) {
                return;
            }
            if (credentials[fieldName] === '') { isEmptyFields = true; }
        });

        if (isEmptyFields) {
            callback(false, 'Заполните все поля');
            return;
        }

        const sshCredentials = {
            host: site.serverHost,
            port: site.serverPort,
            user: site.serverUser,
            password: credentials.serverPassword
        };

        // this.testSSHConnectionWorks(sshCredentials, (isWorks) => {

        //     if (!isWorks) {
        //         callback(false, 'Не удалось подключиться к серверу по SSH:\nПроверьте правильность реквизитов');
        //         return;
        //     }

        this.testGitInstalled((isInstalled) => {

            if (!isInstalled) {
                callback(false, 'Не удалось запустить команду git:\nПроверьте, что Git установлен и команда git доступна в ОС из командной строки');
                return;
            }

            callback(true);

        });

        // });


    }

    isFolderContainsICMS2(dir) {
        let isContains = fs.existsSync(path.resolve(dir, 'system', 'core', 'core.php'));
        isContains = fs.existsSync(path.resolve(dir, 'system', 'libs', 'html.helper.php')) && isContains;
        return isContains;
    }

    testGitInstalled(callback) {

        const shellService = require('./services/shell');

        shellService.stdoutCallback = (message) => {
            console.log('[STDOUT] ' + message);
        }

        shellService.exec('git --version', '', (error) => {
            if (error) {
                callback(false);
                return;
            }
            callback(true);
        });

    }

    testSSHConnectionWorks(credentials, callback) {

        const connect = require('ssh2-connect');

        const opts = {
            host: credentials.host,
            port: credentials.port,
            username: credentials.user,
            password: credentials.password
        };

        // connect(opts, function (err, ssh) {
        //     if (err) {
        //         callback(false);
        //         return;
        //     }
        //     ssh.end();
        //     callback(true);
        // });


        (async () => {
            try {
                const ssh = await connect(opts)
                ssh.end()
                callback(true);
            } catch (err) {
                callback(false);
            }
        })();

    }

}

module.exports = Validator;