
class FormHandler {

    $form;
    callback;

    isLoading = false;

    constructor(selector, callback) {
        this.$form = $(selector);
        this.$form.find('.btn-submit').click((e) => {
            e.preventDefault();
            if (this.isLoading) {
                return;
            }
            if (callback) {
                callback(this.getValues(), this);
            }
        });
    }

    startLoading() {
        this.isLoading = true;
        this.$form.find('.btn-submit').hide();
        this.$form.append('<div class="form-wait"><div class="overlay"></div><div class="text">Проверка введенных данных...</div></div>')
    }

    endLoading() {
        this.isLoading = false;
        this.$form.find('.btn-submit').show();
        this.$form.find('.form-wait').remove();
    }

    resetValues() {
        this.$form.find('input[name]').val('');
    }

    setValues(values) {
        Object.keys(values).forEach((name) => {
            const value = values[name];
            this.$form.find(`input[name=${name}]`).val(value);
        });
    }

    getValues() {
        let values = {};
        this.$form.find('input[name]').each((i, input) => {
            const $input = $(input);
            let value = $input.val();
            if (value == 'true') { value = true; }
            if (value == 'false') { value = false; }
            values[$input.attr('name')] = value;
        });
        return values;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    hide() {
        this.$form.hide();
    }

    show() {
        this.$form.show();
    }

}

module.exports = FormHandler;