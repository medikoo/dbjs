'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , validSet = require('set-collection/lib/valid-set')

  , defineProperty = Object.defineProperty
  , index = 0, map;

module.exports = map = function (set) {
	if (!validSet(set)._setId_) {
		++index;
		map[index] = defineProperty(set, '_setId_', d(index));
	}
	return set._setId_;
};
