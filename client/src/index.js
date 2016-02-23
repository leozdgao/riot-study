import NProgress from 'nprogress'

import '../../isomorphic/components'
import '../sass/index.scss'
import 'nprogress/nprogress.css'

const initData = JSON.parse(window.initData)

riot.settings.brackets = '${ }'

NProgress.start()
window.addEventListener('load', NProgress.done)
