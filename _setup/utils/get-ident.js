'use strict';

var stringify = JSON.stringify

  , isValidIdent = RegExp.prototype.test.bind(
	/^[\t\v !%-\)\+,\-0-\[\]\^`-\u2027-\u2030-\uffff]+$/
)
  , isIdent;

isIdent = function (key) {
	if (typeof key !== 'string') return false;
	return isValidIdent(key);
};

module.exports = function (key, sKey) {
	if (key === undefined) return '';
	return isIdent(key) ? key : stringify(sKey);
};
