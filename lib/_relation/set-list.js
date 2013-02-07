'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , memoize     = require('memoizee/lib/regular')
  , listMethod  = require('../_proto/object-ordered-list').listMethod
  , relation    = require('./')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties;

defineProperties(relation, {
	list: d(function (compareFn) {
		this._assertSet_();
		if (!this.hasOwnProperty('_list_')) {
			defineProperty(this, '_list_', d(memoize(listMethod)));
		}
		return this._list_(compareFn);
	})
});
