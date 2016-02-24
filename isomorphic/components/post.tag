<post>
  <page-header></page-header>
  <main class="content" role="main">
    <article class="post">
      <header class="post-header">
        <section class="date">{opts.data.date}</section>
        <h1 class="post-title">{opts.data.title}</h1>
        <section class="tags">
          <i class="fa fa-tag"></i>
          <span each={opts.data.tags} class="tag">{this.name}</span>
        </section>
      </header>
      <section name="wrapper" class="post-content">
      </section>
    </article>
  </main>
  <page-footer></page-footer>

  <script>
  var content = opts.data.content
  content = content.replace(/{/g, '\\{').replace(/}/g, '\\}')
  this.wrapper.innerHTML = content
  </script>
</post>
