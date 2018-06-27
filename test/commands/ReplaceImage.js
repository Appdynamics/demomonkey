import ReplaceImage from '../../src/commands/ReplaceImage'

var assert = require('assert')

describe('ReplaceImage', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      var img = {
        src: 'asdf'
      }
      new ReplaceImage('', '').apply(img, 'src')
      assert.equal(img.src, 'asdf')
    })

    it('should replace src with exact match', function () {
      var img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.com/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with prefix match', function () {
      var img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.com/*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with suffix match', function () {
      var img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('*/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "contains" match', function () {
      var img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('*example.com*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "not" match', function () {
      var img = {
        src: 'http://cdn.example.net/images/test.png'
      }
      new ReplaceImage('!http://cdn.example.net/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.net/images/test.png')
      new ReplaceImage('!http://cdn.example.com/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "contains" and "not" match', function () {
      var img = {
        src: 'http://cdn.example.net/images/test.png'
      }
      new ReplaceImage('!*example.net*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.net/images/test.png')
      new ReplaceImage('!*example.com*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should leave target unchanged for a mismatch', function () {
      var img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.net/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('http://cdn.example.net/*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('*/test.gif', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('*example.net*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')
    })
  })
})
