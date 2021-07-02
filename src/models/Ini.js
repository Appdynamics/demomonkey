import ini from 'ini'
class Ini {
  constructor(content, repository = {}) {
    this.content = content
  }

  parse() {
    var content = this.content

    // The replace allows quoting for =. The reverse happens in the CommandBuilder.
    content = content.replaceAll('\\=', '\u2260')

    return content ? ini.parse(content) : []
  }
}

export default Ini
