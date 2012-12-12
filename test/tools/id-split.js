'use strict';

module.exports = function (t, a) {
	a.deep(t('3ra89s'), ['3ra89s'], "Object");
	a.deep(t('String'), ['String'], "Namespace");
	a.deep(t('namedObject'), ['namedObject'], "Named object");
	a.deep(t('Date#'), ['Date#'], "Prototype");
	a.deep(t(''), [''], "Relation prototype");
	a.deep(t('"'), ['"'], "Set item prototype");
	a.deep(t('3asdf:raz'), ['3asdf', 'raz'], "Relation");
	a.deep(t('3asdf:raz:dwa'), ['3asdf', 'raz', 'dwa'], "Relation relation");
	a.deep(t('String:raz:dwa'), ['String', 'raz', 'dwa'], "Namespace relation");
	a.deep(t('String:raz:3ra\\"z:d\\\\wa"'), ['String', 'raz', '3ra\\"z:d\\\\wa'],
		"Set item");
	a.deep(t('String:raz:3ra\\"z:d\\\\wa":morda'),
		['String', 'raz', '3ra\\"z:d\\\\wa', 'morda'],
		"Set item relation");
	a.deep(t('String:raz:3ra\\"z:d\\\\wa":morda:3n:dnd\\\\raz"'),
		['String', 'raz', '3ra\\"z:d\\\\wa', 'morda', '3n:dnd\\\\raz'],
		"Set item of relation of set item relation");
};
