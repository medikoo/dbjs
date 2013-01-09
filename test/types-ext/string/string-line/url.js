'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(t('raz'), 'raz', "Constructor");
	a(isError(t.prototype.validateCreate('')), true, "Empty");
	a(t.prototype.validateCreate('relative'), null, "Relative");
	a(t.prototype.validateCreate('../'), null, "Double dot");
	a(t.prototype.validateCreate('/'), null, "Slash");
	a(t.prototype.validateCreate('https://www.medikoo.com'), null, "Https");
	a(t.prototype.validateCreate('http://medikoo.com'), null, "Http");
	a(isError(t.prototype.validateCreate('asfafa sdfdsf/fefe')), true, "Space");
	a(t.prototype.validateCreate('/asdf/asdf/ass'), null, "Absolute");
	a(t.prototype.validateCreate('asdf/asdf/asdf'), null, "Relative");
	a(isError(t.prototype.validateCreate('/asdfasf\nsdf/sdf')), true, "New line");
};
