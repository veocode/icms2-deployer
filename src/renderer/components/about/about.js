const Component = load.class('component');

class About extends Component {

    onActivation() {
        app.setTitle('О программе', 'sitelist');
    }

}

module.exports = new About();
