'use strict';

module.exports = function (/*separator*/) {
	var data = [], sep = arguments[0]
	  , desc = this.object && this.object.getDescriptor(this.__pSKey__ || this.__sKey__)
	  , db = this.object && this.object.database
	  , toString;
	if (sep === undefined) sep = ", ";
	if (!desc || (desc.type === db.Base) || db.isObjectType(desc.type)) toString = String;
	else toString = function (value) { return (new desc.type(value)).toString(desc); };
	this.forEach(function (value) { data.push(toString(value)); });
	return data.join(sep);
};
