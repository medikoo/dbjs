'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend')
  , ee     = require('event-emitter/lib/core')

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
};

ee(Object.defineProperties(Fragment.prototype, extend({
	init: d(function () {
		this.obj.on('update', this.onUpdate);
		this.obj._forEachRelation_(this.onRelation, this);
	}),
	destroy: d(function () {
		this.obj.off('update', this.onUpdate);
		delete this.objects;
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
			this.emit('relupdate', event, null);
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
			this.emit('setitemupdate', event, null);
		}
		obj._forEachRelation_(this.onRelation, this);
	}),
}, d.binder({
	onUpdate: d(function (event, last) {
		var obj = (event || last).obj, rel, relId;
		if (obj._type_ === 'relation') {
			if (passTree.call(this, obj)) {
				if (this.ignored[obj._id_]) return;
				if (!this.accepted[obj._id_]) this.onRelation(obj);
				else this.emit('relupdate', event, last);
			}
		} else {
			rel = obj.obj;
			if (passTree.call(this, rel)) {
				relId = rel._id_;
				if (this.ignored[relId]) return;
				if (!this.accepted[relId]) {
					this.onRelation(rel);
					return;
				}
				if (!this.objects[obj._id_]) this.onSetItem(obj);
				else this.emit('setitemupdate', event, last);
			}
		}
	})
}))));
