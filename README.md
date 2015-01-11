# paper-router

- [Installation](#installation)
- [Initializing the router](#initializing-the-router)
- [Why do I need this?](#why-do-i-need-this)
- [Resourceful routing](#resourceful-routing)
- [Path helpers](#path-helpers)
- [Before/After filters](#beforeafter-filters)
- [Versioning](#versioning)

## Installation

```shell
npm install paper-router
```

## Initializing the router

```javascript
var Router = require( 'paper-router' );
var express = require( 'express' );
var routes = require( './routes' );
var path = require( 'path' );

var app = express();

// Sets up routes on the actual app using the routes object
// Paper router just needs the app your attaching routes to, the location of
// your controller files, and the routes callback that was created in routes.js
var router = new Router( app, path.join( __dirname, '/controllers' ), routes );
```

## Why do I need this?

Paper Router is a routing mechanism that helps keep server-side
connect/restify/express apps organized.

It helps to cleanly separate the actual routes from the actions that respond to
them. This gives you the ability to map multiple routes to the same action,
use path helpers to avoid using string literal paths in your codebase, and
apply things like before & after filters to multiple actions within a
controller.

Here's an example controller:

```javascript
var BananasModel = require( './bananas_model' );

var BananasController = module.exports = {
    index: function( req, res, next ) {
        res.send( BananasModel.getAll() );
    },

    show: function( req, res, next ) {
        res.send( BananasModel.findById( req.params.id ) );
    }
};
```

Here's what the route declaration for both of those actions would look:

```javascript
// routes.js
module.exports = function( router ) {
    router.get( '/bananas', 'bananas#index' );
    router.get( '/bananas/:id', bananas#show' );
}
```

Route declarations go in their own file called routes.js. Use the above syntax
to map routes to specific actions. A controller is just a way to group actions
with common interests.

Notice how the controllers and actions don't need to know anything about the
actual url/path. Separating actions from their routes provides much more
flexibility if one or both need to change during the course of development.

## Resourceful routing

There are 7 classic routes associated with resourceful routing in Rails. I
stole the concept and applied it to paper router (Disclaimer: almost all of
these concepts were ripped off from Rails).

So this:

```javascript
module.exports = function( router ) {
    router.resources( 'bananas' );
};
```

Is equivalent to this:

```javascript
module.exports = function( router ) {
    router.post( '/bananas', 'bananas#create' );
    router.get( '/bananas/:id', 'bananas#show' );
    router.put( '/bananas/:id', 'bananas#update' );
    router.delete( '/bananas/:id', 'bananas#destroy' );
    router.get( '/bananas', 'bananas#index' );
    router.get( '/bananas/new', 'bananas#new' );
    router.get( '/bananas/:id/edit', 'bananas#edit' );
};
```

## Path helpers

The router instance will have path helpers to help compute paths based on
semantic names. This helps to avoid having to hard-code in URLs/paths in your
code (Note: The best way to make these available to all controllers is by making the
router instance a global).

Here's an example:

```javascript
var Router = require( 'paper-router' );
var express = require( 'express' );
var path = require( 'path' );

var app = express();

var router = global.router = new Router( app, path.join( __dirname, '/controllers' ), routes );

function routes( router ) {
    router.resources( 'bananas' );
    router.get( '/bananas/:id/peel', 'bananas#peel', { as: 'bananaPeel' } );
};
```

Here, the global variable `router` provides methods to build paths based on
primitive types (strings, integers, etc) or based on a JavaScript object
(provided it has a method called `toPath`). `router.editBananaPath( banana )` will
map to `/bananas/:id/edit` where `:id` is the id of the banana model.

For single route declarations (non-resourceful), an options object has to be
passed in your declaration with the `as` property if you'd like paper router to
set up a router helper for you. It will use the `as` property appended with
`Path` as the helper method name. So, `{ as: 'bananaPeel' }` would create a
path helper that could be called like so: `router.bananaPeelPath( banana )`.

Note: You can also use the `as` property to alter the names of the path helpers
for an entire set of resourceful routes.


## Before/After filters

Sometimes multiple actions within a controller can benefit from sharing some
logic. The best way to do this is with before/after filters.

You can declare a list of actions that the before/after filter should apply to.

In this example, the method `getBanana` is run only before the `create`,
`update`, and `destroy` actions. The method `cleanup` is run after all actions
**except** `create`, `update`, and `destroy`.

```javascript
var BananasModel = require( './bananas_model' );

var BananasController = module.exports = {
    before: [
        { name: 'getBanana', only: [ 'show', 'update', 'destroy' ] }
    ],

    after: [
        { name: 'cleanup', except: [ 'show', 'update', 'destroy' ] }
    ],

    getBanana: function( req, res, next ) {
        req.banana = BananasModel.findById( req.params.id );
        if ( !req.banana ) {
            return next( new Error( 'Banana #' + req.params.id + ' not found' ) );
        }
        next();
    },

    cleanup: function( req, res, next ) {
        req.cleanup();
        next();
    },

    create: function( req, res, next ) {
        res.send( BananasModel.create( req.body ) );
    },

    show: function( req, res, next ) {
        res.send( req.banana );
    },

    update: function( req, res, next ) {
        res.send( req.banana.update( req.body ) );
    },

    destroy: function( req, res, next ) {
        req.banana.destroy();
        res.send( { success: true } );
    },

    index: function( req, res, next ) {
        res.send( BananasModel.getAll() );
    }
};
```

## Versioning

If you're building an API with Express or Restify that needs to support
versioning, paper-router can help set up your codebase.

Instead of providing paper-router a path to a directory of controllers, give it
a path to a directory of version folders, each who have their own versions of
the controllers. The version folders must begin with a 'v' and be followed by
an integer.

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
var _ = require( 'lodash' );
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


