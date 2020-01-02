import MatchRule from '../../src/models/MatchRule'
import assert from 'assert'

describe('MatchRule', function () {
  describe('#test', function () {
    it('should always return true for empty rules', function () {
      assert.strictEqual(new MatchRule([], []).test('asdf'), true)
    })

    it('should always return true for undefined rules', function () {
      var options = {}
      assert.strictEqual(new MatchRule(options.includes, options.excludes).test('asdf'), true)
    })

    it('should return false if no include rule matches', function () {
      assert.strictEqual(new MatchRule(['/asdx/'], []).test('asdf'), false)
    })

    it('should return true if include rule matches', function () {
      assert.strictEqual(new MatchRule(['/as/'], []).test('asdf'), true)
    })

    it('should return true if no exclude rule matches', function () {
      assert.strictEqual(new MatchRule([], ['/asdx/']).test('asdf'), true)
    })

    it('should return false if exclude rule matches', function () {
      assert.strictEqual(new MatchRule([], ['/df/']).test('asdf'), false)
    })

    it('should return false if include and exclude rule match', function () {
      assert.strictEqual(new MatchRule(['/as/'], ['/df/']).test('asdf'), false)
    })

    it('should return false if include and exclude rule match', function () {
      assert.strictEqual(new MatchRule(['/^https?:\\/\\/.*appdynamics\\.com/.*$/'], []).test(
        'http://demo2.appdynamics.com/controller/#/location=ANALYTICS_ADQL_SEARCH&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15&searchId=2'
      ), true)
    })

    it('should return false if regex is invalid', function () {
      assert.strictEqual(new MatchRule(['/??/']).test('asdf'), false)
    })

    it('should do a simple includes check for a non-regex', function () {
      assert.strictEqual(new MatchRule(['te?st']).test('te?st'), true)
    })
  })
})
