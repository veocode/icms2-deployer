var fs = require('fs');
var path = require('path');

class Validator {

    validateSite(values, callback) {

        let isEmptyFields = false;

        Object.keys(values).forEach((fieldName) => {
            if (values[fieldName] === '') { isEmptyFields = true; }
        });

        if (isEmptyFields) {
            callback(false, 'Заполните все поля');
            return;
        }

        if (!this.isFolderContainsICMS2(values.localDir)) {
            callback(false, `InstantCMS 2 не найдена в указанной папке: ${values.localDir}`);
            return;
        }

        callback(true);

        // this.testSSHConnectionWorks(values, (isWorks) => {
        //     if (!isWorks) {
        //         callback(false, 'Не удалось подключиться к серверу по SSH\nПроверьте правильность реквизитов');
        //         return;
        //     }
        //     callback(true);
        // });

    }

    isFolderContainsICMS2(dir) {
        let isContains = fs.existsSync(path.resolve(dir, 'system', 'core', 'core.php'));
        isContains = fs.existsSync(path.resolve(dir, 'system', 'libs', 'html.helper.php')) && isContains;
        return isContains;
    }

    testSSHConnectionWorks(values, callback) {

        const connect = require('ssh2-connect');

        const opts = {
            host: values.serverHost,
            port: values.serverPort,
            username: values.serverUser,
            password: values.serverPassword
        };

        (async () => {
            try {
                const ssh = await connect(opts)
                callback(true);
                ssh.end()
            } catch (err) {
                callback(false);
            }
        })();

    }

}

module.exports = Validator;