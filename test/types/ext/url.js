'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.validate('')), true, "Empty");
	a(t.validate('relative'), undefined, "Relative");
	a(t.validate('../'), undefined, "Double dot");
	a(t.validate('/'), undefined, "Slash");
	a(t.validate('https://www.medikoo.com'), undefined, "Https");
	a(t.validate('http://medikoo.com'), undefined, "Http");
	a(isError(t.validate('asfafa sdfdsf/fefe')), true, "Space");
	a(t.validate('/asdf/asdf/ass'), undefined, "Absolute");
	a(t.validate('asdf/asdf/asdf'), undefined, "Relative");
	a(isError(t.validate('/asdfasf\nsdf/sdf')), true, "New line");
};
