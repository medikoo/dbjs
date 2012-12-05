'use strict';

var copy          = require('es5-ext/lib/Object/copy')
  , d             = require('es5-ext/lib/Object/descriptor')
  , extend        = require('es5-ext/lib/Object/extend')
  , isEmpty       = require('es5-ext/lib/Object/is-empty')
  , isPlainObject = require('es5-ext/lib/Object/is-plain-object')
  , Relation      = require('./relation')

  , isArray = Array.isArray, create = Object.create

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
		rel._ns.$set(this.ns);
		if (this.data) rel.$setProperties(this.data);
		if (this.hasOwnProperty('value')) rel.$set(this.value);
	},
	makeTestRel: (function () {
		var metaProps = ['multiple', 'required', 'writeOnce'];
		return function (obj, name) {
			var rel = create(obj['__' + name] || Relation.prototype, {
				obj: d('', obj),
				name: d('cw', null),
				ns: d('c', this.ns)
			});
			if (!this.data) return rel;
			metaProps.forEach(function (name) {
				if (this.hasOwnProperty(name)) {
					rel['_' + name]._value = Boolean(this[name]);
				}
			}, this.data);
			return rel;
		};
	}()),
	validate: function (obj, name) {
		var error, relation;
		relation = this.makeTestRel(obj, name);
		error = Relation.combineErrors(
			this.data && relation.validateProperties(this.data),
			this.hasOwnProperty('value') && relation.validate(this.value)
		);
		if (!error) return null;
		error.message = "Invalid relation properties";
		return error;
	}
});
