'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.validate('')), true, "Empty");
	a(t.validate('relative'), null, "Relative");
	a(t.validate('../'), null, "Double dot");
	a(t.validate('/'), null, "Slash");
	a(t.validate('https://www.medikoo.com'), null, "Https");
	a(t.validate('http://medikoo.com'), null, "Http");
	a(isError(t.validate('asfafa sdfdsf/fefe')), true, "Space");
	a(t.validate('/asdf/asdf/ass'), null, "Absolute");
	a(t.validate('asdf/asdf/asdf'), null, "Relative");
	a(isError(t.validate('/asdfasf\nsdf/sdf')), true, "New line");
};
