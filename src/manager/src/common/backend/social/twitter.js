
module.exports = {
    getUser: function(req, callback) {
        req.twitter.verifyCredentials(req.data.accessToken, req.data.accessTokenSecret, function(err, data, response) {
            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        });
    }
};