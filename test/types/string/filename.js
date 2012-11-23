'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.validate('')), true, "Empty");
	a(t.validate('.'), undefined, "Dot");
	a(t.validate('..'), undefined, "Double dot");
	a(t.validate('/'), undefined, "Slash");
	a(t.validate('c:\\'), undefined, "Windows root");
	a(isError(t.validate('c:/sdfsfd/')), true, "Wrong Windows root");
	a(t.validate('/asdf/asdf/as  df'), undefined, "Absolute");
	a(t.validate('asdf/asdf/asdf'), undefined, "Relative");
	a(isError(t.validate('/asdfasf\nsdf/sdf')), true, "New line");
};
