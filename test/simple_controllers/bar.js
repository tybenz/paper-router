var BarController = {
    baz: function( req, res, next ) {
        return { bar: 'baz' };
    }
};

module.exports = BarController;
