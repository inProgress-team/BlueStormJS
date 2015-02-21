module.exports = {
	translate: function (str, lang) {
		var trad = require(process.cwd()+'src/common/i18n/'+lang+'.json');

		var hashmap = [];
		walk(trad, '', hashmap);
		
		hashmap.sort(function (a, b) {
			return (b.key.split('.').length-1)-(a.key.split('.').length-1)
		});

		hashmap.forEach(function (hash) {
			var re = new RegExp(hash.key, 'g')
			str = str.replace(re, hash.value);
		});

		return str;
	}
};


var walk = function (obj, path, res) {

    for(var i in obj) {
    	if(typeof obj[i]=="string") {
    		res.push({key: path+i, value: obj[i]});
    	} else {
    		walk(obj[i], path+i+".", res);
    	}
    }
};

var getLastPath = function(path) {
	if(path==='') {
		return null;
	}
	var aux = path.substring(0, path.length-1);
	if(aux.lastIndexOf('.')==-1) {
		return aux;
	} else {
		return aux.substring(aux.lastIndexOf('.')+1, aux.length);
	}
};

