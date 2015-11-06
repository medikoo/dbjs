'use strict';

module.exports = function (t, a) {
	a(t('foo'), null);
	a(t('foo/bar'), 'bar');
	a(t('foo/bar/lorem'), 'bar/lorem');
	a.throws(function () { t('foo/bar/lorem$iszka'); }, Error);
	a(t('foo/bar/lorem*elo'), 'bar/lorem');
	a(t('foo/bar/lorem/elo'), 'bar/lorem/elo');
};
