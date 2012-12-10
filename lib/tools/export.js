'use strict';

var forEachRight = require('es5-ext/lib/Array/prototype/for-each-right')
  , forEach      = require('es5-ext/lib/Object/for-each')
  , contains     = require('es5-ext/lib/String/prototype/contains')
  , serialize    = require('../_internals/serialize')
  , signals      = require('../_internals/signal')

  , stringify = JSON.stringify;

module.exports = exports = function () {
	var done = {}, data = [];
	forEach(signals, function (signal, signalId) {
		forEachRight.call(signal._order, function (objId) {
			if (done[objId]) return;
			done[objId] = true;
			data.push([signal._sourceId, signal._stamp, objId,
				contains.call(objId, ':') ? serialize(signal[objId]) :
				signal[objId]._id_]);
		});
	}, null, function (a, b) {
		return this[b]._stamp - this[a]._stamp;
	});

	return data.reverse();
};

exports.code = function () {
	return '\'use strict\';\n\n' +
		'var dbImport = require(\'dbjs/lib/_internals/signal-import\');\n\n' +
		exports().map(function (data) {
			return 'dbImport(' + stringify(data[0]) + ', ' + data[1] + ', ' +
				stringify(data[2]) + ', ' + stringify(data[3]) + ');';
		}).join('\n') + '\n';
};
