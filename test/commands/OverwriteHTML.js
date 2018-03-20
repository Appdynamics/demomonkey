import OverwriteHTML from '../../src/commands/OverwriteHTML'

var assert = require('assert')

describe('OverwriteHTML', function () {
  describe('#_addMarker', function () {
    it('adds a unique marker to the end of an html string', function () {
      var cmd = new OverwriteHTML()
      assert.equal(cmd._addMarker('test'), 'test<!-- ' + cmd.marker + ' -->')
    })
  })

  describe('#apply', function () {
    it('should leave target unchanged for location mismatch', function () {
      var document = {
        documentElement: {
          innerHTML: 'asdf'
        }
      }
      new OverwriteHTML('another', '', '', {toString: () => 'here'}).apply(document, 'documentElement')
      assert.equal(document.documentElement.innerHTML, 'asdf')
    })

    it('should not fail on null as target', function () {
      assert.equal(new OverwriteHTML('here', '', '', {toString: () => 'here'}).apply(null, 'documentElement'), false)
      assert.equal(new OverwriteHTML('here', '', '', {toString: () => 'here'}).apply({
        documentElement: null
      }, 'documentElement'), false)
    })

    it('should overwrite target innerHTML', function () {
      var document = {
        documentElement: {
          innerHTML: 'asdf'
        }
      }
      var cmd = new OverwriteHTML('here', '', 'xyz', {toString: () => 'here'})
      cmd.apply(document, 'documentElement')
      assert.equal(document.documentElement.innerHTML, cmd._addMarker('xyz'))
    })

    it('should overwrite innerHTML on selected sub-node', function () {
      var sub = {innerHTML: 'test'}
      var document = {
        documentElement: {
          querySelector: function (query) {
            if (query === '.css') {
              return sub
            }
          },
          innerHTML: 'asdf'
        }
      }
      var cmd = new OverwriteHTML('here', '.css', 'xyz', {toString: () => 'here'})
      cmd.apply(document, 'documentElement')
      assert.equal(sub.innerHTML, cmd._addMarker('xyz'))
    })
  })
})
