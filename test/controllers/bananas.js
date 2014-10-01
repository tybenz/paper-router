var BananasController = {
    index: function( req, res, next ) {
        res.send( 'bananas' )
    },

    show: function( req, res, next ) {
        res.send( 'banana' );
    },

    new: function( req, res, next ) {
        res.send( 'new banana' );
    },

    edit: function( req, res, next ) {
        res.send( 'edit banana' );
    },

    create: function( req, res, next ) {
        res.send( 'create banana' );
    },

    update: function( req, res, next ) {
        res.send( 'update banana' );
    },

    destroy: function( req, res, next ) {
        res.send( 'destroy banana' );
    }
};

module.exports = BananasController;
