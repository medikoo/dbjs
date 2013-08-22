'use strict';

var d = require('es5-ext/lib/Object/descriptor')

  , defineProperties = Object.defineProperties, keys = Object.keys;

module.exports = function (rel, getter) {
	var cleanersMap = {}, clear, result;
	clear = function (id) {
		var cleaners = cleanersMap[id];
		if (!cleaners) return;
		while (cleaners[0]) cleaners.shift()();
		delete cleanersMap[id];
	};
	result = function () {
		var cleaners = [], result
		  , update = this.get(rel.name)._update_;
		clear(this._id_);
		result = getter.call(this, function (rel, forceSet) {
			if (!rel || (typeof rel.on !== 'function')) {
				throw new TypeError("Object is not an emitter");
			}
			if (rel._isSet_ || forceSet) {
				rel.on('delete', update);
				cleaners.push(rel.off.bind(rel, 'delete', update));
				rel.on('add', update);
				cleaners.push(rel.off.bind(rel, 'add', update));
				if (!rel._isSet_) {
					rel.on('change', update);
					cleaners.push(rel.off.bind(rel, 'change', update));
				}
				return rel;
			}
			rel.on('change', update);
			cleaners.push(rel.off.bind(rel, 'change', update));
			return rel.value;
		});
		if (cleaners.length) cleanersMap[this._id_] = cleaners;
		return result;
	};
	return defineProperties(result, {
		origin: d(getter),
		_hasDynamicTriggers_: d(true),
		clearAll: d(function () {
			keys(cleanersMap).forEach(clear);
		})
	});
};
