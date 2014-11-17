// Includes
var dbConnection = require('bluestorm').db;

function Element() {
}

// Function to create an element
Element.prototype.createElement = function createElement(element, cb) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName);
        var model = new Model();
        for(var i in element) {
            if(element.hasOwnProperty(i))
                model[i] = element[i];
        }

        // Save in DB
        model.save(function(err, element) {
            cb(err, element);
        });
    });
};

//  Fonction to get an element from database
Element.prototype.getElementFromDb = function(id, callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName),
            hiddenFields = {'_id': 0, '__v': 0};

        Model.findOne({id: id}).select(hiddenFields).exec(function (err, element) {
            if (err)
                return callback(err);

            callback(null, element);
        });
    });
};

// Function to get an element from cache
Element.prototype.getElementFromCache = function(id, cb) {
    cb(null, this.cache.get(id));
};

// Function to get an element
Element.prototype.getElement = function(id, cb) {
    var $this = this,
        cache = $this.cache;

    $this.getElementFromCache(id, function(err, element) {
        // check if element is in cache
        if(element) {
            cb(err, element);
        }
        // else get element from database and put it in cache
        else
        {
            $this.getElementFromDb(id, function(err, element) {
                cache.set(id, element);
                cb(err, element);
            });
        }
    });
};

// Function to edit a field
Element.prototype.setField = function(id, field, value, callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName);
        var cache = this.cache;
        Model.findOne({ id: id }, function (err, e) {
            if (err)
                return callback(err);

            e[field] = value;

            // set element in cache
            if (cache)
                cache.set(id, e);

            // set element in DB
            e.save(function (err, elt) {
                if (err)
                    return callback(err);

                return callback(null, elt);
            });
        });
    });
};

// Function to edit an element
Element.prototype.setElement = function(id, fields, callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName);
        var cache = this.cache;

        Model.findOne({ id: id }, function (err, e) {
            if (err)
                return callback(err);

            if (!e)
                return callback();

            for (var i in fields) {
                if (fields.hasOwnProperty(i)) {
                    e[i] = fields[i];
                }
            }

            // set element in cache
            if (cache)
                cache.set(id, e);

            // set element in DB
            e.save(function (err, elt) {
                if (err)
                    return callback(err);

                return callback(null, elt);
            });
        });
    });
};

// Function to delete an element
Element.prototype.deleteElement = function(id, callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        // Delete from DB
        var Model = db.model(modelName);
        var cache = this.cache;
        Model.remove({ id: id }, function (err) {
            if (err)
                return callback(err);
        });

        // Delete from cache
        if (cache)
            cache.del(id);

        return callback();
    });
};

// Function to get elements from db (search one thing in differents fields or differents things in differents fields)
Element.prototype.getElementsFromDb = function(params, callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName),
            fields = {},
            options = {},
            hiddenFields = {};

        // if params.search then params.search contains value to find and params.fields contains fields to check if there are value
        // used to find one value in one or differents fields
        if (params.search) {
            fields.$or = [];
            for (var i in params.fields) {
                var exp = {};
                if (params.fields.hasOwnProperty(i)) {
                    if (typeof params.search == 'string')
                        exp[params.fields[i]] = new RegExp(params.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
                    else
                        exp[params.fields[i]] = params.search;
                    fields.$or.push(exp);
                }
            }
        }
        // if params.fields, it's a specific search
        else if (params.fields) {
            fields = params.fields;
        }
        if (params.hiddenFields) {
            hiddenFields = params.hiddenFields;
        }
        if (params.options) {
            options = params.options;
        }

        Model.find(fields).select(hiddenFields).setOptions(options).exec(function (err, elements) {
            callback(err, elements);
        });
    });
};

// Function to get elements from cache
Element.prototype.getElementsFromCache = function(cache, key, cb) {
    cb(null, cache.get(key));
};

// Function to get elements
Element.prototype.getElements = function(params, cb) {
    var $this = this,
        cache = params.cache,
        key = params.keyCache,
        $params = {};
    $params.options = {};

    for(var i in params)
        if(params.hasOwnProperty(i))
            $params[i] = params[i];
    $params.options.skip = params.begin;

    if(params.sort)
        $params.options.sort = params.sort;

    if(params.limit)
        $params.options.limit = params.limit;

    if(params.search) {
        $params.search = params.search;
        key += '-' + params.search;
    }
    key += params.begin;


    $this.getElementsFromCache(cache, key, function(err, element) {
        // check if element is in cache


        if(element) {
            cb(err, element);
        }
        // else get element from database and put it in cache
        else
        {
            $this.getElementsFromDb($params, function(err, element) {
                cache.set(key, element);
                cb(err, element);
            });
        }
    });
};

// Function to get top elements
Element.prototype.getTopElements = function(params, cb) {
    params.cache = this.topElementsCache;
    params.keyCache = 'tops';
    for(var i in this.topElements)
        if(this.topElements.hasOwnProperty(i))
            params[i] = this.topElements[i];

    // if there is no query, we delete fields to check values
    if (!(params.search))
        delete params.fields;
    this.getElements(params, cb);
};

// Function to get last added elements
Element.prototype.getLastAddedElements = function(params, cb) {
    params.cache = this.lastAddedElementsCache;
    params.keyCache = 'lastAddedElements';
    this.getElements(params, cb);
};

// Function to search elements from db
Element.prototype.searchElementsFromDb = function(params, callback) {
    var $params = {};

    for(var i in this.research)
        if(this.research.hasOwnProperty(i))
            $params[i] = this.research[i];

    if(params.search)
        $params.search = params.search;

    if(params.limit)
        $params.options.limit = params.limit;

    this.getElementsFromDb($params, callback);
};

// Function to count elements from db
Element.prototype.count = function(callback) {
    var modelName = this.modelName;

    dbConnection(function(db) {
        var Model = db.model(modelName);

        Model.count({}, function (err, count) {
            return callback(err, count);
        });
    });
};

module.exports = Element;