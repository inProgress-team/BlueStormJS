var ROLES_CONFIG_PATH = process.cwd() + '/config/roles.json',
    USER_CONFIG_PATH = process.cwd() + '/config/user.json',
    SALT_WORK_FACTOR = 10,
    SECRET_TOKEN,
    FIELDS_TO_EXCLUDE_FROM_TOKEN;

var bcrypt = require('bcrypt'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    generatePassword = require('password-generator'),
    async = require('async'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    _ = require('underscore');

var dbConnection = require(__dirname + '/../../../../mongo'),
    logger = require(__dirname + '/../../../logger/logger'),
    mailer = require(__dirname + '/../../../email/mailer'),
    config = require(__dirname + '/../../../config');

var roles = require(ROLES_CONFIG_PATH);
var tokenExpiration = config.main.get('tokenExpiration') || 31;

// init roles
try {
    roles = JSON.parse(fs.readFileSync(ROLES_CONFIG_PATH));
}
catch (err) {
    logger.error(new Error(ROLES_CONFIG_PATH + ' doesn\'t exists or it\'s not a valid JSON.'), 'User');
    process.exit(1);
}

// init SECRET_TOKEN
try {
    var json = JSON.parse(fs.readFileSync(USER_CONFIG_PATH));
    SECRET_TOKEN = json.SECRET_TOKEN;
    if (!SECRET_TOKEN) {
        logger.error(new Error('SECRET_TOKEN not found in ' + USER_CONFIG_PATH), 'User');
        process.exit(1);
    }
    FIELDS_TO_EXCLUDE_FROM_TOKEN = json.fieldsToExcludeFromToken || [];
}
catch (err) {
    logger.error(new Error(USER_CONFIG_PATH + ' doesn\'t exists or it\'s not a valid JSON.'), 'User');
    process.exit(1);
}

/*
 module.exports = function() {
 // User schema
 var UserSchema = new Schema({
 email: { type: String, required: true, unique: true },
 password: { type: String, required: true}
 });

 // Bcrypt middleware on UserSchema
 UserSchema.pre('save', function(next) {
 var user = this;

 if (!user.isModified('password')) return next();

 bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
 if (err)
 return next(err);

 bcrypt.hash(user.password, salt, function(err, hash) {
 if (err)
 return next(err);

 user.password = hash;
 next();
 });
 });
 });

 // Sign In
 UserSchema.statics.signIn = function(email, password, callback) {
 this.findOne({email: email}, function(err, user) {
 if (err)
 return callback(err);
 if (!user)
 return callback('Incorrect email');

 UserSchema.comparePassword(password, function(err, isMatch) {
 if (err)
 return callback(err);
 if (!isMatch)
 return callback('Incorrect password');

 var expires = moment().add('months', 1).valueOf();
 var token = jwt.encode({
 user: user,
 expires: expires
 }, SECRET_TOKEN);
 return callback(null, token);
 });
 });
 };

 // Sign Up
 UserSchema.statics.signUp = function(email, password, callback) {
 console.log('A');
 console.log(mongoose.connection.readyState);
 this.findOne({email: email}, function(err, user) {
 console.log('B');
 if (err)
 return callback(err);
 if (user)
 return callback('User already exists');

 User = mongoose.model('User');
 user = new User();
 user.email = email;
 user.password = password;
 user.save(function(err) {
 if (err)
 return callback(err);

 return callback(null, user);
 });
 });
 };
 };
 */

// Password verification
var comparePassword = function(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, isMatch) {
        if (err)
            return callback(err);

        return callback(null, isMatch);
    });
};

module.exports.encodeToken = function(user) {
    for (var i=0; i<FIELDS_TO_EXCLUDE_FROM_TOKEN.length; i++) {
        delete(user[FIELDS_TO_EXCLUDE_FROM_TOKEN[i]]);
    }
    var expires = moment().add(tokenExpiration, 'days').valueOf();
    return jwt.encode(
        {
            user: user,
            expires: expires
        },
        SECRET_TOKEN);
};

module.exports.decodeToken = function(token) {
    return jwt.decode(token, SECRET_TOKEN);
};

