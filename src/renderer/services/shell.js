class ShellService {

    execCallback;
    stdoutCallback;
    stderrCallback;

    exec(command, cwd, callback) {
        if (this.execCallback){
            this.execCallback(command);
        }
        var child_process = require('child_process');
        var parts = command.split(/\s+/g);
        var options = {};
        if (cwd) {
            options.cwd = cwd;
        }
        var subprocess = child_process.spawn(parts[0], parts.slice(1), options);
        subprocess.stdout.on('data', (data) => {
            if (this.stdoutCallback) {
                this.stdoutCallback(data);
            }
        });
        subprocess.stderr.on('data', (data) => {
            if (this.stderrCallback) {
                this.stderrCallback(data);
            }
        });
        subprocess.on('exit', (code) => {
            var err = null;
            if (code) {
                err = new Error('command "' + command + '" exited with wrong status code "' + code + '"');
                err.code = code;
                err.cmd = command;
            }
            if (callback) callback(err);
        });
    };

    execMany(commands, cwd, callback) {
        let execNext = () => {
            this.exec(commands.shift(), cwd, (err) => {
                if (err) {
                    callback(err);
                    return;
                }
                if (commands.length) {
                    execNext();
                    return;
                }
                callback(null);
            });
        };
        execNext();
    }

}

module.exports = new ShellService();
