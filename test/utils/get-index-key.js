'use strict';

var Db        = require('../../')
  , serialize = require('../../lib/utils/serialize');

module.exports = function (t, a) {
	a(t(), null, "Undefined");
	a(t(null), null, "Null");
	a(t(function () {}), null, "Function");
	a(t({}), null, "Unknown object");
	a(t(Db), serialize(Db), "Namespace");
	a(t('razdwa'), serialize('razdwa'), "Primitive");
};
