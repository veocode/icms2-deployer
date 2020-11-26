const Component = load.class('component');
const moment = load.node('moment');

class SiteView extends Component {

    site;

    onActivation(site) {
        this.site = site;
        app.setTitle(site.name, 'sitelist');
        this.setToolbar();
    }

    setToolbar() {

        const editBtn = {
            hint: 'Редактировать',
            icon: 'pencil',
            class: 'secondary',
            click: () => {
                app.editSite(this.site);
            }
        };

        const deleteBtn = {
            hint: 'Удалить',
            icon: 'trash',
            class: 'danger',
            click: () => {
                app.confirm('Вы хотите удалить сайт?\nЭто действие нельзя будет отменить', () => {
                    app.deleteSite(this.site);
                    app.stepBack();
                    app.toast({
                        type: 'success',
                        message: `Сайт удалён`,
                        timeout: 1.5,
                    });
                });
            }
        };

        const deployBtn = {
            title: 'Публиковать',
            class: 'info',
            click: () => {
                app.deploySite(this.site);
            }
        };

        const updateBtn = {
            title: 'Обновить',
            class: 'success',
            click: () => {
                app.updateSite(this.site);
            }
        };

        let toolbar = [
            editBtn, deleteBtn, '-',
            this.site.isDeployed ? updateBtn : deployBtn
        ];

        app.setToolbar(toolbar);

    }

    onDeactivation() {

    }

    getConnectionCommand() {
        return `ssh ${this.site.server.user}@${this.site.server.host} -p${this.site.server.port}`;
    }

    getDeployStatus() {
        if (this.site.deploy.done) {
            const date = moment(this.site.deploy.date).locale('ru').calendar();
            return `<span>${date}</span>`;
        }
        return `<span class="text-muted">Сайт не опубликован</span>`;
    }

    getUpdateStatus() {
        if (this.site.update.done) {
            const date = moment(this.site.update.date).locale('ru').calendar();
            return `<span>${date}</span>`;
        }
        return `<span class="text-muted">Сайт не обновлялся</span>`;
    }

}

module.exports = new SiteView();
