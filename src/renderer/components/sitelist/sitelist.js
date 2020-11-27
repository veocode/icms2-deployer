const Component = load.class('component');


class SiteList extends Component {

    $siteList;
    sites = {};

    onInit() {
        this.$siteList = this.$dom('.list');
    }

    onActivation() {
        app.setTitle('Мои сайты');
        this.buildSiteList();
        this.bind({
            'isSites': this.hasSites()
        });
        if (this.hasSites()) {
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
        this.sites = app.config.get('sites', {}, true);
        Object.keys(this.sites).forEach((id) => {
            const site = this.sites[id];
            const $item = this.render('list-item', site);
            $item.click((e) => {
                e.preventDefault();
                app.openSite(site);
            });
            this.$siteList.append($item);
        });
    }

    hasSites() {
        return this.sites && Object.keys(this.sites) > 0;
    }

}

module.exports = new SiteList();
