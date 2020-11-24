const { TouchBarScrubber } = require('electron');
const Component = require('../component');

class SiteList extends Component {

    $siteList = this.$dom('.list');
    sites = [];

    onActivation() {
        this.app.setTitle('Мои сайты');
        this.buildSiteList();
        this.bind({
            'isSites': this.sites.length > 0
        });
        if (this.sites.length > 0) {
            this.app.setToolbar([{
                hint: 'Добавить сайт',
                icon: 'plus',
                class: 'info',
                click: () => {
                    this.app.addSite();
                }
            }]);
        }
    }

    onDeactivation() {
        this.$siteList.empty();
    }

    buildSiteList() {
        this.sites = this.app.config.get('sites', [], true);
        this.sites.forEach((site) => {
            const $item = this.render('list-item', site);
            $item.click((e) => {
                e.preventDefault();
                this.app.openSite(site);
            });
            this.$siteList.append($item);
        });
    }

}

module.exports = SiteList;