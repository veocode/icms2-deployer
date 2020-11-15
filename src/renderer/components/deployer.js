const Component = require('./../../renderer/component');

class Deployer extends Component {

    onActivation() {
        this.app.setTitle('Публикация сайта', 'sitelist');
    }

}

module.exports = Deployer;