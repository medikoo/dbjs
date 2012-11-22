'use strict';

var copy          = require('es5-ext/lib/Object/copy')
  , extend        = require('es5-ext/lib/Object/extend')
  , isEmpty       = require('es5-ext/lib/Object/is-empty')
  , isPlainObject = require('es5-ext/lib/Object/is-plain-object')
  , nameRe        = require('./name-re')

  , isArray = Array.isArray

  , RelTransport;

module.exports = RelTransport = function (ns, data) {
	this.ns = ns;
	if (!isPlainObject(data)) {
		this.value = data;
	} else if (data.hasOwnProperty('value')) {
		this.value = data.value;
		this.data = copy(data);
		delete this.data.value;
		if (isEmpty(this.data)) delete this.data;
	} else {
		this.data = data;
	}
	if (this.hasOwnProperty('value') && isArray(this.value)) {
		if (!this.data) this.data = { multiple: true };
		else if (!this.data.hasOwnProperty('multiple')) this.data.multiple = true;
	}
};

extend(RelTransport.prototype, {
	apply: function (rel) {
		var error = this.validate(rel, rel.obj);
		if (error) throw error;
		rel.ns = this.ns;
		if (this.data) rel.setMany(this.data);
		if (this.hasOwnProperty('value')) return (rel.value = this.value);
		return this.ns;
	},
	validate: function (rel, obj) {
		var error, errors, name;
		if (this.hasOwnProperty('value')) {
			// Value validation
			if (this.data) {
				if ((this.value == null) ||
						(this.data.multiple && isArray(this.value) && !this.value.length)) {
					if (this.data.required && (!rel || (rel._value == null))) {
						error = new TypeError(this.value + " is not a value");
					}
				} else if (this.data.multiple && isArray(this.value)) {
					this.value.forEach(function (value) {
						var error;
						if (value == null) {
							if (!errors) errors = [];
							errors.push(new TypeError(value + " is not a value"));
							return;
						}
						if ((error = this._validate(value))) {
							if (!errors) errors = [];
							errors.push(error);
						}
					}, this.ns);
					if (errors) {
						error = new TypeError('Invalid value');
						error.subErrors = errors;
					}
				} else {
					error = this.ns._validate(this.value);
				}
			} else if (this.value != null) {
				error = this.ns._validate(this.value);
			}
		}
		if (error) errors = [error];
		error = null;
		if (this.data && (name = this.data.reverse)) {
			if (name === true) {
				name = obj.ns.__id;
				name = name[0].toLowerCase() + name.slice(1);
			}
			if (!nameRe.test(name)) {
				error = new Error("'" + name + "' is not a valid name");
			} else if (name in this.ns) {
				error = new Error("'" + name + "' is already taken");
			}
		}
		if (error) {
			if (!errors) errors = [];
			errors.push(error);
		}
		if (errors) {
			error = new TypeError("Relation is invalid");
			error.subErrors = errors;
			return error;
		}
	}
});
