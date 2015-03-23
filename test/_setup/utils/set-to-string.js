'use strict';

var Set = require('es6-set');

module.exports = function (t, a) {
	a(t.call(new Set()), '');
	a(t.call(new Set(['foo', 'bar'])), 'foo, bar');
};
