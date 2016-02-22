const express = require('express')
const path = require('path')
const fs = require('fs')
const marked = require('marked')
const riot = require('riot')
const glob = require('glob')
const exphbs = require('express-handlebars')

function loadAllComponents (path) {
  glob(path, (err, tags) => {
    tags.forEach(t => require(t))
  })
}
loadAllComponents(path.join(__dirname, '../isomorphic/components/**/*.tag'))

const app = express()
const hbs = exphbs.create({
  extname: '.hbs'
})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, './views'))

if (process.env['NODE_ENV'] !== 'production') {
  const webpack = require('webpack')
  const config = require('../config/webpack/webpack.dev.js')
  const compiler = webpack(config)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))
}

app.use('/assets', express.static(path.join(__dirname, '../assets')))

app.use((req, res, next) => {
  const content = fs.readFileSync(path.join(__dirname, '../data/article.md')).toString()
  const opts = {
    data: {
      // 对应页面的数据
      title: '写一个自己的 Yeoman Generator',
      tags: [ { name: 'Yeoman' } ],
      date: 'Feb 14, 2016',
      content: marked(content)
    }
  }

  const initData = { key: "value" }
  const body = riot.render('page', opts)
  res.render('basic', {
    title: '写一个自己的 Yeoman Generator',
    assets: {
      js: [ '/static/bundle.js' ],
      css: [ ]
    },
    initData: JSON.stringify(initData),
    body
  })
})

module.exports = app