module.exports.signUp = function(user, options, callback) {
    if (!user || !user.email) {
        return callback('data_not_received');
    }

    // If no options passed
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    var password;
    // If random password
    if (options.randomPassword) {
        password = generatePassword(8, false, /\w/);
        if (!options.resetPasswordLink) {
            options.sendConfirmation = true;
            options.sendPassword = true;
        }
    }
    else {
        if (!options.noPassword && !user.password)
            return callback('data_not_received');
        if (user.password)
            password = user.password;
        else
            password = generatePassword(8, false, /\w/);
    }

    dbConnection(function(db) {
        db.collection('users').findOne({
            email: user.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (res) {
                return callback('already_existing');
            }

            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err)
                    return next(err);

                bcrypt.hash(password, salt, function(err, hash) {
                    if (err)
                        return next(err);

                    user.password = hash;
                    if (options.activationLink) {
                        user.hash = uuid.v4();
                        user.activated = false;
                    } else if (options.resetPasswordLink) {
                        user.hashPassword = generatePassword(8, false, /\w/);
                    } else {
                        user.activated = true;
                    }
                    db.collection('users').insert(user, function(err) {
                        if (err)
                            return callback(err);

                        if (options.sendConfirmation || options.activationLink || options.resetPasswordLink) {
                            var arguments = _.clone(user);
                            if (options.signinLink)
                                arguments.signinLink = options.signinLink;

                            if (options.sendPassword) {
                                arguments.password = password;
                            }

                            if (options.sendConfirmation)
                                mailer.mail(user.email, 'signupComplete', 'user', 'fr', arguments);
                            else if (options.activationLink) {
                                if (options.activationLink.slice(-1) == '/')
                                    options.activationLink = options.activationLink.substring(0, options.activationLink.length - 1);
                                arguments.url = options.activationLink + '/' + user.hash;
                                mailer.mail(user.email, 'signupConfirm', 'user', 'fr', arguments);
                            } else if (options.resetPasswordLink) {
                                if (options.resetPasswordLink.slice(-1) == '/')
                                    options.resetPasswordLink = options.resetPasswordLink.substring(0, options.resetPasswordLink.length - 1);
                                arguments.url = options.resetPasswordLink + '/' + user.email + '/' + user.hashPassword;
                                console.log('0');
                                mailer.mail(user.email, 'signupAndResetPassword', 'user', 'fr', arguments);
                            }
                        }

                        delete user.password;
                        return callback(null, user, module.exports.encodeToken(user));
                    });
                });
            });
        });
    });
};

module.exports.signUpConfirm = function(hash, options, callback) {
    if (!hash) {
        return callback('data_not_received');
    }

    // If no options passed
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    dbConnection(function(db) {
        db.collection('users').findAndModify({
                "hash": hash
            },
            {},
            {
                "$set": {
                    "activated": true,
                    "hash": ""
                }
            },
            {
                "new": true
            },
            function(err, res) {
                if (err)
                    return callback(err);

                if (!res || !res.value)
                    return callback('not_found');

                if (options.sendConfirmation) {
                    var arguments = {};
                    arguments.firstName = res.value.firstName;
                    mailer.mail(res.value.email, 'signupComplete', 'user', 'fr', arguments);
                }

                delete res.value.password;
                return callback(null, res.value, module.exports.encodeToken(res.value));
            }
        );
    });
};

module.exports.resetPassword = function(data, options, callback) {
    if (typeof options == 'function') {
        callback = options;
        options = {};
    }

    if (!data || !data.email) {
        return callback('data_not_received');
    }

    dbConnection(function(db) {
        if (data.resetPasswordLink) {
            db.collection('users').findAndModify({
                    "email": data.email
                },
                {},
                {
                    "$set": {
                        "hashPassword": generatePassword(8, false, /\w/)
                    }
                },
                {
                    "new": true
                },
                function (err, res) {
                    if (err)
                        return callback(err);

                    if (!res || !res.value)
                        return callback('not_found');

                    var arguments = _.clone(res.value);
                    delete arguments.password;
                    if (data.resetPasswordLink.slice(-1) == '/')
                        data.resetPasswordLink = data.resetPasswordLink.substring(0, data.resetPasswordLink.length - 1);
                    arguments.url = data.resetPasswordLink + '/' + data.email + '/' + arguments.hashPassword;
                    mailer.mail(arguments.email, 'resetPassword', 'user', 'fr', arguments);

                    return callback();
                }
            );
        } else {
            var password = generatePassword(8, false, /\w/);
            db.collection('users').findOne({
                email: data.email
            }, function(err, res) {
                if (err)
                    return callback(err);
                if (!res)
                    return callback('account_not_found');

                bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                    if (err)
                        return callback(err);

                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err)
                            return callback(err);

                        res.password = hash;
                        res.activated = true;
                        db.collection('users').save(res, function(err) {
                            if (err)
                                return callback(err);

                            var arguments = _.clone(res);
                            arguments.password = password;
                            if (options.signinLink)
                                arguments.signinLink = options.signinLink;
                            mailer.mail(res.email, 'renewPassword', 'user', 'fr', arguments, function(err) {
                                return callback(err);
                            });
                        });
                    });
                });
            });
        }
    });
};

