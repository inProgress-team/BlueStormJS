
var config = require(__dirname+'/../../config');

var curl = require('curlrequest'),
	os = require('os'),
	gitConfig = require('git-config');

module.exports = {
	send: function (config, data, cb) {
		curl.request({
			url: 'https://api.hipchat.com/v2/room/'+config.room+'/notification?auth_token='+config.token,
			data: data
		}, function (err) {
			if(typeof cb == 'function')
				cb(err);
		});
	}
};
var hipchat = module.exports;
