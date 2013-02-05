'use strict';

var memoize   = require('memoizee/lib/primitive');

module.exports =  memoize(function (tag) {
	return function (name, set) {
		var item = this['_' + name].tags.getItem(tag);
		item.on('change', set._update.bind(set, name));
		return item.value;
	};
});
