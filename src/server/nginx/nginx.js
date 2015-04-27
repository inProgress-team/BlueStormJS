var fs = require('fs');

var logger = require(__dirname+'/../../logger/logger');
var config = require(__dirname+'/../../config');

var frontendApps = config.frontend.list();

var basePath = process.cwd();

module.exports = {
    generateConfig: function() {
        var env = process.env.NODE_ENV;
        var appName = config.main.get('appName') || 'default';
        var pathProd = config.main.get('pathProd');
        var path = env == 'production' ? basePath + '/scripts/production/nginx/' + appName : basePath + '/scripts/preproduction/nginx/' + appName;
        var apiUrl = config.get(env, 'api')['url'];
        var apiPort = config.get(env, 'api')['port'];
        var socketUrl = config.get(env, 'socket')['url'];
        var socketPort = config.get(env, 'socket')['port'];

        var app = "server {\n" +
            "   listen 80;\n" +
            "   server_name $SERVER_NAME;\n" +
            "\n" +
            "   location / {\n" +
            "       proxy_pass http://localhost:$APPPORT;\n" +
            "       proxy_set_header Host $host;\n" +
            "   }\n" +
            "   location /public/ {\n" +
            "       root $PATHPROD" + "/dist/bin/$APPNAME;\n" +
            "   }\n" +
            "}\n" +
            "\n";

        var api = "server {\n" +
            "   listen 80;\n" +
            "   server_name " + apiUrl + ";\n" +
            "\n" +
            "   location / {\n" +
            "       proxy_pass http://localhost:" + apiPort + ";\n" +
            "       proxy_set_header Host $host;\n" +
            "   }\n" +
            "}\n" +
            "\n";

        var socket = "server {\n" +
            "   listen 80;\n" +
            "   server_name " + socketUrl + ";\n" +
            "\n" +
            "   location / {\n" +
            "       proxy_pass http://localhost:" + socketPort + ";\n" +
            "       proxy_set_header Host $host;\n" +
            "       proxy_http_version 1.1;\n" +
            "       proxy_set_header Upgrade $http_upgrade;\n" +
            "       proxy_set_header Connection \"upgrade\";\n" +
            "       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n" +
            "   }\n" +
            "}";

        var res = "";

        frontendApps.forEach(function(name) {
            var application = config.get(env, name);
            res += app.replace('$SERVER_NAME', application.url).replace('$APPPORT', application.port).replace('$PATHPROD', pathProd).replace('$APPNAME', name);

        });

        res += api;
        res += socket;
        
        fs.writeFileSync(path, res);

        logger.log('Nginx\'s configuration file is generated (', path, ['yellow'], ').');
        process.exit(0);
    }
};