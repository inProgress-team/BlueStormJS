
module.exports = {
    load: function(name, env, cb) {
        switch(name) {
            default:
                console.log(name+' task not found.');
                cb();
                break;
        }
    }
};

function tm(log, ms, cb) {
    setTimeout(function() {
        console.log(log);
        cb();
    },ms);
}