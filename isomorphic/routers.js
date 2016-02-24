require('es6-promise').polyfill()
const request = require('superagent')

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
  return new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      if (err) {
        reject(err)
        return
      }
      
      if (res.ok) {
        resolve({
          view, data: res.body
        })
      }
      else reject(Error('Fail to get data.'))
    })
  })
}
