'use strict';

var extend           = require('es5-ext/lib/Object/extend')
  , getObject        = require('./objects')._get
  , serialize        = require('./utils/serialize')
  , unserialize      = require('./utils/unserialize')
  , getValueEndIndex = require('./utils/get-value-end-index')

  , count = 0

  , Event;

Event = module.exports = function (obj, value, stamp) {
	this.obj = obj;
	this.value = value;
	this.stamp = stamp;
	this.index = ++count;
};

extend(Event.prototype, {
	sourceId: '0',
	toString: function () {
		return this.stamp + '.' + this.obj._id_ + '.' + serialize(this.value);
	}
});

Event.unserialize = function (str, sourceId) {
	var data, stamp, id, value, dotIndex, itemIdIndex, index, event;

	data = str.split('.');
	stamp = Number(data[0]);

	if (data.length === 3) {
		id = data[1];
		value = data[2];
	} else {
		str = str.slice(data[0].length + 1);
		dotIndex = str.indexOf('.', index = 0);
		itemIdIndex = str.search(/:\d/, index);
		while ((itemIdIndex !== -1) && (itemIdIndex < dotIndex)) {
			// SetItem property
			index = getValueEndIndex(str.slice(index)) + index + 1;
			dotIndex = str.indexOf('.', index);
			itemIdIndex = str.slice(index).search(/:\d/);
			if (itemIdIndex !== -1) itemIdIndex += index;
		}
		id = str.slice(0, dotIndex);
		value = str.slice(dotIndex + 1);
	}

	value = unserialize(value);
	event = new Event(getObject(id), value, stamp);
	if (sourceId) event.sourceId = sourceId;
	return event;
};
