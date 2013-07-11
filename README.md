# DBJS
## In-Memory Database Engine for JavaScript
### The concept

DBJS is kind of object-relational mapping solution, but done from _other side_, it's different from ORM solutions you may be familiar with, and stating it is ORM is probably wrong.

* In DBJS we define models in JavaScript and in most natural for JavaScript way, using it's types, functions, prototype inheritance etc.
* Same way we work with instances, there's no need for extra handling of `save` or `sync` operations, it's done transparently behind the scenes
* The persistent layer that may be connected to DBJS is transparent to our work, and in normal work we don't need to deal with it directly. Technically persistent layer is low-level graph/key-value data representation, which you may connect to persistent database solution of your choice.
* Schema is defined same way as data objects. Schema can also be mutable and propagate changes during run of application. Technically it's all one, living world.
* You can mix normal JavaScript properties and values with those that are backed by DBJS

***Important: DBJS alredy powers sophisticated projects, but it's still under heavy development. It's API is not yet in stable state and is subject to changes***

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

Mind that while this is the only programmed-in options, you can create your own very custom types, programmatically, with they're constructors and other internal logic.

Within DBJS `Boolean`, `Number`, `String`, `DateTime`, `RegExp` and `Function` types are all primitives expressed with one value (even though in JavaScript some of them object types). Base of type for objects which references individual propertis is `Object`

#### Object type

The object type in DBJS is `Db.Object`, instance of it is set of properties, and each property has both _name_ and value that can be of any defined DBJS type

```javascript
var obj = Db.Object({ foo: 'bar', bar: 34 });

Object.keys(obj); // ['foo', 'bar']
obj._id_;         // '158nineyo28' Unique internal id of an object
```

When we didn't define types for object properties, all of them become of type `Base`, Type `Base` is representation of _undefined_ type and shouldn't be used when defining model. All basic types inherit from `Base`.

```javascript
Object.getPrototypeOf(Db.Boolean); // Db.Base
Object.getPrototypeOf(Db.String); // Db.Base
Object.getPrototypeOf(Db.ShortString); // Db.String
```

We can access meta-data object of a property via prefixing it's name with underscore:

```javascript
obj.foo; // 'bar'
obj._foo; // {}, meta data of an property
```

We can read property's characteristics from it's meta object
```javascript
obj._foo.ns; // Db.Base, namespace
obj._foo._id_; // '158nineyo28:foo', id, each property is an individual object in DBJS
obj._foo._lastModified_ // 1373553256564482,  microtime stamp of last modification
obj._foo.required; // false, id, whether property is required
```

We can override some settings:

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

Let's define some object example namespace. We're gonna create `Patient` and `Doctor` types for simple patient registry system.

Each type provides `rel` function that returns property descriptor, through which we define property of given type:

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

Following descriptor properties have special semantics defined in DBJS internals:

* **required** `boolean` -  Property will be required
* **multiple** `boolean` - Property will be multiple (set of multiple values)
* **reverse** `boolean|string` - Valid only for object types, will expose reverse property on a values, e.g.
In Case of `doctor.patients` and reverse set to `true`, we would be able to access patient's doctor on patient's object, via `patient.doctor` property, we can exact name for a property `reverse: familyDoctor` and then doctor would be accessible on `patient.familyDoctor` property.
* **unique** `boolean` - Whether values should be unique.
* **order** `number` - Order number, used for ordered lists of properties
* **value** _in type of namespace_ - Default value, that will be set on prototype.

All other options that may be provided, are set in direct form on property's meta object and are not used in any way internally by DBJS engine. That way you can define your custom properties and use them later in your custom way.

Let's build some objects for given schema:

```javascript
var drHouse = new Db.Doctor({ firstName: "Gregory", lastName: "House" });

drHouse.firstName; // 'Gregory'
drHouse.lastName; // 'House'
drHouse.patients; // {}, set of patients
drHouse.patients.values; // [], array of patients set values

var john = Db.Patient({ firstName: "John", lastName: "Smith", birthDate: new Date(1977, 0, 3) });

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

There are more type events dedicated for persistent layer, they'll be documented in near future.

#### Dynamic (calculated) properties

With DBJS we can also define dynamic (getter) properties:

Any function value, where length of function signature is `0` is considered and handled as a getter:

```javascript
Db.Doctor.prototype.set('fullName', Db.String.rel({
  value: function () { return this.firstName + " " + this.lastName; }
}));

drHouse.fullName; // "Gregory House"
```

In above case value is recalculated on each access, to improve things, and have valid _change_ events on our dynamic propertu, we can point the triggers that change the value, then value will be recalculated only when triggered _(this is subject to change, in close future triggers will be calculated from function's content and no extra definition of them will be needed)_:

```javascript
Db.Doctor.prototype.set('fullName', Db.String.rel({
  value: function () { return this.firstName + " " + this.lastName; },
  triggers: ['firstName', 'lastName']
}));

drHouse.fullName; // "Gregory House"

drHouse.firstName = "John" // 'change' emitted on both drHouse._firstName and drHouse._fullName
drHouse.fullName; // "John House"
```

#### Inheritance

It's important to understand how DBJS object inheritance is organized. Below diagram shows inheritance tree for some of the objects that we created in above examples:

<img src="http://medyk.org/dbjs-prototypes.png" />

## Tests

	$ npm test
