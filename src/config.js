var frontConf = require(process.cwd()+'/config/frontend.json'),
    backConf = require(process.cwd()+'/config/backend.json'),
    domains = require(process.cwd()+'/config/domains.json');

module.exports = {
    frontend: {
        list: function() {
            var res = [];
            for (var key in domains['development']) {
                if(key!='api'&&key!='socket')
                res.push(key);
            }
            return res;
        }
    },
    get: function(env, name) {
        return domains[env][name];
    }
};