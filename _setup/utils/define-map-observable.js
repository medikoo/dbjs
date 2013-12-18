'use strict';

var assign             = require('es5-ext/object/assign')
  , eq                 = require('es5-ext/object/eq')
  , d                  = require('d/d')
  , lazy               = require('d/lazy')
  , isObservableSymbol = require('observable-value/symbol-is-observable')
  , setFilterMapSubset = require('observable-map/filter-map-subset')
  , setToSet           = require('observable-map/to-set')
  , ReadOnlyMap        = require('observable-map/create-read-only')(
	require('es6-map/primitive')
)
  , serialize          = require('../serialize/value')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , properties;

module.exports = function (prototype, onInit) {

	defineProperty(prototype, isObservableSymbol, d('', true));

	setFilterMapSubset(prototype);
	setToSet(prototype);

	// Observable triggers
	properties = assign({
		_makeObservable_: d(function () {
			if (this.__isObservable__) return;
			defineProperties(this, {
				__isObservable__: d('', true),
				__size__: d('w', this.size)
			});
			if (onInit) onInit.call(this);
		}),
		_emitDelete_: d(function (key, value, dbEvent) {
			var event;
			this.__size__ -= 1;
			if (!this._postponed_) {
				this.emit('change', { type: 'delete', key: key, value: value,
					dbjs: dbEvent });
				return;
			}
			event = this._postponedEvent_;
			if (!event) event = this.__postponedEvent__ = {};
			if (dbEvent) event.dbjs = dbEvent;
			if (event.set && event.set.has(key)) {
				event.set._delete(key);
				return;
			}
			if (!event.deleted) event.deleted = new ReadOnlyMap(null, serialize);
			event.deleted._set(key, value);
		}),
		_emitSet_: d(function (key, value, oldValue, dbEvent) {
			var event, had = oldValue !== undefined;
			if (!had) this.__size__ += 1;
			if (!this._postponed_) {
				event = { type: 'set', key: key, value: value };
				if (had) event.oldValue = oldValue;
				if (dbEvent) event.dbjs = dbEvent;
				this.emit('change', event);
				return;
			}
			event = this._postponedEvent_;
			if (!event) event = this.__postponedEvent__ = {};
			if (dbEvent) event.dbjs = dbEvent;
			if (had && event.set && event.set.has(key)) event.set._delete(key);
			if (event.deleted && event.deleted.has(key) &&
					eq(event.deleted.get(key), value)) {
				event.deleted._delete(key);
				return;
			}
			if (!event.set) event.set = new ReadOnlyMap(null, serialize);
			event.set._set(key, value);
			if (!had) return;
			if (!event.deleted) event.deleted = new ReadOnlyMap();
			event.deleted._set(key, oldValue);
		}),
		_postponed_: d.gs(function () {
			return this.hasOwnProperty('__postponed__') ? this.__postponed__ : 0;
		}, function (value) {
			var event, key, entry;
			if (this.hasOwnProperty('__postponed__')) this.__postponed__ = value;
			else defineProperty(this, '__postponed__', d('w', value));
			if (value) return;
			event = this._postponedEvent_;
			if (!event) return;
			if (event.set && event.set.size) {
				if (event.deleted && event.deleted.size) {
					if ((event.set.size === 1) && (event.deleted.size === 1) &&
							eq(key = event.set.keys().next().value,
								event.deleted.keys().next().value)) {
						event.type = 'set';
						event.key = key;
						event.value = event.set.get(key);
						event.oldValue = event.deleted.get(key);
						delete event.set;
						delete event.deleted;
					} else {
						event.type = 'batch';
					}
				} else if (event.set.size === 1) {
					entry = event.set.entries().next();
					event.type = 'set';
					event.key = entry[0];
					event.value = entry[1];
					delete event.set;
					delete event.deleted;
				} else {
					event.type = 'batch';
					delete event.deleted;
				}
			} else if (event.deleted && event.deleted.size) {
				if (event.deleted.size === 1) {
					entry = event.deleted.entries().next();
					event.type = 'delete';
					event.key = entry[0];
					event.value = entry[1];
					delete event.set;
					delete event.deleted;
				} else {
					event.type = 'batch';
					delete event.set;
				}
			} else {
				event = null;
			}
			this.__postponedEvent__ = null;
			if (!event) return;
			this.emit('change', event);
		})
	}, lazy({
		_postponedEvent_: d(null, { cacheName: '__postponedEvent__', desc: 'w' })
	}));

	['on', 'once'].forEach(function (name) {
		var method = prototype[name];
		properties[name] = d(function (type, listener) {
			if (String(type) !== 'change') return method.call(this, type, listener);
			this._makeObservable_();
			return method.call(this, type, listener);
		});
	});

	// Observable triggers:
	['filter', 'map', 'subset', 'toSet'].forEach(function (name) {
		var method = prototype[name];
		properties[name] = d(function (arg) {
			this._makeObservable_();
			return method.apply(this, arguments);
		});
	});

	defineProperties(prototype, properties);

	return prototype;
};
