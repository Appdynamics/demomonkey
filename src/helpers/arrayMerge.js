import merge from 'deepmerge'

function arrayMerge(dst, src, opt) {
  var i = dst.findIndex((e) => e.name === src[0].name && e.nodeType === src[0].nodeType && e.nodeType === 'directory')
  if (i !== -1) {
    dst[i] = merge(dst[i], src[0], { arrayMerge: arrayMerge })
  } else {
    dst = dst.concat(src)
  }
  return dst.sort((a, b) => {
    return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1
  })
}

export default arrayMerge
