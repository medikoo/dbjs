'use strict';

var contains  = require('es5-ext/lib/String/prototype/contains')
  , history   = require('../_internals/signal').history
  , serialize = require('../_internals/serialize');

module.exports = function (obj) {
	var id = obj._id_
	  , value = serialize(contains.call(obj._id_, ':') ? obj._value : obj.ns)
	  , signal = history[id] && history[id][0];

	if (!signal) return ['0', '0', obj._id_, value];
	return [signal._sourceId, String(signal._stamp), obj._id_, value];
};