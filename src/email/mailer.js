var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

var path           = require('path');
var emailTemplates = require('email-templates');
var fs = require('fs');

var logger = require(__dirname+'/../logger/logger');

var MAIL_CONFIG_FILE_PATH = process.cwd() + '/config/email.json',
    mailOptions;

module.exports = {
    send: function(to, subject, html, text, callback) {

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

            var config = {
                port: mailOptions.port,
                host: mailOptions.host,
                secure: true,
                maxConnections: 5,
                maxMessages: 10
            };

            if (mailOptions.auth.user) {
                config.auth = {
                    user: mailOptions.auth.user,
                    pass: mailOptions.auth.pass
                };
            }

            var transporter = nodemailer.createTransport(smtpTransport({
                port: mailOptions.port,
                host: mailOptions.host,
                secure: true,
                maxConnections: 5,
                maxMessages: 10
            }));
        }

        var optionsForTransporter = {
            from: mailOptions.from, // sender address
            to: to, // list of receivers
            subject: subject,
            html: html,
            text: text
        };

        //if (process.env.NODE_ENV != 'development') {
        transporter.sendMail(optionsForTransporter, function (err, info) {
            if (callback)
                return callback(err, info);
        });
        //}
    },
    mail: function(mail, templateName, module, lang, params, callback) {
        var $this = this;
        var pathi18n;
        var pathMailModule;

        pathMailModule = process.cwd() + '/src/modules/' + module + '/email';
        pathi18n = pathMailModule + '/i18n/' + lang;

        params.i18n = require(pathi18n);
        emailTemplates(pathMailModule, function (err, template) {
            if (err) {
                if (callback)
                    return callback(err);
                throw err;
            }
            template(templateName, params, function (err, html, text) {
                if (err) {
                    if (callback)
                        return callback(err);
                    throw err;
                }
                $this.send(mail, params.i18n[templateName].title, html, text.replace(/&#39;/g, "'"), function (err, info) {
                    if (callback)
                        return callback(err, info);
                });
            });
        });
    }
};