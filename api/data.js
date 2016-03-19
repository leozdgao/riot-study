/**
 * 解析文章，生成数据
 */
'use strict'

const marked = require('marked')
const yaml = require('js-yaml')
const fp = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const frontMatter = require('hexo-front-matter')
const data = require('./data.json')

let articles = []
fse.walk(fp.join(__dirname, './articles'))
  .on('data', item => {
    const stats = item.stats
    if (stats.isFile() && fp.extname(item.path) === '.md' ) {
      articles.push(item.path)
    }
  })
  .on('end', _ => {
    articles = articles.map(article => {
      // const docs = yaml.safeLoadAll()
      // console.log(docs)
      const content = fs.readFileSync(article).toString()
      const data = frontMatter.parse(content)

      return data
      // const data = parseFrontMatter(content)
    })
  })

// function parseFrontMatter (str) {
//
// }

// data.contents.forEach(article => {
//   const content = fs.readFileSync(require.resolve(article.content)).toString()
//   article.content = marked(content)
// })

module.exports = data
