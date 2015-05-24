var BananasController = {
    index: function( req, res, next ) {
        res.send([
            { foo: 'bar' },
            { foo: 'baz' }
        ]);
    },

    extra: function( req, res, next ) {
        res.send({
            foo: 'bar'
        });
    }
};

module.exports = BananasController;
