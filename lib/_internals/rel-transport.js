'use strict';

var copy          = require('es5-ext/lib/Object/copy')
  , extend        = require('es5-ext/lib/Object/extend')
  , isEmpty       = require('es5-ext/lib/Object/is-empty')
  , isPlainObject = require('es5-ext/lib/Object/is-plain-object')

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
};

extend(RelTransport.prototype, {
	apply: function (rel) {
		var error = this.validate(rel);
		if (error) throw error;
		rel.ns = this.ns;
		if (this.data) rel.setMany(this.data);
		if (this.hasOwnProperty('value')) return (rel.value = this.value);
		return this.ns;
	},
	validate: function (rel) {
		if (!this.hasOwnProperty('value')) return;
		if (this.value == null) {
			if (this.data.required && (!rel || (rel._value == null))) {
				return new TypeError(this.value + " is not a value");
			}
			return;
		}
		return this.ns._validate(this.value);
	}
});
