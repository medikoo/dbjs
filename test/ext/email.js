'use strict';

module.exports = function (t, a) {
	a.throws(function () { t('wrong email@marko'); }, "Wrong email");
	a(t('test@example.com'), 'test@example.com', "Email #1");
	a(t('foo+bar@example.com'), 'foo+bar@example.com', "Email #2");
};
