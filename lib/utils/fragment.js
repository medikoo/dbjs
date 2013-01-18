'use strict';

var extend      = require('es5-ext/lib/Object/extend')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , ee          = require('event-emitter/lib/core')
  , ObjFragment = require('./obj-fragment')

  , Fragment;

module.exports = Fragment = function () {
	this.added = {};
	this.fragments = {};
	this.valueRels = {};
	this.onRelation = this.onRelation.bind(this);
	this.onSetItem = this.onSetItem.bind(this);
	this.onAssignEvent = this.onAssignEvent.bind(this);
	this.onDismissEvent = this.onDismissEvent.bind(this);
};

ee(extend(Fragment.prototype, {
	approveRelation: function (rel) { return true; },
	add: function (obj) {
		var id = obj._id_;
		if (this.added[id]) return;
		this.added[id] = true;
		this.onObj(obj);
	},
	remove: function (obj) {
		var id = obj._id_;
		if (!this.added[id]) return;
		delete this.added[id];
		this.offObj(obj);
	},
	onObj: function (obj) {
		var fragment = this.fragments[obj._id_];
		if (fragment) {
			++fragment.refCount;
			return;
		}
		this.emit('update', obj._lastEvent_);
		fragment = this.fragments[obj._id_] =
			new ObjFragment(obj, this.approveRelation);
		fragment.on('relupdate', this.onRelation);
		fragment.on('setitemupdate', this.onSetItem);
		fragment.init();

		// Setup reverse
		obj._forEachReverse_(this.onAssign, this);
		obj.on('assign', this.onAssignEvent);
		obj.on('dismiss', this.onDismissEvent);
	},
	offObj: function (obj) {
		var id = obj._id_, fragment = this.fragments[id], objs;
		if (fragment.refCount === 1) {
			fragment.off('relupdate', this.onRelation);
			fragment.off('setitemupdate', this.onSetItem);
			objs = fragment.objects;
			fragment.destroy();
			delete this.fragments[id];
			forEach(objs, function (obj) { this.emit('remove', obj._id_); }, this);

			obj.off('assign', this.onAssignEvent);
			obj.off('dismiss', this.onDismissEvent);
			obj._forEachReverse_(this.onDismiss, this);
			this.emit('remove', obj._id_);
		} else {
			--fragment.refCount;
		}
	},
	onAssign: function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !this.approveRelation(rel)) return;
		this.onObj(obj);
	},
	onDismiss: function (rel) {
		var obj = rel.obj;
		if (!obj || (obj._type_ !== 'object') || !this.approveRelation(rel)) return;
		this.offObj(obj);
	},
	onAssignEvent: function (event) { this.onAssign(event.obj); },
	onDismissEvent: function (event) { this.onDismiss(event.obj); },
	onRelation: function (event, fragment) {
		var rel = event.obj, relId = rel._id_, value = event.value;

		// Process old
		if (this.valueRels[relId] && (this.valueRels[relId] !== event.value)) {
			this.offObj(this.valueRels[relId]);
			delete this.valueRels[relId];
		}

		// Process new
		if (value && (value._type_ === 'object') &&
				(this.valueRels[relId] !== value) && (value !== fragment.obj)) {
			this.onObj(this.valueRels[relId] = value);
		}

		// Emit
		this.emit('update', event);
	},
	onSetItem: function (event, fragment) {
		var added = event.value, value = event.obj._value;
		if (value && (value._type_ === 'object')) {
			if (added) this.onObj(value);
			else this.offObj(value);
		}
		this.emit('update', event);
	}
}));
