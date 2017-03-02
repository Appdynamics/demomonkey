import Monkey from '../../src/models/Monkey';
import Configuration from '../../src/models/Configuration';

var assert = require('assert');

var intervalId = 0;

var node = {"data": "monkey-demo"};

var scope = {
    setInterval: function(callback, interval) {
        callback();
        return intervalId++;
    },
    clearInterval: function(id) {
        intervalId--;
    },
    location: {
        href: 'https://monkey-demo.appdynamics.com/controller'
    },
    document: {
        title: "demomonkeydemo",
        evaluate: function() {
            return {
                snapshotItem: function(i) {
                    if (i === 0) {
                        return node;
                    }
                    return null;
                }
            }
        }
    }
}

describe('Monkey', function() {
    describe('#run', function() {
        it('should return an interval id', function() {
            var monkey = new Monkey([], scope);
            assert.equal(0, monkey.run(new Configuration()));
            assert.equal(1, monkey.run(new Configuration()));
        });
    });

    describe('#apply', function() {
        it('should change the found text nodes', function() {
            var monkey = new Monkey([], scope);
            monkey.apply(new Configuration("monkey = ape"))
            assert.equal(node.data, "ape-demo");
            assert.equal(scope.document.title, "demoapedemo");
        });
    })

    describe('#runAll', function() {
        it('should return an array of interval ids', function() {
            intervalId = 0;
            var monkey = new Monkey([
                {
                    content: '',
                    name: 'a'
                }, {
                    content: '',
                    name: 'b'
                }
            ], scope);
            assert.deepEqual([
                0, 1
            ], monkey.runAll(''));

            // Check also for matching excludes and includes
            intervalId = 0;
            monkey = new Monkey([
                {
                    content: '@exclude = monkey-demo',
                    name: 'a'
                }, {
                    content: '@include = monkey-demo',
                    name: 'b'
                }
            ], scope);
            assert.deepEqual([0], monkey.runAll(''));
        });
    });
    describe('#stop', function() {
        it('should clear all running intervals', function() {
            intervalId = 0;
            var monkey = new Monkey([
                {
                    content: '',
                    name: 'a'
                }, {
                    content: '',
                    name: 'b'
                }
            ], scope);
            monkey.start();
            assert.equal(2, intervalId);
            monkey.stop();
            assert.equal(0, intervalId);
        });
    });
});
