
module.exports = function(socket) {
    socket.on('test', function() {
        console.log('AHAHA LES WEBSOCKETS');
    })
};