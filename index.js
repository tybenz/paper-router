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
    init: function( server, routes, pathToControllersDir ) {
        pathToControllersDir = pathToControllersDir || __dirname + '/controllers';
        var controllers = this.getControllers( pathToControllersDir );

        for ( var route in routes ) {
            if ( routes.hasOwnProperty( route ) ) {
                var task = routes[route];
                if ( typeof task == "string" ) {
                    var actionParts = task.split('#');
                    var controller = actionParts[ 0 ];
                    var action = actionParts[ 1 ];
                }
                var pathParts = route.split(' ');
                var method = pathParts[ 0 ];
                var path = pathParts[ 1 ];

                if ( method == 'resources' ) {
                    var resource = path;
                    var controller = controllers[ resource ];

                    this.bindRoute( server, 'get', '/' + resource, controller, 'index' );
                    this.bindRoute( server, 'get', '/' + resource + '/:id', controller, 'show' );
                    this.bindRoute( server, 'post', '/' + resource, controller, 'create' );
                    this.bindRoute( server, 'put', '/' + resource + '/:id', controller, 'update' );
                    this.bindRoute( server, 'del', '/' + resource + '/:id', controller, 'destroy' );
                } else if ( server[ method ] ) {
                    this.bindRoute( server, method, '/' + controller + '/' + action, controllers[ controller ], action );
                }
            }
        }
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
     * wrap them with a more complicated callback see example below:
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

    // buildCallback: function( fn ) {
    //     return function( req, res, next ) {
    //         var data = fn( req.params );
    //         data.result.then( function ( modelOrCollection ) {
    //             if ( data.callback ) {
    //                 modelOrCollection = data.callback( modelOrCollection );
    //             }

    //             res.send( modelOrCollection );
    //         });
    //     };
    // },

    // If you'd like to use come authentication middleware like passport,
    // you can put an 'auth' property on your controllers that need authentication
    // bindRoute will make sure to bind the right route, necessary auth, and the callback
    // to whatever http method is specified
    bindRoute: function( server, method, path, controller, action) {
        if ( controller && controller[ action ] ) {
            var args = [],
                authArg;

            args.push( path );
            if ( authArg = controller.auth ? controller.auth( action ) : null ) {
                args.push( authArg );
            }
            args.push( this.buildCallback( controller[ action ] ) );
            server[ method ].apply( server, args );
        }
    }
});

module.exports = Router;
