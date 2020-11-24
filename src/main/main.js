const { app, BrowserWindow } = require('electron');
const { view } = require('./core/view');

class MainProcessWorker {

    start() {
        app.whenReady().then(this.createMainWindow)

        app.on('window-all-closed', () => {
            app.quit();
        })
    }

    createMainWindow() {
        const win = new BrowserWindow({
            show: false,
            width: 900,
            height: 650,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        // win.setMenu(null);

        win.once('ready-to-show', () => {
            win.show()
        });

        win.on('close', () => {
            app.quit();
        });

        win.loadFile(view('index'));
    }

}

const worker = new MainProcessWorker();
worker.start();