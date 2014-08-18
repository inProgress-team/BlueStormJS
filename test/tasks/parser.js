var parser = require(__dirname+'/../../src/tasks/parser'),
    taskLoader = require(__dirname+'/../../src/tasks/taskLoader');

var sinon = require('sinon'),
    assert = require('assert');

describe('Parser', function(){
    var params;
    before(function(done) {
        sinon.stub(taskLoader, 'load', function(param, env, cb) {
            params.push(param);
            cb();
        });
        done();
    });

    after(function(done) {
        taskLoader.load.restore();
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
        parser(json, 'dev', function() {
            assert.deepEqual(params, ['A', 'C', 'E', 'G']);
            done();
        });
    });

    it('2 sublevel : should load tasks in good order 1', function(done) {
        params = [];
        var json = [
            [
                "A",
                "B",
                "C"
            ],
            [
                "D"
            ]
        ];
        parser(json, 'dev', function() {
            assert.deepEqual(params, ['A', 'B', 'C', 'D']);
            done();
        });
    });

    it('2 sublevel : should load tasks in good order 2', function(done) {
        params = [];
        var json = [
            [
                "A",
                "C"
            ],
            [
                "D"
            ],
            [
                "B"
            ]
        ];
        parser(json, 'dev', function() {
            assert.deepEqual(params, ['A', 'C', 'D', 'B']);
            done();
        });
    });
});