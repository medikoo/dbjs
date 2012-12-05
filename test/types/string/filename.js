'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.validate('')), true, "Empty");
	a(t.validate('.'), null, "Dot");
	a(t.validate('..'), null, "Double dot");
	a(t.validate('/'), null, "Slash");
	a(t.validate('c:\\'), null, "Windows root");
	a(isError(t.validate('c:/sdfsfd/')), true, "Wrong Windows root");
	a(t.validate('/asdf/asdf/as  df'), null, "Absolute");
	a(t.validate('asdf/asdf/asdf'), null, "Relative");
	a(isError(t.validate('/asdfasf\nsdf/sdf')), true, "New line");
};
