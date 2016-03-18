<post>
  <article class="post">
    <header class="post-header">
      <section class="date">{opts.data.article.date}</section>
      <h1 class="post-title">{opts.data.article.title}</h1>
      <section class="tags">
        <i class="fa fa-tag"></i>
        <span each={opts.data.article.tags} class="tag">{this.name}</span>
      </section>
    </header>
    <section name="wrapper" class="post-content">
    </section>
  </article>

  <script>
  'use strict'

  let content = opts.data.content
  content = content.replace(/{/g, '\\{').replace(/}/g, '\\}')
  this.wrapper.innerHTML = content

  const isBrowser = require('../isBrowser')
  if (isBrowser()) {
    this.on('updated', _ => {
      const blocks = document.querySelectorAll('pre code')
      for (let i = 0, l = blocks.length; i < l; i++) {
        // 代码高亮 $$('pre code')
        const block = blocks[i]
        hljs.highlightBlock(block)

        const m = /lang-([^ ]+)/.exec(block.className)
        if (m && m[1]) {
          let lang = m[1]
          if (lang == 'javascript') lang = 'js'
          lang = lang.toUpperCase()

          const sign = document.createElement('span')
          sign.className = 'lang-sign'
          sign.textContent = lang
          block.appendChild(sign)
        }
      }
      // 目录组件初始化
    })
  }
  </script>
</post>
