var request = require('request'),
    _ = require('underscore'),
    querystring = require('querystring');

var apiKey = 'eOp84wnY8Iks7CR6', //TODOSONGPEEK NCONF
    prefix = 'http://api.songkick.com/api/3.0/events.json?apikey='+apiKey;

module.exports.searchEvents = function(data, callback) {
    var suffix = '';

    if (typeof(callback) == 'function') {
        _.each(data, function(value, key) {
            if (typeof value === 'string')
                suffix+='&'+key+'='+querystring.escape(value);
            else
                suffix+='&'+key+'='+value;
        });

        request(prefix + suffix, function (err, response, body) {
            var json = JSON.parse(body);

            if (json.error) {
                return callback(json.message);
            }
            else {
                callback(err, JSON.parse(body));
            }
        });
    }
};