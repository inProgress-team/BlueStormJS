var builder = require(__dirname+'/../../src/tasks/builder');

var sinon = require('sinon'),
    assert = require('assert');

describe('Builder', function(){
    var params;
    before(function(done) {
        sinon.stub(builder, 'load', function(param, env, cb) {
            params.push(param);
            cb();
        });
        done();
    });

    after(function(done) {
        builder.load.restore();
        done();
    });


    it('1 sublevel : should load tasks in good order 2', function(done) {
        params = [];
        var json = [
            "A",
            "C",
            "E",
            "G"
        ];
        builder.parse(json, 'dev', function() {
            assert.deepEqual(params, ['A', 'C', 'E', 'G']);
            done();
        });
    });

    it('2 sublevel : should load tasks in good order 1', function(done) {
        params = [];
        var json = [
            [
                "1",
                "2",
                "3"
            ],
            [
                "4"
            ]
        ];
        builder.parse(json, 'dev', function() {
            assert.deepEqual(params, ['1', '2', '3', '4']);
            done();
        });
    });

    it('2 sublevel : should load tasks in good order 2', function(done) {
        params = [];
        var json = [
            [
                "AA",
                "CC"
            ],
            [
                "DD"
            ],
            [
                "BB"
            ]
        ];
        builder.parse(json, 'dev', function() {
            assert.deepEqual(params, ['AA', 'CC', 'DD', 'BB']);
            done();
        });
    });
});