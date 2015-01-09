var util = require( 'util' );

exports.regularRoutesAndControllers = function( test ) {
    test.expect( 21 );
    var restify = require( 'restify' );

    var client = restify.createJsonClient({
        url: 'http://localhost:8888',
        version: '0.0.0'
    });

    var Router = require( '../' );
    var router = new Router( this.server, __dirname + '/controllers', function( router ) {
        router.resources( 'foo' );
        router.get( '/bar/baz', 'bar#baz' );
        router.get( '/class', 'class#route' );
    });

    var count = 0;

    client.get( '/class', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for class#route' );
        test.ok( obj.foo == 'bar', 'class#route' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#index' );
        test.ok( obj.objects[ 0 ].foo == 'bar' && obj.objects[ 1 ].foo2 == 'bar2', 'foo#index' );
        test.ok( obj.requestId === undefined, 'foo#index' );
        test.ok( obj.controller == 'foo' );
        test.ok( obj.action == 'index' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#show' );
        test.ok( obj.foo == 'bar', 'foo#show' );
        test.ok( obj.requestId == 123, 'foo#show' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.post( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#create' );
        test.ok( obj.foo == 'bar', 'foo#create' );
        test.ok( obj.requestId == 123, 'foo#create' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.put( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#update' );
        test.ok( obj.foo == 'bar', 'foo#update' );
        test.ok( obj.requestId == 123, 'foo#update' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.del( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#destroy' );
        test.ok( obj.foo == 'bar', 'foo#destroy' );
        test.ok( obj.requestId == 123, 'foo#destroy' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/bar/baz', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for bar#baz' );
        test.ok( obj.bar == 'baz', 'bar#baz' );
        if ( ++count == 7 ) {
            test.done();
        }
    });
};

exports.simpleRoutesAndControllers = function( test ) {
    test.expect( 12 );
    var restify = require( 'restify' );

    var client = restify.createJsonClient({
        url: 'http://localhost:8888',
        version: '0.0.0'
    });


    var CustomRouter = require( '../' ).extend({
        buildCallback: function ( fn ) {
            return function( req, res, next ) {
                var result = fn( req.params );
                res.send( result );
            };
        }
    });
    var router = new CustomRouter( this.server, __dirname + '/simple_controllers', function( router ) {
        router.resources( 'foo' );
        router.get( '/bar/baz', 'bar#baz' );
    });

    var count = 0;

    client.get( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#index' );
        test.ok( obj[ 0 ].foo == 'bar' && obj[ 1 ].foo2 == 'bar2', 'foo#index' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.get( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#show' );
        test.ok( obj.foo == 'bar', 'foo#show' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.post( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#create' );
        test.ok( obj.foo == 'bar', 'foo#create' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.put( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#update' );
        test.ok( obj.foo == 'bar', 'foo#update' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.del( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#destroy' );
        test.ok( obj.foo == 'bar', 'foo#destroy' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.get( '/bar/baz', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for bar#baz' );
        test.ok( obj.bar == 'baz', 'bar#baz' );
        if ( ++count == 6 ) {
            test.done();
        }
    });
};

exports.nestedRoutesAndControllers = function( test ) {
    test.expect( 12 );
    var restify = require( 'restify' );

    var client = restify.createJsonClient({
        url: 'http://localhost:8888',
        version: '0.0.0'
    });

    var Router = require( '../' );
    var router = new Router( this.server, __dirname + '/nested/controllers', function ( router ) {
        router.resources( 'foo' );
        router.get( '/bar/baz', 'bar#baz' );
    });

    var count = 0;

    client.get( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#index' );
        test.ok( obj[ 0 ].foo == 'bar' && obj[ 1 ].foo2 == 'bar2', 'foo#index' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.get( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#show' );
        test.ok( obj.foo == 'bar', 'foo#show' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.post( '/foo', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#create' );
        test.ok( obj.foo == 'bar', 'foo#create' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.put( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#update' );
        test.ok( obj.foo == 'bar', 'foo#update' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.del( '/foo/1', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for foo#destroy' );
        test.ok( obj.foo == 'bar', 'foo#destroy' );
        if ( ++count == 6 ) {
            test.done();
        }
    });

    client.get( '/bar/baz', function( err, req, res, obj ) {
        test.ok( !err, 'No server error for bar#baz' );
        test.ok( obj.bar == 'baz', 'bar#baz' );
        if ( ++count == 6 ) {
            test.done();
        }
    });
};

exports.pathHelpers = function( test ) {
    test.expect( 5 );

    var Router = require( '../' );
    var router = new Router( this.server, __dirname + '/controllers', function( router ) {
        router.resources( 'bananas' );
        router.get( '/bar/baz', 'bar#baz', { as: 'welcome' } );
    });

    test.ok( router.bananasPath() == '/bananas/' );
    test.ok( router.bananaPath( 1 ) == '/bananas/1/' );
    test.ok( router.newBananaPath() == '/bananas/new/' );
    test.ok( router.editBananaPath( 1 ) == '/bananas/1/edit/' );
    test.ok( router.welcomePath() == '/bar/baz/' );
    test.done();
};

exports.aliasResources = function( test ) {
    test.expect( 14 );
    var restify = require( 'restify' );

    var client = restify.createStringClient({
        url: 'http://localhost:8888',
        version: '0.0.0'
    });

    var Router = require( '../' );
    var router = new Router( this.server, __dirname + '/controllers', function( router ) {
        router.resources( 'bananas', { path: 'b' } );
    });

    var count = 0;

    client.get( '/b', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#index' );
        test.ok( data == 'bananas', 'bananas#index' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/b/1', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#show' );
        test.ok( data == 'banana', 'bananas#show' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/b/new', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#new' );
        test.ok( data == 'new banana', 'bananas#new' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.get( '/b/1/edit', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#edit' );
        test.ok( data == 'edit banana', 'bananas#edit' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.post( '/b', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#create' );
        test.ok( data == 'create banana', 'bananas#create' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.put( '/b/1', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#update' );
        test.ok( data == 'update banana', 'bananas#update' );
        if ( ++count == 7 ) {
            test.done();
        }
    });

    client.del( '/b/1', function( err, req, res, data ) {
        test.ok( !err, 'No server error for bananas#destroy' );
        test.ok( data == 'destroy banana', 'bananas#destroy' );
        if ( ++count == 7 ) {
            test.done();
        }
    });
};

exports.setUp = function( callback ) {
    var restify = require( 'restify' );
    this.server = restify.createServer({
        name: 'test',
        version: '0.0.0'
    });

    this.server.listen( 8888 );

    this.server.use( restify.acceptParser( this.server.acceptable ) );
    this.server.use( restify.pre.sanitizePath() );

    callback();
};

exports.tearDown = function( callback ) {
    this.server.close();
    callback();
};
