'use strict';

var d        = require('d')
  , toArray  = require('es5-ext/array/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../')

  , defineProperty = Object.defineProperty;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, obj2, ownDesc;

	desc = proto.$getOwn('test');
	ownDesc = obj.$getOwn('test');

	a.h1("ACL");
	defineProperty(desc, '_writable_', d('c', false));
	obj.test = 'raz';
	defineProperty(desc, '_extensible_', d('c', false));
	a.throws(function () { obj.test = 'raz'; }, 'NON_WRITABLE', "Non extensible");
	defineProperty(desc, '_extensible_', d('c', true));
	obj.test = 'dwa';
	defineProperty(ownDesc, '_extensible_', d('c', false));
	obj.test = 'tri';
	defineProperty(ownDesc, '_writable_', d('c', false));
	a.throws(function () { obj.test = 'raz'; }, 'NON_WRITABLE', "Non writable");
	delete ownDesc._writable_;

	a.h1("Delete");
	a(obj.delete('test'), true);
	a(obj.delete('test'), false, "Undefined");

	a.h1("Delete value");
	obj.define('delValue', {
		type: db.String,
		value: 'foo'
	});
	a(obj.deleteValue('delValue'), true, "Value");
	a(obj.$getOwn('delValue').type, db.String, "Meta");

	a.h1("Set");
	a(obj.set('test', 'foo'), obj);
	a(obj.test, 'foo', "Value");

	a.h1("Set properties");
	a.h2("Invalid");
	proto.$getOwn('raz').type = db.Number;
	a.throws(function () {
		obj.setProperties({
			raz: 'raz',
			dwa: 2,
			test: 'mano'
		});
	}, 'SET_PROPERTIES_ERROR', '');

	a(obj.raz, undefined, "Not affected");
	a(obj.dwa, undefined, "Not affected #2");
	a(obj.test, 'foo', "Not affected #3");

	a.h2("Valid");
	a(obj.setProperties({
		raz: 23,
		dwa: 2
	}), obj);
	a(obj.raz, 23, "Value");
	a(obj.dwa, 2, "Value #2");

	a.h1("Set multiple");
	desc.multiple = true;
	obj.test = ['raz', 2, 'trzy'];
	a.deep(toArray(obj.test), ['raz', 2, 'trzy']);

	a.h1("Define");
	a(proto.define('hola', {
		type: db.Boolean,
		required: true
	}), proto);
	obj.hola = 'foo';
	a(obj.hola, true, "Type");
	a.throws(function () { obj.hola = null; }, 'VALUE_REQUIRED',
		"Required");

	a.throws(function () {
		proto.define('hola', {});
	}, 'PROPERTY_DEFINED', "Redefine");

	proto.define('miszka', {
		type: db.String,
		required: true,
		value: 23
	});
	a(obj.miszka, '23', "Define with value");

	a.h1("Define properties");
	a(proto.defineProperties({
		farza: {
			type: db.Boolean,
			required: true,
			value: 'elo'
		},
		merso: {
			type: db.Number,
			multiple: true
		}
	}), proto);
	a(obj.farza, true, "Value #1");
	a(isSet(obj.merso), true, "Value #2");

	a.throws(function () {
		proto.defineProperties({ farza: {} });
	}, 'DEFINE_PROPERTIES_ERROR', "Errors");

	a.h1("Multiple add");
	desc.type = db.Number;
	a.throws(function () {
		obj.test.add(null);
	}, 'ITEM_NULL_VALUE', "Null");
	a.throws(function () {
		obj.test.add();
	}, 'ITEM_NULL_VALUE', "Undefined");
	a.throws(function () {
		obj.test.add('fefe');
	}, 'INVALID_VALUE', "Invalid");

	a(obj.test.add(45), obj.test, "Valid");
	a(obj.test.has(45), true, "Has added");
	desc.unique = true;
	obj2 = new db.Object();
	a.throws(function () {
		obj2.test.add(45);
	}, 'VALUE_NOT_UNIQUE', "Invalid");

	a.h1("Multiple delete");
	desc.required = true;
	a(obj.test.delete(2), true);
	a.throws(function () {
		obj.test.delete(45);
	}, 'MULTIPLE_REQUIRED', "Required");

	a.h1("Clear nested");
	obj = new db.Object();
	obj.$getOwn('foo').nested = true;
	obj.foo.set('marko', 'raz');
	obj.foo._clear_();
	a(obj.foo.marko, undefined);

	a.h1("Override getter multiple");
	db.Object.prototype.define('multipleGetter', {
		type: db.String,
		multiple: true,
		value: function () { return ['raz', 'dwa']; }
	});
	obj = new db.Object();
	obj.multipleGetter = ['foo', 'bar'];
	a.deep(toArray(obj.multipleGetter), ['foo', 'bar']);
};
