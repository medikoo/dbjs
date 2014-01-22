'use strict';

var validObject = require('../../valid-dbjs-object')

  , push = Array.prototype.push, keys = Object.keys
  , byStamp = function (a, b) { return a.stamp - b.stamp; }
  , snapshotDescriptor, snapshotItem;

snapshotDescriptor = function (obj, events) {
	var event = obj._lastOwnEvent_;
	if (event) events.push(event);
	if (obj.hasOwnProperty('__descriptors__')) {
		keys(obj.__descriptors__).forEach(function (sKey) {
			snapshotItem(this[sKey], events);
		}, obj.__descriptors__);
	}
};

snapshotItem = function (obj, events) {
	var event = obj._lastOwnEvent_;
	if (event) events.push(event);
};

module.exports = function self(obj) {
	var events, event;
	validObject(obj);
	events = [];
	event = obj._lastOwnEvent_;
	if (event) events.push(event);
	if (obj.hasOwnProperty('__objects__')) {
		keys(obj.__objects__).forEach(function (sKey) {
			push.apply(events, self(this[sKey]));
		}, obj.__objects__);
	}
	if (obj.hasOwnProperty('__descriptors__')) {
		keys(obj.__descriptors__).forEach(function (sKey) {
			snapshotDescriptor(this[sKey], events);
		}, obj.__descriptors__);
	}
	if (obj.hasOwnProperty('__multiples__')) {
		keys(obj.__multiples__).forEach(function (pSKey) {
			keys(this[pSKey]).forEach(function (sKey) {
				snapshotItem(this[sKey], events);
			}, this[pSKey]);
		}, obj.__multiples__);
	}
	return events.sort(byStamp);
};
