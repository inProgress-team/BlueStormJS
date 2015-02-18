module.exports = function (path) {

    if(path===undefined) {
        path = process.cwd();
    }

    var domains = require(path+'/config/domains.json'),
        mainConfig = require(path+'/config/main.json'),
        pkg = require(path+'/package.json');

    return {
        frontend: {
            list: function() {
                var res = [];
                for (var key in domains['development']) {
                    if(key!='api'&&key!='socket'&&key!='main')
                        res.push(key);
                }
                return res;
            }
        },
        get: function(env, name) {
            return domains[env][name];
        },
        isSsl: function () {
            if (mainConfig.ssl) return true;

            return false;
        },
        main: mainConfig,
        pkg: pkg
    };
};