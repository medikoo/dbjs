'use strict';

var value          = require('es5-ext/object/valid-value')
  , unserializeId  = require('../unserialize/id')
  , unserializeKey = require('../unserialize/key')
  , object         = require('../../valid-dbjs-object')
  , nested         = require('../../valid-dbjs-nested-object');

module.exports = function (obj, id) {
	var names = [];
	object(obj);
	names = [];
	unserializeId(value(id)).forEach(function (token, index) {
		if (index % 2) {
			if (token !== '/') throw new TypeError(id + " is not property id");
			return;
		}
		names.push(token);
	});
	while (names.length > 1) obj = nested(obj.get(unserializeKey(names.shift())));
	return { object: obj, key: unserializeKey(names[0]) };
};
