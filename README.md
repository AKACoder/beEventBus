# beEventBus
an javascript version event bus.  

### 中文 [README](https://github.com/AKACoder/beEventBus/blob/master/README_zh.md)

### key features  
- namespace & event-name driven  
- support unicast, multicast, broadcast  
- provided a event factory to simplify the creation of the event  
- you can use it as a Vuejs plugin  

### install  
use script tag in html:  
> \<script src="YOUR_PATH/beEventBus.min.js"></script>  
> YOUR_PATH is the static resource URI where you store beEventBus.min.js

npm:  
> npm install be-eventbus --save


### types & api  
```javascript
//beEventBus.eventType | enum
const eventType = {
    BROADCAST: 0, //broadcast, event will broadcast to all the name matched handler and ignore namespace
    UNICAST: 1,   //unicast, event will post to the last name matched handler under the namespace
    MULTICAST: 2, //multicast, event will post to all the name matched handler under the namespace
}

//beEventBus.event | object
/***
 * 
 * @param namespace | string | namespace
 * @param name | string | event name
 * @param data | any | event data
 * @param type | beEventBus.eventType | valid event type
 * 
 * @description you need new an beEventBus.event before you post an event to bus
 */
const event = function (namespace, name, data, type = eventType.BROADCAST){
    this.namespace = namespace
    this.name = name
    this.data = data
    this.type = type    
}


/***
 *
 * @param namespace | string | namespace
 * @param type | beEventBus.eventType | valid event type
 * 
 * @returns object | {newEvent(name, data)} | this function will return an object which has newEvent method that used to create new beEventBus.event
 * @description this is a factory method. you can preset the namespace and eventType, then the newEvent method of the return object will set this two parameter automatically
 */
const eventFactory = function (namespace, type = eventType.MULTICAST) {/*...*/}

//beEventBus.bus api
/***
 * 
 * @param eventName | string | event name
 * @param action | function | handler function
 * @param scope | object | callback context
 * @param namespace | string | namespace, default set to "BE_EVENT_BUS_DEFAULT_NAMESPACE"
 * 
 * @returns object | eventHandler | eventHandler is an inner type
 * @description register an event handler
 */
beEventBus.bus.registerEventHandler(eventName, action, scope = null, namespace = "BE_EVENT_BUS_DEFAULT_NAMESPACE")

/***
 *
 * @param handler | eventHandler | the object returned by api registerEventHandler
 * @description unregister an event handler
 */
deregisterEventHandler(handler)

/***
 * 
 * @param e | event | the event object to post  
 * @description post an event to the bus
 */
post(e)
```

**use in Vuejs (npm installed)**:
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

### Example
please refer to [example](https://github.com/AKACoder/beEventBus/tree/master/example) directory

### License
MIT