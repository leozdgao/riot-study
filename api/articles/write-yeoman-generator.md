id: 1
title: "写一个自己的 Yeoman Generator"
tags:
  - "Yeoman"
date: "Feb 14, 2016"

---

由于自己经常会写一些 demo，或者学习新工具库的使用，然后又比较依赖 npm 的模块管理（这个是重点）和 webpack 的代码打包功能，所以每次都要创建一个目录结构，复制各种 `.rc` 文件，复制 webpack 的配置文件，复制一个应用了 webpack dev 中间件的 express server，每次都要这样，让我心里很烦。

我一直知道 yeoman 这个东西，不过找不到自己喜欢的 generator，简单浏览过 generator 的文档，感觉很麻烦，不易上手，就一直没学。最近在新的项目组，我又定义了一套开发的目录规范，为了给自己和团队的其他人提供开发上的便利，于是决定好好学写 Yeoman Generator。

本文将介绍一个基本的 Yeoman Generator 的写法，并分享一些开发中的注意点。

## Yeoman 是干什么的？

简单介绍下 Yeoman，它是一个脚手架生成工具，比如在之前写 ASP.NET MVC 的时候，Visual Studio 会给你选模板，然后生成一个项目的基本结构（脚手架），这对提升开发体验是很有帮助的，节省了重复劳动。然而前端没有什么 IDE（WebStorm？或许吧），没有一个固定的开发模式，可能你喜欢 jshint，我想用 eslint，你觉得 angular 顺手，我觉得 vue 更合适，这时就可以使用 Yeoman 这个工具，生成一个 **适合自己技术栈** 的脚手架，需要的一些文件都预先生成好，给自己省点事。

