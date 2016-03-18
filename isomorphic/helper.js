const glob = require('glob')

function loadAllComponents (path) {
  glob(path, (err, tags) => {
    tags.forEach(t => require(t))
  })
}

module.exports = {
  loadAllComponents
}