module.exports.resetPasswordConfirm = function(data, callback) {
    if (!data || !data.email || !data.hashPassword ||!data.password) {
        return callback('data_not_received');
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err)
            return callback(err);

        bcrypt.hash(data.password, salt, function (err, hash) {
            if (err)
                return callback(err);

            dbConnection(function (db) {
                db.collection('users').findAndModify({
                        "email": data.email,
                        "hashPassword": data.hashPassword
                    },
                    {},
                    {
                        "$set": {
                            "password": hash,
                            "hashPassword": ""
                        }
                    },
                    {
                        "new": true
                    },
                    function (err, res) {
                        if (err)
                            return callback(err);

                        if (!res || !res.value)
                            return callback('not_found');

                        delete res.value.password;
                        return callback(null, res.value, module.exports.encodeToken(res.value));
                    }
                );
            });
        });
    });
};

module.exports.changePassword = function(data, callback) {
    if (!data || !data.email ||!data.password || !data.newPassword) {
        return callback('data_not_received');
    }

    dbConnection(function(db) {
        db.collection('users').findOne({
            email: data.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback('account_not_found');

            comparePassword(data.password, res.password, function(err, isMatch) {
                if (err)
                    return callback(err);
                if (!isMatch)
                    return callback('invalid_password');

                bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                    if (err)
                        return callback(err);

                    bcrypt.hash(data.newPassword, salt, function (err, hash) {
                        if (err)
                            return callback(err);

                        res.password = hash;
                        db.collection('users').save(res, function(err) {
                            if (err)
                                return callback(err);

                            delete res.password;
                            return callback(null, res, module.exports.encodeToken(res));
                        });
                    });
                });
            });
        });
    });
};

module.exports.signIn = function(user, callback) {
    if (!user || !user.email || !user.password) {
        return callback('data_not_received');
    }

    dbConnection(function(db) {
        db.collection('users').findOne({
            email: user.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback('account_not_found');
            if (!res.activated)
                return callback('account_not_activated');

            comparePassword(user.password, res.password, function(err, isMatch) {
                if (err)
                    return callback(err);
                if (!isMatch)
                    return callback('invalid_password');

                delete res['password'];
                return callback(null, res, module.exports.encodeToken(res));
            });
        });
    });
};

module.exports.update = function(user, callback) {
    if (!user || !user.email) {
        return callback('data_not_received');
    }

    // If no options passed
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    // If change password
    var newPassword;
    if (user.password) {
        newPassword = user.password;
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err)
                return next(err);

            bcrypt.hash(password, salt, function (err, hash) {
                if (err)
                    return next(err);

                user.password = hash;
            });
        });
    }

    db.collection('users').findAndModify({
            "query": {"email": user.email},
            "update": user,
            "new": true
        },
        function(err, res) {
            if (err)
                return callback(err);

            if (!res || !res.value)
                return callback();

            if (options.sendConfirmation) {
                var arguments = {};

                arguments.firstName = user.firstName;
                if (options.sendPassword) {
                    arguments.password = newPassword;
                }
                mailer.mail(user.email, 'edit', 'user', 'fr', arguments);
            }

            delete user.password;
            return callback(null, res.value, module.exports.encodeToken(res.value));
        }
    );
};

module.exports.tokenIsValid = function(token, callback) {
    var decodedToken;

    try {
        decodedToken = module.exports.decodeToken(token);
    } catch (err) {
        return callback('invalid_token');
    }

    if (decodedToken.expires < moment().valueOf())
        return callback('expired_token');

    return callback(null, decodedToken.user);
};

module.exports.getUsers = function(options , callback) {
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    var criteria = options.criteria || {},
        selection = options.selection || {};

    dbConnection(function(db) {
        db.collection('users').find(criteria, selection).toArray(function(err, res) {
            if (err)
                return callback(err);

            return callback(null, res);
        });
    });
};