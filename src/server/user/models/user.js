var dbConnection = require(__dirname + '/../../../../db'),
    logger = require(__dirname + '/../../../logger/logger'),
    bcrypt = require('bcrypt'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    generatePassword = require('password-generator'),
    async = require('async'),
    fs = require('fs'),
    mailer = require(__dirname + '/../../../email/mailer');

var ROLES_CONFIG_PATH = process.cwd() + '/config/roles.json',
    USER_CONFIG_PATH = process.cwd() + '/config/user.json';

var roles = require(ROLES_CONFIG_PATH);

var SALT_WORK_FACTOR = 10,
    SECRET_TOKEN;

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

var encodeToken = function(user) {
    var expires = moment().add(1, 'months').valueOf();
    return jwt.encode(
        {
            user: user,
            expires: expires
        },
        SECRET_TOKEN);
};

var decodeToken = function(token) {
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
        password = generatePassword(12, false);
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
                return callback('user_already_existing');
            }

            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err)
                    return next(err);

                bcrypt.hash(password, salt, function(err, hash) {
                    if (err)
                        return next(err);

                    user.password = hash;
                    db.collection('user').insert(user, function(err, elts) {
                        if (err)
                            return callback(err);

                        if (options.sendConfirmation) {
                            var arguments = {};

                            arguments.firstName = user.firstName;
                            if (options.sendPassword) {
                                arguments.password = password;
                            }
                            mailer.mail(user.email, 'signupComplete', 'user', 'fr', arguments);
                        }

                        delete user.password;
                        delete user._id;
                        return callback(null, elts[0], encodeToken(elts[0]));
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
                return callback('Email or password invalid');

            comparePassword(user.password, res.password, function(err, isMatch) {
                if (err)
                    return callback(err);
                if (!isMatch)
                    return callback('Email or password invalid');

                delete res['password'];
                return callback(null, res, encodeToken(res));
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
            return callback(null, res, encodeToken(res));
        }
    );
};

module.exports.tokenIsValid = function(token, callback) {
    var decodedToken;

    try {
        decodedToken = decodeToken(token);
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