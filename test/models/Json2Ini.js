import Json2Ini from '../../src/models/Json2Ini'
import assert from 'assert'

describe('Json2Ini', function () {
  describe('#parse', function () {
    it('should return an empty string for null or an empty object', function () {
      assert.strictEqual('', Json2Ini.parse('{}'))
      assert.strictEqual('', Json2Ini.parse('null'))
    })

    it('should return a = b for object {a:"b"}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b"}'), 'a = b')
    })

    it('should return a = b for object {a:"b", x:"y"}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b", "x":"y"}'), 'a = b\r\nx = y')
    })

    it('should support trailing commas', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b", "x":"y",}'), 'a = b\r\nx = y')
    })

    it('should support comments', function () {
      assert.strictEqual(Json2Ini.parse('{//test\r\n"a":"b",\r\nx:"y"}'), 'a = b\r\nx = y')
    })

    it('should return a = b for object {a:{x:"y"}}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":{"x":"y"}}'), '[a]\r\nx = y')
    })
  })
})
