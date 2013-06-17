'use strict';

var Db        = require('../')
  , serialize = require('../lib/utils/serialize');

module.exports = function (T) {
	var obj = new Db(), event = new T(obj, Db.prototype, 123);

	return {
		toString: function (a) {
			a(String(event), '123.' + obj._id_ + '.7Object#', "toString");
		},
		Unserialize: function (a) {
			var event;
			event = T.unserialize('124.' + obj._id_ + '.' +
				serialize('ra.sd#.#sdfdsz'));
			a.deep(event, {
				obj: obj,
				value: 'ra.sd#.#sdfdsz',
				stamp: 124,
				index: event.index
			}, "Object");

			obj = obj.get('marKo');
			event = T.unserialize('12434.' + obj._id_ + '.' + serialize(undefined));
			a.deep(event, {
				obj: obj,
				value: undefined,
				stamp: 12434,
				index: event.index
			}, "Object->Rel");

			obj = obj._getItem_(serialize('hej"mordo.moja.sdf'));
			event = T.unserialize('34343.' + obj._id_ + '.' + serialize(true));
			a.deep(event, {
				obj: obj,
				value: true,
				stamp: 34343,
				index: event.index
			}, "Object->Rel->Item");

			obj = obj.get('markoWki');
			event = T.unserialize('5555.' + obj._id_ + '.' +
				serialize(function () { return 'raz.dwa"#"'; }));
			a.deep(event, {
				obj: obj,
				value: event.value,
				stamp: 5555,
				index: event.index
			}, "Object->Rel->Item->Rel");

			obj = obj._getItem_(serialize(2342));
			event = T.unserialize('333.' + obj._id_ + '.' +
				serialize(undefined));
			a.deep(event, {
				obj: obj,
				value: undefined,
				stamp: 333,
				index: event.index
			}, "Object->Rel->Item->Rel->Item");

			obj = obj.get('czraa');
			event = T.unserialize('11111.' + obj._id_ + '.' +
				serialize(Db.String));
			a.deep(event, {
				obj: obj,
				value: Db.String,
				stamp: 11111,
				index: event.index
			}, "Object->Rel->Item->Rel->Item->Rel");
		}
	};
};
