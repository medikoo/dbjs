'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , ee     = require('event-emitter/lib/core')

  , metaApproved = { multiple: true, ns: true, required: true, tags: true,
		unique: true }

  , ObjFragment, passTree;

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

module.exports = ObjFragment = function (obj, approveRelation) {
	this.objects = {};
	this.ignored = {};
	this.accepted = {};
	this.refCount = 1;
	this.approveRelation = approveRelation;
	this.onUpdate = this.onUpdate.bind(this);
	this.obj = obj;
};

ee(extend(ObjFragment.prototype, {
	init: function () {
		this.obj.on('update', this.onUpdate);
		this.obj._forEachRelation_(this.onRelation, this);
	},
	destroy: function () {
		this.obj.off('update', this.onUpdate);
		delete this.objects;
	},
	onRelation: function (obj) {
		var event, id = obj._id_;
		if (!metaApproved.hasOwnProperty(obj.name) && !this.approveRelation(obj)) {
			this.ignored[id] = true;
			return;
		}
		this.accepted[id] = true;
		if ((event = obj._lastEvent_)) {
			this.objects[id] = obj;
			this.emit('relupdate', event, this);
		}
		obj._forEachItem_(this.onSetItem, this);
		obj._forEachRelation_(this.onRelation, this);
	},
	onSetItem: function (obj) {
		var event;
		if ((event = obj._lastEvent_)) {
			this.objects[obj._id_] = obj;
			this.emit('setitemupdate', event, this);
		}
		obj._forEachRelation_(this.onRelation, this);
	},
	onUpdate: function (event) {
		var obj = event.obj, rel, relId;
		if (obj._type_ === 'relation') {
			if (passTree(obj)) {
				if (this.ignored[obj._id_]) return;
				if (!this.accepted[obj._id_]) this.onRelation(obj);
				else this.emit('relupdate', event, this);
			}
		} else {
			rel = obj.obj;
			if (passTree(rel)) {
				relId = rel._id_;
				if (this.ignored[relId]) return;
				if (!this.accepted[relId]) {
					this.onRelation(rel);
					return;
				}
				if (!this.objects[obj._id_]) this.onSetItem(obj);
				else this.emit('setitemupdate', event, this);
			}
		}
	}
}));
