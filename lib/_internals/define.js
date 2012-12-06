'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , isNamespace  = require('./is-namespace')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , base, fillChain, findNs, define, isValidNsRef
  , Relation, RelProto, RelTransport;

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

define = function (obj, name, value) {
	var get, set, rel, relName, attr, ns, allowNS;

	relName = '__' + name;
	allowNS = isValidNsRef(name);
	attr = ((typeof obj === 'function') || !obj._id_) ? '' : 'e';
	rel = new Relation(obj, name, d.gs('c' + attr, get = function () {
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

	if (value instanceof RelTransport) {
		value.apply(rel);
	} else if (!allowNS && isNamespace(value)) {
		rel._ns.$set(value);
	} else if (value !== undefined) {
		if (value !== null) {
			if (isArray(value)) {
				rel.multiple = true;
				if (value.length) {
					rel.required = true;
					if ((ns = findNs(value[0])) && value.slice(1).every(ns.is, ns)) {
						rel._ns.$set(ns);
					}
				}
			} else {
				rel.required = true;
				rel._ns.$set(findNs(value));
			}
		}
		rel.$set(value);
	}

	defineProperty(obj, relName, d('', rel));
	defineProperty(obj, '_' + name, d.gs('', function () {
		if (!this.hasOwnProperty(relName)) fillChain(this, relName);
		return this[relName];
	}));
	defineProperty(obj, name, d.gs(attr, get, set));
};

module.exports = exports = function (obj, name, value) {
	if ((name in obj) && obj['__' + name]) {
		if (value instanceof RelTransport) {
			value.apply(obj['_' + name]);
		} else if (isNamespace(value) && !isValidNsRef(name)) {
			obj['_' + name]._ns.$set(value);
		} else {
			obj['_' + name].$set(value);
		}
	} else {
		define(obj, name, value);
	}
	return value;
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
base = require('../types/base');
