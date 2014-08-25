module.exports = function(host) {
    return require("mongojs").connect(host);
};