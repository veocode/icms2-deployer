const os = load.node('os');
const path = load.node('path');
const fs = load.node('fs');
const encryptService = load.service('encrypt');

class Config {

    values = {
        'sites': [],
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
        return path.join(os.homedir(), settings.config.dir);
    }

    getFilePath() {
        return path.join(this.getDirPath(), settings.config.file);
    }

    isExists() {
        return fs.existsSync(this.getFilePath());
    }

    save() {
        if (!this.isExists()) {
            try { fs.mkdirSync(this.getDirPath()); } catch { }
        }
        const json = JSON.stringify(this.values, null, 4);
        const encryptedJSON = settings.config.isEncrypt ? encryptService.encrypt(json) : json;
        fs.writeFileSync(this.getFilePath(), encryptedJSON);
    }

    load() {
        const encryptedJSON = fs.readFileSync(this.getFilePath()).toString('utf8');
        const json = settings.config.isEncrypt ? encryptService.decrypt(encryptedJSON) : encryptedJSON;
        this.values = JSON.parse(json);
    }

}

module.exports = Config;
