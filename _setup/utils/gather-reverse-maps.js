'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (obj, sKey) {
	var maps = obj.__reverseMaps__, result;
	while (maps) {
		if (!maps[sKey]) return result;
		if (!hasOwnProperty.call(maps, sKey)) {
			maps = getPrototypeOf(maps);
			continue;
		}
		if (!result) result = [maps[sKey]];
		else result.push(maps[sKey]);
		maps = getPrototypeOf(maps);
	}
	return result;
};
