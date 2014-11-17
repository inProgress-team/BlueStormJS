var async = require('async'),
    slug = require('slug'),
    dbConnection = require('bluestorm').db;

module.exports.generate = function(name, modelName, fieldName, callback) {
    var done = false,
        baseId = slug(name).toLowerCase(),
        id = baseId,
        i = 0;

    if (typeof fieldName == 'function') {
        callback = fieldName;
        fieldName = 'id';
    }

    /**
     * While id is not unique
     */
    async.doWhilst(
        function(callback) {
            var search = {};
            if(fieldName !== undefined) {
                search[fieldName] = id;
            } else {
                search = {"id": id};
            }
            dbConnection(function(db) {
                db.model(modelName).findOne(search, function(err, res) {
                    if (err)
                        return callback(err);

                    if (!res) {
                        done = true;
                    } else {
                        i++;
                        id = baseId+i;
                    }
                    return callback();
                });
            });
        },
        function() {
            return !done;
        },
        function(err) {
            if (err) {
                if (callback)
                    return callback(err);
                throw err;
            }
            if (callback)
                return callback(null, id);
        }
    );
};


