'use strict';

var resolveStatic  = require('./resolve-static-triggers')
  , resolveDynamic = require('./resolve-dynamic-triggers');

module.exports = function (obj, getter, update) {
	var result, clear = [], origin = getter
	  , isDynamic = (getter.$dbjs$getter === 2), fn;

	fn = resolveStatic(getter);
	if (isDynamic || (fn !== getter)) {
		result = resolveDynamic(obj.database, fn, update);
		getter = result.getter;
		clear.push(result.clear);
	}

	return {
		origin: origin,
		getter: getter,
		clear: function () {
			if (!clear) return;
			while (clear.length) clear.pop()();
			clear = null;
		}
	};
};
