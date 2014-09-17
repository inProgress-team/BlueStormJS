var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

var path           = require('path');
var emailTemplates = require('email-templates');
var fs = require('fs');


// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(smtpTransport({

}));


module.exports = {
    send: function(to, subject, html, text, cb) {

        var mailOptions = {

        };

        transporter.sendMail(mailOptions, function(err, info){
            cb(err, info);
        });
    },
    mail: function(mail, templateName, module, lang, params, cb) {
        var $this = this;
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