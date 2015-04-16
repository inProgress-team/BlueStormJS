var fs = require('fs'),
express = require('express');

var logger = require(__dirname+'/../../logger/logger'),
    seo = require(__dirname+'/seo'),
    configApi = require(__dirname+'/../../config');


module.exports = function(config) {
    var dir = 'build';
    if(process.env.NODE_ENV=='production' || process.env.NODE_ENV=='preproduction') {
        dir = 'bin';
    }


    var app = express(),
        cacheIndex = null,
        path = 'dist/'+dir+'/'+config.name,
        start;

    app.use(express.static(path));
    app.use(seo.middleware);

    if(config.debug) {
        //LOGGER FOR EVERY STATIC REQUEST
        app.use(function loggerMiddleware(req, res, next){
            start = new Date;
            next();
        });
    }
    //ROBOTS
    app.get('/robots.txt', function (req, res) {
        res.set('Content-Type', 'text/plain');

        if(configApi.main.isSeo(config.name)) {
            res.send('User-agent: *\nDisallow: /public');
        } else {
            res.send('User-agent: *\nDisallow: /');
        }
    });
    //SITEMAP
    app.get('/sitemap.xml', function (req, res) {
        if(configApi.main.isSeo(config.name)) {
            var file = 'sitemap.xml';
            fs.exists(file, function (exists) {
                if(!exists)
                    return res.status(404).send('Not found');

                res.set('Content-Type', 'text/xml');
                res.send(fs.readFileSync(file));
            });
        } else {
            return res.status(404).send('Not found');
        }
        
    });

    //MAIN HTML
    app.get('*', function(req, res){
        if(req.url.indexOf('/public/')==0 || req.url.indexOf('.tpl.html')!=-1) {
            return res.status(404).send('Not found');
        }
        if(!cacheIndex || process.env.NODE_ENV=='development') {
            cacheIndex = fs.readFileSync(path+'/main.html');
        }

        res.set('Content-Type', 'text/html');
        res.send(cacheIndex);
    });

    if(config.debug) {
        app.use(function(req, res, next) {
            var ms = new Date - start;
            next();
            logger.log(config.name + ' : ' + req.method + ' ' + req.url + ' - ' + ms + 'ms');
        });
    }

    if(config.port) {
        logger.log(config.name, ['green'], ' listening on port ', config.port, ['yellow'], '.');
        app.listen(config.port, function() {
            if(typeof callback=='function') cb();
        });
    } else {
        return app
    }
};