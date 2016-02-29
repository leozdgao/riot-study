require('es6-promise').polyfill()
// const request = require('superagent')
const axios = require('axios')

// 获取对应的 view 和 依赖的数据

module.exports = {
  '/articles/:id': function (params) {
    return fetchInitData('post', `http://localhost:4000/api/contents/${params.id}?_expand=article`)
  },
  '/': function () {
    // get list of articles
    return fetchInitData('post-list', 'http://localhost:4000/api/articles')
  }
}

function fetchInitData (view, url) {
  return axios.get(url)
    .then(res => {
      return {
        view, data: res.data
      }
    })
}
