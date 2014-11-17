var request = require('request'),
    apiKey = '4c68e41f24992df0b2c5d911ac0b0560',//TODOSONGPEEK NCONF
    prefix = 'http://ws.audioscrobbler.com/2.0/?format=json&api_key='+apiKey+'&',
    _ = require('underscore'),
    querystring = require('querystring');


module.exports = {
    apiCall: function(method, data, cb) {

        var suffix = '';
        if(typeof(data)!='function') {
            _.each(data, function(value, key) {
                if (typeof value === 'string')
                    suffix+='&'+key+'='+querystring.escape(value);
                else
                    suffix+='&'+key+'='+value;
            });
        }

        var callback = cb;
        if(method === 'artist.getinfo') {
            callback = function(err, artist) {
                var a = {},
                    priority = 0,
                    prioritySmall = 1,
                    priorityMedium = 2,
                    priorityLarge = 3,
                    priorityExtraLarge = 4;
                a.name = artist.artist.name;
                a.url = artist.artist.url;
                var tags = [];
                if (artist.artist.tags && typeof artist.artist.tags == 'object') {
                    if (Array.isArray(artist.artist.tags.tag)) {
                        _.forEach(artist.artist.tags.tag, function (tag) {
                            tags.push(tag.name);
                        });
                    }
                    else {
                        tags.push(artist.artist.tags.tag.name);
                    }
                }
                artistTags = tags;
                a.tags = tags;
                if(artist.artist.bio.yearformed)
                    a.yearFormed = artist.artist.bio.yearformed;
                if(artist.artist.image) {
                    _.forEach(artist.artist.image, function(image) {
                        // Cover
                        if(image.size == 'small' && prioritySmall > priority) {
                            a.smallCover = image['#text'];
                            priority = prioritySmall;
                        }
                        else if(image.size == 'medium' && priorityMedium > priority) {
                            a.smallCover = image['#text'];
                            priority = priorityMedium;
                        }
                        else if(image.size == 'large' && priorityLarge > priority) {
                            a.smallCover = image['#text'];
                            priority = priorityLarge;
                        }
                        else if(image.size == 'extralarge' && priorityExtraLarge > priority) {
                            a.smallCover = image['#text'];
                            priority = priorityExtraLarge;
                        }
                        // Mega Cover
                        if(image.size == 'mega') {
                            a.cover = image['#text'];
                        }

                    });
                }
                cb(err, a);
            };
        }
        if(method === 'album.getinfo') {
            callback = function(err, album) {
                var a = {},
                    prioritySmallCover = 0,
                    priorityCover = 0,
                    prioritySmall = 1,
                    priorityMedium = 2,
                    priorityLarge = 3,
                    priorityExtraLarge = 4;
                a.name = album.album.name;
                a.releaseDate = album.album.releasedate;
                a.url = album.album.url;
                var tags = [];
                if(Array.isArray(album.album.toptags.tag)) {
                    _.forEach(album.album.toptags.tag, function (tag) {
                        tags.push(tag.name);
                    });
                }
                else
                {
                    if(album.album.toptags.tag)
                        tags.push(album.album.toptags.tag.name);
                }
                a.tags = tags;
                a.songs = [];
                _.forEach(album.album.tracks.track, function(track) {
                    if (track.name) {
                        var elt = {};
                        elt.name = track.name;
                        if (track.duration)
                            elt.length = parseInt(track.duration);
                        a.songs.push(elt);
                    }
                });
                _.forEach(album.album.image, function(image) {
                    // Small cover
                    if(image.size == 'small' && prioritySmall > prioritySmallCover) {
                        a.smallCover = image['#text'];
                        prioritySmallCover = prioritySmall;
                    }
                    else if(image.size == 'medium' && priorityMedium > prioritySmallCover) {
                        a.smallCover = image['#text'];
                        prioritySmallCover = priorityMedium;
                    }
                    // Cover
                    if(image.size == 'medium' && priorityMedium > priorityCover) {
                        a.cover = image['#text'];
                        priorityCover = priorityMedium;
                    }
                    else if(image.size == 'large' && priorityLarge > priorityCover) {
                        a.cover = image['#text'];
                        priorityCover = priorityLarge;
                    }
                    else if(image.size == 'extralarge' && priorityExtraLarge > priorityCover) {
                        a.cover = image['#text'];
                        priorityCover = priorityExtraLarge;
                    }
                });
                if(album.album.releasedate && album.album.releasedate.trim() != '')
                    albumReleaseDate = album.album.releasedate.trim();
                else
                    albumReleaseDate = '';
                cb(err, a);
            };
        }
        if(method === 'tag.gettopalbums') {
            callback = function(err, tops) {
                var res = [];

                if (!Array.isArray(tops.topalbums.album)) {
                    tops.topalbums.album = [tops.topalbums.album];
                }

                for (var top in tops.topalbums.album) {
                    var elt = {};
                    elt.name = tops.topalbums.album[top].name;
                    tops.topalbums.album[top].image.forEach(function(image) {
                        if (image.size = 'medium')
                            elt.cover = image['#text'];
                    });
                    elt.artist = {};
                    elt.artist.name = tops.topalbums.album[top].artist.name;
                    if (elt.name != '[non-album tracks]')
                        res.push(elt);
                }

                cb(err, res);
            };
        }
        if(method === 'tag.gettoptags') {
            callback = function(err, tags) {
                var res = [];

                for (var tag in tags.toptags.tag) {
                    res.push(
                        tags.toptags.tag[tag].name
                    );
                }
                cb(err, res);
            };
        }
        if(method === 'artist.search') {
            callback = function(err, artists) {
                var res = [];

                for (var artist in artists.results.artistmatches.artist) {
                    res.push(
                        artists.results.artistmatches.artist[artist].name
                    );
                }
                cb(err, res);
            };
        }
        if(method === 'album.search') {
            callback = function(err, albums) {
                var res = [];
                if (albums.results['opensearch:totalResults'] != 0) {
                    if (!Array.isArray(albums.results.albummatches.album)) {
                        albums.results.albummatches.album = [albums.results.albummatches.album];
                    }
                    for (var album in albums.results.albummatches.album) {
                        var elt = {};
                        elt.name = albums.results.albummatches.album[album].name;
                        albums.results.albummatches.album[album].image.forEach(function(image) {
                            if (image.size = 'medium')
                                elt.cover = image['#text'];
                        });
                        elt.artist = {};
                        elt.artist.name = albums.results.albummatches.album[album].artist;
                        if (elt.name != '[non-album tracks]')
                            res.push(elt);
                    }
                    cb(null, res);
                }
                else
                    cb(null, null);

            };
        }
        if(method === 'artist.gettopalbums') {
            callback = function(err, albums) {
                var res = [];

                if (albums.topalbums.album) {
                    if (!Array.isArray(albums.topalbums.album)) {
                        albums.topalbums.album = [albums.topalbums.album];
                    }
                    for (var album in albums.topalbums.album) {
                        var elt = {};
                        elt.name = albums.topalbums.album[album].name;
                        albums.topalbums.album[album].image.forEach(function(image) {
                            if (image.size = 'medium')
                                elt.cover = image['#text'];
                        });
                        elt.artist = {};
                        elt.artist.name = albums.topalbums.album[album].name;
                        if (elt.name != '[non-album tracks]')
                            res.push(elt);
                    }
                    cb(null, res);
                }
                else
                    cb(null, null);
            };
        }
        if(method === 'geo.getevents') {
            callback = function(err, events) {
                var res = [];
                if (!Array.isArray(events.events.event)) {
                    events.events.event = [events.events.event];
                }
                events.events.event.forEach(function(event) {
                    if (event && event.venue && event.venue.location && event.venue.location && event.venue.location['geo:point'] && event.venue.location['geo:point']['geo:lat']) {
                        elt = {};
                        elt.name = event.title;
                        event.image.forEach(function (image) {
                            if (image.size = 'medium')
                                elt.cover = image['#text'];
                        });
                        if (event.startDate)
                            elt.startDate = event.startDate;
                        elt.url = event.url;
                        if (event.website)
                            elt.website = event.website;
                        elt.tags = [];
                        if (event.tags && Array.isArray(event.tags.tag)) {
                            event.tags.tag.forEach(function (tag) {
                                elt.tags.push(tag);
                            });
                        }
                        else {
                            if (event.tags)
                                if (event.tags.tag)
                                    elt.tags.push(event.tags.tag);
                        }
                        elt.artists = [];
                        if (event.artists && event.artists.artist) {
                            if (!Array.isArray(event.artists.artist)) {
                                event.artists.artist = [event.artists.artist];
                            }
                            event.artists.artist.forEach(function(artist) {
                                elt.artists.push({name: artist});
                            });
                        }
                        elt.venue = {};
                        if (event.venue && event.venue.name)
                            elt.venue.name = event.venue.name;
                        if (event.venue && event.venue.url)
                            elt.venue.url = event.venue.url;
                        if (event.venue && event.venue.website)
                            elt.venue.website = event.venue.website;
                        event.venue.image.forEach(function (image) {
                            if (image.size = 'medium')
                                elt.venue.image = image['#text'];
                        });
                        elt.venue.location = {};
                        if (event.venue.location && event.venue.location['geo:point']) {
                            elt.venue.location.geo = [event.venue.location['geo:point']['geo:long'], event.venue.location['geo:point']['geo:lat']];
                        }
                        if (event.venue.location && event.venue.location.city)
                            elt.venue.location.city = event.venue.location.city;
                        if (event.venue.location && event.venue.location.country)
                            elt.venue.location.country = event.venue.location.country;
                        if (event.venue.location && event.venue.location.street)
                            elt.venue.location.street = event.venue.location.street;
                        if (event.venue.location && event.venue.location.postalcode)
                            elt.venue.location.postalCode = event.venue.location.postalcode;
                        res.push(elt);
                    }
                });
                cb(null, res);
            };
        }
        request(prefix + 'method=' + method + suffix, function (err, response, body) {
            if (typeof(data) == 'function') {
                data(err, body);
            }
            else {
                var json = JSON.parse(body);
                if (json.error) {
                    return cb(json.message);
                }
                else {
                    callback(err, JSON.parse(body));
                }
            }

        });
    }
};