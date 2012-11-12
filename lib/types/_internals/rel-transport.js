'use strict';

var copy        = require('es5-ext/lib/Object/copy')
  , isEmpty     = require('es5-ext/lib/Object/is-empty')

, RelTransport;

module.exports = RelTransport = function (ns, data) {
	this.ns = ns;
	if (data.hasOwnProperty('value')) {
		this.value = data.value;
		this.data = copy(data);
		delete this.data.value;
		if (isEmpty(this.data)) delete this.data;
	} else {
		this.data = data;
	}
};

RelTransport.prototype.apply = function (rel) {
	rel.ns = this.ns;
	if (this.data) rel.setMany(this.data);
	if (this.hasOwnProperty('value')) return (rel.value = this.value);
	return this.ns;
};
