'use strict';

var Database     = require('../../../')
  , serializeKey = require('../../../_setup/serialize/key')
  , serialize    = require('../../../_setup/serialize/value');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), stamp = '123123123131'
	  , value, subObj;

	value = '3afaasdf';
	a.deep(t([stamp, obj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: obj.__id__,
		value: value
	}, "#1");

	subObj = obj._getObject_('miszka')
		._getMultipleItem_('elleo', 'wiadro', serialize('wiadro'));
	value = '11';
	a.deep(t([stamp, subObj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: subObj.__id__,
		value: value
	}, "#2");

	subObj = obj._getObject_(
		serializeKey('matoł". .. \n\n\n""""\'raz""dwa\n\r\r')
	)._getMultipleItem_(serializeKey('ell" ""\n\':eo'), 'wia\n ::""..dro.',
		serialize('wia\n ::""..dro.'));
	value = '11';
	a.deep(t([stamp, subObj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: subObj.__id__,
		value: value
	}, "#3");
};
