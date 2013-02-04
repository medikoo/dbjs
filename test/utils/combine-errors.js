'use strict';

module.exports = function (t, a) {
	var e1, e2, err;
	e1 = new Error('Test');
	e1.errors = [new Error('Sub1'), new Error('Sub2')];
	e2 = new Error('Marko');
	err = t(e1, null, e2);
	a.ok(err instanceof Error, "Returns error");
	a.deep(err.errors, e1.errors, "Sub errors attached");
};
