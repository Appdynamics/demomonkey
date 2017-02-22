import Pattern from '../../src/models/Pattern';

var assert = require('assert');

describe('Pattern', function() {
    describe('#apply', function() {
        it('empty pattern leaves target untouched', function() {
            assert.equal( new Pattern('','').apply('asdf'), 'asdf');
        });

        it('pattern a->b replaces a with b', function() {
            assert.equal( new Pattern('a','b').apply('asdf'), 'bsdf');
        });

        it('pattern /a/i->b replaces all a and A with b', function() {
            assert.equal( new Pattern('/a/i','b').apply('aAaAsdf'), 'bbbbsdf');
        });

        it('pattern /[0-9]/->b replaces all digitis with b', function() {
            assert.equal( new Pattern('/[0-9]/i','b').apply('1234sdf'), 'bbbbsdf');
        });

        it('pattern /a/pi->b replaces all a with b and presarves case', function() {
            assert.equal( new Pattern('/a/pi','b').apply('AaaaA'), 'BbbbB');
        });

        it('pattern /CaseSensetive/pi->ItWorks replaces and presarves case', function() {
            assert.equal( new Pattern('/CaseSensetive/pi','ItWorks').apply('This is CaseSensetive'), 'This is ItWorks');
            assert.equal( new Pattern('/CaseSensetive/pi','ItWorks').apply('This is CASESENSETIVE'), 'This is ITWORKS');
            assert.equal( new Pattern('/CaseSensetive/pi','ItWorks').apply('This is casesensetive'), 'This is itworks');
        });
    });
});
