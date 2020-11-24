var fs = require('fs');
var path = require('path');

class Validator {

    validateSite(values, callback) {

        if (!this.isFolderContainsICMS2(values.localDir)) {
            callback(false, `InstantCMS 2 не найдена в указанной папке:\n${values.localDir}`);
            return;
        }

        callback(true);

    }

    validateCredentials(site, credentials, callback) {

        const sshCredentials = {
            host: site.serverHost,
            port: site.serverPort,
            user: site.serverUser,
            password: credentials.serverPassword
        };

        this.testGitInstalled((isInstalled) => {

            if (!isInstalled) {
                callback(false, 'Не удалось запустить команду git:\nПроверьте, что Git установлен и команда git доступна в ОС из командной строки');
                return;
            }

            callback(true);

        });

    }

    isFolderContainsICMS2(dir) {
        let isContains = fs.existsSync(path.resolve(dir, 'system', 'core', 'core.php'));
        isContains = fs.existsSync(path.resolve(dir, 'system', 'libs', 'html.helper.php')) && isContains;
        return isContains;
    }

    testGitInstalled(callback) {

        const shellService = require('./services/shell');

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
