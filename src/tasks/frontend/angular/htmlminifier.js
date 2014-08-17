var minify = require('html-minifier').minify;

module.exports = {
    compress: function(content) {
        return minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            removeCommentsFromCDATA: true
        });
    }
}