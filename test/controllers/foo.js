var FooController = {
    before: [
        { name: 'beforeMethod', except: [ 'index' ] }
    ],

    beforeMethod: function( req, res, next ) {
        req.id = 123;
        next();
    },

    index: function( req, res, next ) {
        res.send({
            requestId: req.id,
            controller: req.controller,
            action: req.action,
            objects: [ { foo: 'bar' }, { foo2: 'bar2' } ]
        });
    },

    show: function( req, res, next ) {
        res.send( { foo: 'bar', requestId: req.id } );
    },

    create: function( req, res, next ) {
        res.send( { foo: 'bar', requestId: req.id  } );
    },

    update: function( req, res, next ) {
        res.send( { foo: 'bar', requestId: req.id  } );
    },

    destroy: function( req, res, next ) {
        res.send( { foo: 'bar', requestId: req.id  } );
    }
};

module.exports = FooController;
