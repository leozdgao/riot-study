import NProgress from 'nprogress'
import routers from '../../isomorphic/routers'

import '../../isomorphic/components'
import '../sass/index.scss'
import 'nprogress/nprogress.css'

const initData = window.initData

NProgress.start()
window.addEventListener('load', NProgress.done)

riot.route.base('/')
riot.route.parser(null, require('./routeParser'))

let app = null
Object.keys(routers).forEach(filter => {
  riot.route(filter, routeHandler(filter))
})

function routeHandler (filter) {
  return params => {
    if (app) {
      const handler = routers[filter]
      NProgress.start()
      handler(params).then(({ view, data }) => {
        NProgress.done()
        app.changeView(view, data)
      })
    }
    else {
      app = riot.mount('page', initData)[0]
    }
  }
}

riot.route.start(true)
