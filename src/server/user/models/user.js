var ROLES_CONFIG_PATH = process.cwd() + '/config/roles.json',
    USER_CONFIG_PATH = process.cwd() + '/config/user.json',
    SALT_WORK_FACTOR = 10,
    SECRET_TOKEN;

var bcrypt = require('bcrypt'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    generatePassword = require('password-generator'),
    async = require('async'),
    uuid = require('node-uuid'),
    fs = require('fs');

var dbConnection = require(__dirname + '/../../../../mongo'),
    logger = require(__dirname + '/../../../logger/logger'),
    mailer = require(__dirname + '/../../../email/mailer');

var roles = require(ROLES_CONFIG_PATH);

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
    SECRET_TOKEN = (JSON.parse(fs.readFileSync(USER_CONFIG_PATH))).SECRET_TOKEN;
    if (!SECRET_TOKEN) {
        logger.error(new Error('SECRET_TOKEN not found in ' + USER_CONFIG_PATH), 'User');
        process.exit(1);
    }
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
    var expires = moment().add(1, 'months').valueOf();
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
        return callback('User\'s informations not received');
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
        password = generatePassword(24, false, /\w/);
        options.sendPassword = true;
    }
    else {
        if(!user.password)
            return callback('User\'s informations not received');
        password = user.password;
    }

    dbConnection(function(db) {
        db.collection('user').findOne({
            email: user.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (res) {
                return callback('user.already_existing');
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
                    } else {
                        user.activated = true;
                    }
                    db.collection('user').insert(user, function(err, elts) {
                        if (err)
                            return callback(err);

                        if (options.sendConfirmation || options.activationLink) {
                            var arguments = {};

                            arguments.firstName = user.firstName;
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
                            }
                        }

                        delete user.password;
                        delete user._id;
                        return callback(null, elts[0], module.exports.encodeToken(elts[0]));
                    });
                });
            });
        });
    });
};

module.exports.signUpConfirm = function(hash, options, callback) {
    if (!hash) {
        return callback('Hash not received');
    }

    // If no options passed
    if (typeof options == 'function') {
        callback = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    dbConnection(function(db) {
        db.collection('user').findAndModify({
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

                if (!res)
                    return callback('Document not found');

                if (options.sendConfirmation) {
                    var arguments = {};
                    arguments.firstName = res.firstName;
                    mailer.mail(res.email, 'signupComplete', 'user', 'fr', arguments);
                }

                delete res.password;
                delete res._id;
                return callback(null, res, module.exports.encodeToken(res));
            }
        );
    });
};

module.exports.resetPassword = function(data, callback) {
    if (!data || !data.email || !data.resetPasswordLink) {
        return callback('Email not received');
    }

    dbConnection(function(db) {
        db.collection('user').findAndModify({
                "email": data.email
            },
            {},
            {
                "$set": {
                    "hashPassword": generatePassword(24, false, /\w/)
                }
            },
            {
                "new": true
            },
            function(err, res) {
                if (err)
                    return callback(err);

                if (!res)
                    return callback('Document not found');

                var arguments = {};
                arguments.firstName = res.firstName;
                if (data.resetPasswordLink.slice(-1) == '/')
                    data.resetPasswordLink = data.resetPasswordLink.substring(0, data.resetPasswordLink.length - 1);
                arguments.url = data.resetPasswordLink + '/' + data.email + '/' + res.hashPassword;
                mailer.mail(res.email, 'resetPassword', 'user', 'fr', arguments);

                return callback();
            }
        );
    });
};

module.exports.resetPasswordConfirm = function(data, callback) {
    if (!data || !data.email || !data.hashPassword ||!data.password) {
        return callback('Infos not received');
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err)
            return callback(err);

        bcrypt.hash(data.password, salt, function (err, hash) {
            if (err)
                return callback(err);

            dbConnection(function (db) {
                db.collection('user').findAndModify({
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

                        if (!res)
                            return callback('Document not found');

                        delete res.password;
                        delete res._id;
                        return callback(null, res, module.exports.encodeToken(res));
                    }
                );
            });
        });
    });
};

module.exports.changePassword = function(data, callback) {
    if (!data || !data.email ||!data.password || !data.newPassword) {
        return callback('Infos not received');
    }

    dbConnection(function(db) {
        db.collection('user').findOne({
            email: data.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback('Account not found');

            comparePassword(data.password, res.password, function(err, isMatch) {
                if (err)
                    return callback(err);
                if (!isMatch)
                    return callback('Password invalid');

                bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                    if (err)
                        return callback(err);

                    bcrypt.hash(data.newPassword, salt, function (err, hash) {
                        if (err)
                            return callback(err);

                        res.password = hash;
                        db.collection('user').save(res, function(err) {
                            if (err)
                                return callback(err);

                            delete res.password;
                            delete res._id;
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
        return callback('User\'s informations not received');
    }

    dbConnection(function(db) {
        db.collection('user').findOne({
            email: user.email
        }, function(err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback('Account not found');
            if (!res.activated)
                return callback('Account not activated');

            comparePassword(user.password, res.password, function(err, isMatch) {
                if (err)
                    return callback(err);
                if (!isMatch)
                    return callback('Password invalid');

                delete res['password'];
                delete res['_id'];
                return callback(null, res, module.exports.encodeToken(res));
            });
        });
    });
};

module.exports.update = function(user, callback) {
    if (!user || !user.email) {
        return callback('User\'s informations not received');
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

    db.collection('user').findAndModify({
            "query": {"email": user.email},
            "update": user,
            "new": true
        },
        function(err, res) {
            if (err)
                return callback(err);

            if (options.sendConfirmation) {
                var arguments = {};

                arguments.firstName = user.firstName;
                if (options.sendPassword) {
                    arguments.password = newPassword;
                }
                mailer.mail(user.email, 'edit', 'user', 'fr', arguments);
            }

            delete user.password;
            delete user._id;
            return callback(null, res, module.exports.encodeToken(res));
        }
    );
};

module.exports.tokenIsValid = function(token, callback) {
    var decodedToken;

    try {
        decodedToken = module.exports.decodeToken(token);
    } catch (err) {
        return callback('Token is invalid');
    }

    if (decodedToken.expires < moment().valueOf())
        return callback('Token is expired');

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
        db.collection('user').find(criteria, selection).toArray(function(err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback('No users');

            return callback(null, res);
        });
    });
};