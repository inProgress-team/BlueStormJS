
var curl = require('curlrequest');

module.exports = {
	send: function (config, data) {
		curl.request({
			url: 'https://api.hipchat.com/v2/room/'+config.room+'/notification?auth_token='+config.token,
			data: data
		}, function (err) {
			
		});
	}
};