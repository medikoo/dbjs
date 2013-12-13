'use strict';

var Error = require('../../../_setup/error');

module.exports = function (t, a) {
	var error = new Error("Elo");
	error.key = 'foo';
	a(t(error), 'foo: Elo');
};
