const Component = require('../component');

class SiteView extends Component {

    site;

    onInit() {
        this.$dom('.btn-edit').click((e) => {
            e.preventDefault();
            this.app.editSite(this.site);
        });
    }

    onActivation(site) {
        this.site = site;
        this.app.setTitle('Настройки сайта', 'sitelist');
    }

    onDeactivation() {

    }

}

module.exports = SiteView;