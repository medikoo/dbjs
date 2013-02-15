'use strict';

module.exports = function (t, a) {
	var invoked = 0, obj, x = {};

	a(t, t.Object, "Object");
	a(t.Boolean._id_, 'Boolean', "Boolean");
	a(t.DateTime._id_, 'DateTime', "DateTime");
	a(t.Function._id_, 'Function', "Function");
	a(t.Number._id_, 'Number', "Number");
	a(t.RegExp._id_, 'RegExp', "RegExp");
	a(t.String._id_, 'String', "String");

	obj = t({ foo: 'olek' });
	a(obj.Db, t, "Access to main database from instance");
	a(obj._foo.Db, t, "Access to main database from any instance");
	a.deep(t.Set('raz', 'dwa').values.sort(), ['raz', 'dwa'].sort(),
		"Set library");

	obj.set('externalTest', t.external(function () {
		++invoked;
		return x;
	}));
	a(obj.externalTest, x, "External");
	a(obj.externalTest, x, "External #2");
	a(invoked, 1, "External: Once");
};
