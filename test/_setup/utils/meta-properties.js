'use strict';

module.exports = function (t, a) {
	a(t.constructor, true);
	a(t.foo, undefined);
};
