'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , Relation     = require('./relation')
  , base         = require('../types/base')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , fillChain, findNs;

fillChain = function (obj, relName) {
	var proto = getPrototypeOf(obj);
	if (!proto.hasOwnProperty(relName)) fillChain(proto, relName);
	defineProperty(obj, relName, d('', obj[relName].__create(obj)));
};

findNs = function (value) {
	if (base.string && base.string.is(value)) return base.string;
	if (base.boolean && base.boolean.is(value)) return base.boolean;
	if (base.number && base.number.is(value)) return base.number;
	if (base.RegExp && base.RegExp.is(value)) return base.RegExp;
	if (base.DateTime && base.DateTime.is(value)) return base.DateTime;
};

module.exports = function (obj, name, value) {
	var get, set, rel, relName, attr, ns, isNSProp;

	relName = '_$' + name;
	isNSProp = (name[0] !== name[0].toLowerCase());
	attr = ((typeof obj === 'function') || !obj.__id) ? '' : 'e';
	rel = new Relation(obj, name, d.gs('c' + attr, get = function () {
		if (!this.hasOwnProperty(relName) && this[relName]._multiple) {
			fillChain(this, relName);
		}
		return this[relName].value;
	}, set = function (value) {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);

		if (value instanceof RelTransport) {
			value.apply(rel);
		} else {
			this[relName][(!isNSProp && isNamespace(value)) ? 'ns' : 'value'] = value;
		}
	}));

	if (value instanceof RelTransport) {
		value.apply(rel);
	} else if (!isNSProp && isNamespace(value)) {
		rel.ns = value;
	} else if (value !== undefined) {
		if (value !== null) {
			if (isArray(value)) {
				rel.multiple = true;
				if (value.length) {
					rel.required = true;
					if ((ns = findNs(value[0])) && value.slice(1).every(ns.is, ns)) {
						rel.ns = ns;
					}
				}
			} else {
				rel.required = true;
				rel.ns = findNs(value);
			}
		}

		rel.value = value;
	}

	defineProperty(obj, relName, d('', rel));
	defineProperty(obj, '_' + name, d.gs('', function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName];
	}));
	defineProperty(obj, name, d.gs(attr, get, set));
};
