'use strict';

var remove   = require('es5-ext/lib/Array/prototype/remove')
  , d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , ee       = require('event-emitter')
  , nextTick = require('next-tick')
  , now      = require('time-uuid/lib/time')
  , Proto    = require('./_proto')
  , history  = require('./history')

  , call = Function.prototype.call
  , out = exports, stamp = null, reverse = {}
  , clear = function () { stamp = null; }
  , byStamp = function (a, b) { return b.stamp - a.stamp; }
  , relType = { relation: true, 'relation-set-item': true };

Object.defineProperties(ee(out), {
	_id: d('0'),
	_add: d(function (event, set) {
		var obj, id, last, objHistory;
		obj = event.obj;
		id = obj._id_;
		objHistory = history.hasOwnProperty(id) && history[id];
		if (!objHistory) {
			history[id] = [event];
		} else {
			last = objHistory[0];
			if (last) {
				if (last.stamp > event.stamp) {
					objHistory.unshift(event);
					objHistory.sort(byStamp);
					return;
				}
				if (last.value && (last.value._type_ === 'object')) {
					id = last.value._id_;
					if (reverse.hasOwnProperty(id)) remove.call(reverse[id], obj);
				}
			}
			if (!last || (last.stamp < event.stamp)) {
				objHistory.unshift(event);
			} else if (last.stamp === event.stamp) {
				objHistory.splice(0, 1, event);
			}
		}
		if (event.value && (event.value._type_ === 'object')) {
			id = event.value._id_;
			if (reverse.hasOwnProperty(id)) reverse[id].push(obj);
			else reverse[id] = [obj];
		}
		if (set) obj.$$setValue(event.value);
	}),
	_emit: d(function (event) {
		var obj, id, prevEvent, prevValue, value;
		obj = event.obj;
		id = obj._id_;

		prevEvent = history[id][1];
		if (prevEvent) {
			prevValue = prevEvent.value;
			if (prevValue && (prevValue._type_ === 'object')) {
				prevValue.emit('revunrelate', event);
			}
		}
		value = event.value;
		if (value && (value._type_ === 'object')) value.emit('revrelate', event);

		obj.emit('signal', event);
		while (relType[obj._type_] && ((obj = obj.obj))) obj.emit('signal', event);

		out.emit('signal', event);
	})
});

Object.defineProperty(Proto, '_signal_', d('c', function (value) {
	var event;
	if (stamp == null) {
		stamp = now();
		nextTick(clear);
	}
	event = { stamp: stamp, obj: this, value: value, sourceId: out._id };
	out._add(event);
	out._emit(event);
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
