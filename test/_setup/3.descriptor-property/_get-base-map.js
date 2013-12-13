'use strict';

module.exports = function (desc) {
	return [['type', desc.type], ['required', false], ['multiple', false],
		['nested', false], ['unique', false], ['min', -Infinity], ['max', Infinity],
		['step', 0]];
};
