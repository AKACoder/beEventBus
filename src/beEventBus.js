const BE_EVENT_BUS_DEFAULT_NAMESPACE = "BE_EVENT_BUS_DEFAULT_NAMESPACE"

const eventType = {
    BROADCAST: 0,
    UNICAST: 1,
    MULTICAST: 2,
}

/***
 *
 * @param namespace
 * @param name
 * @param data
 * @param type
 */
const event = function (namespace, name, data, type = eventType.BROADCAST) {
    this.namespace = namespace
    this.name = name
    this.data = data
    this.type = type
}

/***
 *
 * @param namespace
 * @param type
 * @returns {{newEvent: newEvent}}
 */
const eventFactory = function (namespace, type = eventType.MULTICAST) {
    return {
        newEvent: function (name, data) {
            return new event(namespace, name, data, type)
        }
    }
}

const bus = new function () {
    let eventHandler = function (namespace, eventName, action, scope) {
        if(!(action instanceof Function)) {
            return
        }

        this.namespace = namespace
        this.eventName = eventName
        this.action = action
        this.scope = scope
    }

    let eventHandlerMap = {}

    function sendEvent(handler, data) {
        if(handler.scope instanceof Object) {
            handler.action.call(handler.scope, data)
        } else {
            handler.action(data)
        }
    }

    function sendMultipleEvent(name, handlers, data) {
        for(let i = 0; i < handlers.length; i++) {
            if(name !== handlers[i].eventName) {
                continue
            }
            sendEvent(handlers[i], data)
        }
    }

    function broadcastEvent(name, data) {
        for(let handlers of Object.values(eventHandlerMap)) {
            sendMultipleEvent(name, handlers, data)
        }
    }

    function unicastEvent(namespace, name, data) {
        if(!eventHandlerMap[namespace]) {
            return
        }

        const handlers = eventHandlerMap[namespace]
        if(1 > handlers.length) {
            return
        }

        sendEvent(handlers[0], data)

    }

    function multicastEvent(namespace, name, data) {
        if(!eventHandlerMap[namespace]) {
            return
        }

        const handlers = eventHandlerMap[namespace]
        sendMultipleEvent(name, handlers, data)
    }

    return {
        /***
         *
         * @param eventName
         * @param action
         * @param scope
         * @param namespace
         * @returns {eventHandler}
         */
        registerEventHandler(eventName, action, scope = null, namespace = BE_EVENT_BUS_DEFAULT_NAMESPACE) {
            if(!(eventHandlerMap[namespace] instanceof Array)) {
                eventHandlerMap[namespace] = []
            }

            let handler = new eventHandler(namespace, eventName, action, scope)
            eventHandlerMap[namespace].unshift(handler)
            return handler
        },

        /***
         *
         * @param handler
         */
        deregisterEventHandler(handler) {
            if(!(handler instanceof eventHandler)) {
                return
            }

            if(!eventHandlerMap[handler.namespace]) {
                return
            }

            let handlers = eventHandlerMap[handler.namespace]

            for (let i = 0; i < handlers.length; i++) {
                if(handler === handlers[i]) {
                    handlers.splice(i, 1)
                    break
                }
            }
        },

        /***
         *
         * @param e
         */
        post(e) {
            if(!(e instanceof event)) {
                return
            }

            switch (e.type) {
                case eventType.BROADCAST:
                    broadcastEvent(e.name, e.data)
                    break

                case eventType.UNICAST:
                    unicastEvent(e.namespace, e.name, e.data)
                    break

                case eventType.MULTICAST:
                    multicastEvent(e.namespace, e.name, e.data)
                    break

                default:
                    return
            }
        },
    }
}()


//for vue
/***
 *
 * @type {{install: busForVue.install}}
 */
let busForVue = {
    install: function (Vue, options) {
        Vue.prototype.$BEEventBus = {bus, eventType, event, eventFactory }
    }
}

export {bus, eventType, event, eventFactory, busForVue }


