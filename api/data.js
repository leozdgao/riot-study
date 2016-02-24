const marked = require('marked')
const fs = require('fs')
const data = require('./data.json')

data.contents.forEach(article => {
  const content = fs.readFileSync(require.resolve(article.content)).toString()
  article.content = marked(content)
})

module.exports = data
