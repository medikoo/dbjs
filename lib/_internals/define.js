'use strict';

var isBoolean    = require('es5-ext/lib/Boolean/is-boolean')
  , isDate       = require('es5-ext/lib/Date/is-date')
  , isFunction   = require('es5-ext/lib/Function/is-function')
  , isNumber     = require('es5-ext/lib/Number/is-number')
  , isRegExp     = require('es5-ext/lib/RegExp/is-reg-exp')
  , isString     = require('es5-ext/lib/String/is-string')
  , d            = require('es5-ext/lib/Object/descriptor')
  , Relation     = require('./relation')
  , root         = require('../types/root')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , fillChain;

fillChain = function (obj, relName) {
	var proto = getPrototypeOf(obj);
	if (!proto.hasOwnProperty(relName)) fillChain(proto, relName);
	defineProperty(obj, relName, d('', obj[relName].create(obj)));
};

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
			if (isFunction(value)) (rel.ns = root.Function);
				else if (isString(value)) (rel.ns = root.string);
				else if (isBoolean(value)) (rel.ns = root.boolean);
				else if (isNumber(value)) (rel.ns = root.number);
				else if (isRegExp(value)) (rel.ns = root.RegExp);
				else if (isDate(value)) (rel.ns = root.DateTime);
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
		if (!this.hasOwnProperty(relName) && this[relName]._$multiple._value) {
			fillChain(this, relName);
		}
		return this[relName].value;
	}, set = function (value) {
		if (!this.hasOwnProperty(relName)) {
			fillChain(this, relName);
			defineProperty(this, name, d.gs(dscr, get, set));
		} else if (!this.hasOwnProperty(name)) {
			defineProperty(this, name, d.gs(dscr, get, set));
		}
		if (value instanceof RelTransport) {
			value.apply(rel);
		} else {
			this[relName][isNamespace(value) ? 'ns' : 'value'] = value;
		}
	}));
	return rel._value;
};
