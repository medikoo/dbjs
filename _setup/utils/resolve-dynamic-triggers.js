'use strict';

var contains          = require('es5-ext/array/#/contains')
  , diff              = require('es5-ext/array/#/diff')
  , remove            = require('es5-ext/array/#/remove')
  , isMap             = require('es6-map/is-map')
  , isObservable      = require('observable-value/is-observable')
  , isObservableValue = require('observable-value/is-observable-value')

  , getChangeListener, on, off, isNonMapObservable;

isNonMapObservable = function (obj, forceMap) {
	if (!isObservable(obj)) return false;
	return forceMap || !isMap(obj);
};

getChangeListener = function (update, event) {
	this._release_(update(event.dbjs || (event.sourceId != null ? event : null)));
};
on = function (onChange, obj) {
	var listeners = obj._dynamicListeners_;
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
		result = getter.call(this, function (obj, forceMap) {
			var dupe;
			if (!isNonMapObservable(obj, forceMap)) return obj;
			if (!nu) nu = [];
			else if (contains.call(nu, obj)) dupe = true;
			if (!dupe) {
				nu.push(obj);
				if (obj._makeObservable_) obj._makeObservable_();
			}
			if (!isObservableValue(obj)) return obj;
			obj = obj.value;
			if (dupe) return obj;
			if (isNonMapObservable(obj, forceMap)) {
				nu.push(obj);
				if (obj._makeObservable_) obj._makeObservable_();
			}
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
