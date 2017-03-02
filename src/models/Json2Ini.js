import JSON5 from 'json5'

class Json2Ini {
  static parse(json) {
    function parseObject(obj) {
      var ini = ''
      for (var key in obj) {
        if (typeof obj[key] === 'object') {
          ini += '[' + key + ']\r\n' + parseObject(obj[key])
        } else {
          ini += key + ' = ' + obj[key] + '\r\n'
        }
      }
      return ini.replace(/^\s+|\s+$/g, '')
    }

    return parseObject(JSON5.parse(json))
  }
}

export default Json2Ini
