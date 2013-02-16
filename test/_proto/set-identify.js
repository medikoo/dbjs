'use strict';

var SetColl = require('set-collection');

module.exports = function (t, a) {
	var set = new SetColl();
	t(set);
	a(typeof set._setId_, 'number');
};
