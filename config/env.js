const fp = require('path')

function fromBase (sub) {
  return fp.join(__dirname, sub)
}

module.exports = {
  port: 4000,
  entry: fromBase('../client/src/index.js'),
  publicPath: fromBase('../www')
}
