'use strict';

var unserializeId  = require('../unserialize/id');

module.exports = function (id) {
	var keys = [];
	unserializeId(id).slice(1).some(function (token, index) {
		if (!(index % 2)) {
			if (token === '$') throw new Error(id + " is not property id");
			if (token === '*') return true;
			return;
		}
		keys.push(token);
	});
	return keys.join('/') || null;
};
