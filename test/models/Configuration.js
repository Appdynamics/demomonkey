import Configuration from '../../src/models/Configuration';

var assert = require('assert');
var fs = require('fs');

var complexConfiguration;

before(function(done) {
    fs.readFile('./examples/test.mnky', 'utf8', function(err, data) {
        if (err)
            throw err;
        complexConfiguration = new Configuration(data);
        done();
    });
});

var emptyConfiguration = new Configuration("");
var simpleConfiguration = new Configuration("a = b")
var configurationWithOption = new Configuration("@a = b")
var configurationWithInclude = new Configuration("@include = /www/")
var configurationWithVariable = new Configuration("$a = b")
var configurationWithImport = new Configuration("+Cities")

describe('Configuration', function() {

    describe('#getVariables', function() {
        it('should return empty array when an empty ini was provided', function() {
            assert.deepEqual(emptyConfiguration.getVariables(), []);
        });
        it('should return empty object when no variable is defined', function() {
            assert.deepEqual(simpleConfiguration.getVariables(), []);
        });
        it('ini $a = b should return array with one variable set', function() {
            assert.deepEqual(configurationWithVariable.getVariables(), [
                {
                    name: 'a',
                    placeholder: 'b',
                    description: ''
                }
            ]);
        });
        it('complex ini should return object 2 variables', function() {
            assert.deepEqual(complexConfiguration.getVariables(), [
                {
                    name: 'x',
                    placeholder: '1',
                    description: ''
                }, {
                    name: 'y',
                    placeholder: '2',
                    description: 'Set y'
                }
            ])
        })
    });

    describe('#apply', function() {

        it('empty configuration should return untouched node', function() {
            var node = {
                value: 'a'
            };
            emptyConfiguration.apply(node)
            assert.equal(node.value, 'a');
        });

        it("configuration with pattern ['a', 'b'] should replace node.value from a to b", function() {
            var node = {
                value: 'a'
            };
            simpleConfiguration.apply(node);
            assert.equal(node.value, 'b');
        });

        it('configuration with no matching pattern should return untouched node', function() {
            var node = {
                value: 'x'
            };
            simpleConfiguration.apply(node);
            assert.equal(node.value, 'x');
        });

        it('should apply patterns from imported configurations', function() {
            var node = {
                value: 'a'
            };

            var repository = {
              getByName: function(name) {
                return simpleConfiguration;
              }
            };

            (new Configuration('+other',repository)).apply(node);
            assert.equal(node.value, 'b');
        })
    });

    describe('#isEnabledForUrl', function() {
        it('should return true for empty rules', function() {
            assert.equal(simpleConfiguration.isEnabledForUrl('http://www.example.com'), true)
        });
    });

    describe('#isEnabledForUrl', function() {
        it('should return true for matching include and false for mismatch', function() {

            assert.deepEqual(configurationWithInclude.getOptions(), {include: ["/www/"]});

            assert.equal(configurationWithInclude.isEnabledForUrl('http://www.example.com'), true)
            assert.equal(configurationWithInclude.isEnabledForUrl('http://example.com'), false)
        });
    });

    describe('#getImports', function() {
        it('should return empty array when an empty ini was provided', function() {
            assert.deepEqual(emptyConfiguration.getImports(), []);
        });
        it('should return empty array when no import is set', function() {
            assert.deepEqual(simpleConfiguration.getImports(), []);
        });
        it('ini +Cities should return array with one import', function() {
            assert.deepEqual(configurationWithImport.getImports(), ['Cities']);
        });
        it('complex ini should return object with one import', function() {
            assert.deepEqual(complexConfiguration.getImports(), ['A'])
        })
    });

    describe('#getOptions', function() {
        it('should return empty object when an empty ini was provided', function() {
            assert.deepEqual(emptyConfiguration.getOptions(), {});
        });
        it('should return empty object when no option is set', function() {
            assert.deepEqual(simpleConfiguration.getOptions(), {});
        });
        it('ini @a = b should return object with one option set', function() {
            assert.deepEqual(configurationWithOption.getOptions(), {a: ["b"]});
        });
        it('complex ini should return object with include and exclude rules', function() {
            assert.deepEqual(complexConfiguration.getOptions(), {
                include: ["a", "b"]
            })
        })
    });
});
