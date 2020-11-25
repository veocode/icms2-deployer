const fs = require('fs');
const encryptService = require('./services/encrypt');

class Config {

    dir = '.icms2deployer';
    file = 'config.json';

    isEncrypted = false;

    values = {
        'sites': [],
        'defaultSite': {
            name: '',
            url: '',
            localDir: '',
            version: '1.0.0',
            gitRepo: 'https://github.com/veocode/testrepo.git',
            gitUser: 'veocode',
            serverHost: '134.209.26.140',
            serverPort: '22',
            serverUser: 'root',
            config: {
                HTTP_PORT: 80,
                PHPMYADMIN_PORT: 8080,
                MYSQL_DATABASE: 'icmsdb',
                MYSQL_USER: 'icmsdb',
                MYSQL_PASSWORD: 'secret',
                MYSQL_ROOT_PASSWORD: 'rootsecret',
                PHPMYADMIN_INSTALL: 'y'
            }
        },
    };

    constructor() {
        if (!this.isExists()) {
            this.save();
            return;
        }
        this.load();
    }

    get(key, defaultValue, isReloadFirst) {
        if (isReloadFirst) {
            this.load();
        }
        return (key in this.values) ? this.values[key] : defaultValue;
    }

    set(key, value) {
        this.values[key] = value;
        this.save();
    }

    getDirPath() {
        return path.join(os.homedir(), this.dir);
    }

    getFilePath() {
        return path.join(this.getDirPath(), this.file);
    }

    isExists() {
        return fs.existsSync(this.getFilePath());
    }

    save() {
        if (!this.isExists()) {
            try { fs.mkdirSync(this.getDirPath()); } catch { }
        }
        const json = JSON.stringify(this.values, null, 4);
        const encryptedJSON = this.isEncrypted ? encryptService.encrypt(json) : json;
        fs.writeFileSync(this.getFilePath(), encryptedJSON);
    }

    load() {
        const encryptedJSON = fs.readFileSync(this.getFilePath()).toString('utf8');
        const json = this.isEncrypted ? encryptService.decrypt(encryptedJSON) : encryptedJSON;
        this.values = JSON.parse(json);
    }

}

module.exports = Config;