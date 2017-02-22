import MatchRule from '../../src/models/MatchRule';

var assert = require('assert');

describe('MatchRule', function() {
    describe('#test', function() {
        it('should always return true for empty rules', function() {
            assert.equal( new MatchRule([],[]).test('asdf') , true);
        });

        it('should return false if no include rule matches', function() {
            assert.equal( new MatchRule(['/asdx/'],[]).test('asdf'), false);
        });

        it('should return true if include rule matches', function() {
            assert.equal( new MatchRule(['/as/'],[]).test('asdf'), true);
        });

        it('should return true if no exclude rule matches', function() {
            assert.equal( new MatchRule([],['/asdx/']).test('asdf'), true);
        });

        it('should return false if exclude rule matches', function() {
            assert.equal( new MatchRule([],['/df/']).test('asdf'), false);
        });

        it('should return false if include and exclude rule match', function() {
            assert.equal( new MatchRule(['/as/'],['/df/']).test('asdf'), false);
        });
    });
});
