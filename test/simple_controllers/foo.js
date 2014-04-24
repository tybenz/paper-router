var FooController = {
    index: function( req, res, next ) {
        return [ { foo: 'bar' }, { foo2: 'bar2' } ];
    },

    show: function( req, res, next ) {
        return { foo: 'bar' };
    },

    create: function( req, res, next ) {
        return { foo: 'bar' };
    },

    update: function( req, res, next ) {
        return { foo: 'bar' };
    },

    destroy: function( req, res, next ) {
        return { foo: 'bar' };
    }
};

module.exports = FooController;
