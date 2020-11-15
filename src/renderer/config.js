var fs = require('fs');

class Config {

    dir = '.icms2deployer';
    file = 'config.json';

    values = {
        'sites': []
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
        fs.writeFileSync(this.getFilePath(), json);
    }

    load() {
        const json = fs.readFileSync(this.getFilePath()).toString('utf8');
        this.values = JSON.parse(json);
    }

}

module.exports = Config;