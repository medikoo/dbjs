'use strict';

var FilterSet       = require('./object-filter-set')
  , MapSet          = require('./object-map-set')
  , ObjectList      = require('./object-ordered-list')
  , SetIntersection = require('./set-intersection')
  , SetUnion        = require('./set-union')
  , SetComplement   = require('./set-complement');

module.exports = function (set) {
	FilterSet.defineOn(set);
	MapSet.defineOn(set);
	ObjectList.defineOn(set);
	SetIntersection.defineOn(set);
	SetUnion.defineOn(set);
	SetComplement.defineOn(set);
};
