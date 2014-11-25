var gulp = require('gulp'),
del = require('del');

var //gulpLogger = require(__dirname+'/oldlogger'),
server = require(__dirname+'/server'),
logger = require(__dirname+'/../../../../../logger/logger');


var config = require(__dirname+'/../../../../../config');


var frontendApps = config.frontend.list(),
builds = ['build@backend'],
compiles = [];
frontendApps.forEach(function(app) {
	builds.push('build@'+app);
	compiles.push('compile@'+app);
});

var async = require('async'),
slug = require('slug');

process.on('message',function(data){
	server.startDev(data);
});

process.on('uncaughtException',function(err){
	console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
});