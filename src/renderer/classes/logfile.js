const os = load.node('os');
const path = load.node('path');
const fs = load.node('fs');

class LogFile {

    name;
    directory;
    path;

    logger;

    constructor() {

        this.name = [
            'icms2dp',
            (new Date()).getTime(),
            Math.random().toString(36).substring(8)
        ].join("-") + '.txt';

        this.directory = app.getPath('temp');

        this.path = path.join(this.directory, this.name);

        this.create();

    }

    create() {
        fs.writeFileSync(this.path, '');
        this.logger = fs.createWriteStream(this.path, { flags: 'a' });
    }

    write(line) {
        this.logger.write(line + os.EOL);
    }

    delete() {
        this.close();
        fs.unlinkSync(this.path);
    }

    close() {
        this.logger.end();
    }

    view() {
        app.openPath(this.path);
    }

}

module.exports = LogFile;
