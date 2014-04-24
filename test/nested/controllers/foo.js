var FooController = {
    index: function( req, res, next ) {
        res.send( [ { foo: 'bar' }, { foo2: 'bar2' } ] );
    },

    show: function( req, res, next ) {
        res.send( { foo: 'bar' } );
    },

    create: function( req, res, next ) {
        res.send( { foo: 'bar' } );
    },

    update: function( req, res, next ) {
        res.send( { foo: 'bar' } );
    },

    destroy: function( req, res, next ) {
        res.send( { foo: 'bar' } );
    }
};

module.exports = FooController;
