'use strict';

var replace     = require('es5-ext/lib/String/prototype/simple-replace')
  , memoize     = require('memoizee')
  , promisify   = require('deferred').promisify
  , resolve     = require('path').resolve
  , readFile    = promisify(require('fs').readFile)
  , writeFile   = promisify(require('fs').writeFile)
  , getSnapshot = require('../lib/history')._snapshot
  , codify      = require('../lib/utils/codify')

  , stringify = JSON.stringify, getTpl;

getTpl = memoize(function () {
	return readFile(resolve(__dirname, 'export.tpl'), 'utf8');
});

module.exports = function (filename/*, options*/) {
	var options = Object(arguments[1]);
	return writeFile(resolve(String(filename)), getTpl()(function (tpl) {
		var data;
		if (options.log) tpl = tpl.replace(/\/\/\$LOG\$/g, '');
		data = getSnapshot();
		tpl = tpl.replace('$TIME$', (new Date()).toISOString());
		tpl = tpl.replace('$COUNT$', data.length);
		return replace.call(tpl, '$IMPORT$', data.map(function (event) {
			return 'getObject(' + stringify(event.obj._id_) + ').$$setValue(' +
				codify(event.value) + ');';
		}).join('\n'));
	}));
};
