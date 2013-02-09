'use strict';

var compact     = require('es5-ext/lib/Array/prototype/compact')
  , replace     = require('es5-ext/lib/String/prototype/simple-replace')
  , memoize     = require('memoizee')
  , promisify   = require('deferred').promisify
  , resolve     = require('path').resolve
  , readFile    = promisify(require('fs').readFile)
  , writeFile   = promisify(require('fs').writeFile)
  , getSnapshot = require('../lib/history')._snapshot

  , metaNames = { $construct: true, validateConstruction: true, toString: true }
  , stringify = JSON.stringify, getTpl;

getTpl = memoize(function () {
	return readFile(resolve(__dirname, 'tagger.tpl'), 'utf8');
});

module.exports = function (filename, tag/*, options*/) {
	var options = Object(arguments[2]);
	tag = String(tag);
	return writeFile(resolve(String(filename)), getTpl()(function (tpl) {
		var data = getSnapshot(), done = {};
		if (options.log) tpl = tpl.replace(/\/\/\$LOG\$/g, '');
		tpl = tpl.replace('$TAG$', stringify(tag).slice(1, -1));
		tpl = tpl.replace('$TIME$', (new Date()).toISOString());
		data = compact.call(data.map(function (event) {
			var obj = event.obj;
			if (obj._type_ !== 'relation') return null;
			while (obj.obj && (obj.obj._type_ === 'relation')) obj = obj.obj;
			if (obj.obj._type_ !== 'prototype') return null;
			if (obj.obj.ns._childType_ !== 'object') return null;
			if (metaNames.hasOwnProperty(obj.name)) return null;
			if (done.hasOwnProperty(obj._id_)) return null;
			done[obj._id_] = true;
			return 'getObject(' + stringify(obj._id_) + ').tags.add(' +
				stringify(tag) + ');';
		}));
		tpl = tpl.replace('$COUNT$', data.length);
		return replace.call(tpl, '$CONTENT$', data.join('\n'));
	}));
};
