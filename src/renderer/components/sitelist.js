const Component = load.class('component');


class SiteList extends Component {

    $siteList = this.$dom('.list');
    sites = [];

    onActivation() {
        app.setTitle('Мои сайты');
        this.buildSiteList();
        this.bind({
            'isSites': this.sites.length > 0
        });
        if (this.sites.length > 0) {
            app.setToolbar([{
                hint: 'Добавить сайт',
                icon: 'plus',
                class: 'info',
                click: () => {
                    app.addSite();
                }
            }]);
        }
    }

    onDeactivation() {
        this.$siteList.empty();
    }

    buildSiteList() {
        this.sites = app.config.get('sites', [], true);
        this.sites.forEach((site) => {
            const $item = this.render('list-item', site);
            $item.click((e) => {
                e.preventDefault();
                app.openSite(site);
            });
            this.$siteList.append($item);
        });
    }

}

module.exports = new SiteList();
