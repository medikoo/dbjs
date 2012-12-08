'use strict';

var forEachRight = require('es5-ext/lib/Array/prototype/for-each-right')
  , forEach      = require('es5-ext/lib/Object/for-each')
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
				serialize(signal[objId])]);
		});
	}, null, function (a, b) {
		return this[b]._stamp - this[a]._stamp;
	});

	return data.reverse();
};

exports.code = function () {
	return '\'use strict\';\n\n' +
		'var import = require(\'dbjs/lib/_internals/signal-import\');\n\n' +
		exports().map(function (data) {
			return 'import(' + stringify(data[0]) + ', ' + data[1] + ', ' +
				stringify(data[2]) + ', ' + stringify(data[3]) + ');';
		}).join('\n') + '\n';
};
