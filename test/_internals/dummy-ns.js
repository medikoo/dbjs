'use strict';

module.exports = function (t, a) {
	var x;
	a(t.is({}), true, "Is");
	a(t.normalize(x = {}), x, "Normalize");
	a(t.validate(), null, "Validate");
	a(t._serialize_(34), '234', "Serialize");
	a(t.coerce(x), x, "Coerce");
	a(t.$construct(x), x, "Construct");
};
