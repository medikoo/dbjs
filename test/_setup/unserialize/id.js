'use strict';

module.exports = function (t, a) {

	a.deep(t('ObjNewreateTest1'), ['ObjNewreateTest1'], "Type");
	a.deep(t('ObjNewreateTest1#'), ['ObjNewreateTest1#'], "Prototype");
	a.deep(t('objNewreateTest'), ['objNewreateTest'], "Named object");
	a.deep(t('0sdfw230'), ['0sdfw230'], "Object");

	a.deep(t('objNewreateTest42/elok'), ['objNewreateTest42', '/', 'elok'],
		"Plain Property");
	a.deep(t('objNewreateTest499/3"kdkd\\nre"'),
		['objNewreateTest499', '/', '3"kdkd\\nre"'], "Serialized property");

	a.deep(t('objNewreateTest222/miszka/elka'),
		['objNewreateTest222', '/', 'miszka', '/', 'elka'],
		"Deep nested");

	a.deep(t('objNewreateTest787$/mafa'),
		['objNewreateTest787', '$', '', '/', 'mafa'], "Descriptor prototype");
	a.deep(t('objNewreateTest6/makara*mafa'),
		['objNewreateTest6', '/', 'makara', '*', 'mafa'],
		"Items");
	a.deep(t('objsdfeks/24343*2"898.34"'),
		['objsdfeks', '/', '24343', '*', '2"898.34"'],
		"Serialized items");
};
