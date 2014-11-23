

module.exports = function (path) {

    var domains = require(path+'/config/domains.json');

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
        }
    };
};