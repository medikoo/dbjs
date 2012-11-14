'use strict';

var isBoolean    = require('es5-ext/lib/Boolean/is-boolean')
  , isDate       = require('es5-ext/lib/Date/is-date')
  , isFunction   = require('es5-ext/lib/Function/is-function')
  , isNumber     = require('es5-ext/lib/Number/is-number')
  , isRegExp     = require('es5-ext/lib/RegExp/is-reg-exp')
  , isString     = require('es5-ext/lib/String/is-string')
  , d            = require('es5-ext/lib/Object/descriptor')
  , base         = require('../base')
  , Relation     = require('../relation')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , defineProperty = Object.defineProperty;

module.exports = function (obj, name, value) {
	var get, set, rel, relName, dscr;

	rel = new Relation(obj, name);
	if (value instanceof RelTransport) {
		value.apply(rel);
	} else if (isNamespace(value)) {
		rel.ns = value;
	} else if (value !== undefined) {
		if ((value !== null) && ((typeof obj === 'function') ||
				obj.hasOwnProperty('constructor'))) {

			rel.required = true;
			if (isFunction(value)) (rel.ns = base.Function);
				else if (isString(value)) (rel.ns = base.string);
				else if (isBoolean(value)) (rel.ns = base.boolean);
				else if (isNumber(value)) (rel.ns = base.number);
				else if (isRegExp(value)) (rel.ns = base.RegExp);
				else if (isDate(value)) (rel.ns = base.DateTime);
		}

		rel.value = value;
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
			value.apply(rel);
		} else {
			this[relName][isNamespace(value) ? 'ns' : 'value'] = value;
		}
	}));
	return rel.value;
};
