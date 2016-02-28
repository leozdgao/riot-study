const cache = {}
const regex = /\/:(\w+)/g

function routeParser (path, filter) {
  console.log(arguments)
  const paramKeys = cache[filter] || (function () {
    let m = null
    const result = []
    while ((m = regex.exec(path)) !== null) {
      result.push(m[1])
    }
    return (cache[filter] = result)
  })()
  const result = {}
  paramKeys.forEach(key => {
    const start = path.indexOf(`:${key}`)
    let end = path.indexOf('/', start)
    if (end < 0) {
      end = void 0
    }
    const val = path.slice(start, end)
    result[key] = val
  })
  return [ result ]
}

module.exports = routeParser
