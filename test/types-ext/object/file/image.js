'use strict';

module.exports = function (t, a) {
	a.deep(t({ dir: '/moo', width: '34', height: 23.43 }),
		{ dir: '/moo', width: 34, height: 23 });
};
