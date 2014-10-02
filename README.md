# paper-router

Before:

https://gist.github.com/tybenz/d056013f70f039b61c4b

After:

https://gist.github.com/tybenz/f3ec2b8e0fabd1f78335

# Installation

```shell
npm install paper-router
```

# Usage

```javascript
var Router = require( 'paper-router' ); // returns a class that we can call new on
var restify = require( 'restify' ); // could also be express

var server = server.createServer();

// See notes below on what the routes object should look like
var routes = function( router ) {
    router.resources( 'foo' );
    router.get( '/bar/baz', 'bar#baz' );
    router.resources( 'bananas', { path: 'b' } );
}

// Sets up routes on the actual server using the routes object
var router = new Router( server, __dirname + '/controllers', routes );
```

## How it works

A router takes in a server and a path to a directory full of controller files
and a routes function that can use the appropriate methods to declare routes
e.g.:

```javascript
new Router(
    server,
    __dirname + '/controllers',
    function( router ) {
        router.resources( 'foo' );
        router.get( '/foo/bar', 'controller#action' );
    }
);
```

Route declarations can either specify a "resource" - controller that
maps to CRUD methods, or it can have an explicit mapping between an
arbitrary route and a controller#action combo

Each controller should be an object with its actions as properties:

```javascript
var FooController = {
    index: function( req, res, next ) {
        res.send( 'foo' );
    }
};
```


## Path helpers

The router instance will have path helpers to help compute paths based on
semantic names. This helps to avoid having to hard-code in URLs/paths in your
code (Note: The best way to make these available to all controllers is by making the
router instance a global).

Here's an example:

```javascript
// server.js
var Router = require( 'paper-router' );
var router = new Router(
    server,
    path.join( __dirname, 'controllers' ),
    function( router ) {
        router.resources( 'automobiles', { as: 'cars' } );
    }
);
global.router = router;
```

```javascript
// controllers/autmobiles.js
var AutomobilesController = {
    new: function( req, res, next ) {
        var car = Cars.create( { color: 'red' } );
        res.redirect( router.editCarPath( car ) );
    }
}
```

Here, the global variable router provides methods to build paths based on
primitive types (strings, integers, etc) or based on a JavaScript object
(provided it has a method called `toPath` ). `router.editCarPath( car )` will
map to `/automobiles/:id/edit` where id is the id of the newly created car
model.


## Versioning

If you're building an API with Express or Restify that needs to support
versioning, paper-router can help set up your codebase.

Instead of providing paper-router a path to a directory of controllers, give it
a path to a directory of version folders, each who have their own versions of
the controllers. The version folders must begin with a 'v' and be followed by
an integer (sorry semver freaks).

Example directory structure:

```python
|-- src
|   |-- controllers
|   |   |-- v0
|   |   |   |-- users.js
|   |   |   |-- bananas.js
|   |   |   |-- peels.js
|   |   |-- v1
|   |   |   |-- users.js
|   |   |   |-- bananas.js
|   |   |   |-- peels.js
```

Example of instantiating paper router:

```javascript
var server = require( 'server' );
var PaperRouter = require( 'paper-router' );

var routes = function( router ) {
  router.resources( 'users', '/v0', 'v0' );
  router.resources( 'bananas', '/v0', 'v0' );
  router.resources( 'peels', '/v0', 'v0' );

  router.resources( 'users', '/v1', 'v1' );
  router.resources( 'bananas', '/v1', 'v1' );
  router.resources( 'peels', '/v1', 'v1' );
};

var router = new PaperRouter(
    server,
    __dirname + './controllers', // path to directory of version folders
    routes,
    true // indicates controllerDir contains version folders
);

server.listen( 3000, function() {
    console.log( 'SERVER STARTED!' );
});
```

How or if you handle any shared logic/fallbacks between
versions is up to you.

Here's an example of a v1 `BananasController` which falls back to using the v0
`BananasController` actions if new ones are not defined:

```javascript
var _ = require( 'lodash-node' );
var v0 = require( '../v0/bananas.js' );

var BananasController = _.extend( {}, v0, {
    index: function( req, res, next ) {
        res.send( { message: 'Under construction' } );
    }
});

module.exports = BananasController;
```

The `index` action is the only thing that changed from v0 to v1. Any other actions
that v0 has that v1 does not will be set up correctly if the same routes are
bound for both v0 and v1.

Here the "inheritance" or shared logic is totally up the user. Paper-router
just wires up the routes for you, as long as you tell it where to look.

Note that with this method, I still have to have a controller file in every
version folder. Paper router will not go an find an older controller. The
mirror has to be set up manually for each version.


## buildCallback

This method is meant to be over-written.
It should return a function to be bound to the server's route mechanism
Example: In express routes are done like this:

```javascript
server.get( '/foo/bar', function( req, res ) {
    res.send( 'foobar' );
});
```

So in your controller you can simply take the `function( req, res ) {...}`
part and set it as a property on the controller

Or if you'd like to have your controllers know less about the server and
how to respond, you can have controllers whose actions simply return a value and
wrap them with a more complicated callback see example below:

```javascript
var CustomRouter = Router.extend({
    buidCallback: function ( fn ) {
        return function( req, res, next ) {
            var result = fn();
            res.send( result );
        };
    }
});
```

## Authentication middleware
If you'd like to use some authentication middleware like
[passport](https://github.com/jaredhanson/passport), you can put an `auth`
property on your controllers that need authentication.  The `bindRoute` method
will make sure to bind the right route, necessary auth, and the callback to
whatever express/restify method is specified.

Typical route binding in express/restify looks like this:

```javascript
server.get( '/foo', function( req, res, next ) {
    res.send( 'foo' );
});
```

With passport it might look like this:

```javascript
var authCallback = function() {
    return passport.authenticate( 'basic', { session: false } );
}

server.get( '/foo', authCallback, function( req, res, next ) {
    passport.authenticate( 'basic', { session: false } );
    res.send( 'foo' );
});
```

If there is an auth property set on your controller it will be passed as the
second argument to the routing method. If there isn't one, no auth callback
will be passed and the second argument will be your route callback - business
as usual.
