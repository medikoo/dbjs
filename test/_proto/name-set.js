'use strict';

module.exports = function (t, a) {
	var set = new t({}), x = {}, values, i = 0;
	a.deep(set.values, [], "Empty");
	set[set._serialize('foo')] = 'foo';
	set[set._serialize('bar')] = 'bar';
	a.deep(set.values.sort(), ['bar', 'foo'], "Filled");
	values = set.values;

	set.forEach(function (name, index, self) {
		a(name, values[i], "Name #" + i);
		a(index, null, "Index #" + i);
		a(self, set, "Set #" + i);
		a(this, x, "Context #" + i);
		++i;
	}, x);
};
