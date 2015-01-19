var domains = require(process.cwd()+'/config/domains.json'),
    main = require(process.cwd()+'/config/main.json');

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
        if(main.ssl) return true;

        return false;
    }
};