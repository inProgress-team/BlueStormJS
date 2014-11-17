var request = require('request'),
    async = require('async'),
    _ = require('underscore'),
    querystring = require('querystring');

var rating = require(__dirname + '/../rating');
//TODOSONGPEEK NCONF THIS

var apiKey = 'AIzaSyCeKrpRu-yNVUJQumWiOkPCKu5O0rkc0B0';

module.exports.get = function(type, resource, params, callback) {
    var url = "https://www.googleapis.com/"+type+"/v3/"+resource;
    params.key = apiKey;
    // Send the request
    request.get({url: url, qs: params}, function(err, resp, res) {
        if(err) return callback(err);

        callback(null, JSON.parse(res));
    });
};

module.exports.getUser = function(accessToken, callback) {
    module.exports.get('oauth2', 'userinfo', {
        access_token: accessToken
    }, callback);
    /*var url = "https://www.googleapis.com/oauth2/v3/userinfo";
     var params = {
     access_token: accessToken
     };
     // Send the request
     request.get({url: url, qs: params}, function(err, resp, user) {
     if(err) return callback(err);

     callback(null, JSON.parse(user));
     });*/
};

var convertTime = function(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
};

module.exports.searchSongs = function(params, callback) {

    var query = params.query,
        nbResults = params.count,
        isForContribution = false,
        suggestion;

    if (params.isForContribution)
        isForContribution = true;
    /*****
     *
     *
     *
     *
     * YOUTUBE
     * @type {null}
     */
    var aux = null,
        youtubeSongs = [];
    async.series([
        function(callback) {
            if (isForContribution) {
                request('http://gdata.youtube.com/feeds/api/videos?q=' + querystring.escape(query) + '&alt=json', function (error, response, body) {
                    if (error)
                        return callback('echec http request on Youtube');
                    if (response.statusCode != 200)
                        return callback('echec http request on Youtube');
                    // Check if not XML
                    // TODOSONGPEEK
                    if (body[0] != '<') {
                        var json = JSON.parse(body);
                        if (json.hasOwnProperty('feed')) {
                            if (json.feed.hasOwnProperty('link')) {
                                for (var i in json.feed.link) {
                                    if (json.feed.link.hasOwnProperty(i))
                                        if (json.feed.link[i].hasOwnProperty('rel') && json.feed.link[i].rel.indexOf('spellcorrection') > -1) {
                                            query = json.feed.link[i].title;
                                            suggestion = json.feed.link[i].title;
                                            return callback();
                                        }
                                }
                            }
                        }
                    }
                    return callback();
                });
            }
            else
                return callback();
        },
        function(callback) {
            module.exports.get('youtube', 'search', {
                part: 'id,snippet',
                q: query,
                maxResults: nbResults+1,
                fields: 'items/id,pageInfo',
                videoEmbeddable: true,
                regionCode: 'FR',//TODOSONGPEEK modify this
                type: 'video',
                sort: 'rating',
                videoCategoryId: 10
            }, function (err, res) {
                if(res.error) return console.log(res.error);
                if(err) return console.log(err);
                aux = res;
                callback();
            });
        },
        function(callback) {
            var ids = '';
            _.each(aux.items, function(item) {
                ids+=item.id.videoId+',';
            });
            ids = ids.substring(0, ids.length-1);

            module.exports.get('youtube', 'videos', {
                part: 'id,snippet,contentDetails,statistics',
                id: ids,
                fields: 'items(contentDetails,id,snippet,statistics)'
            }, function (err, res) {
                if(res.error) return console.log(res.error);
                if(err) return console.log(err);


                _.each(res.items, function(song) {
                    var likes = parseInt(song.statistics.likeCount,10),
                        dislikes = parseInt(song.statistics.dislikeCount,10),
                        percent = parseInt(100*likes/(likes + dislikes),10);
                    var s = {
                        name: song.snippet.title,
                        listened: song.statistics.viewCount,
                        cover: 'http://i1.ytimg.com/vi/'+song.id+'/hqdefault.jpg',
                        medias: [{
                            type: 'youtube',
                            id: song.id,
                            length: convertTime(song.contentDetails.duration),
                            rating: rating.percentToInteger(percent, 5)
                        }],
                        author: song.snippet.channelTitle
                    };
                    if (isForContribution)
                        s.description = song.snippet.description;
                    youtubeSongs.push(s);
                });
                /**
                 * Youtube done
                 */
                callback();
            });
        },
        function() {
            if (isForContribution) {
                res = {};
                res.query = query;
                res.songs = youtubeSongs;
                if (suggestion)
                    res.suggestion = suggestion;
                return callback(null, res);
            }
            else
                return callback(null, youtubeSongs);
        }
    ]);
};

var getSongsOfPlaylistRec = function(id, nextPage, songs, callback) {
    module.exports.get('youtube', 'playlistItems', {
        part: 'snippet',
        playlistId: id,
        pageToken: nextPage
    }, function (err, res) {
        if (err)
            return callback(err);

        if (res.error)
            return callback(res.error.message);

        res.items.forEach(function(song) {
            if (song.snippet.thumbnails)
                songs.push({"medias": [{"id": song.snippet.resourceId.videoId, "type": 'youtube'}], "name": song.snippet.title, "cover": song.snippet.thumbnails.default.url});
        });

        if (err)
            return callback(err);

        if (res.nextPageToken)
            getSongsOfPlaylistRec(id, res.nextPageToken, songs, callback);
        else
            return callback(null, songs);
    });
};

module.exports.getSongsOfPlaylist = function(id, callback) {
    getSongsOfPlaylistRec(id, undefined, [], function(err, songs) {
        if (err)
            return callback(err);

        var ids = '';
        _.each(songs, function(song) {
            ids += song.medias[0].id +',';
        });
        ids = ids.substring(0, ids.length-1);

        module.exports.get('youtube', 'videos', {
            part: 'contentDetails',
            id: ids,
            fields: 'items(contentDetails)'
        }, function (err, res) {
            if (err)
                return callback(err);
            if(res.error)
                return callback(res.error.message);

            var i=0;
            _.each(res.items, function(song) {
                songs[i].medias[0].length = convertTime(song.contentDetails.duration);
                i++;
            });

            module.exports.get('youtube', 'playlists', {
                part: 'snippet',
                id: id
            }, function (err, res) {
                if (err)
                    return callback(err);

                if (res.error)
                    return callback(res.error.message);

                return callback(null, {"name": res.items[0].snippet.title, "songs": songs});
            });
        });
    });
};