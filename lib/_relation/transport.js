'use strict';

var copy           = require('es5-ext/object/copy')
  , assign         = require('es5-ext/object/assign')
  , isEmpty        = require('es5-ext/object/is-empty')
  , isPlainObject  = require('es5-ext/object/is-plain-object')

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

assign(RelTransport.prototype, {
	apply: function (rel) {
		rel.$construct(this.ns, this.data);
		if (this.hasOwnProperty('value')) rel.$setValue(this.value);
	},
	validate: function (obj, name) {
		var error, rel = obj.get(name), data;
		error = rel.validateConstruction(this.ns, this.data);
		if (error) return error;
		if (!this.hasOwnProperty('value')) return null;
		data = this.data ? copy(this.data) : {};
		data.ns = this.ns;
		data.__proto__ = rel;
		return rel.validateCreate(this.value, data);
	}
});
