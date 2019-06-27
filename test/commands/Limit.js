import Limit from '../../src/commands/Limit'
import SearchAndReplace from '../../src/commands/SearchAndReplace'
import assert from 'assert'

describe('Limit', function () {
  describe('#apply', function () {
    let node1 = {
      value: 'search'
    }
    let node2 = {
      value: 'search'
    }
    it('limits the application of an other command', function () {
      const limit = new Limit(new SearchAndReplace('search', 'replace'), 1)
      limit.apply(node1)
      limit.apply(node2)
      assert.equal(node1.value, 'replace')
      assert.equal(node2.value, 'search')
    })
  })
})
