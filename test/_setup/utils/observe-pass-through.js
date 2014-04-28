'use strict';

var ObservableValue = require('observable-value')
  , ObservableSet   = require('observable-set')
  , ObservableMap   = require('observable-map')
  , ObservableArray = require('observable-array');

module.exports = function (t, a) {
	var x = new ObservableValue('foo');
	a(t(x), 'foo', "Observable value");

	x = new ObservableSet();
	a(t(x), x, "Observable set");

	x = new ObservableMap();
	a(t(x), x, "Observable map");

	x = new ObservableArray();
	a(t(x), x, "Observable array");

	x = undefined;
	a(t(x), x, "Undefined");

	x = {};
	a(t(x), x, "Other object");
};