而 Yeoman Generator 则定义了一个脚手架应该如何生成，所以我们可以去 [这个网站](http://yeoman.io/generators/) 找适合自己的 Generator，如果没有的话，就自己动手吧。

然后这里是安装和使用的命令，不具体介绍它的使用了，想学的话可以去 [它的官网](http://yeoman.io/) 看看。

```shell
> npm install -g yo
> npm install -g generator-angular

> yo angular
```

## 自己的需求

先说下自己的需求吧，我希望它可以：

- 满足自己的技术栈：express、webpack、react、babel、eslint、travis
- 自动生成并安装依赖
- 灵活性，即可以生成一个适合写 demo 的小脚手架，也可以生成一个 WebApp 的复杂脚手架，同时，在需要的时候可以只生成一份 `.babelrc`
- 组合性，多个脚手架可以组合，可复用

很高兴的是，Yeoman 完全可以实现我的需求。

## 开始写 Yeoman Generator 了

Yeoman 给我们提供了一个用来写脚手架的脚手架 [generator-generator](https://github.com/yeoman/generator-generator)，我们可以从它开始。

> 由于生成出来的项目依赖 nsp 服务，我在 npm prepublish 阶段的时候发生了域名解析错误的问题，如果遇到了类似的问题，就把 package.json 里的 prepublish 删掉吧。

假设我要写一个 Generator 叫做 Butler（管家的意思），那么，根据 Yeoman 的规定，你需要将这个 node 模块的名字命名为 `generator-*`，所以我命名为 `generator-butler`，如果你是通过 `generator-generator` 生成的目录结构，那么可以进入到 `generator-butler` 目录中，运行 `npm link`，就可以开始使用你的 Generator 啦。

![](http://ww1.sinaimg.cn/large/005YR2J3gw1f0y6nfy1btj31340n5gp0.jpg)

Yeoman Generator 高度依赖目录结构，意思是它的行为由你的目录结构决定，怎么说？比如：

```shell
yo butler
yo butler:babel
```

第一条命令会找你代码目录中的 `app` 目录，第二条命令会找你目录中的 `babel` 目录。这样的一个个目录称为 `sub-generator`，默认的 `sub-generator` 名字是 app。

为什么要这样呢？我分享我的想法，我觉得这是出于对可组合性角度考虑的，我们可以定义多个 `sub-generator`，比如我有多个 `sub-generator` 分别单独管理：babel、eslint、webpack，同时 app 这个默认的 `sub-generator` 是这几个 `sub-generator` 的组合，所以：

- 同时可以生成整个项目的结构，也可以（比如）只生成 babel 配置文件
- 各个模块单独管理，易于维护

非常符合自己比较认同的一句话：

> perfer composition over inheritance

默认 `sub-generator` 是基于项目根目录找的，也可以换一个目录（比如 generators），就像例子中那样统一管理，要实现这个，需要在 `package.json` 中加一个属性：

```json
{
  ...
  "files": [
    "generators"
  ],
  ...
}
```

如何实现组合，下面会说到。

> sub-generator 的加载似乎并不是直接应用 node 的模块 resolve 机制，我本来以为是一个文件夹模块加载方式，我试着直接创建文件模块，它就不认了，看来是必须使用文件夹模块的方式的。

### 基本结构

Yeoman 为我们提供了 Generator 的基类，于是：

```js
var generators = require('yeoman-generator')

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments)

    // your logic
  }
})
```

> 这边用的 OOP 用的是 `classical inheritance` 的风格，使用了 [class-extend](https://github.com/SBoudrias/class-extend) 这个模块，有兴趣的可以看看。

我们需要做的就是定义它的方法就行了。那么要怎么定义呢？

### 运行周期

一个 Yeoman Generator 被创建后（构造函数必然是最先被调用的），会依次调用它原型上的方法，且每一个方法中的 this 都被绑定为 Generator 实例本身，调用的顺序如下：

1. **initializing** - 初始化一些状态之类的，通常是和用户输入的 `options` 或者 `arguments` 打交道，这个后面说。
2. **prompting** - 和用户交互的时候（命令行问答之类的）调用。
3. **configuring** - 保存配置文件（如 `.babelrc` 等）。
4. **default** - 其他方法都会在这里按顺序统一调用。
5. **writing** - 在这里写一些模板文件。
6. **conflicts** - 处理文件冲突，比如当前目录下已经有了同名文件。
7. **install** - 开始安装依赖。
8. **end** - 擦屁股的部分... Say Goodbye maybe...

上面只是调用顺序，后面的说明是建议，也就是说你完全可以在 **install** 的部分写文件，在 **configuring** 的时候就开始安装依赖，不过这样的话，就不保证行为的正确性了，更不要说维护上的问题了，所以，别这样，按照它的强制范式来吧。

这些运行周期方法，除了可以是函数外，还可以是对象，我以 babel 的 `sub-generator` 为例子：

```js
writing: {
  files: function () {
    // 写 `.babelrc` 文件
  },
  pkg: function () {
    // 给 package.json 文件上添加依赖项
  }
}
```

对象里的每一个函数会被依次执行。是写成一个函数，还是分成多个函数写成一个对象，都可以，我个人倾向于后者。

**关于依赖 Object 属性的顺序**

偏一下题，注意 default 这个部分，【按顺序执行】？

首先从 ECMAScript 标准来说，并不保证对象属性的顺序，之前开发遇到过坑：

> 4.3.3 Object
An object is a member of the type Object. It is **an unordered collection** of properties each of which contains a primitive value, object, or function. A function stored in a property of an object is called a method.

自己在写 Generator 的时候也没怎么自定义方法（就是 default 这步是空的），都是依赖它的运行周期函数，而 Yeoman Generator 目前是依赖于对象属性的插入顺序的（相当于运行到 default 这步的时候），这里不多评价，如果平时开发希望在遍历集合的时候，保证遍历顺序的话，应该使用数组或者是ECMAScript 2015 中新增的 Map 对象：

> A Map iterates its elements in insertion order, whereas iteration order is not specified for Objects.

### 和用户的交互

Yeoman 提供了多个方式来灵活定制你的脚手架：

**Arguments 和 Options**

比如：

> yo butler MyProject --react --author leozdgao

其中，`MyProject` 就一个第一个定义的 argument，而 `react` 和 `author` 就是 options，值分别是 true 和 leozdgao。

对于 arguments 来说，不需要输入 key，键值对的对应关系是根据定义顺序来的。对于 options 来说，可以分别出入 key 和 value。

定义 arguments 和 options 的方式是类似的：

```js
this.option('react', {
  type: Boolean,
  desc: "need to use React or not.",
  defaults: false
})
this.arguments('name', {
  type: String,
  desc: "your project name",
  required: true
})
```

从参数名上就看的明白是什么意思了，不多说了。

定义 arguments 或者 options 写在哪里都行，不过为了保证在任何地方都能正常访问到，建议放在构造函数中。如果要访问的话：

```js
this.options['react'] // options 通过 options 属性获取
this.name // 是的，arguments 会直接作为 generator 的一个属性
```

arguments 和 options 的帮助信息会在定义后自动生成（如果它们不是在构造函数中被定义的话，帮助信息就无法自动生成）：

```shell
> yo butler --help
```

> 不要信你定义的 `type`，其实这里并没有根据你定义的 `type` 进行转换，如果对数据类型有要求的话，这里要当心。

**CLI 交互**

使用与用户问答交互的方式是比较有趣的，同时也不用记住要传的参数，Yeoman 提供了 API 来让我们快速实现 CLI 交互：

```js
module.exports = generators.Base.extend({
  prompting: function () {
    var done = this.async();
    this.prompt({
      type    : 'input',
      name    : 'name',
      message : 'Your project name',
      default : this.appname // Default to current folder name
    }, function (answers) {
      this.log(answers.name);
      done();
    }.bind(this));
  }
});
```

内部直接使用了 `Inquirer.js`，API不变，这里就不多写了，大家可以直接看 [文档](https://github.com/SBoudrias/Inquirer.js)。

> 可以发现 Yeoman 处理异步的方式是声明回调并显示调用。

### 项目模板

生成脚手架就是拷贝模板文件，你可以定义你的模板文件。这里涉及到两个文件夹，一个是你希望生成脚手架的目标文件夹，一个是模板所在的文件夹。Yeoman 提供了 API 来快速获取它们，来看个例子，我希望根据 `react` 这个 option 来决定是否在 presets 中添加 `react`：

```js
writing: function () {
  this.fs.copyTpl(
    this.templatePath('.babelrc'),
    this.destinationPath('.babelrc'),
    { needReact: this.options.react }
  )
}
```

获取目标文件夹目录可以用 `generator.destinationPath()`，传入的参数和 `path.join()` 是一样的。获取模板文件夹目录可以用 `generator.sourceRoot()`，默认是 Generator 代码目录下的 `./templates`，也可以重写：`generator.sourceRoot('new/template/path')`。如果是拼模板文件路径的话，就用 `generator.templatePath('app/index.js')`。

Yeoman 给我们提供了方便的处理文件的工具，可以通过 `fs` 属性调用，其实就是用了 [mem-fs-editor](https://github.com/sboudrias/mem-fs-editor) 这个库，可以直接看它的 API 说明，这里不多说了，要提一下的是模板引擎用的时 EJS。

这份是我对应上面例子的模板文件：

```json
{
  "presets": [
    "es2015", "stage-0"
    <% if (needReact) { %>
    , "react"
    <% } %>
  ]
}

```

例子里调用了 `copyTpl`，如果觉得不用经过模板引擎，可以直接用 `copy` 原样拷贝。

### 组合

> 这里的组合只是概念，并不是按照函数式的方式实现的。

要实现组合，其实很简单，在希望调用的地方调用 `generator.composeWith` 即可，直接上例子：

```js
default: function () {
  // execute other sub-generators
  this.composeWith('butler:babel', {
    options: { react: this.options.react }
  }, {
    local: require.resolve('../babel')
  })
  // select a License
  this.composeWith('license', {
    options: {
      name: this.props.authorName,
      email: this.props.authorEmail,
      website: this.props.authorUrl
    }
  }, {
    local: require.resolve('generator-license/app')
  })
}
```

例子里分别是组合本地的一个 `sub-generator`，和一个外部的 `Generator`，我选择在 default 这个运行周期调用组合。

composeWith 接受三个参数，第一个参数一个名字，写什么都行，不过最好写要被组合的 `Generator` 的名字。第二个参数是传入 `options` 和 `arguments`。第三个参数 settings，只用 local 和 link 两个选项，local 是用来定位要组合的 `Generator` 的位置的，link 还不知道，没怎么看懂它的 [说明文档](http://yeoman.io/generator/Base.html)。

### 自动安装依赖

恩，差点忘记这个，很简单，就是函数调用：

```js
install: function() {
  this.npmInstall([ 'lodash' ], { 'saveDev': true });
}
```

在任何地方调用都是可以的，Yeoman 会统一在进入 install 阶段的时候统一执行。如果还有在用 bower 的同学的话可以用这个：`generator.bowerInstall()`。

## 最后

好了，基本上完了，如果什么地方写错了，还望指出。自己的 [butler](https://github.com/leozdgao/butler)，还在开发中，可以参考，另外我其实也是参考 [generator-node](https://github.com/yeoman/generator-node) 的，或者自己找些 Yeoman Generator 的源码学学，个人认为使用 npm 作为包管理是趋势（暂时也应该没有终极方案，还是要依赖 bundle 工具），那么 bundle 工具就是不可或缺的了，写个脚手架还是挺有帮助的，希望本文对大家有帮助。

然后是一些工具库推荐：

- [generator-license](https://github.com/jozefizso/generator-license) - 选择 License 的 Generator
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - 提供命令行交互的工具
- [inquirer-npm-name](https://github.com/SBoudrias/inquirer-npm-name) - 帮助查询模块名在 npm 上是否冲突，和 Yeoman 完美融合
- [yosay](https://github.com/yeoman/yosay) - 在命令行输出信息的时候，同时输出 Yeoman 的卡通人物...

一些文档的链接：

- [Yeoman Generator API](http://yeoman.io/generator/Base.html)
- [Get Started](http://yeoman.io/authoring/)
- [Yeoman 官网](http://yeoman.io/)

Yeoman 团队目前在开发一个 [Yeoman App](https://github.com/yeoman/yeoman-app)，就是一个 GUI 版的 yo 吧，总之还是期待的。
