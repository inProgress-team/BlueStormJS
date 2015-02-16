
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
	},
	sendBluestormCommand: function (command) {
		var hipchatConfig = config().main.hipchat,
			pkg = config().pkg;


		if(hipchatConfig && hipchatConfig.token && hipchatConfig.room) {

			var username = os.hostname();
			gitConfig(function (err, config) {
				if (!err) {
					username = config.user.name;
				}

				hipchat.send(hipchatConfig, {
		            "color": "green",
		            "message": "<strong>"+username+"</strong> a commencé à travailler sur <strong>"+pkg.name+"</strong>",
		            "notify": false,
		            "message_format": "html"
		        })

		        process.on('SIGINT', function(msg) {
				    hipchat.send(hipchatConfig, {
				        "color": "red",
				        "message": "<strong>"+username+"</strong> a arrêté de travailler sur <strong>"+pkg.name+"</strong>",
				        "notify": false,
				        "message_format": "html"
				    }, function (err) {
				    	process.exit();
				    });
				    return true;
				});
			});


			
		}
	}
};
var hipchat = module.exports;
