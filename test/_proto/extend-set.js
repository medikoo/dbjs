'use strict';

var SetColl = require('set-collection');

module.exports = function (t, a) {
	var set = new SetColl();
	t(set);
	a(typeof set.filter, 'function', "Filter");
	a(typeof set.union, 'function', "Union");
};
