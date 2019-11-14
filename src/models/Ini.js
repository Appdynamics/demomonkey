import ini from 'ini'

class Ini {
  constructor(content, repository = {}) {
    this.content = content
  }

  parse() {
    var content = this.content

    // The replace allows quoting for =. The reverse happens in the CommandBuilder.
    var r = content ? ini.parse(content.replace('\\=', '\u2260')) : []

    return r
  }
}

export default Ini
