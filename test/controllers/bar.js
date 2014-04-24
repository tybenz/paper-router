var BarController = {
    baz: function( req, res, next ) {
        res.send( { bar: 'baz' } );
    }
};

module.exports = BarController;
