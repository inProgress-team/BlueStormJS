var domains = require(process.cwd()+'/config/domains.json'),
    mainConfig = require(process.cwd()+'/config/main.json');

module.exports = {
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
    main: {
        get: function (name) {
            return mainConfig[name];
        }
    }
};