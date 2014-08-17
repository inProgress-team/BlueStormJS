var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir'),
    less = require('less');

var logger = require(__dirname+'/../../../logger/logger'),
    config = require(__dirname+'/../../../config/config');



var apps = ['desktop', 'admin'];


module.exports = {
    build: function(env, cb) {

    }

};
var i18n = module.exports;