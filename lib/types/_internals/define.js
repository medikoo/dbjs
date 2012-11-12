'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , Relation     = require('../relation')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , defineProperty = Object.defineProperty;

module.exports = function (obj, name, value) {
	var get, set, rel, relName, dscr;

	rel = new Relation(obj, name);
	if (value instanceof RelTransport) {
		value.apply(rel);
	} else {
		rel[isNamespace(value) ? 'ns' : 'value'] = value;
	}

	relName = '_$' + name;
	dscr = (typeof obj === 'function') ? '' : 'e';
	defineProperty(obj, relName, d('', rel));
	defineProperty(obj, '_' + name, d.gs('', function () {
		return this.hasOwnProperty(relName) ? this[relName] : undefined;
	}));
	defineProperty(obj, name, d.gs(dscr, get = function () {
		return this[relName].value;
	}, set = function (value) {
		if (!this.hasOwnProperty(relName)) {
			defineProperty(this, relName, d('', this[relName].create(this)));
			defineProperty(this, name, d.gs(dscr, get, set));
		}
		if (value instanceof RelTransport) {
			return value.apply(rel);
		} else {
			return (this[relName][isNamespace(value) ? 'ns' : 'value'] = value);
		}
	}));
	return rel.value;
};
