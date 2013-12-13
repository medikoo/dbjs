'use strict';

var d        = require('d/d')
  , Database = require('../../../')

  , defineProperty = Object.defineProperty;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, ownDesc, prop, ownProp;

	desc = proto.$get('test');
	prop = desc.$get('test');
	ownDesc = obj.$get('test');
	ownProp = ownDesc.$get('test');

	a.h1("ACL");
	defineProperty(prop, '_writable_', d('c', false));
	ownDesc.test = 'raz';
	defineProperty(prop, '_extensible_', d('c', false));
	a.throws(function () { ownDesc.test = 'raz'; }, 'NON_WRITABLE',
		"Non extensible");
	defineProperty(prop, '_extensible_', d('c', true));
	ownDesc.test = 'dwa';
	defineProperty(ownProp, '_extensible_', d('c', false));
	ownDesc.test = 'tri';
	defineProperty(ownProp, '_writable_', d('c', false));
	a.throws(function () { ownDesc.test = 'raz'; }, 'NON_WRITABLE',
		"Non writable");
	delete ownProp._writable_;

	a.h1("Delete");
	a(ownDesc.delete('test'), true);
	a(ownDesc.delete('test'), false, "Undefined");

	a.h1("Set");
	a(ownDesc.set('test', 'foo'), ownDesc);
	a(ownDesc.test, 'foo', "Value");

	a.h1("Set properties");
	a.h2("Invalid");
	a.throws(function () {
		ownDesc.setProperties({
			min: 'raz',
			dwa: 2,
			test: 'mano'
		});
	}, 'SET_PROPERTIES_ERROR', '');

	a(ownDesc.min, -Infinity, "Not affected");
	a(ownDesc.dwa, undefined, "Not affected #2");
	a(ownDesc.test, 'foo', "Not affected #3");

	a.h2("Valid");
	a(ownDesc.setProperties({
		raz: 23,
		dwa: 2
	}), ownDesc);
	a(ownDesc.raz, 23, "Value");
	a(ownDesc.dwa, 2, "Value #2");
};
