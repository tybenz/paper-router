# paper-router

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
var routes = {
    'resources foo': true
    'get /bar/#baz': 'bar#baz'
}

// Sets up routes on the actual server using the routes object
var router = new Router( server, routes, __dirname + '/controllers' );
```

## How it works

Takes in a server, a path to a directory full of controller files,
and a routes object that looks like this:

```javascript
routes = {
    'resources foo': true,
    'get /foo/bar': 'controller#action'
}
```

Either a route will specify a "resource" - controller that maps to CRUD methods
Or it can have an explicit mapping between an arbitrary route and
a controller/action combo

Each controller should be an object with its actions as properties

e.g.
```javascript
var FooController = {
    bar: function( req, res, next ) {
      res.send( { foo: 'bar' } );
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
