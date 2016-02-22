<page>
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
      <section class="post-content">
        <post content={opts.data.content}></post>
      </section>
    </article>
  </main>
  <page-footer></page-footer>

  function dateFormat (date) {
    return date
  }
</page>
