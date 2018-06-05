# beEventBus
javascript版本的事件总线。  


### 关于'be'
- '**be**' 是 '**blockchain explorer**' 的缩写，这是我的区块链浏览器项目中的一部分，后续会开源所有区块链浏览器代码。   

### 关键属性  
- 命名空间+消息名称的驱动方式  
- 提供单播、组播、多播三种消息传递方式  
- 提供了一个消息工厂类，用来简化同命名空间下的同类型消息创建  
- 可以在Vuejs中作为plugin使用  

### 安装  
script标签:  
> \<script src="YOUR_PATH/beEventBus.min.js"></script>  
> YOUR_PATH是你存放beEventBus.min.js的静态资源URI

npm:  
> npm install be-eventbus --save


### 类型和接口说明  
```javascript
//beEventBus.eventType | enum | 消息类型枚举，不同类型的消息会做不同的处理
const eventType = {
    BROADCAST: 0, //广播消息，会向所有namespace下，匹配eventName的处理者进行广播
    UNICAST: 1,   //单播消息，会发送给namespace下，匹配eventName最后一个注册的消息处理者
    MULTICAST: 2, //多播消息，会发送给namespace下，匹配eventName的所有消息处理者
}

//beEventBus.event 对象
/***
 * 
 * @param namespace | string | 命名空间
 * @param name | string | 事件名称
 * @param data | any | 事件数据
 * @param type | beEventBus.eventType | beEventBus下的eventType中的有效值
 * 
 * @description 使用总线发布消息之前，需要 new 一个 beEventBus.event
 */
const event = function (namespace, name, data, type = eventType.BROADCAST){
    this.namespace = namespace
    this.name = name
    this.data = data
    this.type = type    
}


/***
 *
 * @param namespace | string | 命名空间
 * @param type | beEventBus.eventType | 事件类型
 * 
 * @returns object | {newEvent(name, data)} | 会返回一个对象，该对象拥有一个newEvent方法，用来更加便利的创建beEventBus.event对象
 * @description 这是一个消息工厂方法，可以设置一个工厂对象，这个对象拥有设置好的namespace和eventType，该工厂的newEvent方法创建的event会自动设置这两个参数
 */
const eventFactory = function (namespace, type = eventType.MULTICAST) {/*...*/}

//beEventBus.bus 接口集合
/***
 * 
 * @param eventName | string | 事件名称
 * @param action | function | 处理函数，回调时，会把event的data传进去
 * @param scope | object | 回调上下文
 * @param namespace | string | 事件所属命名空间，默认为 "BE_EVENT_BUS_DEFAULT_NAMESPACE"
 * 
 * @returns object | eventHandler | eventHandler 是内置的事件处理对象
 * @description 事件处理注册接口
 */
beEventBus.bus.registerEventHandler(eventName, action, scope = null, namespace = "BE_EVENT_BUS_DEFAULT_NAMESPACE")

/***
 *
 * @param handler | eventHandler | 注册接口返回的对象
 * @description 事件处理注销接口
 */
deregisterEventHandler(handler)

/***
 * 
 * @param e | event | beEventBus的event对象 
 * @description 发布消息到总线
 */
post(e)
```

**在Vuejs中使用 (使用 npm 引入)**:
```javascript
/*
 .........
 */
import {busForVue} from "be-eventbus";
Vue.use(busForVue)

/*
 .........
 this.$BEEventBus.bus
 this.$BEEventBus.eventType
 this.$BEEventBus.event
 this.$BEEventBus.eventFactory
 */

```

### 例子
请参阅[example目录](https://github.com/AKACoder/beEventBus/tree/master/example)下的例子
```

### License
MIT
