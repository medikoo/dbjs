'use strict';

var diff              = require('es5-ext/array/#/diff')
  , remove            = require('es5-ext/array/#/remove')
  , isObservable      = require('observable-value/is-observable')
  , isObservableValue = require('observable-value/is-observable-value')

  , getChangeListener, on, off;

getChangeListener = function (update, event) {
	this._release_(update(event));
};
on = function (onChange, obj) {
	var listeners = obj._dynamicListeners_;
	if (obj._makeObservable_) obj._makeObservable_();
	if (listeners) listeners.push(this);
	else obj.on('change', onChange);

};
off = function (onChange, obj) {
	var listeners = obj._dynamicListeners_;
	if (listeners) remove.call(listeners, this);
	else obj.off('change', onChange);
};

module.exports = function (db, getter, update) {
	var observed, wrap, onChange = getChangeListener.bind(db, update)
	  , add = on.bind(update, onChange), remove = off.bind(update, onChange);

	wrap = function (arg) {
		var nu, result;
		result = getter.call(this, function (obj) {
			if (!isObservable(obj)) return obj;
			if (!nu) nu = [];
			nu.push(obj);
			if (!isObservableValue(obj)) return obj;
			obj = obj.value;
			if (isObservable(obj)) nu.push(obj);
			return obj;
		}, arg);
		if (!observed) {
			if (nu) nu.forEach(add);
		} else if (nu) {
			diff.call(observed, nu).forEach(remove);
			diff.call(nu, observed).forEach(add);
		} else {
			observed.forEach(remove);
		}
		observed = nu;
		return result;
	};

	return {
		origin: getter,
		getter: wrap,
		clear: function () {
			if (!observed) return;
			observed.forEach(remove);
			observed = null;
		}
	};
};
