var fs = require( 'fs' );
var util = require( 'util' );
var Class = require( 'class.extend' );
var inflect = require( 'i' )();

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
    init: function( server, pathToControllersDir, routes, versioned ) {
        pathToControllersDir = pathToControllersDir || __dirname + '/controllers';
        this._routes = {};
        this.server = server;
        this.routes = routes;
        this.versioned = versioned;
        this.controllers = this.getControllers( pathToControllersDir );
        var self = this;

        this.routes({
            resources: this.resources.bind( this ),
            get: this.get.bind( this ),
            post: this.post.bind( this ),
            patch: this.post.bind( this ),
            put: this.put.bind( this ),
            del: this.del.bind( this ),
            delete: this.delete.bind( this )
        });
    },

    /*
     * Shorthand for CRUD methods and a few other commonly used routes
     * for resourcesful web apps
    */
    resources: function( resource, options ) {
        options = options || {};
        var version = options.version;
        var controller = this.controllers[ resource + ( version ? ':' + version : '' ) ];
        var prefixRoute = options.prefixRoute;
        var path = options.path;
        var as = options.as;
        var singular = as ? inflect.singularize( as ) : inflect.singularize( resource );
        var cap = function( str ) {
            return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
        };

        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + ( path || resource ), controller, resource, 'index', as || resource );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/new', controller, resource, 'new', 'new' + cap( singular) );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/:id', controller, resource, 'show', singular );
        this.bindRoute( 'get', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/:id/edit', controller, resource, 'edit', 'edit' + cap( singular ) );
        this.bindRoute( 'post', ( prefixRoute || "" ) + '/' + ( path || resource ), controller, resource, 'create', as || resource );
        this.bindRoute( 'put', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/:id', controller, resource, 'update', singular );
        this.bindRoute( 'del', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/:id', controller, resource, 'destroy', singular );
        if ( this.server.delete ) {
            this.bindRoute( 'delete', ( prefixRoute || "" ) + '/' + ( path || resource ) + '/:id', controller, resource, 'destroy' );
        }
    },

    /*
     * GET, POST, PUT, and DELETE
    */
    get: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'get', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    post: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'post', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    patch: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'patch', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    put: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'put', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    del: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'del', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    delete: function( path, action, options ) {
        options = options || {};
        var controllerAction = action.split( '#' );
        var controller = controllerAction[ 0 ];
        action = controllerAction[ 1 ];

        this.bindRoute( 'delete', path, this.controllers[ controller + ( options.version ? ':' + options.version : '' ) ], controller, action, options.as );
    },

    /*
     * Method to build a controllers obj where the keys are the controller names
     * and the values are the controllers themselves
    */
    getControllers: function( pathToControllersDir ) {
        var controllers = {};
        var controllerList = fs.readdirSync( pathToControllersDir );

        for ( var i = 0, len = controllerList.length; i < len; i++ ) {
            var file = controllerList[ i ];
            if ( this.versioned ) {
                // If the versioned flag is set, the original controller list
                // is actually a list of folders which should be named after
                // their versions and shoulf contain controller files
                if ( fs.lstatSync( pathToControllersDir + '/' + file ).isDirectory() ) {
                    var version = file;
                    var controllerList2 = fs.readdirSync( pathToControllersDir + '/' + version );

                    for ( var j = 0, len2 = controllerList2.length; j < len2; j++ ) {
                        file = controllerList2[ j ];

                        // if the file name doesn't start with '.' and ends with '.js'
                        // add the controller to our lookup table of all controllers
                        if ( file.charAt(0) != '.' && file.match( /\.js$/ ) ) {
                            // In the versioned case we save the controller to
                            // a property named controller:version
                            // e.g. 'users:v0'
                            var controller = require( pathToControllersDir + '/' + version + '/' + file );
                            controllers[ file.replace( /\.js$/, '' ) + ':' + version ] = typeof controller == 'function' ? new controller() : controller;
                        }
                    }

                }
            } else {
                // if the file name doesn't start with '.' and ends with '.js'
                // add the controller to our lookup table of all controllers
                if ( file.charAt(0) != '.' && file.match( /\.js$/ ) ) {
                    var controller = require( pathToControllersDir + '/' + file );
                    controllers[ file.replace( /\.js$/, '' ) ] = typeof controller == 'function' ? new controller() : controller;
                }
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
    pathHelper: function() {
        var path = this.path;
        var regex = /\:[^\/\*]+/g;
        var lastIndex = 0;
        var newPath = '';
        var count = 0;
        var arg;

        while( match = regex.exec( path ) ) {
            newPath += path.substring( lastIndex, match.index );
            if ( arg = arguments[ count ] ) {
                newPath += typeof arg !== 'object' ? arg : arg.toPath();
            } else {
                throw new Error( 'Path helper must be called with same number of arguments as the path\'s parameters' );
            }
            lastIndex = match.index + match[ 0 ].length;
            count++;
        }
        newPath += path.substring( lastIndex );

        return newPath.replace( /([^\/])$/, '$1/' );
    },

    /*
     * If you'd like to use some authentication middleware like passport,
     * you can put an 'auth' property on your controllers that need authentication
     * bindRoute will make sure to bind the right route, necessary auth, and the callback
     * to whatever http method is specified
    */
    bindRoute: function( method, path, controller, controllerName, action, as ) {
        if ( controller && controller[ action ] ) {
            var args = [],
                authArg;

            args.push( path );

            if ( controller.pre ) {
                args.push( controller.pre.bind( controller ) );
            }

            if ( controller.before ) {
                var err = new Error( 'The before property must be an array of objects' );
                if ( !util.isArray( controller.before ) ) {
                    throw err;
                }

                for ( var i = 0, len = controller.before.length; i < len; i++ ) {
                    var options = controller.before[ i ];
                    if ( ( !options.except && !options.only ) || ( options.except && options.except.indexOf( action ) == -1 ) ) {
                        if ( typeof controller[ options.name ] == 'function' ) {
                            args.push( controller[ options.name ].bind( controller ) );
                        } else {
                            throw new Error( 'Must be a function' );
                        }
                    }
                    if ( options.only && options.only.indexOf( action ) != -1 ) {
                        if ( typeof controller[ options.name ] == 'function' ) {
                            args.push( controller[ options.name ].bind( controller ) );
                        } else {
                            throw new Error( 'Must be a function' );
                        }
                    }
                }
            }

            if ( authArg = controller.auth ? controller.auth( action ) : null ) {
                args.push( authArg );
            }

            args.push( function( req, res, next ) {
                req.controller = controllerName;
                req.action = action;
                next();
            });

            args.push( this.buildCallback( controller[ action ] ).bind( controller ) );

            if ( controller.after ) {
                var err = new Error( 'The after property must be an array of objects' );
                if ( !util.isArray( controller.after ) ) {
                    throw err;
                }

                for ( var i = 0, len = controller.after.length; i < len; i++ ) {
                    var options = controller.after[ i ];
                    if ( options.except && options.except.indexOf( action ) == -1 ) {
                        if ( typeof controller[ options.name ] == 'function' ) {
                            args.push( controller[ options.name ].bind( controller ) );
                        } else {
                            throw new Error( 'Must be a function' );
                        }
                    }
                    if ( options.only && options.only.indexOf( action ) != -1 ) {
                        if ( typeof controller[ options.name ] == 'function' ) {
                            args.push( controller[ options.name ].bind( controller ) );
                        } else {
                            throw new Error( 'Must be a function' );
                        }
                    }
                }
            }

            this.server[ method ].apply( this.server, args );

            if ( as ) {
                this[ as + 'Path' ] = this.pathHelper.bind( { path: path } );
            }
        }
    }
});

module.exports = Router;
