import ini from 'ini'

class Ini {
  constructor(content) {
    this.content = content
  }

  parse() {
    var content = this.content // .replace('\\=', '\u207c')
    var r = this.content ? ini.parse(content) : []
    return r
  }
}

export default Ini
