const fs = load.node('fs');
const path = load.node('path');
const shellService = load.service('shell');


class ValidatorService {

    validateSite(mode, values, callback) {

        if (!this.isFolderContainsICMS2(values.localDir)) {
            callback(false, `InstantCMS 2 не найдена в указанной папке:\n${values.localDir}`);
            return;
        }

        if (mode == 'add') {
            if (window.app.isSiteExists('localDir', values.localDir)) {
                callback(false, `Сайт из этой папки уже был добавлен:\n${values.localDir}`);
                return;
            }
        }

        callback(true);
    }

    validateDeployment(site, config, callback) {

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

module.exports = new ValidatorService();
