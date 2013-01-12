'use strict';

var remove   = require('es5-ext/lib/Array/prototype/remove')
  , d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , ee       = require('event-emitter')
  , nextTick = require('next-tick')
  , now      = require('time-uuid/lib/time')
  , Proto    = require('./_proto')
  , objects  = require('./objects')
  , history  = require('./history')

  , call = Function.prototype.call
  , out = exports, stamp = null, reverse = {}
  , clear = function () { stamp = null; }
  , byStamp = function (a, b) { return b.stamp - a.stamp; }
  , relType = { relation: true, 'relation-set-item': true }
  , objectType = { object: true, namespace: true, primitive: true };

Object.defineProperties(ee(out), {
	_id: d('0'),
	_add: d(function (event, noEvents) {
		var obj, id, last, objHistory, dismissed, assigned, addedTo, removedFrom;

		obj = event.obj;
		id = obj._id_;

		// Update history and reverse relations index
		objHistory = history.hasOwnProperty(id) && history[id];
		if (!objHistory) {
			history[id] = [event];
		} else {
			last = objHistory[0];
			if (last) {
				if (last.stamp > event.stamp) {
					// Outdated update, add to history and quit
					objHistory.unshift(event);
					objHistory.sort(byStamp);
					return;
				} else if (last.stamp < event.stamp) {
					objHistory.unshift(event);
				} else {
					objHistory.splice(0, 1, event);
				}
				if (last.value && (last.value !== event.value)) {
					if (obj._type_ === 'relation-set-item') {
						if (obj._key_[0] === '7') {
							id = obj._key_.slice(1);
							remove.call(reverse[id], obj);
							dismissed = objects._get(id);
						}
					}
					if (last.value._type_) {
						if (obj._type_ === 'relation') {
							if (last.value._type_ === 'object') {
								id = last.value._id_;
								remove.call(reverse[id], obj);
								dismissed = last.value;
							}
						} else if (objectType[last.value._type_]) {
							removedFrom = last.value;
						}
					}
				}
			} else {
				objHistory.unshift(event);
			}
		}
		if (event.value && (!last || (last.value !== event.value))) {
			if (obj._type_ === 'relation-set-item') {
				if (obj._key_[0] === '7') {
					id = obj._key_.slice(1);
					if (reverse.hasOwnProperty(id)) reverse[id].push(obj);
					else reverse[id] = [obj];
					assigned = objects._get(id);
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
			obj = obj.obj;
			while (relType[obj._type_]) obj = obj.obj;
			obj.emit('update', event);
			if (dismissed) dismissed.emit('dismiss', event);
			if (assigned) assigned.emit('assign', event);
		} else {
			if (removedFrom) removedFrom.emit('remove', event);
			if (addedTo) addedTo.emit('add', event);
		}
		out.emit('update', event);
	})
});

Object.defineProperty(Proto, '_signal_', d('c', function (value) {
	if (stamp == null) {
		stamp = now();
		nextTick(clear);
	}
	out._add({ stamp: stamp, obj: this, value: value, sourceId: out._id });
}));
Object.defineProperties(Proto.prototype, {
	_signal_: d(Proto._signal_),
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
