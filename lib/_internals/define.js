'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , isNamespace  = require('./is-namespace')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , base, fillChain, findNs, define, isValidNsRef
  , Relation, RelProto, RelTransport, signal;

fillChain = function (obj, relName) {
	var proto = getPrototypeOf(obj);
	if (!proto.hasOwnProperty(relName)) fillChain(proto, relName);
	defineProperty(obj, relName, d('', obj[relName]._create_(obj)));
};

isValidNsRef = function (name) { return (name[0] !== name[0].toLowerCase()); };

findNs = function (value) {
	if (base.String && base.String.is(value)) return base.String;
	if (base.Boolean && base.Boolean.is(value)) return base.Boolean;
	if (base.Number && base.Number.is(value)) return base.Number;
	if (base.RegExp && base.RegExp.is(value)) return base.RegExp;
	if (base.DateTime && base.DateTime.is(value)) return base.DateTime;
};

module.exports = exports = function (obj, name, value) {
	var rel, ns;
	if ((name in obj) && obj['__' + name]) {
		rel = obj['_' + name];
		if (value instanceof RelTransport) {
			value.apply(rel);
		} else if (isNamespace(value) && !isValidNsRef(name)) {
			rel._ns.$setValue(value);
			signal(rel._ns, value);
		} else {
			rel.$setMultiValue(value);
		}
	} else {
		define(obj, name);
		rel = obj['_' + name];
		if (value instanceof RelTransport) {
			value.apply(rel);
		} else if (isNamespace(value) && !isValidNsRef(name)) {
			rel._ns.$setValue(value);
			signal(rel._ns, value);
		} else if (value !== undefined) {
			if (value !== null) {
				if (isArray(value)) {
					rel._multiple.$setValue(true);
					signal(rel._multiple, true);
					if (value.length) {
						rel._required.$setValue(true);
						signal(rel._required, true);
						if ((ns = findNs(value[0])) && value.slice(1).every(ns.is, ns)) {
							rel._ns.$setValue(ns);
							signal(rel._ns, ns);
						}
					}
					rel.$setMultiValue(value);
					return value;
				}
				rel._required.$setValue(true);
				signal(rel._required, true);
				if ((ns = findNs(value))) {
					rel._ns.$setValue(ns);
					signal(rel._ns, ns);
				}
				rel.$setMultiValue(value);
				return value;
			}
			rel.$setValue(value);
			signal(rel, value);
		} else {
			signal(rel, undefined);
		}
	}
	return value;
};

exports.define = define = function (base, name) {
	var get, set, rel, relName, attr, allowNS, proto;

	proto = getPrototypeOf(base);
	while (proto.hasOwnProperty('_id_')) {
		base = proto;
		proto = getPrototypeOf(proto);
	}

	relName = '__' + name;
	allowNS = isValidNsRef(name);
	attr = ((typeof base === 'function') || !base._id_ || base._descriptor_) ?
			'' : 'e';
	rel = new Relation(base, name, d.gs('c' + attr, get = function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName].value;
	}, set = function (value) {
		var error, rel;
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		rel = this[relName];
		if (value instanceof RelTransport) {
			if ((error = value.validate(this, name))) throw error;
			value.apply(rel);
		} else {
			rel[(!allowNS && isNamespace(value)) ? 'ns' : 'value'] = value;
		}
	}));

	defineProperty(base, relName, d('', rel));
	defineProperty(base, '_' + name, d.gs('', function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName];
	}));
	defineProperty(base, name, d.gs(attr, get, set));
};

exports.validate = function (obj, name, value) {
	var defined = (name in obj) && obj['__' + name] && true
	  , errors, error;

	if (value instanceof RelTransport) return value.validate(obj, name);
	if (isNamespace(value) && !isValidNsRef(name)) return null;
	if (defined) return obj['_' + name].validate(value);

	if (isArray(value)) {
		if ((errors = RelProto._validateValues_(value))) {
			error = new TypeError(value + " contains invalid values");
			error.errors = errors;
			return error;
		}
		return null;
	}
	return RelProto.validate(value);
};

exports.fillChain = fillChain;

Relation = require('./relation');
RelTransport = require('./rel-transport');
RelProto = Relation.prototype;
base = require('../types-base/base');
signal = require('./signal');
