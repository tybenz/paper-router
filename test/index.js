exports.regularRoutesAndControllers = function( test ) {
    test.expect( 12 );
    var restify = require( 'restify' );

    var client = restify.createJsonClient({
        url: 'http://localhost:8888',
        version: '0.0.0'
    });

    var Router = require( '../' );
    var router = new Router( this.server, __dirname + '/controllers', function( router ) {
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
            }
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
