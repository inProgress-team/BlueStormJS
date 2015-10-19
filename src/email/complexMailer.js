var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

var path           = require('path');
var emailTemplates = require('email-templates');
var fs = require('fs');

var logger = require(__dirname+'/../logger/logger');

var MAIL_CONFIG_FILE_PATH = process.cwd() + '/config/email.json',
    mailOptions;

module.exports = {
    send: function(to, from, subject, html, text, options, callback) {
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }

        if (!transporter) {
            // Check if config file for database exists
            try {
                mailOptions = JSON.parse(fs.readFileSync(MAIL_CONFIG_FILE_PATH));
            }
            catch (err) {
                logger.error(new Error(MAIL_CONFIG_FILE_PATH + ' doesn\'t exists or it\'s not a valid JSON.'), 'Mailer');
                process.exit(1);
            }

            if (!mailOptions || !mailOptions.port || !mailOptions.host || !mailOptions.from) {
                logger.error(new Error('mail config file is invalid.'), 'Mailer');
                process.exit(1);
            }

            var transport = {
                port: mailOptions.port,
                host: mailOptions.host,
                maxConnections: 5,
                maxMessages: 10
            };

            if (mailOptions.auth) {
                transport.auth = {
                    user: mailOptions.auth.user,
                    pass: mailOptions.auth.pass
                };
                transport.secure = true;
            }

            var transporter = nodemailer.createTransport(smtpTransport(transport));
        }

        if(options.from) {
            mailOptions.from = options.from;
        }

        var optionsForTransporter = {
            from: from, // sender address
            to: to, // list of receivers
            subject: subject,
            html: html,
            text: text
        };

        //if (process.env.NODE_ENV != 'development') {
        transporter.sendMail(optionsForTransporter, function (err, info) {
            if (typeof callback=='function')
                return callback(err, info);
        });
        //}
    },
    mail: function(mail, from, title, templateName, module, lang, params, callback) {

        var options;
        if(typeof callback == 'object') {
            options = callback;
            callback = null;
        }


        var $this = this;
        var pathi18n;
        var pathMailModule;

        pathMailModule = process.cwd() + '/src/modules/' + module + '/email';
        pathi18n = pathMailModule + '/i18n/' + lang;

        params.i18n = require(pathi18n);
        emailTemplates(pathMailModule, function (err, template) {
            if (err) {
                if (typeof callback=='function')
                    return callback(err);
                throw err;
            }
            template(templateName, params, function (err, html, text) {
                if (err) {
                    if (typeof callback=='function')
                        return callback(err);
                    throw err;
                }
                $this.send(mail, from, title, html, text.replace(/&#39;/g, "'"), function (err, info) {
                    if (typeof callback=='function')
                        return callback(err, info);
                });
            });
        });
    }
};