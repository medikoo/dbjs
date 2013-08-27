'use strict';

var replace     = require('es5-ext/string/#/simple-replace')
  , memoize     = require('memoizee')
  , promisify   = require('deferred').promisify
  , resolve     = require('path').resolve
  , readFile    = promisify(require('fs').readFile)
  , writeFile   = promisify(require('fs').writeFile)
  , getSnapshot = require('../lib/history')._snapshot

  , stringify = JSON.stringify, getTpl;

getTpl = memoize(function () {
	return readFile(resolve(__dirname, 'tagger.tpl'), 'utf8');
});

module.exports = function (filename, tag/*, options*/) {
	var options = Object(arguments[2]);
	tag = stringify('_' + String(tag) + '_');
	return writeFile(resolve(String(filename)), getTpl()(function (tpl) {
		var data = getSnapshot(), done = {}, lines = [];
		if (options.log) tpl = tpl.replace(/\/\/\$LOG\$/g, '');
		tpl = tpl.replace('$TAG$', tag.slice(1, -1));
		tpl = tpl.replace('$TIME$', (new Date()).toISOString());
		lines.push('defineProperty(getObject(\':":order\'), ' + tag + ', value);');
		data.forEach(function (event) {
			var obj = event.obj;
			if (done.hasOwnProperty(obj._id_)) return null;
			done[obj._id_] = true;
			if ((obj._type_ === 'relation') && (obj.obj._type_ === 'relation') &&
					((obj.name === 'ns') || (obj.name === 'required'))) {
				if (!done.hasOwnProperty(obj.obj._id_)) {
					done[obj.obj._id_] = true;
					lines.push('defineProperty(getObject(' + stringify(obj.obj._id_) +
						'), ' + tag + ', value);');
				}
			}
			lines.push('defineProperty(getObject(' + stringify(obj._id_) + '), ' +
				tag + ', value);');
		});
		tpl = tpl.replace('$COUNT$', data.length);
		return replace.call(tpl, '$CONTENT$', lines.join('\n'));
	}));
};
