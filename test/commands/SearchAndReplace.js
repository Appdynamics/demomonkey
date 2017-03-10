import SearchAndReplace from '../../src/commands/SearchAndReplace'

var assert = require('assert')

describe('SearchAndReplace', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      assert.equal(new SearchAndReplace('', '').apply('asdf'), 'asdf')
    })

    it('should replace a with b for pattern a->b', function () {
      assert.equal(new SearchAndReplace('a', 'b').apply('asdf'), 'bsdf')
    })

    it('should handle regular expressions as pure strings', function () {
      assert.equal(new SearchAndReplace('/[0-9]/', 'b').apply('asdf'), 'asdf')
    })

    it('should replace all a and A with b for pattern /a/i->b', function () {
      assert.equal(new SearchAndReplace(/a/ig, 'b').apply('aAaAsdf'), 'bbbbsdf')
    })

    it('should replace all digits with b for pattern !/[0-9]/->b', function () {
      assert.equal(new SearchAndReplace(/[0-9]/ig, 'b').apply('1234sdf'), 'bbbbsdf')
    })

    /* it('should replace all a with b and presarves case for pattern !/a/pi->b replaces', function () {
      assert.equal(new SearchAndReplace('!/a/pi', 'b').apply('AaaaA'), 'BbbbB')
    }) */

    /* it('should replace all !a with b for pattern \\!a->b first letter can be quoted.', function () {
      assert.equal(new SearchAndReplace('\\!a', 'b').apply('!a!a!a'), 'bbb')
    }) */

    /* it('should leave target untouched for undefined commands', function () {
      assert.equal(new SearchAndReplace('!a', 'b').apply('asdf'), 'asdf')
    }) */

    /* it('it should replace and preserve cases for pattern /CaseSensetive/pi->ItWorks', function () {
      assert.equal(new SearchAndReplace('!/CaseSensetive/pi', 'ItWorks').apply('This is CaseSensetive'),
        'This is ItWorks')
      assert.equal(new SearchAndReplace('!/CaseSensetive/pi', 'ItWorks').apply('This is CASESENSETIVE'),
        'This is ITWORKS')
      assert.equal(new SearchAndReplace('!/CaseSensetive/pi', 'ItWorks').apply('This is casesensetive'),
        'This is itworks')
    }) */
  })
})
