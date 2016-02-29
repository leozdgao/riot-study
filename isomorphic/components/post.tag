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
  var content = opts.data.content
  content = content.replace(/{/g, '\\{').replace(/}/g, '\\}')
  this.wrapper.innerHTML = content
  </script>
</post>
