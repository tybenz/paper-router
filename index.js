var fs = require( 'fs' );
var Class = require( 'class.extend' );

var Router = Class.extend({
    /*
     * Takes in a server, a path to a directory full of controller files,
     * and a routes object that looks like this:
     *
     * routes = {
     *     'resources foo': true,
     *     'get /foo/bar': 'controller#action'
     * }
     *
     * Either it will specify a "resource" - controller that maps to CRUD methods
     * Or it can have an explicit mapping between an arbitrary route and
     * a controller/action combo
     *
     * Each controller should be an object with its actions as properties
     *
    */
    init: function( server, pathToControllersDir ) {
        pathToControllersDir = pathToControllersDir || __dirname + '/controllers';
        this.controllers = this.getControllers( pathToControllersDir );
        this.server = server;
        var self = this;

        this.routes({
            resources: function( resource ) {
                self.resources( resource );
            },
            get: function( path, action ) {
                self.get( path, action );
            },
            post: function( path, action ) {
                self.get( path, action );
            },
            put: function(  path, action ) {
                self.get( path, action );
            },
            delete: function( path, action ) {
                self.get( path, action );
            }
        });
    },

    resources: function( resource ) {
        var controller = this.controllers[ resource ];

        this.bindRoute( 'get', '/' + resource, controller, 'index' );
        this.bindRoute( 'get', '/' + resource + '/:id', controller, 'show' );
        this.bindRoute( 'post', '/' + resource, controller, 'create' );
        this.bindRoute( 'put', '/' + resource + '/:id', controller, 'update' );
        this.bindRoute( 'del', '/' + resource + '/:id', controller, 'destroy' );
    },

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

    delete: function( path, action ) {
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'delete', path, this.controllers[ controller ], action );
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

    // The following is an example of a more complicated buildCallback
    // this is simply a method to abstract how much the controller knows about the server
    // I tend to write my controllers to be more utilitarian. So I can call them from different parts
    // of my application to retrieve data. The networking stuff can be moved into the router
    // buidCallback: function ( fn ) {
    //     return function( req, res, next ) {
    //         var result = fn();
    //         res.send( result );
    //     };
    // }

    // If you'd like to use come authentication middleware like passport,
    // you can put an 'auth' property on your controllers that need authentication
    // bindRoute will make sure to bind the right route, necessary auth, and the callback
    // to whatever http method is specified
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
    },

    // TO be overridden
    routes: function( route ) {
    }
});

module.exports = Router;
