<page>
  <page-header></page-header>
  <main name="content" class="content" role="main">
  </main>
  <page-footer></page-footer>

  <script>
  // router control code here
  this.state = riot.observable({

  })

  changeView (view, data) {
    console.log(view)
    console.log(data)
    riot.mount(this.content, view, { data })
  }

  riot.mount(this.content, opts.view, { data: opts.data })
  </script>
</page>
