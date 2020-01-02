function extractParameters(params) {
  const parameters = []
  // parameters = command.slice(command.indexOf('(') + 1, -1).split(/\s*,\s*/).filter(elem => elem !== '')
  let index = 0
  parameters.push('')
  let open = ''
  params.split('').forEach(letter => {
    if (open !== '\'' && letter === '"') {
      open = open === '"' ? '' : letter
    }
    if (open !== '"' && letter === '\'') {
      open = open === '\'' ? '' : letter
    }
    if (open === '' && letter === ',') {
      index++
      parameters.push('')
      return
    }
    parameters[index] += letter
  })
  return parameters.map(e => e.trim().replace(/"(.*)"|'(.*)'/, '$1$2')) // .filter(e => e !== '')
}

export default extractParameters
