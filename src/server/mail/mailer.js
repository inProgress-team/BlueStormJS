var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

var path           = require('path');
var emailTemplates = require('email-templates');
var fs = require('fs');

var logger = require(__dirname+'/../../logger/logger');

var MAIL_CONFIG_FILE_PATH = process.cwd() + '/config/mail.json',
    mailOptions;

var pathlang,
    pathUserModule;

// reusable transporter object using SMTP transport
var transporter;

module.exports = {
    send: function(to, subject, html, text, cb) {

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

            var transporter = nodemailer.createTransport(smtpTransport({
                port: mailOptions.port,
                host: mailOptions.host,
                auth: {
                    user: mailOptions.auth.user,
                    pass: mailOptions.auth.pass
                },
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

        transporter.sendMail(optionsForTransporter, function(err, info){
            cb(err, info);
        });
    },
    mail: function(mail, templateName, module, lang, params, cb) {
        var $this = this;
        if (!pathlang) {

        }
        params.i18n = require(__dirname+'/i18n/'+lang);
        emailTemplates(__dirname+'/../'+module+'/mail', function(err, template) {
            if(err) return cb(err);
            template(templateName, params, function(err, html, text) {
                if(err) return cb(err);
                $this.send(mail, params.i18n[templateName].title, html, text.replace(/&#39;/g, "'"), function(err, info) {
                    cb(err, info);
                });
            });
        });
    }
};