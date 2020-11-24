const connect = require('ssh2-connect');
const exec = require('ssh2-exec');

class SSHService {

    ssh;

    execCallback;
    stdoutCallback;
    stderrCallback;

    async connect(site, callback) {

        const opts = {
            host: site.serverHost,
            port: site.serverPort,
            username: site.serverUser,
            password: site.serverPassword
        };

        try {
            if (this.execCallback) {
                this.execCallback(`ssh ${opts.username}@${opts.host}`);
            }
            if (this.stdoutCallback) {
                this.stdoutCallback(`Connecting to ${opts.host} as ${opts.username}...`);
            }
            this.ssh = await connect(opts);
            if (this.stdoutCallback) {
                this.stdoutCallback(`Connected succesfully`);
            }
            callback(true, this.ssh);
        } catch (err) {
            if (this.ssh) {
                return;
            }
            if (this.stderrCallback) {
                this.stderrCallback(`Failed to connect`);
            }
            callback(false);
        }

    }

    exec(command, cwd, callback) {
        if (this.execCallback) {
            this.execCallback(command);
        }

        let options = {
            cmd: command,
            ssh: this.ssh
        };

        if (cwd) {
            options.cwd = cwd;
        }

        let process = exec(options, function (err, stdout, stderr) {
            if (err) {
                callback(false);
                return;
            }
            callback(true);
        });

        process.stdout.on('data', (data) => {
            if (this.stdoutCallback) {
                this.stdoutCallback(data);
            }
        });
        process.stderr.on('data', (data) => {
            if (this.stderrCallback) {
                this.stderrCallback(data);
            }
        });
    }

    close() {
        if (this.ssh) {
            this.ssh.end();
        }
    }

}

module.exports = new SSHService();
