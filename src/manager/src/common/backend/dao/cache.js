/**
 *
 * Caches for dao
 */

var LRU = require("lru-cache"),
    optionsArtistsCache = {
        max: 10000,
        length: function () { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsTopArtistsCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 // 1 hour
    },
    optionsFullArtistsCache = {
        max: 10000,
        length: function () { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
    ,
    optionsAlbumsCache = {
        max: 10000,
        length: function () { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsLastAddedAlbumsCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 // 1 hour
    },
    optionsTopAlbumsCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 // 1 hour
    },optionsFullAlbumsCache = {
        max: 10000,
        length: function () { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsSongsCache = {
        max: 10000,
        length: function () { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 heurs
    },
    optionsTopSongsCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 // 1 hour
    },
    optionsDailyAlbumsCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 * 24 // 24 hour
    },
    optionsPlaylistsCache = {
        max: 10000,
        length: function (n) { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsTopPlaylistsCache = {
        max: 10000,
        length: function (n) { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsFullPlaylistsCache = {
        max: 10000,
        length: function (n) { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsTopFullPlaylistsCache = {
        max: 10000,
        length: function (n) { return 1},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    },
    optionsSongsFromArtistCache = {
        max: 10000,
        length: function (n) { return n.length},
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    };

module.exports.artistsCache = LRU(optionsArtistsCache);
module.exports.topArtistsCache = LRU(optionsTopArtistsCache);
module.exports.fullArtistsCache = LRU(optionsFullArtistsCache);
module.exports.albumsCache = LRU(optionsAlbumsCache);
module.exports.topAlbumsCache = LRU(optionsTopAlbumsCache);
module.exports.lastAddedAlbumsCache = LRU(optionsLastAddedAlbumsCache);
module.exports.fullAlbumsCache = LRU(optionsFullAlbumsCache);
module.exports.songsCache = LRU(optionsSongsCache);
module.exports.topSongsCache = LRU(optionsTopSongsCache);
module.exports.dailyAlbumsCache = LRU(optionsDailyAlbumsCache);
module.exports.playlistsCache = LRU(optionsPlaylistsCache);
module.exports.topPlaylistsCache = LRU(optionsTopPlaylistsCache);
module.exports.fullPlaylistsCache = LRU(optionsFullPlaylistsCache);
module.exports.topFullPlaylistsCache = LRU(optionsTopFullPlaylistsCache);
module.exports.songsFromArtistCache = LRU(optionsSongsFromArtistCache);

module.exports.resetCache = function(cache) {
    var cache = module.exports[cache];

    if (cache)
        cache.reset();
};

module.exports.remove = function(cache, key) {
    var cache = module.exports[cache];

    if (cache)
        cache.del(key);
};