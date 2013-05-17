'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend')
  , ee     = require('event-emitter/lib/core')
  , allOff = require('event-emitter/lib/all-off')

  , metaApproved = { multiple: true, ns: true, required: true, tags: true,
		unique: true, writeOnce: true }

  , Fragment, passTree;

passTree = function (rel) {
	var parent = rel.obj, tree;
	if (parent._type_ === 'relation-set-item') parent = parent.obj;
	while (parent._type_ === 'relation') {
		if (!tree) tree = [parent];
		else tree.unshift(parent);
		parent = parent.obj;
		if (parent._type_ === 'relation-set-item') parent = parent.obj;
	}
	while (tree && (rel = tree.shift())) {
		if (this.ignored[rel._id_]) return false;
		if (!this.accepted[rel._id_]) {
			this.onRelation(rel);
			return false;
		}
	}
	return true;
};

module.exports = Fragment = function (obj, approveRelation) {
	this.objects = {};
	this.ignored = {};
	this.accepted = {};
	this.approveRelation = approveRelation;
	this.obj = obj;
	if (this.obj._lastEvent_) this.objects = [this.obj._id_];
};

ee(Object.defineProperties(Fragment.prototype, extend({
	init: d(function () {
		this.obj.on('update', this.onUpdate);
		this.obj.on('selfupdate', this.onSelfUpdate);
		this.obj._forEachRelation_(this.onRelation, this);
	}),
	destroy: d(function () {
		var objects = this.objects;
		this.obj.off('update', this.onUpdate);
		this.obj.off('update', this.onSelfUpdate);
		allOff(this);
		delete this.objects;
		return objects;
	}),
	onRelation: d(function (obj) {
		var event, id = obj._id_;
		if (!metaApproved.hasOwnProperty(obj.name) && !this.approveRelation(obj)) {
			this.ignored[id] = true;
			return;
		}
		this.accepted[id] = true;
		if ((event = obj._lastEvent_)) {
			this.objects[id] = obj;
			this.emit('update', event, null);
		}
		if (obj.hasOwnProperty('__itemPrototype_')) {
			obj.__itemPrototype_._forEachRelation_(this.onRelation, this);
			obj._forEachItem_(this.onSetItem, this);
		}
		obj._forEachRelation_(this.onRelation, this);
	}),
	onSetItem: d(function (obj) {
		var event;
		if ((event = obj._lastEvent_)) {
			this.objects[obj._id_] = obj;
			this.emit('update', event, null);
		}
		obj._forEachRelation_(this.onRelation, this);
	}),
}, d.binder({
	onSelfUpdate: d(function (nu, old) {
		if (!nu) {
			delete this.objects[this.obj._id_];
			this.emit('remove', this.obj._id_);
			return;
		}
		this.objects[this.obj._id_] = this.obj;
		this.emit('update', nu, old);
	}),
	onUpdate: d(function (nu, old) {
		var obj = (nu || old).obj, rel, relId;
		if (!nu) {
			if (this.objects[obj._id_]) {
				delete this.objects[obj._id_];
				this.emit('remove', obj._id_);
			}
			return;
		}
		if (obj._type_ === 'relation') {
			// Relation
			if (passTree.call(this, obj)) {
				if (this.ignored[obj._id_]) return;
				if (!this.accepted[obj._id_]) this.onRelation(obj);
				else this.emit('update', nu, old);
			}
		} else {
			// Set item
			rel = obj.obj;
			if (passTree.call(this, rel)) {
				relId = rel._id_;
				if (this.ignored[relId]) return;
				if (!this.accepted[relId]) {
					this.onRelation(rel);
					return;
				}
				if (!this.objects[obj._id_]) this.onSetItem(obj);
				else this.emit('update', nu, old);
			}
		}
	})
}))));
