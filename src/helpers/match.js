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
  const startsWithStar = search.charAt(0) === '*'
  const endsWithStar = search.slice(-1) === '*'

  if (startsWithNot) {
    return !match(original, search.slice(1), replace)
  }

  if (startsWithStar && endsWithStar) {
    return original.includes(search.slice(1, -1))
  }

  if (startsWithStar) {
    return original.endsWith(search.slice(1))
  }

  if (endsWithStar) {
    return original.startsWith(search.slice(0, -1))
  }

  return original === search
}

export default match
