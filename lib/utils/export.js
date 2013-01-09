'use strict';

var forEachRight = require('es5-ext/lib/Array/prototype/for-each-right')
  , forEach      = require('es5-ext/lib/Object/for-each')
  , contains     = require('es5-ext/lib/String/prototype/contains')
  , signals      = require('../signal')
  , serialize    = require('./serialize')

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

exports.code = function (/*options*/) {
	var str, count = 0, options = Object(arguments[0]), importId;
	importId = options.importId ? stringify(options.importId) : '"schema"';
	str = '\'use strict\';\n\n' +
		'module.exports = require(\'dbjs\');\n' +
		'var dbImport = require(\'dbjs/lib/_internals/signal-import\');\n' +
		(options.log ? 'var now = Date.now, time = now();\n\n' : '\n') +
		exports().map(function (data) {
			++count;
			return 'dbImport(' + stringify(data[0]) + ', ' + data[1] + ', ' +
				stringify(data[2]) + ', ' + stringify(data[3]) + ', ' + importId +
				');';
		}).join('\n') + '\n';
	if (options.log) {
		str += '\nconsole.log("Schema restore: ' + count +
			' objects in " + ((now() - time) / 1000).toFixed(3) + "s");\n';
	}
	return str;
};
