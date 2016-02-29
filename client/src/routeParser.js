function routeParser (path, filter) {
  // 忽略 querystring 和 hash
  path = path.split('?')[0]
  filter = filter.split('?')[0]

  const pathUnit = path.split('/')
  const filterUnit = filter.split('/')
  const result = [ {} ]

  // 只有两组的长度相等时，才可能匹配
  if (pathUnit.length !== filterUnit.length) return

  for (let i = 0, l = pathUnit.length; i < l; i++) {
    const pUnit = pathUnit[i]
    const fUnit = filterUnit[i]

    if (pUnit == fUnit) continue
    else {
      if (fUnit[0] === ':') {
        const key = fUnit.slice(1)
        result[0][key] = pUnit
        continue
      }
      else return
    }
  }

  return result
}

module.exports = routeParser
