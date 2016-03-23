<page>
  <page-header active={headerActiveIndex}></page-header>
  <main name="content" class="content" role="main">
  </main>
  <page-footer></page-footer>

  <script>
  const routerMap = [ 'post-list', 'archives', 'about-me' ]
  this.headerActiveIndex = routerMap.indexOf(opts.view)
  // router control code here
  this.state = riot.observable({

  })

  changeView (view, data) {
    riot.mount(this.content, view, { data })
  }

  riot.mount(this.content, opts.view, { data: opts.data })
  </script>
</page>
