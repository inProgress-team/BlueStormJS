var logger = require(__dirname+'/../logger/logger');

module.exports = {
    reload: function() {
        logger.info('Livereload ;)', {level:3, color:'magenta'});
    }
}