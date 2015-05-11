'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, obj2;

	desc = proto.$getOwn('test');
	a.h1("Delete");
	a(obj.delete('test'), false, "Undefined");
	obj.test = null;
	a(obj.delete('test'), true, "Null");
	a(obj.delete('test'), false, "Deleted");
	desc.nested = true;
	a.throws(function () { obj.delete('test'); }, 'NESTED_DELETE', "Nested");
	desc.nested = false;
	desc.multiple = true;
	a.throws(function () { obj.delete('test'); }, 'MULTIPLE_DELETE', "Multiple");
	desc.multiple = false;
	desc.required = true;
	obj.delete('test');
	obj.test = 'foo';
	a.throws(function () { obj.delete('test'); }, 'VALUE_REQUIRED', "Required");

	proto.test = 'raz';
	a(obj.delete('test'), true, "Value on prototype");
	desc.required = false;
	proto.test = null;
	desc.required = true;
	obj.test = 'foo';
	a.throws(function () { obj.delete('test'); }, 'VALUE_REQUIRED', "Null on prototype");
	obj._set_('test', null);
	obj.delete('test');

	a.h1("Set");
	desc.required = false;
	desc.type = db.Number;
	a.throws(function () { obj.set('test'); }, 'SET_UNDEFINED', "Undefined");

	a(obj.set('test', null), obj, "Set null");
	desc.nested = true;
	a.throws(function () { obj.set('test', 23); }, 'NESTED_OVERRIDE', "Nested");
	desc.nested = false;
	desc.required = true;
	a.throws(function () { obj.set('test', null); }, 'VALUE_REQUIRED', "Required");
	desc.required = false;
	obj.set('test', 23);
	a.throws(function () { obj.set('test', 'raz'); }, 'INVALID_NUMBER', "Type");

	a.h2("Unique");
	desc.unique = true;

	obj2 = new db.Object();
	a.throws(function () { obj2.set('test', 23); }, 'VALUE_NOT_UNIQUE', "#1");
	obj2.set('test', 34);
	a.throws(function () { obj.set('test', 34); }, 'VALUE_NOT_UNIQUE', "#2");

	a.h2("Multiple");
	desc.multiple = true;
	obj.test = [1, 2, 34];
	a.throws(function () { obj.test = null; }, 'MULTIPLE_NULL', "Null");
	desc.required = true;
	a.throws(function () { obj.test = []; }, 'MULTIPLE_REQUIRED', "Required");
	a.throws(function () { obj.test = [23, null]; }, 'MULTIPLE_ERRORS', "Null value");
	a.throws(function () { obj.test = [23, 'raz']; }, 'MULTIPLE_ERRORS', "Invalid value");
	obj.test = [34, 24, 55, 2];
	a.throws(function () { obj2.test = [45, 34, 43]; }, 'MULTIPLE_ERRORS', "Unique");

	// Engine needs to be fixed, so following passes
	// a.h1("Reverse");
	// db = new Database();
	// db.Object.extend('Test1');
	// db.Object.extend('Test2', {
	//   foo: { type: db.Test1, reverse: 'bar' }
	// });
	// db.Test1.extend('Test3', {
	//   bar: { type: db.Test2, value: function () { return obj3; } }
	// });
	// obj1 = new db.Test1();
	// obj3 = new db.Test2();
	// obj2 = new db.Test2({ foo: obj1 });
	// obj4 = new db.Test3();
	// a(obj1.bar, obj2);
	// a(obj4.bar, obj3);
};
