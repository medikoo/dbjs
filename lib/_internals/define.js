'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , Relation     = require('./relation')
  , root         = require('../types/root')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , fillChain, findNs;

fillChain = function (obj, relName) {
	var proto = getPrototypeOf(obj);
	if (!proto.hasOwnProperty(relName)) fillChain(proto, relName);
	defineProperty(obj, relName, d('', obj[relName].create(obj)));
};

findNs = function (value) {
	if (root.string && root.string.is(value)) return root.string;
	if (root.boolean && root.boolean.is(value)) return root.boolean;
	if (root.number && root.number.is(value)) return root.number;
	if (root.RegExp && root.RegExp.is(value)) return root.RegExp;
	if (root.DateTime && root.DateTime.is(value)) return root.DateTime;
};

module.exports = function (obj, name, value) {
	var get, set, rel, relName, dscr, ns;

	rel = new Relation(obj, name);
	if (value instanceof RelTransport) {
		value.apply(rel);
	} else if (isNamespace(value)) {
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

	relName = '_$' + name;
	dscr = (typeof obj === 'function') ? '' : 'e';
	defineProperty(obj, relName, d('', rel));
	defineProperty(obj, '_' + name, d.gs('', function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName];
	}));
	defineProperty(obj, name, d.gs(dscr, get = function () {
		if (!this.hasOwnProperty(relName) && this[relName]._multiple) {
			fillChain(this, relName);
		}
		return this[relName].value;
	}, set = function (value) {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);

		if (value instanceof RelTransport) {
			value.apply(rel);
		} else {
			this[relName][isNamespace(value) ? 'ns' : 'value'] = value;
		}

		if (!this.hasOwnProperty(name)) {
			defineProperty(this, name, d.gs(dscr, get, set));
		}
	}));
	return rel._value;
};
