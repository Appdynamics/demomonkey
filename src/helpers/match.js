// Copied from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& meint den komplett erkannten String
}

function match(original, search, replace) {
  // This also works with "startsWithNot" (see below)
  // !search === replace becomes search !== replace
  // original === replace is evaluated before the code below
  if (search === replace || original === replace) {
    return false
  }

  const regex = search.match(/^!\/(.+)\/([gimp]+)?$/)
  if (regex) {
    return (new RegExp(regex[1], regex[2])).test(original)
  }

  const startsWithNot = search.charAt(0) === '!'

  if (startsWithNot) {
    return !match(original, search.slice(1), replace)
  }

  // The '*' is at any other place (not start, not end, not both)
  if (search.includes('*')) {
    const parts = search.split('*').map(escapeRegExp).join('.*')
    console.log(parts)
    return new RegExp(parts).test(original)
  }

  return original === search
}

export default match
