var userDAO = require(__dirname + '/../dao/user'),
    mailer = require(__dirname + '/../../mail/mailer');

module.exports = function(app) {
    app.post('/signup', function(req, res) {
        console.log('fram');
        var user = req.body,
            options = {};

        if (!user || !user.email || !user.password)
            return res.send({
                err: 'user\'s informations were not received'
            });

        if (user.role)
            options.role = user.role;

        options.otherFields = {};
        if (user.firstName) {
            options.otherFields.firstName = user.firstName;
        }
        if (user.lastName) {
            options.otherFields.lastName = user.lastName;
        }

        userDAO.signUp(user.email, user.password, options, function(err, user, token) {
            if (err) {
                return res.send({
                    "err": err
                });
            }
            else {
                return res.send({
                    user: user,
                    token: token
                });
            }
        });
    });

    app.post('/signin', function(req, res) {
        var user = req.body;

        if (!user || !user.email || !user.password)
            return res.send({
                err: 'user\'s informations were not received'
            });

        userDAO.signIn(user.email, user.password, function(err, user, token) {
            if (err)
                return res.send({
                    err: err
                });
            else
                return res.send({
                    user: user,
                    token: token
                });
        });
    });

    app.get('/user', function(req, res) {
        var data = req.query;

        if (!data || !data.token) {
            return res.send({
                err: 'token not received'
            });
        }

        userDAO.tokenIsValid(data.token, function(err, user) {
            if (err) {
                return res.send({
                    err: err
                });
            }
            else {
                return res.send({
                    user: user
                })
            }
        });
    });
};