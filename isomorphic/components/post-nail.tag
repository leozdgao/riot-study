<post-nail class="post-nail">
  <section class="post-nail-date">{opts.data.date}</section>
  <h2 class="post-nail-title"><a href={'/articles/' + opts.data.id}>{opts.data.title}</a></h2>
  <section name="abstract" class="post-nail-abstract"></section>
  <a class="post-nail-more" href={'/articles/' + opts.data.id}>阅读全文</a>

  <script>
  this.abstract.innerHTML = opts.data.abstract || ''
  </script>
</post-nail>
