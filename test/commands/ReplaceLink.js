import ReplaceLink from '../../src/commands/ReplaceLink'

var assert = require('assert')

describe('ReplaceLink', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      var link = {
        href: 'asdf'
      }
      new ReplaceLink('', '').apply(link, 'href')
      assert.equal(link.href, 'asdf')
    })

    it('should replace the link url if href equals the search pattern', function () {
      var link = {
        href: 'asdf'
      }
      new ReplaceLink('asdf', 'xyz').apply(link, 'href')
      assert.equal(link.href, 'xyz')
    })

    it('should leave the target unchanged if the pattern does not match the href exactly', function () {
      var link = {
        href: 'asdf'
      }
      new ReplaceLink('asdfa', 'xyz').apply(link, 'href')
      assert.equal(link.href, 'asdf')
    })
  })
})
