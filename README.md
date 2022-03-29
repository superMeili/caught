# caught

## 一个可配置，且可扩展的，前端信息捕获工具 (A configurable, extensible h5 information capture tool)

## 原生支持TypeScript （Native support for TypeScript）

<br/>

### 安装 (installation)
- 直接引入脚本 (Import scripts directly) <br/>
```html
<script src="https://unpkg.com/caught-core"></script>
```
- 与打包工具一起使用 (Use with the packaging tool) <br/> 
```js
npm install caught-core -save
```
### 使用方法 (usage)
```js
// 直接引入脚本 (Import scripts directly)
var caught = window.createCaught({
  //...options
  errorHandler: (errs) => {
    console.log('错误列表：', errs)
  },
  plugins: []
})
var createCustomInsert = caught.createCustomInsert
var proxyCaught = caught.proxyCaught
// 使用npm包 (Use NPM package)
import createCaught from '@caught/core'

const { createCustomInsert, proxyCaught } = createCaught({
  //...options
  errorHandler: (errs) => {
    console.log('错误列表：', errs)
  },
  plugins: []
})
```

### 说明 (instruction)
1. 各配置项及用途 (onfiguration items and usage)

|  选项名  | 用途 | 类型 | 默认值 
|  ----  | ----  | ----  | ---- |
| sameLimit  | 批量上传模式时，相同错误的最大载入限制 (Max load limit for the same error in batch upload mode) | number | 10
| retry  | 是否开启处理失败重试模式 (Whether to enable retry after processing failure) | boolean | true
| retryTime  | 失败重试的间隔时间, 单位毫秒 (Retry interval, in milliseconds) | number | 5000
| failMaxNum  | 最大失败次数，超出则停止捕获 (Maximum number of failures, beyond which capture stops) | number | 5
| listeners  | 是否启用错误事件监听功能 (Whether to enable error event listening) | boolean or object| true
| errorHandler  | 信息处理方法，必传项 (Information processing method, must pass) | function | - 
| plugins  | 插件配置项 (Plug-in configuration items) | array | []
| sync  | 是否开启同步捕获 (Whether to enable synchronization capture) | boolean | fasle

*除errorHandler外，其他都是可选项 (All except errorHandler are optional)*

2. 为插件编写提供的钩子 (Hooks provided for plug-in authoring)

|  钩子名  | 用途 | 参数 
|  ----  | ----  | ----  | 
| addInfo | caught默认只收集部分重要信息，若需要自定义额外信息，可通过次钩子添加 (Caught Collects only some important information by default. If you need to customize additional information, you can add it using the secondary hook  ) | info
| fail  | 处理失败时的钩子 (Handle failed hooks) | infoList
| success  | 处理成功时的钩子 (Handle success hooks) | infoList
| jsError  | js error 事件触发时的钩子 (js Error the hook when the event is raised) | info, event
| staticError  | 静态资源加载 error 事件触发时的钩子 (Static resource loading hooks when the error event is raised) | info, event
| promiseRejection  | 未catch的promsie (Did not catch promsie) | info, event
| schedulable | 调度机制初始化完成时的钩子 (oks for scheduling mechanism initialization when complete) | createCustomInsert

3. errorHandler选项说明
- errorHandler为必选项，若未设置，则整个caught工具不会生效
- errorHandler为函数类型，默认会注入两个参数，infoList数组及notify方法，infoList为当前捕获到的信息队列，notify由开发者方调用，用于通知caught本次信息处理成功(notify(true))或失败(notify(false))
```js
{
  errorHandler(infoList, notify) {
    axios.post(url, data: infoList)
    .then(() => {
      notify(true)
    })
    .catch(() => {
      notify(false)
    })
  }
}
```
- 调用notify的目的有两个：1. 用于失败重试功能， 2. caught内存优化，若不调用，caught依然能正常运行，但失败重试功能讲失效

4. plugins选项说明
类似于webpack插件，caught也提供了插件扩展的能力，具体用法如下
```js
class PluginDemo {
  apply(register) { // register 用于hook注册
    const handler = info => {
      const { type, flag, error, meta } = info
      return {
        myInfo: {
          name: 'meili',
        }
      }
    }
    register.addInfo(handler) // 注册 addInfo 钩子
  }
}

createCaught({
  //...options
  plugins: [
    new PluginDemo()
  ]
})
```

