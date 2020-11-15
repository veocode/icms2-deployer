const Component = require('../component');

class SiteList extends Component {

    $siteList = this.$dom('.list');

    onActivation() {
        this.app.setTitle('Мои сайты');
        this.buildSiteList();
    }

    onDeactivation() {
        this.$siteList.empty();
    }

    buildSiteList() {
        this.$siteList.empty();
        const sites = this.app.config.get('sites');

        sites.forEach((site) => {
            this.$siteList.append(this.buildSiteDOM(site));
        });
    }

    buildSiteDOM(site) {
        let $dom = $('<div></div>').addClass('site').addClass('static-ui');

        $('<div></div>').addClass('name').html(site.name).appendTo($dom);
        $('<div></div>').addClass('url').html(site.url).appendTo($dom);

        return $dom;
    }

}

module.exports = SiteList;