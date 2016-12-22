'use strict';

var assign         = require('es5-ext/object/assign')
  , d              = require('d')
  , lazy           = require('d/lazy')
  , Observable     = require('observable-value')

  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , setValue = valueDesc.set
  , baseEmit = Observable.prototype._emit_;

module.exports = Object.create(Observable.prototype, assign({
	_update_: d(function (value, dbEvent) {
		this._updateEvent_(dbEvent);
		setValue.call(this, value);
	}),
	_updateEvent_: d(function (dbEvent) {
		this.__lastModified__ = dbEvent ? dbEvent.stamp : 0;
		this.__passEvent__ = dbEvent;
	}),
	_emit_: d(function (nu, old) {
		var event, dbEvent = this.__passEvent__;
		this.__passEvent__ = null;
		if (!dbEvent) return baseEmit.call(this, nu, old);
		if (!this.__postponed__) {
			this.emit('change', { type: 'change', newValue: nu, oldValue: old, dbjs: dbEvent,
				target: this });
			return;
		}
		baseEmit.call(this, nu, old);
		event = this.__postponedEvent__;
		if (!event) return;
		event.dbjs = dbEvent;
	})
}, lazy({
	_dynamicListeners_: d(function () { return []; },
		{ cacheName: '__dynamicListeners__', desc: '' }),
	__passEvent__: d('w', null),
	__lastModified__: d(function () { return null; }, { desc: 'w' })
})));
