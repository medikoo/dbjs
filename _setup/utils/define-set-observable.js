'use strict';

var assign             = require('es5-ext/object/assign')
  , d                  = require('d')
  , lazy               = require('d/lazy')
  , isObservableSymbol = require('observable-value/symbol-is-observable')
  , setFilterMap       = require('observable-set/filter-map')
  , setFirst           = require('observable-set/first')
  , setLast            = require('observable-set/last')
  , setHas             = require('observable-set/has')
  , setSize            = require('observable-set/size')
  , setAndOrNot        = require('observable-set/and-or-not')
  , setToArray         = require('observable-set/to-array')
  , ReadOnlySet        = require('observable-set/create-read-only')(
	require('es6-set/primitive')
)
  , defineFilterByKey   = require('./define-filter-by-key')
  , serialize          = require('../serialize/value')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , properties;

module.exports = function (prototype, onInit) {

	defineProperty(prototype, isObservableSymbol, d('', true));

	setFilterMap(prototype);
	setFirst(prototype);
	setLast(prototype);
	setHas(prototype);
	setSize(prototype);
	setAndOrNot(prototype);
	setToArray(prototype);

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
		_emitAdd_: d(function (value, dbEvent) {
			var event;
			this.__size__ += 1;
			if (!this.__postponed__) {
				event = { type: 'add', value: value };
				if (dbEvent) event.dbjs = dbEvent;
				this.emit('change', event);
				return;
			}
			event = this.__postponedEvent__;
			if (!event) event = this.__postponedEvent__ = {};
			if (dbEvent) event.dbjs = dbEvent;
			if (event.deleted && event.deleted.has(value)) {
				event.deleted._delete(value);
				return;
			}
			if (!event.added) event.added = new ReadOnlySet(null, serialize);
			event.added._add(value);
		}),
		_emitDelete_: d(function (value, dbEvent) {
			var event;
			this.__size__ -= 1;
			if (!this.__postponed__) {
				this.emit('change', { type: 'delete', value: value, dbjs: dbEvent });
				return;
			}
			event = this.__postponedEvent__;
			if (!event) event = this.__postponedEvent__ = {};
			if (dbEvent) event.dbjs = dbEvent;
			if (event.added && event.added.has(value)) {
				event.added._delete(value);
				return;
			}
			if (!event.deleted) event.deleted = new ReadOnlySet(null, serialize);
			event.deleted._add(value);
		}),
		_postponed_: d.gs(function () {
			return this.__postponed__;
		}, function (value) {
			var event;
			this.__postponed__ = value;
			if (value) return;
			event = this.__postponedEvent__;
			if (!event) return;
			if (event.added && event.added.size) {
				if (event.deleted && event.deleted.size) {
					event.type = 'batch';
				} else if (event.added.size === 1) {
					event.type = 'add';
					event.value = event.added.values().next().value;
					delete event.deleted;
					delete event.added;
				} else {
					event.type = 'batch';
					delete event.deleted;
				}
			} else if (event.deleted && event.deleted.size) {
				if (event.deleted.size === 1) {
					event.type = 'delete';
					event.value = event.deleted.values().next().value;
					delete event.added;
					delete event.deleted;
				} else {
					event.type = 'batch';
					delete event.added;
				}
			} else {
				event = null;
			}
			this.__postponedEvent__ = null;
			if (!event) return;
			this.emit('change', event);
		})
	}, lazy({
		__postponed__: d('w', 0),
		__postponedEvent__: d('w', null)
	}));

	['on', 'once'].forEach(function (name) {
		var method = prototype[name];
		properties[name] = d(function (type, listener) {
			if (String(type) !== 'change') return method.call(this, type, listener);
			this._makeObservable_();
			return method.call(this, type, listener);
		});
	});

	return defineFilterByKey(defineProperties(prototype, properties));
};
