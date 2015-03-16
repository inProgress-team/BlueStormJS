var cheerio = require('cheerio');


module.exports = {
	get: function (html) {
		$ = cheerio.load(html);

		var res = parseInt($('body').attr('data-status'), 10);
		if(isNaN(res)) {
			res = 200;
		}
		return res;
	}
};
var status = module.exports;
