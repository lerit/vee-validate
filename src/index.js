import Validator from './validator';
import debounce from './utils/debouncer.js';
import ErrorBag from './errorBag';

const DEFAULT_DELAY = 0;

export default (Vue, options) => {
    const errorsBagName = options ? options.errorsBagName || 'errors' : 'errors';
    Vue.mixin({
        data() {
            return {
                [errorsBagName]: null
            };
        },
        created() {
            this.$validator = Validator.create();
            this.$set(errorsBagName, this.$validator.errorBag);
        }
    });

    Vue.directive('validate', {
        params: ['rules', 'delay', 'reject'],
        onInput() {
            this.vm.$validator.validate(this.fieldName, this.el.value);
        },
        onFileInput() {
            if (! this.vm.$validator.validate(this.fieldName, this.el.files)
            && this.params.reject) {
                this.el.value = '';
            }
        },
        attachValidator() {
            this.vm.$validator.attach(this.fieldName, this.params.rules);
        },
        bind() {
            this.fieldName = this.el.name;
            this.attachValidator();
            const handler = this.el.type === 'file' ? this.onFileInput : this.onInput;
            this.handles = this.el.type === 'file' ? 'change' : 'input';

            const delay = this.params.delay || (options && options.delay) || DEFAULT_DELAY;
            this.handler = delay ? debounce(handler.bind(this), delay) : handler.bind(this);
            this.el.addEventListener(this.handles, this.handler);
        },
        unbind() {
            this.vm.$validator.detach(this.fieldName);
            this.el.removeEventListener(this.handles, this.handler);
        }
    });
};

export { Validator, ErrorBag };
