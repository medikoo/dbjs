# dbjs
## In-Memory Database Engine for JavaScript

### Concept

_dbjs_ is database of events, each atomic update is represented as an event which is added on top of log.

In contrary to popular CRUD model, each creation, update and deletion is just another atomic event that occurs and affects state of things.

Please see great [presentation by Greg Young](http://www.infoq.com/presentations/Events-Are-Not-Just-for-Notifications), which while unrelated to this project, describes well one of the main ideas behind _dbjs_.

***Important: dbjs already powers sophisticated projects, but it's still under heavy development. It's API is not yet in stable state and is subject to changes***

_If you need help with dbjs, please don't hesitate to ask on dedicated mailing list: [dbjs-engine@googlegroups.com](https://groups.google.com/forum/#!forum/dbjs-engine)_

### Installation
#### NPM

In your project path:

	$ npm install medikoo/dbjs

##### Browser

You can easily bundle NPM packages for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

### Introduction

#### Data modeling

In common application we define models in database engine that persists our data, and then we try to resemble that model (in manual or more less automatic way) in a language that we program our application. We connect both worlds and work like that.

In _dbjs_ we define models directly in JavaScript, using most of things that language has to offer, its types, functions, prototypal inheritance etc. and we work with it natural way. On the other side _dbjs_ provides all means to observe the changes in reasonable manner. Persistent layer can be easily connected to low-end point which expresses data with graph/key-value representations, that remains transparent to our work.

Let's start step by step, by writing example model setup:

```javascript
var Database = require('dbjs');
var db = new Database();
```

`db` is our database, it exposes basic types, that correspond directly to JavaScript types

##### Basic types

* `db.Boolean`
* `db.Number`
* `db.String`
* `db.DateTime`
* `db.RegExp`
* `db.Function`
* `db.Object`

Types are actually constructors that work in similar way as native JavaScript constructors:
```javascript
db.Number('343'); // 343
db.String(343); // '343'
db.Boolean('foo'); // true
```
but they're more strict:

```javascript
db.Number('foo'); // TypeError: foo is invalid Number
```

Any type can be extended into other:

```javascript
db.String.extend('ShortString', { max: { value: 5 } });
```

Type name must be upper-case and follow camelCase convention, also name must be unique.
After type is created it can be accessed directly on Database object:

```javascript
db.ShortString('foo'); // 'foo'
```

When deriving from String type, we can define additional characteristics via options:
* `min`: Minimum length
* `max`: Maximum length
* `pattern`: RegExp pattern

We set `ShortString` type to handle strings that are no longer than 3 characters
```javascript
db.ShortString('foobar'); // TypeError: foobar is too long
```

Similar options can be provided when extending `Number` type (`min`, `max` and `step`) or 
`DateTime` type (`min`, `max` and `step`).

Mind that, while this is the only programmed-in options, you still can create your very own custom types programmatically, by creating custom constructors and providing other logic.

Within dbjs following types: `Boolean`, `Number`, `String`, `DateTime`, `RegExp` and `Function` are all considered as primitive and are expressed with one end value (even though in JavaScript language some of them are expressed with objects).

##### Object type

Base type for object types is `Db.Object`, Instance of `Db.Object` is (as in plain JavaScript) a plain object (a set of properties). Each property can have value that can be of any defined dbjs type

```javascript
var obj = db.Object({ foo: 'bar', bar: 34 });

Object.keys(obj); // ['foo', 'bar']
obj.__id__;         // '158nineyo28' Unique internal id of an object
```

When type for property is not defined, then property is of `Db.Base` type. `Base` is representation of _undefined_ type and shouldn't be used when defining model. Note: all basic types inherit from `Base`.

```javascript
Object.getPrototypeOf(db.Boolean);     // db.Base
Object.getPrototypeOf(db.String);      // db.Base
Object.getPrototypeOf(db.ShortString); // db.String
```

We can access descriptor object of a property via following means:
- `obj.getDescriptor(propertyName)`: Returns descriptor of a property on definition or value level, that means that if e.g. we do `user.getDescriptor('firstName')`, it's possible we will receive an object for `User.prototype.firstName` property. This variant should be used when we want to just _read_ the characterictics.
- `obj.getOwnDescriptor(propertyName))`: Returns descriptor of a property on context object level, so for `user.getDescriptor('firstName')`, we will receive a descriptor for `user.firstName`. This variant should be used when we want to alter property characteristics.
- `obj.${propertyName}`: (deprecated) - an alias for `obj.getDescriptor('propertyName')`

```javascript
obj.foo; // 'bar'
obj.getDescriptor('foo'); // {}, descriptor of a property
```

We can read property's characteristics from its descriptor object

```javascript
var fooDesc = obj.getDescriptor('foo');
fooDesc.type;        // db.Base, type of property
fooDesc.__id__;      // '158nineyo28/$foo', id of a desciptor object
fooDesc.__valueId__; // '158nineyo28/foo', id of a value that object describes
fooDesc.lastModified // 1373553256564482,  microtime stamp of last modification
fooDesc.required;    // false, whether property is required
```

We can override property characteristics:

```javascript
var barDesc = obj.getOwnDescriptor('bar');
barDesc.type = db.String;
obj.bar; // '34'
barDesc.type = db.Number;
obj.bar; // 34
barDesc.type = db.Boolean;
obj.bar; // true

barDesc.required = true;
obj.bar = null; // TypeError: Property is required
barDesc.required = false;
obj.bar = null; // Ok
```

##### Defining object model

Let's define some custom object types.

We're going to create `Patient` and `Doctor` types for simple patient registry system:

Each dbjs type provides `rel` function, which generates property descriptor, through which we can define custom property of given type:

```javascript
db.Object.extend('Patient', {
  firstName: { type: db.String, required: true }, 
  lastName: { type: db.String, required: true },
  birthDate: { type: db.DateTime, required: true }
});

db.Object.extend('Doctor', {
  firstName: { type: db.String, required: true },
  lastName: { type: db.String, required: true },
  patients: { type: db.Patient, multiple: true, reverse: 'doctor', unique: true }
});
```

Following descriptor properties, have special semantics defined in dbjs internals:

* **required** `boolean` -  Property will be required
* **multiple** `boolean` - Property will be multiple (set of multiple values)
* **reverse** `any` - Valid only for object types, will expose reverse property on a values, e.g.
In Case of `doctor.patients` and reverse set to `doctor`, we would be able to access patient's doctor on patient's object, via `patient.doctor` property.
* **unique** `boolean` - Whether values should be unique.
* **order** `number` - Order number, used in ordered lists of properties
* **value** - Default value, that will be set on prototype.

Any other option which may be provided will be set in it's direct form on meta-data object and it will not be used in  internally by dbjs engine. That way you can define your custom meta properties and use them later in your custom way.

Let's build some objects for given schema:

```javascript
var drHouse = new db.Doctor({ firstName: "Gregory", lastName: "House" });

drHouse.firstName; // 'Gregory'
drHouse.lastName; // 'House'
drHouse.patients; // {}, set of patients

var john = new db.Patient({ firstName: "John", lastName: "Smith", birthDate: new Date(1977, 0, 3) });

john.firstName; // 'John';
john.doctor; // null, we access reverse doctor value out of doctor.patients property.
```

Let's assign patient to our doctor:

```javascript
drHouse.patients.add(john);
drHouse.patients.has(john); // true
drHouse.patients // { john }

john.doctor; // drHouse
```

#### Events

dbjs is highly evented, and provides observer functionalities for each object and property

```javascript
var johnLastNameObservable = john._lastName;
john.lastName = 'House'; // 'change' emitted on johnLastNameObservable
drHouse.patients.delete(john); // 'delete' emitted on drHouse.patients
drHouse.patients.add(john); // 'add' emitted on drHouse.patients
```

There are more event types dedicated for persistent layer, they'll be documented in near future.

#### Computed properties

With dbjs we can also define computed (getter) properties:

Any function value, where length of function signature is `0` is considered and handled as a getter:

```javascript
db.Doctor.prototype.define('fullName', {
	type: db.String,
	value: function () { return this.firstName + " " + this.lastName; }
});

drHouse.fullName; // "Gregory House"
```

In above case value is recalculated on each access. However whenever we decide to listen for changes on `drHouse` object or on its `fullName` observer, value will be automatically recalculated whenever `firstName` or `lastName` of `drHouse` changes:

```javascript

drHouse._fullName.on('change', function () { ... });

drHouse.firstName = "John" // fullName recalculated and 'change' emitted
drHouse.fullName; // "John House"
```

### Binding with persistent layer

See [Engine agnostic example of persistent layer binding](https://gist.github.com/medikoo/e11a8ce61303a996feab)

#### [dbjs-ext](https://github.com/medikoo/dbjs-ext) Other types (extensions)

dbjs on its own provides just basic types (which correspond to native JavaScript types), you can extend them into more custom on your own, but there's also dedicated [dbjs-EXT](https://github.com/medikoo/dbjs-ext) project which defines all other common types that you may be after.

#### [dbjs-dom](https://github.com/medikoo/dbjs-dom) DOM bindings

dbjs-DOM is dedicated project which provides two-way DOM bindings for any dbjs objects (each type is handled in dedicated way). If you build website with dbjs models, it will definitely you a lot of time.

## Tests

	$ npm test
