# DBJS
## In-Memory Database Engine for JavaScript
### Concept

In common application we define models in Database engine that persists our data, and then we try to resemble that in manual or more less automatic way with models written in language that we use, we connect both worlds and work like that.

With DBJS we define models directly and just in a language, using all things that JavaScript has to offer, its types, functions, prototypal inheritance etc. and we work with it natural way. DBJS on the other side provides all means to observe the changes in reasonable manner. Persistent layer can be easily connected to end point which expresses data with low-level graph/key-value representation, and that remains transparent to our work.

***Important: DBJS already powers sophisticated projects, but it's still under heavy development. It's API is not yet in stable state and is subject to changes***

### Installation
#### NPM

In your project path:

	$ npm install medikoo/dbjs

##### Browser

You can easily bundle NPM packages for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

### Introduction

Let's start step by step, by writing example model setup:

```javascript
var Db = require('dbjs');
```

`Db` is our database, it exposes basic types, that correspond directly to JavaScript types

#### Basic types

* `Db.Boolean`
* `Db.Number`
* `Db.String`
* `Db.DateTime`
* `Db.RegExp`
* `Db.Function`
* `Db.Object`

Types are actually constructors that work in similar way as native JavaScript constructors:
```javascript
Db.Number('343'); // 343
Db.String(343); // '343'
Db.Boolean('foo'); // true
```
but they're more strict:

```javascript
Db.Number('foo'); // TypeError: foo is invalid Number
```

Any type can be extended into other:

```javascript
Db.String.create('ShortString', { max: 5 });
```

Type name must be upper-case and follow camelCase convention, also name must be unique.
After type is created it can be accessed directly on Database object:

```javascript
Db.ShortString('foo'); // 'foo'
```

When deriving from String type, we can define additional characteristics via options:
* `min`: Minimum length
* `max`: Maximum length
* `pattern`: RegExp pattern

We set `ShortString` type to handle strings that are no longer than 3 characters
```javascript
Db.ShortString('foobar'); // TypeError: foobar is too long
```

Similar options can be provided when extending `Number` type (`min`, `max` and `step`) or 
`DateTime` type (`min` and `max`).

Mind that, while this is the only programmed-in options, you still can create your very own custom types programmatically, by creating custom constructors and providing other logic.

Within DBJS following types: `Boolean`, `Number`, `String`, `DateTime`, `RegExp` and `Function` are all considered as primitive and are expressed with one end value (even though in JavaScript language some of them are expressed with objects).

#### Object type

Base type for object types is `Db.Object`, Instance of `Db.Object` is (as in plain JavaScript) a plain object (a set of properties). Each property can have value that can be of any defined DBJS type

```javascript
var obj = Db.Object({ foo: 'bar', bar: 34 });

Object.keys(obj); // ['foo', 'bar']
obj._id_;         // '158nineyo28' Unique internal id of an object
```

When type for property is not defined, then property is of `Db.Base` type. `Base` is representation of _undefined_ type and shouldn't be used when defining model. Note: all basic types inherit from `Base`.

```javascript
Object.getPrototypeOf(Db.Boolean); // Db.Base
Object.getPrototypeOf(Db.String); // Db.Base
Object.getPrototypeOf(Db.ShortString); // Db.String
```

We can access meta-data object of a property via it's name prefixed with underscore:

```javascript
obj.foo; // 'bar'
obj._foo; // {}, meta data of an property
```

We can read property's characteristics from it's meta object
```javascript
obj._foo.ns; // Db.Base, namespace
obj._foo._id_; // '158nineyo28:foo', id, each property is an individual object in DBJS
obj._foo._lastModified_ // 1373553256564482,  microtime stamp of last modification
obj._foo.required; // false, whether property is required
```

We can override property characteristics:

```javascript
obj._bar.ns = Db.String;
obj.bar; // '34'
obj._bar.ns = Db.Number;
obj.bar; // 34
obj._bar.ns = Db.Boolean;
obj.bar; // true

obj._bar.required = true;
obj.bar = null; // TypeError: Property is required
obj._bar.required = false;
obj.bar = null; // Ok
```

#### Defining object model

Let's define some custom object types.

We're going to create `Patient` and `Doctor` types for simple patient registry system:

Each DBJS type provides `rel` function, which generates property descriptor, through which we can define custom property of given type:

