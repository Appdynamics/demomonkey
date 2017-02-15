import Configuration from '../../src/models/Configuration';

var assert = require('assert');
var fs = require('fs');

var complexConfiguration;

before(function(done){
    fs.readFile('./examples/test.mnky', 'utf8', function(err, data) {
      if (err) throw err;
      complexConfiguration = new Configuration(data);
      done();
    });
});



    var emptyConfiguration = new Configuration("");
    var simpleConfiguration = new Configuration("a = b")
    var configurationWithOption = new Configuration("@a = b")

    describe('TestConfiguration', function() {

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
                assert.deepEqual(complexConfiguration.getOptions(), {include: ["a","b"]})
            })
        });
    });
