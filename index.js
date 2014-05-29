var fs = require( 'fs' );
var Class = require( 'class.extend' );

var Router = Class.extend({
    /*
     * Takes in a server and a path to a directory full of controller files
     * and a routes function that can use the appropriate methods to declare routes
     * e.g.:
     *
     * new Router(
     *     server,
     *     __dirname + '/controllers',
     *     function( router ) {
     *         router.resources( 'foo' );
     *         router.get( '/foo/bar', 'controller#action' );
     *     }
     * );
     *
     *
     * Route declarations can either specify a "resource" - controller that
     * maps to CRUD methods, or it can have an explicit mapping between an
     * arbitrary route and a controller#action combo
     *
     * Each controller should be an object with its actions as properties
     * e.g.:
     *
     * var FooController = {
     *     index: function( req, res, next ) {
     *         res.send( 'foo' );
     *     }
     * };
     *
    */
    init: function( server, pathToControllersDir, routes ) {
        pathToControllersDir = pathToControllersDir || __dirname + '/controllers';
        this.controllers = this.getControllers( pathToControllersDir );
        this.server = server;
        this.routes = routes;
        var self = this;

        this.routes({
            resources: function( resource, prefixRoute ) {
                self.resources( resource, prefixRoute );
            },
            get: function( path, action ) {
                self.get( path, action );
            },
            post: function( path, action ) {
                self.post( path, action );
            },
            put: function(  path, action ) {
                self.put( path, action );
            },
            del: function( path, action ) {
                self.del( path, action );
            }
        });
    },

    /*
     * Shorthand for CRUD methods and a few other commonly used routes
     * for resourcesful web apps
    */
    resources: function( resource, prefixRoute ) {
        var controller = this.controllers[ resource ];

        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + resource, controller, 'index' );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + resource + '/:id', controller, 'show' );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + resource + '/new', controller, 'new' );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + resource + '/:id/edit', controller, 'edit' );
        this.bindRoute( 'post', ( prefixRoute || "" ) + '/' + resource, controller, 'create' );
        this.bindRoute( 'put', ( prefixRoute || "" ) + '/' + resource + '/:id', controller, 'update' );
        this.bindRoute( 'del', ( prefixRoute || "" ) + '/' + resource + '/:id', controller, 'destroy' );
    },

    /*
     * GET, POST, PUT, and DELETE
    */
    get: function( path, action ) {
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'get', path, this.controllers[ controller ], action );
    },

    post: function( path, action ) {
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'post', path, this.controllers[ controller ], action );
    },

    put: function( path, action ) {
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'put', path, this.controllers[ controller ], action );
    },

    del: function( path, action ) {
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'del', path, this.controllers[ controller ], action );
    },

    /*
     * Method to build a controllers obj where the keys are the controller names
     * and the values are the controllers themselves
    */
    getControllers: function( pathToControllersDir ) {
        var controllers = {};
        var controllerList = fs.readdirSync( pathToControllersDir );

        for ( var i = 0, len = controllerList.length; i < len; i++ ) {
            var controller = controllerList[i];
            // if the file name doesn't start with '.' and ends with '.js'
            // add the controller to our lookup table of all controllers
            if ( controller.charAt(0) != '.' && controller.match( /\.js$/ ) ) {
                controllers[ controller.replace( /\.js$/, '' ) ] = require( pathToControllersDir + '/' + controller );
            }
        }

        return controllers;
    },

    /*
     * This method is meant to be over-written
     * It should return a function to be bound to the server's route mechanism
     * Example: In express routes are done like this:
     *
     * server.get( '/foo/bar', function( req, res ) {
     *     res.send( 'foobar' );
     * });
     *
     * So in your controller you can simply take the function( req, res ) {...}
     * part and set it as a property on the controller
     *
     * Or if you'd like to have your controllers know less about the server and
     * how to respond, you can have controllers whose actions simply return a value and
     * wrap them with a more complicated callback see example below
     *
     */
    buildCallback: function( fn ) {
        return fn;
    },

    /*
     * The following is an example of a more complicated buildCallback
     * this is simply a method to abstract how much the controller knows about the server
     * I tend to write my controllers to be more utilitarian. So I can call them from different parts
     * of my application to retrieve data. The networking stuff can be moved into the router
     *
     * buidCallback: function ( fn ) {
     *     return function( req, res, next ) {
     *         var result = fn();
     *         res.send( result );
     *     };
     * }
    */

    /*
     * If you'd like to use some authentication middleware like passport,
     * you can put an 'auth' property on your controllers that need authentication
     * bindRoute will make sure to bind the right route, necessary auth, and the callback
     * to whatever http method is specified
    */
    bindRoute: function( method, path, controller, action) {
        if ( controller && controller[ action ] ) {
            var args = [],
                authArg;

            args.push( path );
            if ( authArg = controller.auth ? controller.auth( action ) : null ) {
                args.push( authArg );
            }
            args.push( this.buildCallback( controller[ action ] ) );
            this.server[ method ].apply( this.server, args );
        }
    }
});

module.exports = Router;
