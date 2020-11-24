const Component = require('../component');

class SiteView extends Component {

    site;

    onActivation(site) {
        this.site = site;
        this.app.setTitle(site.name, 'sitelist');
        this.setToolbar();
    }

    setToolbar() {

        const editBtn = {
            hint: 'Редактировать',
            icon: 'pencil',
            class: 'secondary',
            click: () => { 
                this.app.editSite(this.site); 
            }
        };

        const deleteBtn = {
            hint: 'Удалить',
            icon: 'trash',
            class: 'danger',
            click: () => { 
                this.app.confirm('Вы хотите удалить сайт?\nЭто действие нельзя будет отменить', () => {                
                    this.app.deleteSite(this.site);
                    this.app.stepBack();
                });
            }
        };

        const deployBtn = {
            title: 'Публиковать',
            class: 'info',
            click: () => { 
                this.app.deploySite(this.site);
            }
        };

        const updateBtn = {
            title: 'Обновить',
            class: 'success',
            click: () => { 
                this.app.updateSite(this.site);
            }
        };

        let toolbar = [
            editBtn, deleteBtn, '-',
            this.site.isDeployed ? updateBtn : deployBtn
        ];

        this.app.setToolbar(toolbar);
        
    }

    onDeactivation() {

    }

}

module.exports = SiteView;