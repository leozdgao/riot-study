require('es6-promise').polyfill()
// const request = require('superagent')
const axios = require('axios')

// 获取对应的 view 和 依赖的数据

module.exports = {
  '/': function () {
    // get list of articles
    return fetchInitData('post-list', 'http://localhost:4000/api/articles')
  },
  '/*': function (id) {
    return fetchInitData('post', `http://localhost:4000/api/contents/${id}?_expand=article`)
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
