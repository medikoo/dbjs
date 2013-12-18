'use strict';

module.exports = function (value) {
	if (!value) return false;
	if (typeof value !== 'object') return false;
	return (value.unserializeEvent && value.objects && value.Base &&
			!value.__id__ && (value.Base.__id__ === 'Base')) || false;
};
