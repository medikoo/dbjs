'use strict';

module.exports = function (id) {
	var iS = id.indexOf('\\'), iQ = id.indexOf('"'), pos;
	while ((iS > -1) && (iS < iQ)) {
		pos = iS + 2;
		iS = id.indexOf('\\', pos);
		if (iQ < pos) iQ = id.indexOf('"', pos);
	}
	return iQ;
};
