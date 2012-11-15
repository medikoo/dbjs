'use strict';

module.exports = function (t, a) {
	a.deep(t.options.toArray(), ['F', 'M']);
};
