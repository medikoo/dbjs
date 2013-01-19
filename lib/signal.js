'use strict';

var remove   = require('es5-ext/lib/Array/prototype/remove')
  , d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , ee       = require('event-emitter')
  , nextTick = require('next-tick')
  , now      = require('time-uuid/lib/time')
  , proto    = require('./_proto')
  , Event    = require('./event')
  , objects  = require('./objects')
  , history  = require('./history')

  , call = Function.prototype.call
  , getObject = objects._get
  , out = exports, stamp = null, reverse = {}
  , clear = function () { stamp = null; }
  , byStamp = function (a, b) { return b.stamp - a.stamp; }
  , relType = { relation: true, 'relation-set-item': true }
  , objectType = { object: true, namespace: true, prototype: true };

Object.defineProperties(ee(out), {
	_id: d('0'),
	_add: d(function (event, noEvents) {
		var obj, id, previous, objHistory, dismissed, assigned, addedTo
		  , removedFrom;

		obj = event.obj;
		id = obj._id_;

		// Update history and reverse relations index
		objHistory = history.hasOwnProperty(id) && history[id];
		if (!objHistory) {
			history[id] = [event];
		} else {
			previous = objHistory[0];
			if (previous) {
				if (previous.stamp > event.stamp) {
					// Outdated update, add to history and quit
					objHistory.unshift(event);
					objHistory.sort(byStamp);
					return;
				} else if (previous.stamp < event.stamp) {
					objHistory.unshift(event);
				} else {
					if ((previous.sourceId === event.sourceId) &&
							(previous.value === event.value)) {
						obj.$$setValue(event.value);
						return;
					}
					objHistory.splice(0, 1, event);
					if (previous.value === event.value) {
						obj.$$setValue(event.value);
						if (noEvents) return;
						out.emit('update', event, previous);
						return;
					}
				}
				if (previous.value && (previous.value !== event.value)) {
					if (obj._type_ === 'relation-set-item') {
						if (obj._key_[0] === '7') {
							id = obj._key_.slice(1);
							dismissed = getObject(id);
							if (dismissed._type_ === 'object') remove.call(reverse[id], obj);
							else dismissed = null;
						}
					}
					if (previous.value._type_) {
						if (obj._type_ === 'relation') {
							if (previous.value._type_ === 'object') {
								id = previous.value._id_;
								remove.call(reverse[id], obj);
								dismissed = previous.value;
							}
						} else if (objectType[previous.value._type_]) {
							removedFrom = previous.value;
						}
					}
				}
			} else {
				objHistory.unshift(event);
			}
		}
		if (event.value && (!previous || (previous.value !== event.value))) {
			if (obj._type_ === 'relation-set-item') {
				if (obj._key_[0] === '7') {
					id = obj._key_.slice(1);
					assigned = getObject(id);
					if (assigned._type_ === 'object') {
						if (reverse.hasOwnProperty(id)) reverse[id].push(obj);
						else reverse[id] = [obj];
					} else {
						assigned = null;
					}
				}
			}
			if (event.value._type_) {
				if (obj._type_ === 'relation') {
					if (event.value._type_ === 'object') {
						id = event.value._id_;
						if (reverse.hasOwnProperty(id)) reverse[id].push(obj);
						else reverse[id] = [obj];
						assigned = event.value;
					}
				} else if (objectType[event.value._type_]) {
					addedTo = event.value;
				}
			}
		}

		obj.$$setValue(event.value);
		if (noEvents) return;
		if (relType[obj._type_]) {
			do {
				obj = obj.obj;
				if (!obj) break;
			} while (relType[obj._type_]);
			if (obj) obj.emit('update', event, previous);
			if (dismissed) dismissed.emit('dismiss', event, previous);
			if (assigned) assigned.emit('assign', event, previous);
		} else {
			if (removedFrom) removedFrom.emit('remove', event, previous);
			if (addedTo) addedTo.emit('add', event, previous);
		}
		out.emit('update', event, previous);
	}),
	_remove: d(function (id, noEvents) {
		var obj = getObject(id)
		  , objHistory = history.hasOwnProperty(id) && history[id]
		  , lastEvent = objHistory[0], dismissed, removedFrom;

		if (lastEvent && lastEvent.value) {
			if (obj._type_ === 'relation-set-item') {
				if (obj._key_[0] === '7') {
					id = obj._key_.slice(1);
					dismissed = getObject(id);
					if (dismissed._type_ === 'object') remove.call(reverse[id], obj);
					else dismissed = null;
				}
			}
			if (lastEvent.value._type_) {
				if (obj._type_ === 'relation') {
					if (lastEvent.value._type_ === 'object') {
						id = lastEvent.value._id_;
						remove.call(reverse[id], obj);
						dismissed = lastEvent.value;
					}
				} else if (objectType[lastEvent.value._type_]) {
					removedFrom = lastEvent.value;
				}
			}
		}

		delete history[id];
		obj.$$setValue();
		if (noEvents) return;
		if (relType[obj._type_]) {
			do {
				obj = obj.obj;
				if (!obj) break;
			} while (relType[obj._type_]);
			if (obj && lastEvent) obj.emit('update', null, lastEvent);
			if (dismissed) dismissed.emit('dismiss', null, lastEvent);
		} else if (removedFrom) {
			removedFrom.emit('remove', null, lastEvent);
		}
		out.emit('remove', id);
	})
});

Object.defineProperties(proto, {
	_signal_: d(function (value) {
		if (stamp == null) {
			stamp = now();
			nextTick(clear);
		}
		out._add(new Event(this, value, stamp));
	}),
	_forEachReverse_: d(function (cb/*, thisArg*/) {
		var data, thisArg = arguments[1];
		callable(cb);
		data = reverse.hasOwnProperty(this._id_) && reverse[this._id_];
		if (!data) return;
		data.forEach(function (rel) {
			call.call(cb, thisArg, rel, rel._id_, this);
		}, this);
	})
});
