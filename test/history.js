'use strict';

var Db = require('../');

module.exports = function (t, a) {
	var obj = Db(), objHistory = t[obj._id_];
	a(objHistory.length, 1, "Length");
	a.deep(objHistory[0], { stamp: objHistory[0].stamp, obj: obj,
		value: Db.prototype, sourceId: '0' }, "Event");
};
