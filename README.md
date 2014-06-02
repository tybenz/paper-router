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


## buildCallback

This method is meant to be over-written
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
