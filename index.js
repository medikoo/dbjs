'use strict';

var aFrom                 = require('es5-ext/array/from')
  , validFunction         = require('es5-ext/function/valid-function')
  , assign                = require('es5-ext/object/assign')
  , d                     = require('d')
  , lazy                  = require('d/lazy')
  , ee                    = require('event-emitter')
  , Event                 = require('./_setup/event')
  , Error                 = require('./_setup/error')
  , unserializeEvent      = require('./_setup/unserialize/event')
  , unserializeValue      = require('./_setup/unserialize/value')
  , setup                 = require('./_setup')
  , validValue            = require('./valid-dbjs-value')
  , observePassthru       = require('./_setup/utils/observe-pass-through')
  , resolveStaticTriggers = require('./_setup/utils/resolve-static-triggers')

  , push = Array.prototype.push
  , defineProperties = Object.defineProperties
  , release = function (obj) { obj._postponed_ -= 1; }
  , byIndex = function (a, b) { return a.index - b.index; }
  , Database, notifyDynamic;

notifyDynamic = function (obj) {
	if (!obj.hasOwnProperty('__dynamicListeners__')) return;
	aFrom(obj.__dynamicListeners__).forEach(function (update) {
		var event, postponed;
		if (obj.hasOwnProperty('__postponedEvent__') && obj.__postponedEvent__) {
			event = obj.__postponedEvent__.dbjs;
		}
		postponed = update(event, postponed);
		if (postponed) {
			push.apply(this, postponed);
			postponed.forEach(notifyDynamic, this);
		}
	}, this);
};

Database = module.exports = function () {
	if (!(this instanceof Database)) return new Database();
	setup(this);
};

ee(defineProperties(Database.prototype, assign({
	unserializeEvent: d(function (str, sourceId) {
		var data = unserializeEvent(str)
		  , value = unserializeValue(data.value, this.objects);
		return new Event(this.objects.unserialize(data.id, value), value,
			data.stamp, sourceId);
	}),
	getSnapshot: d(function (/*options*/) {
		var result = [];
		this.objects._plainForEach_(function (obj) {
			var event = obj._lastOwnEvent_;
			if (event && (event.value !== undefined)) result.push(event);
		});
		return result.sort(byIndex);
	}),
	Error: d(Error),
	observePassthru: d(observePassthru),
	resolveGetterObservables: d(function (fn) { return resolveStaticTriggers(validFunction(fn)); }),
	_update_: d(function (id, value) {
		var obj;
		validValue(value);
		obj = this.objects.unserialize(id, value);
		new Event(obj, value); //jslint: ignore
	}),
	_postponed_: d.gs(function () {
		return this.__postponed__;
	}, function (value) {
		var postponed;
		this.__postponed__ = value;
		if (value) return;
		if (!this.__postponedObjects__) return;
		postponed = this.__postponedObjects__;
		this.__postponedObjects__ = null;
		this._release_(postponed);
	}),
	_release_: d(function (postponed) {
		if (!postponed) return;
		if (this.__postponed__) {
			if (!this.__postponedObjects__) this.__postponedObjects__ = postponed;
			else push.apply(this.__postponedObjects__, postponed);
			return;
		}
		postponed.forEach(notifyDynamic, postponed);
		postponed.forEach(release);
	})
}, lazy({
	__postponed__: d('w', 0),
	__postponedObjects__: d('w', null)
}))));
