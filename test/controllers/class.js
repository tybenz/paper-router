var ClassController = function() {
}

ClassController.prototype.route = function( req, res, next ) {
    res.send( { foo: 'bar' } );
};

module.exports = ClassController;
