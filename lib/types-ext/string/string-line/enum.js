'use strict';

var StringLine = require('../string-line');

require('../../../types-base/object');

module.exports = StringLine.create('Enum', function (options) {
	if (Array.isArray(options)) {
		this._options.$setValue(options);
		return;
	}
	this._options.$setValue(null);
	Object.keys(options).forEach(function (name) {
		var option = this.$add(name), value = options[name];
		if (value === true) return;
		option.$setProperties(value);
	}, this._options);
}, {
	verifyNS: function (options) {
		var opts, error, errors;
		if (Array.isArray(options)) {
			return this.StringLine.verifyNS.call(this, { options: options });
		}
		if (options) {
			opts = [];
			Object.keys(Object(options)).forEach(function (name) {
				var error, value = options[name];
				opts.push(name);
				if (value === true) return;
				if (value == null) {
					error = new TypeError(value + " are not valid option properties");
				} else {
					error = this.validate(value);
				}
				if (error) {
					if (!errors) errors = [];
					errors.push(error);
				}
			}, this.Object);
			error = this.StringLine.verifyNS.call(this, { options: opts });
			if (errors) {
				error = this.combineErrors.apply(this, errors.concat(error));
				if (error) error.message = options + " is not valid options";
			}
			return error;
		}
		return new TypeError(options + " is not valid options");
	},
	options: StringLine.rel({ multiple: true, required: true }),
	is: function (value) {
		if (typeof value !== 'string') return false;
		return this.options.has(value);
	},
	normalize: function (value) {
		return this.options.has(value) ? String(value) : null;
	},
	validate: function (value) {
		if (!this.options.has(value)) {
			return new TypeError(value + " is not a valid " + this._id_);
		}
		return null;
	}
});
