const path = require('path');

module.exports = {
    view: function (name) {
        return path.resolve(__dirname, '..', 'views', `${name}.html`);
    }
}
