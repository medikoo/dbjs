'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.prototype.validateCreate('')), true, "Empty");
	a(t.prototype.validateCreate('.'), null, "Dot");
	a(t.prototype.validateCreate('..'), null, "Double dot");
	a(t.prototype.validateCreate('/'), null, "Slash");
	a(t.prototype.validateCreate('c:\\'), null, "Windows root");
	a(isError(t.prototype.validateCreate('c:/sdfsfd/')), true,
		"Wrong Windows root");
	a(t.prototype.validateCreate('/asdf/asdf/as  df'), null, "Absolute");
	a(t.prototype.validateCreate('asdf/asdf/asdf'), null, "Relative");
	a(isError(t.prototype.validateCreate('/asdfasf\nsdf/sdf')), true, "New line");
};
