'use strict';

var remove   = require('es5-ext/array/#/remove')
  , callable = require('es5-ext/object/valid-callable')
  , d        = require('d/d')
  , ee       = require('event-emitter/lib/core')
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
	_add: d(function (event) {
		var obj, id, previous, objHistory, dismissed, assigned, addedTo
		  , removedFrom, masterObj;

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
					event.fulfilled = true;
					return;
				}
				if (previous.stamp < event.stamp) {
					objHistory.unshift(event);
				} else {
					if ((previous.sourceId === event.sourceId) &&
							(previous.value === event.value)) {
						obj.$$setValue(event.value);
						event.fulfilled = true;
						return;
					}
					objHistory.splice(0, 1, event);
					if (previous.value === event.value) {
						obj.$$setValue(event.value);
						out.emit('update', event, previous);
						event.fulfilled = true;
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
		obj.emit('selfupdate', event, previous);
		if (relType[obj._type_]) {
			masterObj = obj.obj;
			while (masterObj && relType[masterObj._type_]) masterObj = masterObj.obj;
			if (masterObj) masterObj.emit('update', event, previous);
			if (dismissed) dismissed.emit('dismiss', event, previous);
			if (assigned) assigned.emit('assign', event, previous);
		} else if (removedFrom || addedTo) {
			if (removedFrom) removedFrom.emit('reduce', event, previous);
			if (addedTo) addedTo.emit('extend', event, previous);
		}
		out.emit('update', event, previous);
		event.fulfilled = true;
	}),
	_remove: d(function (id) {
		var obj, subId, lastEvent, dismissed, removedFrom;
		if (!history.hasOwnProperty(id)) return;
		lastEvent = history[id][0];
		delete history[id];
		if (!lastEvent) return;
		obj = getObject(id);

		if (lastEvent.value) {
			if (obj._type_ === 'relation-set-item') {
				if (obj._key_[0] === '7') {
					subId = obj._key_.slice(1);
					dismissed = getObject(subId);
					if (dismissed._type_ === 'object') remove.call(reverse[subId], obj);
					else dismissed = null;
				}
			}
			if (lastEvent.value._type_) {
				if (obj._type_ === 'relation') {
					if (lastEvent.value._type_ === 'object') {
						subId = lastEvent.value._id_;
						remove.call(reverse[subId], obj);
						dismissed = lastEvent.value;
					}
				} else if (objectType[lastEvent.value._type_]) {
					removedFrom = lastEvent.value;
				}
			}
		}

		obj.$$setValue();
		if (relType[obj._type_]) {
			do {
				obj = obj.obj;
				if (!obj) break;
			} while (relType[obj._type_]);
			if (obj) obj.emit('update', null, lastEvent);
			if (dismissed) dismissed.emit('dismiss', null, lastEvent);
		} else if (removedFrom) {
			removedFrom.emit('reduce', null, lastEvent);
		}
		obj.emit('selfupdate', null, lastEvent);
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