```javascript
Db.Object.create('Patient', {
  firstName: Db.String.rel({ required: true }), 
  lastName: Db.String.rel({ required: true }),
  birthDate: Db.DateTime.rel({ required: true })
});

Db.Object.create('Doctor', {
  firstName: Db.String.rel({ required: true }),
  lastName: Db.String.rel({ required: true }),
  patients: Db.Patient.rel({ multiple: true, reverse: true, unique: true })
});
```

Following descriptor properties, have special semantics defined in DBJS internals:

* **required** `boolean` -  Property will be required
* **multiple** `boolean` - Property will be multiple (set of multiple values)
* **reverse** `boolean|string` - Valid only for object types, will expose reverse property on a values, e.g.
In Case of `doctor.patients` and reverse set to `true`, we would be able to access patient's doctor on patient's object, via `patient.doctor` property. We can decide on exact name for a property e.g. `reverse: familyDoctor` and then doctor would be accessible on `patient.familyDoctor` property.
* **unique** `boolean` - Whether values should be unique.
* **order** `number` - Order number, used in ordered lists of properties
* **value** _in type of namespace_ - Default value, that will be set on prototype.

Any other option which may be provided will be set in it's direct form on meta-data object and it will not be used in  internally by DBJS engine. That way you can define your custom meta properties and use them later in your custom way.

Let's build some objects for given schema:

```javascript
var drHouse = new Db.Doctor({ firstName: "Gregory", lastName: "House" });

drHouse.firstName; // 'Gregory'
drHouse.lastName; // 'House'
drHouse.patients; // {}, set of patients
drHouse.patients.values; // [], array of patients set values

var john = new Db.Patient({ firstName: "John", lastName: "Smith", birthDate: new Date(1977, 0, 3) });

john.firstName; // 'John';
john.doctor; // null, we access reverse doctor value out of doctor.patients property.
```

Let's assign patient to our doctor:

```javascript
drHouse.patients.add(john);
drHouse.patients.has(john); // true
drHouse.patients.values; // [john]

john.doctor; // drHouse
```

Each multiple set item has also own meta object:
```javascript
var johnItem = drHouse.patients.getItem(john); // {}, meta object;
johnItem.value; // true, as it's present in set, it'll be false if it would be removed
johnItem.subject; // john
```

#### Events

DBJS is highly evented.

```javascript
john.lastName = 'House'; // 'change' emitted on john._lastName
drHouse.patients.delete(john); // 'delete' emitted on drHouse.patients, and 'change' emitted on johnItem
drHouse.patients.add(john); // 'add' emitted on drHouse.patients, and 'change' emitted on johnItem
```

There are more event types dedicated for persistent layer, they'll be documented in near future.

#### Dynamic (calculated) properties

With DBJS we can also define dynamic (getter) properties:

Any function value, where length of function signature is `0` is considered and handled as a getter:

```javascript
Db.Doctor.prototype.set('fullName', Db.String.rel({
  value: function () { return this.firstName + " " + this.lastName; }
}));

drHouse.fullName; // "Gregory House"
```

In above case value is recalculated on each access. However we can optimize it and additionally have valid _change_ events on our dynamic property. To achieve that we need to point the triggers that change the value. After that, value will be recalculated immediatelly when one of its triggers have changed, and already calculated value will be provided on access.

```javascript
Db.Doctor.prototype.set('fullName', Db.String.rel({
  value: function () { return this.firstName + " " + this.lastName; },
  triggers: ['firstName', 'lastName']
}));

drHouse.fullName; // "Gregory House"

drHouse.firstName = "John" // 'change' emitted on both drHouse._firstName and drHouse._fullName
drHouse.fullName; // "John House"
```

_In close feature, need of listing triggers will not be needed, they'll be read out of function body automatically._

#### Inheritance

It's important to understand how DBJS object inheritance is organized. Below diagram shows inheritance tree for some of the objects that we created in above examples:

<img src="http://medyk.org/dbjs-prototypes.png" />

#### [DBJS-EXT](https://github.com/medikoo/dbjs-ext) Other types (extensions)

DBJS on its own provides just basic types (which correspond to native JavaScript types), you can extend them into more custom on your own, but there's also dedicated [DBJS-EXT](https://github.com/medikoo/dbjs-ext) project which defines all other common types that you may be after.

#### [DBJS-DOM](https://github.com/medikoo/dbjs-dom) DOM bindings

DBJS-DOM is dedicated project which provides two-way DOM bindings for any DBJS objects (each type is handled in dedicated way). If you build website with DBJS models, it will definitely you a lot of time.

## Tests

	$ npm test
