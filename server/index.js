const express = require('express')
const alwaysRenderIndex = require('connect-history-api-fallback')
const path = require('path')
const fs = require('fs')
const marked = require('marked')
const riot = require('riot')
const exphbs = require('express-handlebars')
const _ = require('lodash')
const routers = require('../isomorphic/routers')
const loadAllComponents = require('../isomorphic/helper').loadAllComponents

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
  const jsonServer = require('json-server')
  const config = require('../config/webpack/webpack.dev.js')
  const compiler = webpack(config)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))

  app.use('/api', jsonServer.router(require('../articles/data.json')))
}

app.use('/assets', express.static(path.join(__dirname, '../assets')))

app.use((req, res, next) => {
  // console.log(req.params)
  next()
})

_.each(routers, (router, mount) => {
  app.get(mount, function (req, res, next) {
    router(req.params).then(data => {
      const body = riot.render('page', data)
      _.assign(app.locals, {
        title: data.title || 'leozdgao 的个人博客',
        initData: JSON.stringify(data),
        body,
        assets: {
          css: [ ],
          js: [ '/bundle.js' ]
        }
      })

      res.render('basic')
      // next()
      // res.render('basic', )
    }).catch(e => {
      const err = Error()
      if (e instanceof Error) {
        err.status = 500
        err.message = e.message
        next(err)
      }
      else {
        err.status = 404
      }
    })
  })
})

app.use((req, res, next) => {
  const err = Error()
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.render('error', {
    status: err.status || 500,
    msg: err.message
  })
})

module.exports = app
