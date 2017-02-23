import Pattern from '../../src/models/Pattern';

var assert = require('assert');

describe('Pattern', function() {
    describe('#apply', function() {
        it('should leave target unchanged for empty pattern', function() {
            assert.equal( new Pattern('','').apply('asdf'), 'asdf');
        });

        it('should replace a with b for pattern a->b', function() {
            assert.equal( new Pattern('a','b').apply('asdf'), 'bsdf');
        });

        it('should replace all a and A with b for pattern !/a/i->b', function() {
            assert.equal( new Pattern('!/a/i','b').apply('aAaAsdf'), 'bbbbsdf');
        });

        it('should replace all digits with b for pattern !/[0-9]/->b', function() {
            assert.equal( new Pattern('!/[0-9]/i','b').apply('1234sdf'), 'bbbbsdf');
        });

        it('should replace all a with b and presarves case for pattern !/a/pi->b replaces', function() {
            assert.equal( new Pattern('!/a/pi','b').apply('AaaaA'), 'BbbbB');
        });

        it('should replace all !a with b for pattern \\!a->b first letter can be quoted.', function() {
            assert.equal( new Pattern('\\!a','b').apply('!a!a!a'), 'bbb');
        });

        it('should leave target untouched for undefined commands', function() {
            assert.equal( new Pattern('!a','b').apply('asdf'), 'asdf');
        });

        it('it should replace and preserve cases for pattern /CaseSensetive/pi->ItWorks', function() {
            assert.equal( new Pattern('!/CaseSensetive/pi','ItWorks').apply('This is CaseSensetive'), 'This is ItWorks');
            assert.equal( new Pattern('!/CaseSensetive/pi','ItWorks').apply('This is CASESENSETIVE'), 'This is ITWORKS');
            assert.equal( new Pattern('!/CaseSensetive/pi','ItWorks').apply('This is casesensetive'), 'This is itworks');
        });
    });
});
