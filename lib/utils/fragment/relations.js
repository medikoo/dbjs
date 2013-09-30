// Representation of one object with it's relations and set items

'use strict';

var extend   = require('es5-ext/object/extend')
  , d        = require('d/d')
  , autoBind = require('d/auto-bind')
  , ee       = require('event-emitter/lib/core')
  , allOff   = require('event-emitter/lib/all-off')

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

module.exports = Fragment = function (obj, pass) {
	this.objects = {};
	this.ignored = {};
	this.accepted = {};
	this.pass = pass;
	this.obj = obj;
	if (this.obj._lastEvent_) this.objects[this.obj._id_] = this.obj;
	obj.on('update', this.onUpdate);
	obj.on('selfupdate', this.onSelfUpdate);
	obj._forEachRelation_(this.onRelationObj, this);
};

ee(Object.defineProperties(Fragment.prototype, extend({
	destroy: d(function () {
		var objects = this.objects;
		this.obj.off('update', this.onUpdate);
		this.obj.off('selfupdate', this.onSelfUpdate);
		allOff(this);
		delete this.objects;
		return objects;
	}),
	onRelationObj: d(function (obj) {
		var event = obj._lastEvent_;
		if (event) {
			this.onUpdate(event);
			return;
		}
		if (obj.hasOwnProperty('__itemPrototype_')) {
			obj.__itemPrototype_._forEachRelation_(this.onRelationObj, this);
			obj._forEachItem_(function (item) {
				var event = item._lastEvent_;
				if (event) this.onUpdate(event);
				else item._forEachRelation_(this.onRelationObj, this);
			}, this);
		}
		obj._forEachRelation_(this.onRelationObj, this);
	}),
	onRelation: d(function (obj) {
		var event, id = obj._id_;
		if (!this.pass(obj)) {
			this.ignored[id] = true;
			return;
		}
		this.accepted[id] = true;
		if ((event = obj._lastEvent_)) {
			this.objects[id] = obj;
			this.emit('update', event, null);
		}
		if (obj.hasOwnProperty('__itemPrototype_')) {
			obj.__itemPrototype_._forEachRelation_(this.onRelationObj, this);
			obj._forEachItem_(this.onSetItem, this);
		}
		obj._forEachRelation_(this.onRelationObj, this);
	}),
	onSetItem: d(function (obj) {
		var event;
		if ((event = obj._lastEvent_)) {
			this.objects[obj._id_] = obj;
			this.emit('update', event, null);
		}
		obj._forEachRelation_(this.onRelationObj, this);
	}),
}, autoBind({
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
