var FooController = {
    before: [
        { name: 'beforeMethod' },
        { name: 'beforeNotDestroy', except: [ 'destroy' ] },
        { name: 'beforeLimited', only: [ 'create', 'update' ] }
    ],

    beforeMethod: function( req, res, next ) {
        req.id = 123;
        next();
    },

    beforeLimited: function( req, res, next ) {
        req.name = 'foo';
        next();
    },

    beforeNotDestroy: function( req, res, next ) {
        req.foo = 'bar';
        next();
    },

    index: function( req, res, next ) {
        res.send({
            requestId: req.id,
            controller: req.controller,
            action: req.action,
            name: req.name,
            foo: req.foo,
            objects: [ { foo: 'bar' }, { foo2: 'bar2' } ]
        });
    },

    show: function( req, res, next ) {
        res.send({
            requestId: req.id,
            name: req.name,
            foo: req.foo
        });
    },

    create: function( req, res, next ) {
        res.send({
            requestId: req.id,
            name: req.name,
            foo: req.foo
        });
    },

    update: function( req, res, next ) {
        res.send({
            requestId: req.id,
            name: req.name,
            foo: req.foo
        });
    },

    destroy: function( req, res, next ) {
        res.send({
            requestId: req.id,
            name: req.name,
            foo: req.foo
        });
    }
};

module.exports = FooController;
