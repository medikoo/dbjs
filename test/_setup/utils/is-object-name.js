'use strict';

module.exports = function (t, a) {
	a(t(234), false, "Number");
	a(t('234'), false, "Numeric");
	a(t('2foobar'), false, "Starts with number");
	a(t('FooBar'), false, "Capitalized");
	a(t('fooBar'), true, "Correct");
	a(t('foo34Bar34'), true, "Correct #2");
	a(t('foo Bar'), false, "Whitespace");
	a(t('foo-nar'), false, "Dash");
	a(t('foo$bar'), false, "Dollar");
	a(t('foo_bar'), false, "Underscore");
};
