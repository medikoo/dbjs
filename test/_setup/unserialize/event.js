'use strict';

var Database  = require('../../../')
  , serialize = require('../../../_setup/utils/serialize');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), stamp = '123123123131'
	  , value, subObj;

	value = '3afaasdf';
	a.deep(t([stamp, obj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: obj.__id__,
		value: value
	}, "#1");

	subObj = obj._getObject_(serialize('miszka'))
		._getMultipleItem_(serialize('elleo'), 'wiadro', serialize('wiadro'));
	value = '11';
	a.deep(t([stamp, subObj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: subObj.__id__,
		value: value
	}, "#2");

	subObj = obj._getObject_(serialize('matoł". .. \n\n\n""""\'raz""dwa\n\r\r'))
		._getMultipleItem_(serialize('ell" ""\n\':eo'), 'wia\n ::""..dro.',
			serialize('wia\n ::""..dro.'));
	value = '11';
	a.deep(t([stamp, subObj.__id__, value].join('.')), {
		stamp: Number(stamp),
		id: subObj.__id__,
		value: value
	}, "#3");
};
